import AppKit
import Foundation

@MainActor
final class CodevatorConfigStore: ObservableObject {
    @Published private(set) var config: CodevatorConfig
    @Published private(set) var isPreviewRunning = false
    @Published private(set) var lastError: String?

    let configURL: URL
    private let configDirectory: URL

    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    private var directoryDescriptor: CInt = -1
    private var fileDescriptor: CInt = -1
    private var directoryMonitor: DispatchSourceFileSystemObject?
    private var fileMonitor: DispatchSourceFileSystemObject?
    private var reloadWorkItem: DispatchWorkItem?
    private var volumeDebounceTask: Task<Void, Never>?

    init(environment: [String: String] = ProcessInfo.processInfo.environment) {
        if let customHome = environment["CODEVATOR_HOME"], !customHome.isEmpty {
            configDirectory = URL(fileURLWithPath: customHome, isDirectory: true)
        } else {
            configDirectory = FileManager.default.homeDirectoryForCurrentUser
                .appendingPathComponent(".codevator", isDirectory: true)
        }

        self.configURL = configDirectory.appendingPathComponent("config.json", isDirectory: false)
        self.config = Self.loadConfig(from: configURL)
        self.encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        startMonitoring(directoryURL: configDirectory)
    }

    deinit {
        fileMonitor?.cancel()
        directoryMonitor?.cancel()
    }

    // MARK: - Computed properties

    var statusImageName: String {
        config.enabled ? "music.note" : "music.note.slash"
    }

    var statusText: String {
        if !config.enabled {
            "Sounds disabled"
        } else if isDaemonRunning {
            "Playing \(displayName(for: config.mode)) at \(config.volume)%"
        } else {
            "Waiting for an agent session…"
        }
    }

    var isDaemonRunning: Bool {
        let pidFile = configDirectory.appendingPathComponent("daemon.pid")
        guard let contents = try? String(contentsOf: pidFile, encoding: .utf8),
              let pid = Int32(contents.trimmingCharacters(in: .whitespacesAndNewlines)) else {
            return false
        }
        return kill(pid, 0) == 0
    }

    // MARK: - User actions

    func setEnabled(_ enabled: Bool) {
        updateConfig { $0.enabled = enabled }
        if isDaemonRunning {
            if enabled {
                sendDaemonCommand(["action": "fadeIn", "mode": config.mode, "volume": Double(config.volume) / 100.0])
            } else {
                // Send quit — fadeOut alone gets overridden by the daemon's
                // session-awareness loop which re-fades-in when heartbeats exist.
                sendDaemonCommand(["action": "quit"])
            }
        }
    }

    func setMode(_ mode: String) {
        if mode == CodevatorMode.spotify.rawValue, !isSpotifyInstalled() {
            lastError = "Spotify is not installed. Keeping \(displayName(for: config.mode))."
            return
        }

        updateConfig { $0.mode = mode }
        if isDaemonRunning {
            sendDaemonCommand(["action": "fadeIn", "mode": mode, "volume": Double(config.volume) / 100.0])
        }
    }

    func setVolume(_ volume: Int) {
        let clamped = max(0, min(100, volume))
        updateConfig { $0.volume = clamped }

        volumeDebounceTask?.cancel()
        volumeDebounceTask = Task {
            try? await Task.sleep(for: .milliseconds(150))
            guard !Task.isCancelled else { return }
            if isDaemonRunning {
                sendDaemonCommand(["action": "fadeIn", "mode": config.mode, "volume": Double(clamped) / 100.0])
            }
        }
    }

    func refreshFromDisk() {
        config = Self.loadConfig(from: configURL)
    }

    func clearError() {
        lastError = nil
    }

    func displayName(for mode: String) -> String {
        CodevatorMode(rawValue: mode)?.label ?? mode.capitalized
    }

    // MARK: - Daemon command protocol

    /// Sends a command to the running daemon via ~/.codevator/command.json
    /// using the same atomic-write protocol as the CLI.
    private func sendDaemonCommand(_ command: [String: Any]) {
        var payload = command
        payload["ts"] = Int(Date().timeIntervalSince1970 * 1000)

        do {
            let data = try JSONSerialization.data(withJSONObject: payload, options: [])
            let commandFile = configDirectory.appendingPathComponent("command.json")
            // .atomic writes to a temp file then uses POSIX rename (overwrites destination)
            try data.write(to: commandFile, options: .atomic)
            lastError = nil
        } catch {
            lastError = "Could not send command: \(error.localizedDescription)"
        }
    }

    // MARK: - Config persistence

    private func updateConfig(_ mutate: (inout CodevatorConfig) -> Void) {
        var next = config
        mutate(&next)
        config = next
        writeConfig(next)
    }

    private func writeConfig(_ config: CodevatorConfig) {
        do {
            try FileManager.default.createDirectory(
                at: configURL.deletingLastPathComponent(),
                withIntermediateDirectories: true
            )
            let data = try encoder.encode(config)
            try data.write(to: configURL, options: .atomic)
            lastError = nil
        } catch {
            lastError = "Could not save settings: \(error.localizedDescription)"
        }
    }

    // MARK: - Utilities

    private func isSpotifyInstalled() -> Bool {
        NSWorkspace.shared.urlForApplication(withBundleIdentifier: "com.spotify.client") != nil
    }

    // MARK: - File monitoring

    private func startMonitoring(directoryURL: URL) {
        do {
            try FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true)
        } catch {
            lastError = "Could not prepare config directory: \(error.localizedDescription)"
            return
        }

        // Monitor the directory — catches file creation/deletion/rename
        directoryDescriptor = open(directoryURL.path, O_EVTONLY)
        if directoryDescriptor >= 0 {
            let source = DispatchSource.makeFileSystemObjectSource(
                fileDescriptor: directoryDescriptor,
                eventMask: [.write, .rename, .delete],
                queue: .main
            )
            source.setEventHandler { [weak self] in
                guard let self else { return }
                // Re-attach file monitor in case config.json was recreated
                self.attachFileMonitor()
                self.scheduleReload()
            }
            source.setCancelHandler { [descriptor = directoryDescriptor] in
                if descriptor >= 0 { close(descriptor) }
            }
            directoryMonitor = source
            source.resume()
        }

        // Monitor config.json directly — catches in-place content writes
        attachFileMonitor()
    }

    private func attachFileMonitor() {
        fileMonitor?.cancel()

        let fd = open(configURL.path, O_EVTONLY)
        guard fd >= 0 else { return }
        fileDescriptor = fd

        let source = DispatchSource.makeFileSystemObjectSource(
            fileDescriptor: fd,
            eventMask: [.write, .rename, .delete, .extend, .attrib],
            queue: .main
        )
        source.setEventHandler { [weak self] in
            self?.scheduleReload()
        }
        source.setCancelHandler {
            close(fd)
        }
        fileMonitor = source
        source.resume()
    }

    private func scheduleReload() {
        reloadWorkItem?.cancel()
        let workItem = DispatchWorkItem { [weak self] in
            guard let self else { return }
            self.refreshFromDisk()
        }
        reloadWorkItem = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(150), execute: workItem)
    }

    private static func loadConfig(from url: URL) -> CodevatorConfig {
        guard
            let data = try? Data(contentsOf: url),
            let decoded = try? JSONDecoder().decode(CodevatorConfig.self, from: data)
        else {
            return .default
        }
        return decoded
    }
}
