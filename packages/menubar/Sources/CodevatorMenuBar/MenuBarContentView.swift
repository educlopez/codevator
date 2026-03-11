import SwiftUI

// MARK: - Mode animation config

private struct ModeAnimConfig: Sendable {
    let interval: TimeInterval
    let animDuration: Double
    let minH: CGFloat
    let maxH: CGFloat

    static func forMode(_ mode: String) -> ModeAnimConfig {
        switch CodevatorMode(rawValue: mode) {
        case .elevator, .none: return .init(interval: 0.55, animDuration: 0.50, minH: 10, maxH: 28)
        case .typewriter:      return .init(interval: 0.14, animDuration: 0.08, minH: 6,  maxH: 34)
        case .ambient:         return .init(interval: 1.40, animDuration: 1.20, minH: 12, maxH: 22)
        case .retro:           return .init(interval: 0.16, animDuration: 0.10, minH: 5,  maxH: 36)
        case .minimal:         return .init(interval: 2.20, animDuration: 2.00, minH: 13, maxH: 19)
        case .spotify:         return .init(interval: 0.32, animDuration: 0.26, minH: 10, maxH: 30)
        }
    }
}

// MARK: - Animated equalizer bars

private struct SignalBars: View {
    let enabled: Bool
    let mode: String

    @State private var heights: [CGFloat] = [9, 14, 24, 19]
    @State private var animTask: Task<Void, Never>?

    private let idleHeights: [CGFloat] = [9, 14, 24, 19]

    var body: some View {
        HStack(alignment: .bottom, spacing: 3) {
            ForEach(0..<4, id: \.self) { i in
                RoundedRectangle(cornerRadius: 2, style: .continuous)
                    .fill(enabled ? Color.accentColor : Color.secondary.opacity(0.3))
                    .frame(width: 4, height: heights[i])
            }
        }
        .frame(height: 32, alignment: .bottom)
        .onAppear { restart(enabled: enabled, mode: mode) }
        .onChange(of: enabled) { _, v in restart(enabled: v, mode: mode) }
        .onChange(of: mode) { _, m in restart(enabled: enabled, mode: m) }
        .onDisappear { animTask?.cancel() }
    }

    private func restart(enabled: Bool, mode: String) {
        animTask?.cancel()
        guard enabled else {
            withAnimation(.easeOut(duration: 0.4)) { heights = idleHeights }
            return
        }
        let cfg = ModeAnimConfig.forMode(mode)
        animTask = Task { @MainActor in
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(cfg.interval))
                guard !Task.isCancelled else { break }
                let next: [CGFloat] = (0..<4).map { _ in .random(in: cfg.minH...cfg.maxH) }
                withAnimation(.easeInOut(duration: cfg.animDuration)) { heights = next }
            }
        }
    }
}

// MARK: - Main view

struct MenuBarContentView: View {
    @ObservedObject var store: CodevatorConfigStore
    @State private var appeared = false

    private let modeColumns = [
        GridItem(.flexible(), spacing: 6),
        GridItem(.flexible(), spacing: 6)
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            hero
            Divider()
            controlsSection
            errorBanner
            Divider()
            footer
        }
        .padding(14)
        .frame(width: 300)
        .opacity(appeared ? 1 : 0)
        .onAppear {
            withAnimation(.easeOut(duration: 0.15)) {
                appeared = true
            }
        }
    }

    // MARK: - Hero

    private var hero: some View {
        HStack(alignment: .top, spacing: 10) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Codevator")
                    .font(.system(size: 16, weight: .semibold))

                Text(store.statusText)
                    .font(.system(size: 11))
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 8)

            VStack(alignment: .trailing, spacing: 8) {
                Text(store.config.enabled ? "LIVE" : "IDLE")
                    .font(.system(size: 9, weight: .semibold, design: .monospaced))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(
                        Capsule(style: .continuous)
                            .fill(store.config.enabled ? Color.red : Color.secondary)
                    )

                SignalBars(enabled: store.config.enabled, mode: store.config.mode)
            }
        }
    }

    // MARK: - Controls

    private var controlsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Playback toggle
            HStack {
                VStack(alignment: .leading, spacing: 1) {
                    Text("Playback")
                        .font(.system(size: 12, weight: .medium))

                    Text(store.config.enabled
                         ? "Sounds play during agent sessions"
                         : "Sounds disabled")
                        .font(.system(size: 10))
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Toggle("", isOn: Binding(
                    get: { store.config.enabled },
                    set: { store.setEnabled($0) }
                ))
                .labelsHidden()
                .toggleStyle(.switch)
                .controlSize(.small)
            }

            Divider()

            // Sound mode
            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("Sound")
                        .font(.system(size: 12, weight: .medium))
                    Spacer()
                    Text(store.displayName(for: store.config.mode))
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(.secondary)
                }

                LazyVGrid(columns: modeColumns, spacing: 6) {
                    ForEach(CodevatorMode.allCases) { mode in
                        Button {
                            store.setMode(mode.rawValue)
                        } label: {
                            Text(mode.label)
                                .font(.system(size: 11, weight: .medium))
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 6)
                        }
                        .buttonStyle(.borderless)
                        .background(
                            RoundedRectangle(cornerRadius: 6, style: .continuous)
                                .fill(store.config.mode == mode.rawValue
                                      ? Color.accentColor.opacity(0.15)
                                      : Color.secondary.opacity(0.08))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 6, style: .continuous)
                                .stroke(store.config.mode == mode.rawValue
                                        ? Color.accentColor.opacity(0.4)
                                        : Color.clear, lineWidth: 1)
                        )
                    }
                }
            }

            Divider()

            // Volume
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text("Volume")
                        .font(.system(size: 12, weight: .medium))
                    Spacer()
                    Text("\(store.config.volume)%")
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(.secondary)
                }

                Slider(
                    value: Binding(
                        get: { Double(store.config.volume) },
                        set: { store.setVolume(Int($0.rounded())) }
                    ),
                    in: 0...100,
                    step: 1
                )
                .controlSize(.small)
            }
        }
    }

    // MARK: - Footer

    private var footer: some View {
        HStack(spacing: 8) {
            if store.isDaemonRunning {
                Image(systemName: "circle.fill")
                    .font(.system(size: 6))
                    .foregroundStyle(.green)
                Text("Daemon active")
                    .font(.system(size: 10))
                    .foregroundStyle(.secondary)
            } else {
                Image(systemName: "circle.fill")
                    .font(.system(size: 6))
                    .foregroundStyle(.secondary.opacity(0.4))
                Text("No active session")
                    .font(.system(size: 10))
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Button("Quit") {
                NSApplication.shared.terminate(nil)
            }
            .buttonStyle(.borderless)
            .font(.system(size: 11))
            .foregroundStyle(.secondary)
        }
    }
}

// MARK: - Error banner

extension MenuBarContentView {
    @ViewBuilder
    var errorBanner: some View {
        if let error = store.lastError {
            Text(error)
                .font(.system(size: 11))
                .foregroundStyle(.red)
                .padding(8)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 6, style: .continuous)
                        .fill(Color.red.opacity(0.08))
                )
        }
    }
}
