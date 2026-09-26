import Foundation

/// Thống kê một câu hỏi — cùng tên trường với bản web để nhập/xuất tiến độ qua lại.
public struct QStat: Codable, Hashable, Sendable {
    public var c: Int = 0
    public var w: Int = 0
    /// 1 đúng, 0 sai ở lần gần nhất
    public var last: Int = 0
    public var t: Int64 = 0
    public var box: Int = 0
    public var due: Int64? = nil

    public init(c: Int = 0, w: Int = 0, last: Int = 0, t: Int64 = 0, box: Int = 0, due: Int64? = nil) {
        self.c = c; self.w = w; self.last = last; self.t = t; self.box = box; self.due = due
    }

    private enum K: String, CodingKey { case c, w, last, t, box, due }

    public init(from decoder: Decoder) throws {
        let d = try decoder.container(keyedBy: K.self)
        c = try d.decodeIfPresent(Int.self, forKey: .c) ?? 0
        w = try d.decodeIfPresent(Int.self, forKey: .w) ?? 0
        last = try d.decodeIfPresent(Int.self, forKey: .last) ?? 0
        t = try d.decodeIfPresent(Int64.self, forKey: .t) ?? 0
        box = try d.decodeIfPresent(Int.self, forKey: .box) ?? 0
        due = try d.decodeIfPresent(Int64.self, forKey: .due)
    }
}

public struct ExamRecord: Codable, Hashable, Identifiable, Sendable {
    public let id: String
    public let license: String
    public let setNo: Int?
    public let version: String?
    public let at: Int64
    public let correct: Int
    public let total: Int
    public let passed: Bool
    public let criticalFail: Bool
    public let duration: Int64
    public let wrongIds: [Int]

    public init(id: String, license: String, setNo: Int?, version: String?, at: Int64, correct: Int, total: Int, passed: Bool, criticalFail: Bool, duration: Int64, wrongIds: [Int]) {
        self.id = id; self.license = license; self.setNo = setNo; self.version = version; self.at = at
        self.correct = correct; self.total = total; self.passed = passed; self.criticalFail = criticalFail
        self.duration = duration; self.wrongIds = wrongIds
    }

    private enum K: String, CodingKey { case id, license, setNo, version, at, correct, total, passed, criticalFail, duration, wrongIds }

    public init(from decoder: Decoder) throws {
        let d = try decoder.container(keyedBy: K.self)
        id = try d.decodeIfPresent(String.self, forKey: .id) ?? UUID().uuidString
        license = try d.decode(String.self, forKey: .license)
        setNo = try d.decodeIfPresent(Int.self, forKey: .setNo)
        version = try d.decodeIfPresent(String.self, forKey: .version)
        at = try d.decodeIfPresent(Int64.self, forKey: .at) ?? 0
        correct = try d.decodeIfPresent(Int.self, forKey: .correct) ?? 0
        total = try d.decodeIfPresent(Int.self, forKey: .total) ?? 0
        passed = try d.decodeIfPresent(Bool.self, forKey: .passed) ?? false
        criticalFail = try d.decodeIfPresent(Bool.self, forKey: .criticalFail) ?? false
        duration = try d.decodeIfPresent(Int64.self, forKey: .duration) ?? 0
        wrongIds = try d.decodeIfPresent([Int].self, forKey: .wrongIds) ?? []
    }
}

public struct Streak: Codable, Hashable, Sendable {
    public var days: Int = 0
    public var last: String = ""

    public init(days: Int = 0, last: String = "") { self.days = days; self.last = last }

    private enum K: String, CodingKey { case days, last }

    public init(from decoder: Decoder) throws {
        let d = try decoder.container(keyedBy: K.self)
        days = try d.decodeIfPresent(Int.self, forKey: .days) ?? 0
        last = try d.decodeIfPresent(String.self, forKey: .last) ?? ""
    }
}

/// Toàn bộ tiến độ + cài đặt — cùng định dạng JSON với Android (`progress.json`).
public struct ProgressState: Codable, Hashable, Sendable {
    public var stats: [Int: QStat] = [:]
    public var exams: [ExamRecord] = []
    public var xp: Int = 0
    public var streak = Streak()
    public var bestCombo: Int = 0
    public var bookmarks: [Int] = []
    public var sound: Bool = true
    public var lastLicense: String? = nil
    public var driverName: String = ""
    /// "tt12" | "tt108" | nil (tự động theo ngày)
    public var examVersion: String? = nil
    public var fontScale: Double = 1
    public var onboarded: Bool = false
    /// "before" | "after" | "unknown"
    public var examTiming: String? = nil

