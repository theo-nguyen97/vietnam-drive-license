import Foundation

/// Sinh đề & chấm thi — chuyển từ src/lib/exam.ts, giữ nguyên thuật toán.
public final class ExamBuilder: @unchecked Sendable {
    private let repo: Repo
    private var setCache: [String: [[Question]]] = [:]
    private let lock = NSLock()

    public init(repo: Repo) { self.repo = repo }

    private let planTt12: [Int: [Int: Int]] = [
        25: [1: 8, 2: 1, 3: 1, 5: 8, 6: 6],
        30: [1: 8, 2: 1, 3: 1, 4: 1, 5: 9, 6: 9],
        35: [1: 10, 2: 1, 3: 2, 4: 1, 5: 10, 6: 10],
        40: [1: 10, 2: 1, 3: 2, 4: 1, 5: 14, 6: 11],
        45: [1: 10, 2: 1, 3: 2, 4: 1, 5: 16, 6: 14],
    ]

    private let planTt108: [String: [Int: Int]] = [
        "moto-40": [1: 14, 2: 3, 3: 2, 5: 12, 6: 8],
        "moto-50": [1: 17, 2: 3, 3: 3, 5: 14, 6: 12],
        "car-50": [1: 14, 2: 3, 3: 2, 4: 1, 5: 15, 6: 14],
        "car-60": [1: 17, 2: 3, 3: 3, 4: 2, 5: 17, 6: 17],
        "car-70": [1: 19, 2: 3, 3: 3, 4: 2, 5: 22, 6: 20],
        "car-80": [1: 21, 2: 4, 3: 3, 4: 2, 5: 26, 6: 23],
        "car-90": [1: 23, 2: 4, 3: 4, 4: 2, 5: 30, 6: 26],
    ]

    /// Phân bổ số câu theo chương (không tính câu điểm liệt). Thứ tự chương tăng dần.
    public func plan(_ licenseId: String, _ version: ExamVersion) -> [(chapter: Int, count: Int)] {
        guard let lic = repo.license(licenseId) else { return [] }
        let total = lic.config(version).total
        let base: [Int: Int]
        if version == .tt108 {
            base = planTt108["\(lic.group)-\(total)"] ?? planTt108[lic.isMoto ? "moto-40" : "car-90"]!
        } else {
            base = planTt12[total] ?? planTt12[45]!
        }
        return fitPlan(base, target: total - 1, moto: lic.isMoto)
    }

    private func fitPlan(_ plan: [Int: Int], target: Int, moto: Bool) -> [(chapter: Int, count: Int)] {
        let entries = plan.keys.sorted().map { ($0, plan[$0]!) }.filter { ch, n in n > 0 && !(moto && ch == 4) }
        let sum = entries.reduce(0) { $0 + $1.1 }
        if sum == target { return entries.map { (chapter: $0.0, count: $0.1) } }
        var scaled = entries.map { ch, n in [ch, max(1, Int((Double(n) * Double(target) / Double(sum)).rounded(.down)))] }
        var diff = target - scaled.reduce(0) { $0 + $1[1] }
        var i = 0
        while diff != 0 && i < scaled.count * 4 {
            let candidates = [1, 5, 6, 2, 3, 4].map { c in scaled.firstIndex { $0[0] == c } ?? -1 }.filter { $0 >= 0 }
            let pick = i % min(3, scaled.count)
            guard pick < candidates.count else { break }
            let idx = candidates[pick]
            scaled[idx][1] += diff.signum()
            diff -= diff.signum()
            i += 1
        }
        return scaled.map { (chapter: $0[0], count: $0[1]) }
    }

    /// Chương 1 → câu điểm liệt → các chương còn lại.
    private func orderExam(_ qs: [Question]) -> [Question] {
        func rank(_ q: Question) -> Double { q.critical ? 1.5 : Double(q.chapter) }
        return qs.sorted { a, b in
            let ra = rank(a), rb = rank(b)
            return ra != rb ? ra < rb : a.id < b.id
        }
    }

