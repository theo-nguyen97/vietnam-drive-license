import Foundation

/// Các bài ôn tập (chuyển từ src/lib/sets.ts).
public final class SetBuilder: @unchecked Sendable {
    public static let dailySize = 20
    public static let staticKeys = ["hom-nay", "tat-ca", "diem-liet", "cau-sai", "ngau-nhien", "da-luu"]

    private let repo: Repo
    public init(repo: Repo) { self.repo = repo }

    public struct Meta: Hashable, Sendable {
        public let title: String
        public let desc: String
        public let icon: String
        public init(_ title: String, _ desc: String, _ icon: String) { self.title = title; self.desc = desc; self.icon = icon }
    }

    public func meta(_ key: String) -> Meta {
        if key.hasPrefix("chu-de-") {
            if let t = repo.topic(String(key.dropFirst("chu-de-".count))) { return Meta(t.name, t.hint, t.icon) }
            return Meta("Ôn tập", "", "📘")
        }
        if key == "diem-yeu" { return Meta("Luyện điểm yếu", "Câu hỏi từ các chủ đề bạn hay sai nhất", "🩺") }
        if key.hasPrefix("chuong-") {
            if let id = Int(key.dropFirst("chuong-".count)), let ch = repo.chapter(id) { return Meta(ch.short, ch.name, ch.icon) }
            return Meta("Ôn tập", "", "📘")
        }
        switch key {
        case "hom-nay": return Meta("Ôn tập hôm nay", "Lặp lại ngắt quãng: câu đến hạn ôn + câu mới", "📅")
        case "tat-ca": return Meta("Toàn bộ câu hỏi", "Chạy lần lượt qua tất cả các trạm", "🛣️")
        case "diem-liet": return Meta("Câu điểm liệt", "Sai một câu là trượt — phải thuộc lòng", "⚠️")
        case "cau-sai": return Meta("Câu hay sai", "Những câu bạn trả lời sai ở lần gần nhất", "🔁")
        case "ngau-nhien": return Meta("Chạy ngẫu nhiên", "20 câu bất kỳ — khởi động nhanh", "🎲")
        case "da-luu": return Meta("Câu đã lưu", "Các câu bạn đánh dấu để ôn lại", "🔖")
        default: return Meta("Ôn tập", "", "📘")
        }
    }

    public func build(_ licenseId: String, key: String, stats: [Int: QStat], bookmarks: [Int]) -> [Question] {
        let all = repo.questionsFor(licenseId)
        if key.hasPrefix("chuong-") {
            let id = Int(key.dropFirst("chuong-".count))
            return all.filter { $0.chapter == id }
        }
        if key.hasPrefix("chu-de-") { return topicSet(licenseId, topicId: String(key.dropFirst("chu-de-".count)), stats: stats) }
        switch key {
        case "diem-yeu": return weaknessSet(licenseId, stats: stats)
        case "hom-nay": return dailySet(all, stats: stats)
        case "diem-liet": return all.filter { $0.critical }
        case "cau-sai": return all.filter { stats[$0.id]?.last == 0 }
        case "ngau-nhien": return Array(all.shuffled().prefix(20))
        case "da-luu":
            let set = Set(bookmarks)
            return all.filter { set.contains($0.id) }
        default: return all
        }
    }

    /// Câu đến hạn ôn (theo hộp Leitner), ưu tiên câu điểm liệt và câu quá hạn lâu.
    public func dueQuestions(_ all: [Question], stats: [Int: QStat], now: Int64 = nowMillis()) -> [Question] {
        all.filter { q in
            guard let s = stats[q.id] else { return false }
            return (s.due ?? s.t) <= now
        }.sorted { a, b in
            let ca = a.critical ? 0 : 1, cb = b.critical ? 0 : 1
            if ca != cb { return ca < cb }
            return (stats[a.id]?.due ?? 0) < (stats[b.id]?.due ?? 0)
        }
    }