    public init() {}

    private enum K: String, CodingKey {
        case stats, exams, xp, streak, bestCombo, bookmarks, sound, lastLicense, driverName, examVersion, fontScale, onboarded, examTiming
    }

    /// JSON lưu `stats` dạng object với khoá là số (giống web) — Codable mặc định của Swift lại
    /// mã hoá `[Int: …]` thành mảng, nên phải tự chuyển khoá.
    public init(from decoder: Decoder) throws {
        let d = try decoder.container(keyedBy: K.self)
        let raw = try d.decodeIfPresent([String: QStat].self, forKey: .stats) ?? [:]
        var stats: [Int: QStat] = [:]
        for (k, v) in raw { if let id = Int(k) { stats[id] = v } }
        self.stats = stats
        exams = try d.decodeIfPresent([ExamRecord].self, forKey: .exams) ?? []
        xp = try d.decodeIfPresent(Int.self, forKey: .xp) ?? 0
        streak = try d.decodeIfPresent(Streak.self, forKey: .streak) ?? Streak()
        bestCombo = try d.decodeIfPresent(Int.self, forKey: .bestCombo) ?? 0
        bookmarks = try d.decodeIfPresent([Int].self, forKey: .bookmarks) ?? []
        sound = try d.decodeIfPresent(Bool.self, forKey: .sound) ?? true
        lastLicense = try d.decodeIfPresent(String.self, forKey: .lastLicense)
        driverName = try d.decodeIfPresent(String.self, forKey: .driverName) ?? ""
        examVersion = try d.decodeIfPresent(String.self, forKey: .examVersion)
        fontScale = try d.decodeIfPresent(Double.self, forKey: .fontScale) ?? 1
        onboarded = try d.decodeIfPresent(Bool.self, forKey: .onboarded) ?? false
        examTiming = try d.decodeIfPresent(String.self, forKey: .examTiming)
    }

    public func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: K.self)
        try c.encode(Dictionary(uniqueKeysWithValues: stats.map { (String($0.key), $0.value) }), forKey: .stats)
        try c.encode(exams, forKey: .exams)
        try c.encode(xp, forKey: .xp)
        try c.encode(streak, forKey: .streak)
        try c.encode(bestCombo, forKey: .bestCombo)
        try c.encode(bookmarks, forKey: .bookmarks)
        try c.encode(sound, forKey: .sound)
        try c.encodeIfPresent(lastLicense, forKey: .lastLicense)
        try c.encode(driverName, forKey: .driverName)
        try c.encodeIfPresent(examVersion, forKey: .examVersion)
        try c.encode(fontScale, forKey: .fontScale)
        try c.encode(onboarded, forKey: .onboarded)
        try c.encodeIfPresent(examTiming, forKey: .examTiming)
    }
}

/// Khoảng cách ôn lại theo hộp Leitner: 10 phút, 1, 3, 7, 16, 35 ngày.
public let REVIEW_INTERVALS: [Int64] = [10 * 60_000, DAY_MS, 3 * DAY_MS, 7 * DAY_MS, 16 * DAY_MS, 35 * DAY_MS]
public let DAY_MS: Int64 = 86_400_000

/// Các phép biến đổi thuần trên `ProgressState` (chuyển từ ProgressStore.kt) — không phụ thuộc nền tảng.
public enum ProgressLogic {
    public static func record(_ s: ProgressState, qid: Int, correct: Bool, now: Int64 = nowMillis(), today: Date = Date()) -> ProgressState {
        var s = s
        let prev = s.stats[qid] ?? QStat()
        let box = correct ? min(REVIEW_INTERVALS.count - 1, prev.box + (prev.t != 0 ? 1 : 2)) : 0
        s.stats[qid] = QStat(
            c: prev.c + (correct ? 1 : 0),
            w: prev.w + (correct ? 0 : 1),
            last: correct ? 1 : 0,
            t: now,
            box: box,
            due: now + REVIEW_INTERVALS[box]
        )
        s.streak = nextStreak(s.streak, today: today)
        return s
    }

    public static func addXp(_ s: ProgressState, _ n: Int) -> ProgressState { var s = s; s.xp = max(0, s.xp + n); return s }
    public static func setBestCombo(_ s: ProgressState, _ n: Int) -> ProgressState { var s = s; s.bestCombo = max(s.bestCombo, n); return s }

