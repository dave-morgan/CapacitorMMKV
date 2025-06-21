// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "DavemorganMmkv",
    platforms: [.iOS(.v14)],
    products: [
        .library(
            name: "DavemorganMmkv",
            targets: ["CapacitorMMKVPlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "CapacitorMMKVPlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm")
            ],
            path: "ios/Sources/CapacitorMMKVPlugin"),
        .testTarget(
            name: "CapacitorMMKVPluginTests",
            dependencies: ["CapacitorMMKVPlugin"],
            path: "ios/Tests/CapacitorMMKVPluginTests")
    ]
)