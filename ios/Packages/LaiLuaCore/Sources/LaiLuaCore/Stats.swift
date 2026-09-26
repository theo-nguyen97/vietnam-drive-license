import Foundation

public struct Rank: Hashable, Sendable {
    public let xp: Int
    public let name: String
    public let icon: String
}

public let RANKS: [Rank] = [
    Rank(xp: 0, name: "Học viên", icon: "🔰"),
    Rank(xp: 150, name: "Tài xế tập sự", icon: "🚲"),
    Rank(xp: 400, name: "Tài xế", icon: "🛵"),
    Rank(xp: 900, name: "Tay lái cứng", icon: "🚗"),
    Rank(xp: 1800, name: "Tay lái lụa", icon: "🏎️"),
    Rank(xp: 3500, name: "Huyền thoại đường phố", icon: "🏆"),
]

public struct RankInfo: Sendable {
    public let rank: Rank
    public let level: Int
    public let next: Rank?
    public let progress: Double
}

public func rankOf(_ xp: Int) -> RankInfo {
    var idx = 0
    for (i, r) in RANKS.enumerated() where xp >= r.xp { idx = i }
    let cur = RANKS[idx]
    let next = idx + 1 < RANKS.count ? RANKS[idx + 1] : nil
    let progress = next.map { Double(xp - cur.xp) / Double($0.xp - cur.xp) } ?? 1
    return RankInfo(rank: cur, level: idx + 1, next: next, progress: min(1, max(0, progress)))
}

public struct ChapterProgress: Sendable {
    public var total = 0
    public var mastered = 0
    public var seen = 0
}

public struct LicenseProgress: Sendable {
    public let total: Int
    public let mastered: Int
    public let seen: Int
    public let wrong: Int
    public let pct: Double
    public let chapters: [Int: ChapterProgress]
    public let exams: Int
    public let passed: Int
    public let best: Double
    public let critical: Int
    public let criticalMastered: Int
}

public func licenseProgress(_ repo: Repo, _ licenseId: String, stats: [Int: QStat], exams: [ExamRecord]) -> LicenseProgress {
    let qs = repo.questionsFor(licenseId)
    var mastered = 0, seen = 0, wrong = 0
    var chapters: [Int: ChapterProgress] = [:]
    for q in qs {
        var ch = chapters[q.chapter] ?? ChapterProgress()
        ch.total += 1
        if let s = stats[q.id] {
            seen += 1; ch.seen += 1
            if s.last == 1 { mastered += 1; ch.mastered += 1 } else { wrong += 1 }
        }
        chapters[q.chapter] = ch
    }
    let mine = exams.filter { $0.license.caseInsensitiveCompare(licenseId) == .orderedSame }
    let critical = qs.filter { $0.critical }
    return LicenseProgress(
        total: qs.count, mastered: mastered, seen: seen, wrong: wrong,
        pct: qs.isEmpty ? 0 : Double(mastered) / Double(qs.count),
        chapters: chapters,
        exams: mine.count, passed: mine.filter { $0.passed }.count,
        best: mine.map { Double($0.correct) / Double(max(1, $0.total)) }.max() ?? 0,
        critical: critical.count, criticalMastered: critical.filter { stats[$0.id]?.last == 1 }.count
    )
}

// MARK: - Dự đoán khả năng đậu (src/lib/predict.ts)

public struct Reason: Hashable, Sendable {
    public let icon: String
    public let text: String
    public let good: Bool
}

public struct Prediction: Hashable, Sendable {
    public let p: Double
    public let confidence: String
    public let label: String
    public let tone: String
    public let reasons: [Reason]
}

public final class Predictor: @unchecked Sendable {
    private let repo: Repo
    private let exams: ExamBuilder
    private let sets: SetBuilder

    public init(repo: Repo, exams: ExamBuilder, sets: SetBuilder) {
        self.repo = repo; self.exams = exams; self.sets = sets
    }

    private func probCorrect(_ q: Question, _ s: QStat?, _ topicAcc: [String: Double]) -> Double {
        guard let s else {
            guard let acc = topicAcc[q.topic] else { return 0.42 }
            return 0.25 + 0.5 * acc
        }
        return s.last == 1
            ? min(0.97, 0.8 + 0.035 * Double(s.box) - 0.04 * Double(min(s.w, 2)))
            : min(0.55, 0.3 + 0.06 * Double(min(s.c, 3)))
    }

