import AppKit
import CoreText
import SwiftUI

enum CodevatorFonts {
    private static let fontFiles = [
        "InstrumentSerif-Regular.ttf",
        "InstrumentSerif-Italic.ttf",
        "Inter-Regular.ttf",
        "Inter-SemiBold.ttf",
        "Inter-Bold.ttf",
        "IBMPlexMono-Regular.ttf",
        "IBMPlexMono-Medium.ttf"
    ]

    static func registerAll() {
        fontFiles.forEach(registerFont(named:))
    }

    private static func registerFont(named fileName: String) {
        guard let url = Bundle.module.url(forResource: fileName, withExtension: nil) else {
            return
        }

        var error: Unmanaged<CFError>?
        CTFontManagerRegisterFontsForURL(url as CFURL, .process, &error)
    }
}

extension Font {
    static func codevatorDisplay(_ size: CGFloat) -> Font {
        .custom("InstrumentSerif-Regular", size: size)
    }

    static func codevatorDisplayItalic(_ size: CGFloat) -> Font {
        .custom("InstrumentSerif-Italic", size: size)
    }

    static func codevatorSans(_ size: CGFloat, weight: CodevatorSansWeight = .regular) -> Font {
        .custom(weight.fontName, size: size)
    }

    static func codevatorMono(_ size: CGFloat, weight: CodevatorMonoWeight = .regular) -> Font {
        .custom(weight.fontName, size: size)
    }
}

enum CodevatorSansWeight {
    case regular
    case semibold
    case bold

    fileprivate var fontName: String {
        switch self {
        case .regular:
            "Inter-Regular"
        case .semibold:
            "Inter-SemiBold"
        case .bold:
            "Inter-Bold"
        }
    }
}

enum CodevatorMonoWeight {
    case regular
    case medium

    fileprivate var fontName: String {
        switch self {
        case .regular:
            "IBMPlexMono-Regular"
        case .medium:
            "IBMPlexMono-Medium"
        }
    }
}
