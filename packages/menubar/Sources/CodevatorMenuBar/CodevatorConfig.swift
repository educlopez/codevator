import Foundation

struct SoundProfile: Codable, Equatable {
    var mode: String
    var volume: Int
}

struct CodevatorConfig: Codable, Equatable {
    var mode: String
    var volume: Int
    var enabled: Bool
    var profiles: [String: SoundProfile]?
    var activeProfile: String?
    var agent: String?

    static let `default` = CodevatorConfig(
        mode: "elevator",
        volume: 70,
        enabled: true,
        profiles: nil,
        activeProfile: nil,
        agent: nil
    )
}

enum CodevatorMode: String, CaseIterable, Identifiable {
    case elevator
    case typewriter
    case ambient
    case retro
    case minimal
    case spotify

    var id: String { rawValue }

    var label: String {
        switch self {
        case .elevator: "Elevator"
        case .typewriter: "Typewriter"
        case .ambient: "Ambient"
        case .retro: "Retro"
        case .minimal: "Minimal"
        case .spotify: "Spotify"
        }
    }
}
