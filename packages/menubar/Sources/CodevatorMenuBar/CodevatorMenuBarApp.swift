import AppKit
import SwiftUI

@main
struct CodevatorMenuBarApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var store = CodevatorConfigStore()

    var body: some Scene {
        MenuBarExtra("Codevator", systemImage: store.statusImageName) {
            MenuBarContentView(store: store)
        }
        .menuBarExtraStyle(.window)
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        CodevatorFonts.registerAll()
        NSApp.setActivationPolicy(.accessory)
    }
}
