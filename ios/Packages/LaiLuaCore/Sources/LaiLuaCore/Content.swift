import Foundation

/*
 * Nội dung đọc thêm dùng chung với web & Android: tin tức luật (news.json), lộ trình lấy bằng +
 * sa hình thực hành (journey.json), học mẹo (tips.json). Xuất bởi scripts/export-mobile-data.tsx.
 */

// MARK: - Tin tức

public struct TimelineItem: Codable, Hashable, Sendable {
    public let date: String
    public let text: String
}

/// Một khối nội dung bài viết — phân biệt bằng trường `type` trong JSON.
public enum NewsBlock: Hashable, Sendable, Decodable {
    case para(String)
    case heading(String)
    case bullets([String])
    case table(head: [String], rows: [[String]])
    case timeline([TimelineItem])
    case tip(String)
    /// Khối đếm ngược + bảng so sánh đề 2027.
    case exam2027
    /// Loại khối mới mà app chưa biết — bỏ qua thay vì làm hỏng cả bài.
    case unknown

    private enum K: String, CodingKey { case type, text, items, head, rows }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        switch try c.decode(String.self, forKey: .type) {
        case "p": self = .para(try c.decode(String.self, forKey: .text))
        case "h": self = .heading(try c.decode(String.self, forKey: .text))
        case "list": self = .bullets(try c.decode([String].self, forKey: .items))
        case "table": self = .table(head: try c.decode([String].self, forKey: .head), rows: try c.decode([[String]].self, forKey: .rows))
        case "timeline": self = .timeline(try c.decode([TimelineItem].self, forKey: .items))
        case "tip": self = .tip(try c.decode(String.self, forKey: .text))
        case "exam2027": self = .exam2027
        default: self = .unknown
        }
    }
}

public struct NewsItem: Hashable, Identifiable, Sendable, Decodable {
    public var id: String { slug }
    public let slug: String
    public let title: String
    public let category: String
    public let date: String
    public let emoji: String
    public let summary: String
    public let body: [NewsBlock]
    public let sources: [String]
    public let pinned: Bool

    private enum K: String, CodingKey { case slug, title, category, date, emoji, summary, body, sources, pinned }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        slug = try c.decode(String.self, forKey: .slug)
        title = try c.decode(String.self, forKey: .title)
        category = try c.decode(String.self, forKey: .category)
        date = try c.decode(String.self, forKey: .date)
        emoji = try c.decode(String.self, forKey: .emoji)
        summary = try c.decode(String.self, forKey: .summary)
        body = try c.decode([NewsBlock].self, forKey: .body)
        sources = try c.decodeIfPresent([String].self, forKey: .sources) ?? []
        pinned = try c.decodeIfPresent(Bool.self, forKey: .pinned) ?? false
    }
}

public struct OfficialLink: Codable, Hashable, Sendable {
    public let href: String
    public let label: String
}

public struct NewsBundle: Sendable, Decodable {
    public let categories: [String]
    public let items: [NewsItem]
    public let links: [OfficialLink]

    public init(categories: [String] = [], items: [NewsItem] = [], links: [OfficialLink] = []) {
        self.categories = categories; self.items = items; self.links = links
    }

    private enum K: String, CodingKey { case categories, items, links }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        categories = try c.decode([String].self, forKey: .categories)
        items = try c.decode([NewsItem].self, forKey: .items)
        links = try c.decodeIfPresent([OfficialLink].self, forKey: .links) ?? []
    }
}

// MARK: - Lộ trình lấy bằng

public struct StepLink: Codable, Hashable, Sendable {
    public let href: String
    public let label: String
}

public struct JourneyStep: Codable, Hashable, Identifiable, Sendable {
    public var id: String { key }
    public let key: String
    public let title: String
    public let icon: String
    public let desc: String
    public let items: [String]
    public let link: StepLink?
    public let isNew: String?
}

public struct Fault: Codable, Hashable, Sendable {
    public let text: String
    public let pts: String
}

public struct CourseExercise: Codable, Hashable, Identifiable, Sendable {
    public let id: String
    public let no: Int
    public let title: String
    public let diagram: String
    public let goal: String
    public let tips: [String]
    public let faults: [Fault]
}

public struct JourneyBundle: Codable, Sendable {
    public let steps: [String: [JourneyStep]]
    public let course: [String: [CourseExercise]]

    public init(steps: [String: [JourneyStep]] = [:], course: [String: [CourseExercise]] = [:]) {
        self.steps = steps; self.course = course
    }
}

// MARK: - Học mẹo

public struct TipGroup: Hashable, Identifiable, Sendable, Decodable {
    public let id: String
    public let name: String
    public let icon: String
    public let desc: String
    public let topics: [String]
    public let chapters: [Int]

    private enum K: String, CodingKey { case id, name, icon, desc, topics, chapters }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        id = try c.decode(String.self, forKey: .id)
        name = try c.decode(String.self, forKey: .name)
        icon = try c.decode(String.self, forKey: .icon)
        desc = try c.decode(String.self, forKey: .desc)
        topics = try c.decodeIfPresent([String].self, forKey: .topics) ?? []
        chapters = try c.decodeIfPresent([Int].self, forKey: .chapters) ?? []
    }
}

public struct TipItem: Hashable, Identifiable, Sendable, Decodable {
    public let id: String
    public let group: String
    public let title: String
    public let mnemonic: String
    public let body: String
    public let signs: [String]
    public let questions: [Int]

    private enum K: String, CodingKey { case id, group, title, mnemonic, body, signs, questions }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        id = try c.decode(String.self, forKey: .id)
        group = try c.decode(String.self, forKey: .group)
        title = try c.decode(String.self, forKey: .title)
        mnemonic = try c.decode(String.self, forKey: .mnemonic)
        body = try c.decode(String.self, forKey: .body)
        signs = try c.decodeIfPresent([String].self, forKey: .signs) ?? []
        questions = try c.decodeIfPresent([Int].self, forKey: .questions) ?? []
    }
}

public struct TipBundle: Sendable, Decodable {
    public let groups: [TipGroup]
    public let tips: [TipItem]

    public init(groups: [TipGroup] = [], tips: [TipItem] = []) { self.groups = groups; self.tips = tips }
}
