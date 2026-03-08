import AppKit
import Foundation

@MainActor
final class CodevatorConfigStore: ObservableObject {
    @Published private(set) var config: CodevatorConfig
    @Published private(set) var isPreviewRunning = false
    @Published private(set) var lastError: String?

    let configURL: URL

    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()
    private var configDirectoryDescriptor: CInt = -1
    private var configMonitor: DispatchSourceFileSystemObject?
    private var reloadWorkItem: DispatchWorkItem?
    private var volumeCommandTask: Task<Void, Never>?

    init(environment: [String: String] = ProcessInfo.processInfo.environment) {
        let configDirectory: URL
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

    var statusImageName: String {
        config.enabled ? "music.note" : "music.note.slash"
    }

    var statusText: String {
        if config.enabled {
            "Playing \(displayName(for: config.mode)) at \(config.volume)%"
        } else {
            "Codevator is currently disabled"
        }
    }

    func setEnabled(_ enabled: Bool) {
        updateConfig { $0.enabled = enabled }
        Task {
            do {
                if enabled {
                    try await runCodevatorCommand(["on"])
                    try await runCodevatorCommand(["play"])
                } else {
                    try await runCodevatorCommand(["off"])
                }
                lastError = nil
            } catch {
                lastError = "Could not update playback: \(error.localizedDescription)"
                refreshFromDisk()
            }
        }
    }

    func setMode(_ mode: String) {
        let previousMode = config.mode

        if mode == CodevatorMode.spotify.rawValue, !isSpotifyInstalled() {
            lastError = "Spotify is not installed. Keeping \(displayName(for: previousMode))."
            refreshFromDisk()
            return
        }

        updateConfig { $0.mode = mode }
        Task {
            do {
                try await runCodevatorCommand(["mode", mode])
                lastError = nil
            } catch {
                lastError = "Could not switch mode: \(error.localizedDescription)"
                if mode == CodevatorMode.spotify.rawValue {
                    updateConfig { $0.mode = previousMode }
                } else {
                    refreshFromDisk()
                }
            }
        }
    }

    func setVolume(_ volume: Int) {
        let clampedVolume = max(0, min(100, volume))
        updateConfig { $0.volume = clampedVolume }
        volumeCommandTask?.cancel()
        volumeCommandTask = Task {
            try? await Task.sleep(for: .milliseconds(150))
            guard !Task.isCancelled else { return }
            do {
                try await runCodevatorCommand(["volume", String(clampedVolume)])
                lastError = nil
            } catch {
                lastError = "Could not change volume: \(error.localizedDescription)"
                refreshFromDisk()
            }
        }
    }

    func previewCurrentMode() async {
        guard !isPreviewRunning else { return }

        isPreviewRunning = true
        defer { isPreviewRunning = false }

        do {
            let process = Process()
            process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
            process.arguments = ["npx", "codevator", "preview", config.mode]
            process.currentDirectoryURL = FileManager.default.homeDirectoryForCurrentUser

            let outputPipe = Pipe()
            process.standardOutput = outputPipe
            process.standardError = outputPipe

            try process.run()
            process.waitUntilExit()

            if process.terminationStatus != 0 {
                let data = outputPipe.fileHandleForReading.readDataToEndOfFile()
                let message = String(data: data, encoding: .utf8)?
                    .trimmingCharacters(in: .whitespacesAndNewlines)
                lastError = message?.isEmpty == false ? message : "Preview failed."
            } else {
                lastError = nil
            }
        } catch {
            lastError = error.localizedDescription
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

    private func runCodevatorCommand(_ arguments: [String]) async throws {
        let outputPipe = Pipe()
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
        process.arguments = ["npx", "codevator"] + arguments
        process.currentDirectoryURL = FileManager.default.homeDirectoryForCurrentUser
        process.standardOutput = outputPipe
        process.standardError = outputPipe

        try process.run()

        let status = await withCheckedContinuation { continuation in
            process.terminationHandler = { process in
                continuation.resume(returning: process.terminationStatus)
            }
        }

        guard status == 0 else {
            let data = outputPipe.fileHandleForReading.readDataToEndOfFile()
            let message = String(data: data, encoding: .utf8)?
                .trimmingCharacters(in: .whitespacesAndNewlines)
            throw NSError(
                domain: "CodevatorMenuBar",
                code: Int(status),
                userInfo: [
                    NSLocalizedDescriptionKey: message?.isEmpty == false
                        ? message!
                        : "codevator exited with status \(status)."
                ]
            )
        }
    }

    private func isSpotifyInstalled() -> Bool {
        NSWorkspace.shared.urlForApplication(withBundleIdentifier: "com.spotify.client") != nil
    }

    private func startMonitoring(directoryURL: URL) {
        do {
            try FileManager.default.createDirectory(at: directoryURL, withIntermediateDirectories: true)
        } catch {
            lastError = "Could not prepare config directory: \(error.localizedDescription)"
            return
        }

        configDirectoryDescriptor = open(directoryURL.path, O_EVTONLY)
        guard configDirectoryDescriptor >= 0 else { return }

        let source = DispatchSource.makeFileSystemObjectSource(
            fileDescriptor: configDirectoryDescriptor,
            eventMask: [.write, .rename, .delete, .attrib, .extend],
            queue: .main
        )

        source.setEventHandler { [weak self] in
            self?.scheduleReload()
        }

        source.setCancelHandler { [descriptor = configDirectoryDescriptor] in
            if descriptor >= 0 {
                close(descriptor)
            }
        }

        configMonitor = source
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
