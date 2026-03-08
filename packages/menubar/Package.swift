// swift-tools-version: 6.2
import PackageDescription

let package = Package(
    name: "CodevatorMenuBar",
    platforms: [
        .macOS("26.0")
    ],
    products: [
        .executable(name: "CodevatorMenuBar", targets: ["CodevatorMenuBar"])
    ],
    targets: [
        .executableTarget(
            name: "CodevatorMenuBar",
            path: "Sources/CodevatorMenuBar",
            resources: [
                .process("Resources")
            ]
        )
    ]
)