    private final class Cycle {
        private let items: [Question]
        private var i = 0
        init(_ items: [Question]) { self.items = items }

        func take(_ n: Int, used: inout Set<Int>) -> [Question] {
            var out: [Question] = []
            if items.isEmpty { return out }
            var guardCount = 0
            while out.count < n && guardCount < items.count * 2 {
                let it = items[i % items.count]
                i += 1; guardCount += 1
                if used.insert(it.id).inserted { out.append(it) }
            }
            return out
        }
    }

    /// pick(chapter hoặc 0 = điểm liệt, n, used)
    private func compose(_ licenseId: String, _ version: ExamVersion, pick: (Int, Int, inout Set<Int>) -> [Question]) -> [Question] {
        guard let lic = repo.license(licenseId) else { return [] }
        let total = lic.config(version).total
        var used = Set<Int>()
        var out = pick(0, 1, &used)
        for (ch, n) in plan(licenseId, version) { out += pick(ch, n, &used) }
        for ch in [1, 5, 6] {
            if out.count >= total { break }
            out += pick(ch, total - out.count, &used)
        }
        return orderExam(Array(out.prefix(total)))
    }

    /// Đề ngẫu nhiên theo seed.
    public func build(_ licenseId: String, seed: UInt64, version: ExamVersion) -> [Question] {
        var rng = Rng(seed: seed)
        let pool = repo.questionsFor(licenseId)
        return compose(licenseId, version) { ch, n, used in
            let src = ch == 0 ? pool.filter { $0.critical } : pool.filter { $0.chapter == ch && !$0.critical }
            let picked = Array(src.shuffled(using: &rng).filter { !used.contains($0.id) }.prefix(n))
            for q in picked { used.insert(q.id) }
            return picked
        }
    }

    public func setCount(_ licenseId: String) -> Int { repo.license(licenseId)?.isMoto == true ? 10 : 20 }

    /// Bộ đề cố định "Đề số 1…N" — tất định theo mã hạng, giống hệt bản web.
    public func sets(_ licenseId: String, _ version: ExamVersion) -> [[Question]] {
        let key = "\(licenseId.uppercased())-\(version.key)"
        lock.lock(); defer { lock.unlock() }
        if let cached = setCache[key] { return cached }
        var rng = Rng(seed: jsHash(jsStringSeed(key)))
        let pool = repo.questionsFor(licenseId)
        var cycles: [Int: Cycle] = [:]
        cycles[0] = Cycle(pool.filter { $0.critical }.shuffled(using: &rng))
        for ch in 1...6 { cycles[ch] = Cycle(pool.filter { $0.chapter == ch && !$0.critical }.shuffled(using: &rng)) }
        let sets = (0..<setCount(licenseId)).map { _ in
            compose(licenseId, version) { ch, n, used in cycles[ch]!.take(n, used: &used) }
        }
        setCache[key] = sets
        return sets
    }

    public struct Result: Hashable, Sendable {
        public let correct: Int
        public let total: Int
        public let passed: Bool
        public let criticalFail: Bool
        public let wrongIds: [Int]
    }

    public func grade(_ licenseId: String, questions: [Question], answers: [Int: Int], version: ExamVersion) -> Result {
        let cfg = repo.license(licenseId)?.config(version) ?? ExamConfig(total: questions.count, minutes: 0, pass: questions.count)
        var correct = 0
        var criticalFail = false
        var wrong: [Int] = []
        for q in questions {
            if answers[q.id] == q.answer { correct += 1 } else {
                wrong.append(q.id)
                if q.critical { criticalFail = true }
            }
        }
        return Result(correct: correct, total: questions.count, passed: !criticalFail && correct >= cfg.pass, criticalFail: criticalFail, wrongIds: wrong)
    }
}