    /// P(số câu đúng ≥ k) — phân phối Poisson-nhị thức.
    private func atLeast(_ ps: [Double], _ k: Int) -> Double {
        var dist: [Double] = [1]
        for p in ps {
            var next = [Double](repeating: 0, count: dist.count + 1)
            for i in dist.indices {
                next[i] += dist[i] * (1 - p)
                next[i + 1] += dist[i] * p
            }
            dist = next
        }
        var sum = 0.0
        if max(0, k) < dist.count { for i in max(0, k)..<dist.count { sum += dist[i] } }
        return sum
    }

    public func predict(_ licenseId: String, version: ExamVersion, stats: [Int: QStat], history: [ExamRecord], samples: Int = 60) -> Prediction {
        guard let lic = repo.license(licenseId) else {
            return Prediction(p: 0, confidence: "low", label: "Mới bắt đầu", tone: "red", reasons: [])
        }
        let cfg = lic.config(version)
        let pool = repo.questionsFor(licenseId)
        let reports = sets.analyze(licenseId, stats: stats)
        var topicAcc: [String: Double] = [:]
        for r in reports { if let acc = r.accuracy, r.attempts >= 2 { topicAcc[r.topic.id] = acc } }

        var total = 0.0
        for i in 0..<samples {
            let exam = exams.build(licenseId, seed: UInt64(1000 + i * 7919), version: version)
            let crit = exam.first { $0.critical }
            let rest = exam.filter { $0.id != crit?.id }.map { probCorrect($0, stats[$0.id], topicAcc) }
            let pc = crit.map { probCorrect($0, stats[$0.id], topicAcc) } ?? 1
            total += pc * atLeast(rest, cfg.pass - (crit != nil ? 1 : 0))
        }
        var p = total / Double(samples)

        let recent = Array(history.filter { $0.license.caseInsensitiveCompare(licenseId) == .orderedSame && ($0.version ?? "tt12") == version.key }.prefix(5))
        if recent.count >= 2 {
            let rate = Double(recent.filter { $0.passed }.count) / Double(recent.count)
            p = 0.7 * p + 0.3 * rate
        }

        let seen = pool.filter { stats[$0.id] != nil }.count
        let coverage = Double(seen) / Double(max(1, pool.count))
        let confidence = coverage < 0.3 ? "low" : (coverage < 0.7 ? "medium" : "high")
        let critical = pool.filter { $0.critical }
        let critOk = critical.filter { stats[$0.id]?.last == 1 }.count
        let weak = reports.first { $0.status == .danger }

        var reasons: [Reason] = []
        let unseen = pool.count - seen
        reasons.append(unseen > 0
            ? Reason(icon: "📚", text: "Còn \(unseen)/\(pool.count) câu chưa học", good: Double(unseen) < Double(pool.count) * 0.1)
            : Reason(icon: "📚", text: "Đã học hết ngân hàng câu hỏi", good: true))
        reasons.append(Reason(icon: "⚠️", text: "Điểm liệt đã thuộc \(critOk)/\(critical.count) câu", good: critOk == critical.count))
        if let weak {
            let pct = Int(((weak.accuracy ?? 0) * 100).rounded(.toNearestOrAwayFromZero))
            reasons.append(Reason(icon: weak.topic.icon, text: "Hay sai: \(weak.topic.name) (đúng \(pct)%)", good: false))
        }
        if !recent.isEmpty {
            let ok = recent.filter { $0.passed }.count
            reasons.append(Reason(icon: "🏁", text: "Thi thử gần đây: đạt \(ok)/\(recent.count) lần", good: Double(ok) / Double(recent.count) >= 0.8))
        }
        let tone = p >= 0.8 ? "green" : (p >= 0.5 ? "amber" : "red")
        let label: String
        if p >= 0.9 { label = "Sẵn sàng đi thi" } else if p >= 0.8 { label = "Khả năng cao" } else if p >= 0.5 { label = "Cần luyện thêm" } else if p >= 0.2 { label = "Chưa sẵn sàng" } else { label = "Mới bắt đầu" }
        return Prediction(p: p, confidence: confidence, label: label, tone: tone, reasons: reasons)
    }
}
