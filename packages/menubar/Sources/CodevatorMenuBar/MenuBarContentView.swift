import SwiftUI

// MARK: - Mode color map (mirrors codevator.dev palette)

private extension CodevatorMode {
    var accentColor: Color {
        switch self {
        case .elevator:  Color(red: 0.10, green: 0.42, blue: 0.29)
        case .typewriter: Color(red: 0.55, green: 0.45, blue: 0.33)
        case .ambient:   Color(red: 0.29, green: 0.48, blue: 0.71)
        case .retro:     Color(red: 0.66, green: 0.33, blue: 0.97)
        case .minimal:   Color(red: 0.60, green: 0.60, blue: 0.60)
        case .spotify:   Color(red: 0.11, green: 0.73, blue: 0.33)
        }
    }
}

// MARK: - Mode animation config

private struct ModeAnimConfig: Sendable {
    /// How often heights are randomised
    let interval: TimeInterval
    /// Duration of the animated height transition
    let animDuration: Double
    let minH: CGFloat
    let maxH: CGFloat

    static func forMode(_ mode: String) -> ModeAnimConfig {
        switch mode {
        case "elevator":   return .init(interval: 0.55, animDuration: 0.50, minH: 10, maxH: 28)
        case "typewriter": return .init(interval: 0.14, animDuration: 0.08, minH: 6,  maxH: 34)
        case "ambient":    return .init(interval: 1.40, animDuration: 1.20, minH: 12, maxH: 22)
        case "retro":      return .init(interval: 0.16, animDuration: 0.10, minH: 5,  maxH: 36)
        case "minimal":    return .init(interval: 2.20, animDuration: 2.00, minH: 13, maxH: 19)
        case "spotify":    return .init(interval: 0.32, animDuration: 0.26, minH: 10, maxH: 30)
        default:           return .init(interval: 0.55, animDuration: 0.50, minH: 10, maxH: 28)
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
        HStack(alignment: .bottom, spacing: 4) {
            ForEach(0..<4, id: \.self) { i in
                RoundedRectangle(cornerRadius: 2, style: .continuous)
                    .fill(enabled ? Color.codevatorInk.opacity(0.88) : Color.codevatorMuted.opacity(0.35))
                    .frame(width: 5, height: heights[i])
            }
        }
        .frame(height: 36, alignment: .bottom)
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

    private let modeColumns = [
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8)
    ]

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.codevatorPaper, Color.codevatorPaperShadow],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(alignment: .leading, spacing: 14) {
                hero
                controlsCard

                if let lastError = store.lastError {
                    Text(lastError)
                        .font(.codevatorSans(11))
                        .foregroundStyle(Color.codevatorAlert)
                        .padding(.horizontal, 11)
                        .padding(.vertical, 9)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .fill(Color.codevatorAlertBackground)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke(Color.codevatorAlert.opacity(0.18), lineWidth: 0.8)
                        )
                }

