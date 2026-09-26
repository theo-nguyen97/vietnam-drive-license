import UIKit

/// Ảnh biển báo (PNG 256 px trong `assets/signs`) — cache trong bộ nhớ.
final class SignImages: @unchecked Sendable {
    private let baseURL: URL?
    private var cache: [String: UIImage?] = [:]
    private let lock = NSLock()

    init(baseURL: URL?) { self.baseURL = baseURL }

    func image(_ code: String) -> UIImage? {
        lock.lock(); defer { lock.unlock() }
        if let hit = cache[code] { return hit }
        let img = baseURL.flatMap { UIImage(contentsOfFile: $0.appendingPathComponent("\(code).png").path) }
        cache[code] = img
        return img
    }
}
