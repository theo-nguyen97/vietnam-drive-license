import Foundation

/// Bộ sinh số giả ngẫu nhiên mulberry32 — cùng thuật toán và cùng kết quả với bản web
/// (src/lib/random.ts) và Android để "Đề số N" trên mọi nền tảng là một.
public struct Rng {
    private var a: UInt32

    public init(seed: UInt64) { a = UInt32(truncatingIfNeeded: seed) }

    public mutating func next() -> Double {
        a = a &+ 0x6d2b79f5
        var t = a
        t = (t ^ (t >> 15)) &* (t | 1)
        t ^= t &+ (t ^ (t >> 7)) &* (t | 61)
        return Double(t ^ (t >> 14)) / 4294967296.0
    }
}

extension Array {
    /// Trộn Fisher–Yates dùng `rng` (giống `shuffle()` của web).
    public func shuffled(using rng: inout Rng) -> [Element] {
        var a = self
        if a.count < 2 { return a }
        for i in stride(from: a.count - 1, through: 1, by: -1) {
            let j = Int((rng.next() * Double(i + 1)).rounded(.down))
            a.swapAt(i, j)
        }
        return a
    }
}

/// Giống `hash()` của web, kể cả việc JS nhân số thực 64-bit rồi mới ép về 32-bit.
public func jsHash(_ n: Int64) -> UInt64 {
    let x = Double(n) * 2654435761.0
    let u = toUint32(x)
    let r = Int32(bitPattern: UInt32(u)) ^ Int32(bitPattern: UInt32(u >> 16))
    return UInt64(UInt32(bitPattern: r))
}

private func toUint32(_ d: Double) -> UInt64 {
    let m = abs(d).truncatingRemainder(dividingBy: 4294967296.0)
    let v = UInt64(m.rounded(.down))
    return d < 0 ? (4294967296 - v) & 0xFFFF_FFFF : v
}

/// `key.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 1_000_000_007, 7)`
public func jsStringSeed(_ key: String) -> Int64 {
    var a: Int64 = 7
    for unit in key.utf16 { a = (a * 31 + Int64(unit)) % 1_000_000_007 }
    return a
}