    public func dailySet(_ all: [Question], stats: [Int: QStat]) -> [Question] {
        let due = Array(dueQuestions(all, stats: stats).prefix(Self.dailySize))
        if due.count >= Self.dailySize { return due }
        let fresh = all.filter { stats[$0.id] == nil }
        let critical = fresh.filter { $0.critical }
        let others = fresh.filter { !$0.critical }.shuffled()
        let picked = Array((Array(critical.prefix(3)) + others).prefix(Self.dailySize - due.count))
        return due + picked
    }

    /// Số câu đến hạn và số câu mới trong bài hôm nay.
    public func dailyCounts(_ licenseId: String, stats: [Int: QStat]) -> (due: Int, fresh: Int) {
        let all = repo.questionsFor(licenseId)
        let due = min(dueQuestions(all, stats: stats).count, Self.dailySize)
        return (due, max(0, Self.dailySize - due))
    }

    // MARK: - Chủ đề & điểm yếu (src/lib/topics.ts)

    public enum Status: Int, Sendable { case danger = 0, warn, good, unknown }

    public struct TopicReport: Sendable {
        public let topic: Topic
        public let total: Int
        public let seen: Int
        public let attempts: Int
        public let correct: Int
        public let wrongNow: Int
        public let risk: Double
        public let accuracy: Double?
        public let status: Status
    }

    public func analyze(_ licenseId: String, stats: [Int: QStat]) -> [TopicReport] {
        let qs = repo.questionsFor(licenseId)
        return repo.topicsFor(licenseId).map { topic -> TopicReport in
            let list = qs.filter { $0.topic == topic.id }
            var c = 0, w = 0, seen = 0, wrongNow = 0
            for q in list {
                guard let s = stats[q.id] else { continue }
                seen += 1; c += s.c; w += s.w
                if s.last == 0 { wrongNow += 1 }
            }
            let attempts = c + w
            let risk = (Double(w) + Double(wrongNow) * 1.5 + 0.5) / (Double(attempts) + Double(wrongNow) * 1.5 + 4)
            let status: Status
            if attempts < 2 { status = .unknown } else if risk >= 0.33 { status = .danger } else if risk >= 0.16 { status = .warn } else { status = .good }
            return TopicReport(topic: topic, total: list.count, seen: seen, attempts: attempts, correct: c, wrongNow: wrongNow, risk: risk,
                               accuracy: attempts > 0 ? Double(c) / Double(attempts) : nil, status: status)
        }.sorted { a, b in
            if a.status != b.status { return a.status.rawValue < b.status.rawValue }
            return a.risk > b.risk
        }
    }

    public func topicSet(_ licenseId: String, topicId: String, stats: [Int: QStat]) -> [Question] {
        let list = repo.questionsFor(licenseId).filter { $0.topic == topicId }
        func rank(_ q: Question) -> Int {
            guard let s = stats[q.id] else { return 1 }
            return s.last == 0 ? 0 : 2 + s.box
        }
        return list.sorted { a, b in
            let ra = rank(a), rb = rank(b)
            if ra != rb { return ra < rb }
            return (stats[a.id]?.w ?? 0) > (stats[b.id]?.w ?? 0)
        }
    }

    public func weaknessSet(_ licenseId: String, stats: [Int: QStat], size: Int = 20) -> [Question] {
        let reports = analyze(licenseId, stats: stats).filter { $0.status == .danger || $0.status == .warn }
        var out: [Question] = []
        var used = Set<Int>()
        let sum = reports.reduce(0.0) { $0 + $1.risk }
        let totalRisk = sum > 0 ? sum : 1.0
        for r in reports {
            let quota = max(2, Int((r.risk / totalRisk * Double(size)).rounded(.toNearestOrAwayFromZero)))
            for q in topicSet(licenseId, topicId: r.topic.id, stats: stats).prefix(quota) {
                if out.count >= size { break }
                if used.insert(q.id).inserted { out.append(q) }
            }
        }
        return out
    }
}

/// Thời điểm hiện tại tính bằng mili-giây (cùng đơn vị với `Date.now()` của web).
public func nowMillis(_ date: Date = Date()) -> Int64 { Int64((date.timeIntervalSince1970 * 1000).rounded(.down)) }
