import AppKit
import SwiftUI

@main
struct CodevatorMenuBarApp: App {
    @StateObject private var store = CodevatorConfigStore()

    var body: some Scene {
        MenuBarExtra("Codevator", systemImage: store.statusImageName) {
            MenuBarContentView(store: store)
        }
        .menuBarExtraStyle(.window)
    }
}