                footer
            }
            .padding(14)
        }
        .frame(width: 318)
    }

    private var hero: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Codevator.")
                    .font(.codevatorDisplay(22))
                    .foregroundStyle(Color.codevatorInk)

                Text("Elevator music for your coding agent")
                    .font(.codevatorSans(10, weight: .semibold))
                    .foregroundStyle(Color.codevatorMuted)
                    .textCase(.uppercase)
                    .tracking(0.8)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)

                Text(store.statusText)
                    .font(.codevatorDisplayItalic(14))
                    .foregroundStyle(Color.codevatorMuted)
                    .lineLimit(2)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 8)

            VStack(alignment: .trailing, spacing: 10) {
                Text(store.config.enabled ? "LIVE" : "IDLE")
                    .font(.codevatorMono(10, weight: .medium))
                    .foregroundStyle(Color.codevatorPaper)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(
                        Capsule(style: .continuous)
                            .fill(store.config.enabled ? Color.codevatorLive : Color.codevatorInk)
                    )

                SignalBars(enabled: store.config.enabled, mode: store.config.mode)
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(Color.codevatorHero)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.codevatorStroke, lineWidth: 0.8)
        )
    }

    private var controlsCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .center, spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    sectionLabel("Playback")

                    Text(store.config.enabled ? "On" : "Off")
                        .font(.codevatorDisplay(17))
                        .foregroundStyle(Color.codevatorInk)
                }

                Spacer()

                Toggle("", isOn: Binding(
                    get: { store.config.enabled },
                    set: { store.setEnabled($0) }
                ))
                .labelsHidden()
                .toggleStyle(.switch)
                .tint(Color.codevatorInk)
                .scaleEffect(0.9)
            }

            Divider()
                .overlay(Color.codevatorStroke)

            VStack(alignment: .leading, spacing: 9) {
                HStack(alignment: .firstTextBaseline) {
                    sectionLabel("Sound")

                    Spacer()

                    Text(store.displayName(for: store.config.mode))
                        .font(.codevatorMono(10, weight: .medium))
                        .foregroundStyle(Color.codevatorMuted)
                }

                LazyVGrid(columns: modeColumns, spacing: 8) {
                    ForEach(CodevatorMode.allCases) { mode in
                        Button(mode.label) {
                            store.setMode(mode.rawValue)
                        }
                        .buttonStyle(ModeChipButtonStyle(
                            isSelected: store.config.mode == mode.rawValue,
                            color: mode.accentColor
                        ))
                    }
                }
            }

            Divider()
                .overlay(Color.codevatorStroke)

            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .firstTextBaseline) {
                    sectionLabel("Volume")

                    Spacer()

                    Text("\(store.config.volume)%")
                        .font(.codevatorMono(10, weight: .medium))
                        .foregroundStyle(Color.codevatorInk)
                }

                Slider(
                    value: Binding(
                        get: { Double(store.config.volume) },
                        set: { store.setVolume(Int($0.rounded())) }
                    ),
                    in: 0...100,
                    step: 1
                )
                .tint(Color.codevatorInk)
                .controlSize(.small)
            }
        }
        .padding(14)
        .background(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .fill(Color.codevatorPanel)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(Color.codevatorStroke, lineWidth: 0.8)
        )
    }

    private var footer: some View {
        HStack(spacing: 10) {
            Button(store.isPreviewRunning ? "Previewing..." : "Preview") {
                Task {
                    await store.previewCurrentMode()
                }
            }
            .buttonStyle(CodevatorPrimaryButtonStyle())
            .disabled(store.isPreviewRunning)

            Spacer()

            Button("Quit") {
                NSApplication.shared.terminate(nil)
            }
            .buttonStyle(CodevatorSecondaryButtonStyle())
        }
    }

    private func sectionLabel(_ text: String) -> some View {
        Text(text)
            .font(.codevatorSans(10, weight: .semibold))
            .foregroundStyle(Color.codevatorMuted)
            .textCase(.uppercase)
            .tracking(1.15)
    }
}

// MARK: - Button styles

private struct ModeChipButtonStyle: ButtonStyle {
    let isSelected: Bool
    let color: Color

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.codevatorSans(12, weight: .semibold))
            .foregroundStyle(isSelected ? Color.white : Color.codevatorInk)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 8)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(isSelected ? color : Color.codevatorPaper.opacity(configuration.isPressed ? 0.9 : 0.48))
            )
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(isSelected ? Color.clear : Color.codevatorStroke, lineWidth: 0.8)
            )
            .scaleEffect(configuration.isPressed ? 0.988 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

private struct CodevatorPrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.codevatorSans(13, weight: .semibold))
            .foregroundStyle(Color.codevatorPaper)
            .padding(.horizontal, 18)
            .padding(.vertical, 10)
            .background(
                Capsule(style: .continuous)
                    .fill(Color.codevatorInk.opacity(configuration.isPressed ? 0.84 : 1))
            )
            .scaleEffect(configuration.isPressed ? 0.988 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

private struct CodevatorSecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.codevatorSans(13))
            .foregroundStyle(Color.codevatorInk)
            .padding(.horizontal, 15)
            .padding(.vertical, 10)
            .background(
                Capsule(style: .continuous)
                    .fill(Color.codevatorPaper.opacity(configuration.isPressed ? 0.7 : 0.26))
            )
            .overlay(
                Capsule(style: .continuous)
                    .stroke(Color.codevatorStroke, lineWidth: 0.9)
            )
            .scaleEffect(configuration.isPressed ? 0.988 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

// MARK: - Color palette

private extension Color {
    static let codevatorPaper = Color(red: 0.953, green: 0.949, blue: 0.92)
    static let codevatorPaperShadow = Color(red: 0.905, green: 0.898, blue: 0.854)
    static let codevatorHero = Color(red: 0.906, green: 0.912, blue: 0.855)
    static let codevatorPanel = Color(red: 0.846, green: 0.854, blue: 0.797, opacity: 0.58)
    static let codevatorPanelDeep = Color(red: 0.76, green: 0.772, blue: 0.708)
    static let codevatorStroke = Color(red: 0.372, green: 0.408, blue: 0.33, opacity: 0.11)
    static let codevatorInk = Color(red: 0.157, green: 0.173, blue: 0.123)
    static let codevatorMuted = Color(red: 0.331, green: 0.356, blue: 0.274)
    static let codevatorLive = Color(red: 0.72, green: 0.14, blue: 0.12)
    static let codevatorAlert = Color(red: 0.55, green: 0.23, blue: 0.19)
    static let codevatorAlertBackground = Color(red: 0.93, green: 0.86, blue: 0.81)
}