    public static func addExam(_ s: ProgressState, _ r: ExamRecord, today: Date = Date()) -> ProgressState {
        var s = s
        s.exams = Array(([r] + s.exams).prefix(50))
        s.streak = nextStreak(s.streak, today: today)
        return s
    }

    public static func toggleBookmark(_ s: ProgressState, _ qid: Int) -> ProgressState {
        var s = s
        if let i = s.bookmarks.firstIndex(of: qid) { s.bookmarks.remove(at: i) } else { s.bookmarks.append(qid) }
        return s
    }

    public static func completeOnboarding(_ s: ProgressState, license: String, timing: String) -> ProgressState {
        var s = s
        s.lastLicense = license
        s.examTiming = timing
        switch timing {
        case "after": s.examVersion = "tt108"
        case "before": s.examVersion = "tt12"
        default: s.examVersion = nil
        }
        s.onboarded = true
        return s
    }

    /// Xoá tiến độ nhưng giữ cài đặt.
    public static func reset(_ s: ProgressState) -> ProgressState {
        var n = ProgressState()
        n.sound = s.sound; n.driverName = s.driverName; n.fontScale = s.fontScale; n.examVersion = s.examVersion
        n.onboarded = s.onboarded; n.lastLicense = s.lastLicense; n.examTiming = s.examTiming
        return n
    }

    // MARK: - Chuỗi ngày học

    public static func dayKey(_ d: Date = Date()) -> String {
        let f = DateFormatter()
        f.calendar = Calendar(identifier: .gregorian)
        f.locale = Locale(identifier: "en_US_POSIX")
        f.timeZone = .current
        f.dateFormat = "yyyy-MM-dd"
        return f.string(from: d)
    }

    private static func yesterday(_ d: Date) -> Date { Calendar.current.date(byAdding: .day, value: -1, to: d) ?? d.addingTimeInterval(-86_400) }

    public static func nextStreak(_ s: Streak, today: Date = Date()) -> Streak {
        let t = dayKey(today)
        if s.last == t { return s }
        let y = dayKey(yesterday(today))
        return Streak(days: s.last == y ? s.days + 1 : 1, last: t)
    }

    /// Số ngày học liên tiếp còn hiệu lực.
    public static func activeStreak(_ s: Streak, today: Date = Date()) -> Int {
        let t = dayKey(today)
        let y = dayKey(yesterday(today))
        return (s.last == t || s.last == y) ? s.days : 0
    }

    // MARK: - Xuất / nhập tệp JSON (cùng định dạng với web & Android)

    private struct Export: Encodable {
        let app = "lai-lua"
        let version = 1
        let exportedAt: String
        let state: ProgressState
    }

    /// Chỉ xuất phần tiến độ (không kèm cài đặt) theo đúng định dạng tệp của bản web.
    public static func exportJSON(_ s: ProgressState, at date: Date = Date()) -> String {
        var slim = ProgressState()
        slim.stats = s.stats; slim.exams = s.exams; slim.xp = s.xp; slim.streak = s.streak; slim.bestCombo = s.bestCombo; slim.bookmarks = s.bookmarks
        let enc = JSONEncoder()
        enc.outputFormatting = [.sortedKeys]
        let iso = ISO8601DateFormatter()
        iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let data = (try? enc.encode(Export(exportedAt: iso.string(from: date), state: slim))) ?? Data()
        return String(decoding: data, as: UTF8.self)
    }

    private struct Envelope: Decodable { let state: ProgressState? }

    /// Nhập tệp JSON (từ app hoặc web) vào `current`. Trả về nil nếu tệp không hợp lệ.
    public static func importJSON(_ text: String, into current: ProgressState) -> ProgressState? {
        let data = Data(text.utf8)
        let dec = JSONDecoder()
        let partial: ProgressState
        if let env = try? dec.decode(Envelope.self, from: data), let st = env.state {
            partial = st
        } else if let st = try? dec.decode(ProgressState.self, from: data) {
            partial = st
        } else {
            return nil
        }
        var s = current
        s.stats = partial.stats
        s.exams = Array(partial.exams.prefix(50))
        s.xp = max(0, partial.xp)
        s.streak = partial.streak
        s.bestCombo = partial.bestCombo
        var seen = Set<Int>()
        s.bookmarks = partial.bookmarks.filter { seen.insert($0).inserted }
        return s
    }
}
