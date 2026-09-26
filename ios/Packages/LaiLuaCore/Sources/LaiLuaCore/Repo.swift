import Foundation

/// Ngân hàng câu hỏi & danh mục, nạp một lần từ các tệp JSON trong bundle.
public final class Repo: @unchecked Sendable {
    public let questions: [Question]
    public let licenses: [License]
    public let chapters: [Chapter]
    public let signs: [SignInfo]
    public let signGroups: [SignGroup]
    public let topics: [Topic]

    private let byId: [Int: Question]
    private var poolCache: [String: [Question]] = [:]
    private let lock = NSLock()

    public init(questions: [Question], licenses: [License], chapters: [Chapter], signs: [SignInfo], signGroups: [SignGroup], topics: [Topic]) {
        self.questions = questions
        self.licenses = licenses
        self.chapters = chapters
        self.signs = signs
        self.signGroups = signGroups
        self.topics = topics
        byId = Dictionary(questions.map { ($0.id, $0) }, uniquingKeysWith: { a, _ in a })
    }

    /// Dựng kho từ các tệp JSON (`questions.json`, `licenses.json`, …) — dùng cho app lẫn kiểm thử.
    public static func load(read: (String) throws -> Data) throws -> Repo {
        let dec = JSONDecoder()
        let bundle = try dec.decode(SignBundle.self, from: read("signs.json"))
        return Repo(
            questions: try dec.decode([Question].self, from: read("questions.json")),
            licenses: try dec.decode([License].self, from: read("licenses.json")),
            chapters: try dec.decode([Chapter].self, from: read("chapters.json")),
            signs: bundle.signs,
            signGroups: bundle.groups,
            topics: try dec.decode([Topic].self, from: read("topics.json"))
        )
    }

    public func question(_ id: Int) -> Question? { byId[id] }

    public func license(_ id: String) -> License? {
        licenses.first { $0.id.caseInsensitiveCompare(id) == .orderedSame }
    }

    public func chapter(_ id: Int) -> Chapter? { chapters.first { $0.id == id } }
    public func sign(_ code: String) -> SignInfo? { signs.first { $0.code == code } }
    public func topic(_ id: String) -> Topic? { topics.first { $0.id == id } }

    private func group(of licenseId: String) -> String { license(licenseId)?.group ?? "car" }

    /// Câu hỏi áp dụng cho một hạng bằng (theo nhóm xe máy / ô tô).
    public func questionsFor(_ licenseId: String) -> [Question] {
        let key = licenseId.uppercased()
        lock.lock(); defer { lock.unlock() }
        if let cached = poolCache[key] { return cached }
        let g = group(of: licenseId)
        let chapterGroups = Dictionary(chapters.map { ($0.id, $0.groups) }, uniquingKeysWith: { a, _ in a })
        let pool = questions.filter { q in
            (q.only == nil || q.only == g) && (chapterGroups[q.chapter]?.contains(g) ?? false)
        }
        poolCache[key] = pool
        return pool
    }

    public func chaptersFor(_ licenseId: String) -> [Chapter] {
        let g = group(of: licenseId)
        return chapters.filter { $0.groups.contains(g) }
    }

    public func topicsFor(_ licenseId: String) -> [Topic] {
        let g = group(of: licenseId)
        let used = Set(questionsFor(licenseId).map { $0.topic })
        return topics.filter { used.contains($0.id) && ($0.groups == nil || $0.groups!.contains(g)) }
    }

    /// Ngày áp dụng cấu trúc đề mới (Thông tư 108/2026/TT-BCA): 01/3/2027 giờ Việt Nam.
    public static let tt108Date: Date = {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = TimeZone(identifier: "Asia/Ho_Chi_Minh") ?? TimeZone(secondsFromGMT: 7 * 3600)!
        return cal.date(from: DateComponents(year: 2027, month: 3, day: 1))!
    }()

    public static func defaultExamVersion(now: Date = Date()) -> ExamVersion {
        now >= tt108Date ? .tt108 : .tt12
    }
}
