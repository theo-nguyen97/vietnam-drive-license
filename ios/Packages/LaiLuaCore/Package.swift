// swift-tools-version:5.9
import PackageDescription

/// Phần logic thuần Swift của Lái Lụa (không phụ thuộc UIKit/SwiftUI) — dùng chung cho app iOS
/// và chạy được `swift test` trên macOS lẫn Linux.
let package = Package(
    name: "LaiLuaCore",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [.library(name: "LaiLuaCore", targets: ["LaiLuaCore"])],
    targets: [
        .target(name: "LaiLuaCore"),
        .testTarget(name: "LaiLuaCoreTests", dependencies: ["LaiLuaCore"]),
    ]
)
