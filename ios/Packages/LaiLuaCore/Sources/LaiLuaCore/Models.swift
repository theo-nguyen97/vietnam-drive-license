import Foundation

/*
 * Mô hình dữ liệu dùng chung với bản web và Android (xuất bởi scripts/export-mobile-data.tsx).
 * Tên trường giữ nguyên như JSON để các bản luôn khớp.
 */

public struct ExamConfig: Codable, Hashable, Sendable {
    public let total: Int
    public let minutes: Int
    public let pass: Int

    public init(total: Int, minutes: Int, pass: Int) {
        self.total = total; self.minutes = minutes; self.pass = pass
    }
}

public struct License: Codable, Hashable, Identifiable, Sendable {
    public let id: String
    public let bank: Int
    public let name: String
    public let short: String
    public let desc: String
    /// "moto" hoặc "car"
    public let group: String
    public let family: String
    public let vehicle: String
    public let exam: ExamConfig
    public let exam2027: ExamConfig
    public let minAge: Int
    public let validity: String
    public let color: String

    public var isMoto: Bool { group == "moto" }
    public func config(_ version: ExamVersion) -> ExamConfig { version == .tt108 ? exam2027 : exam }
}

public enum ExamVersion: String, CaseIterable, Hashable, Sendable {
    case tt12
    case tt108

    public var key: String { rawValue }
    public var title: String { self == .tt12 ? "Đề hiện hành" : "Đề từ 01/3/2027" }
    public var law: String { self == .tt12 ? "TT12/2025" : "TT108/2026" }

    public static func of(_ key: String?) -> ExamVersion? {
        guard let key else { return nil }
        return ExamVersion(rawValue: key)
    }
}

public struct Chapter: Codable, Hashable, Identifiable, Sendable {
    public let id: Int
    public let name: String
    public let short: String
    public let icon: String
    public let groups: [String]
}

public struct SignInfo: Codable, Hashable, Identifiable, Sendable {
    public var id: String { code }
    public let code: String
    public let name: String
    public let group: String
    public let meaning: String
}

public struct SignGroup: Codable, Hashable, Identifiable, Sendable {
    public let id: String
    public let name: String
    public let desc: String
}

public struct SignBundle: Codable, Sendable {
    public let groups: [SignGroup]
    public let signs: [SignInfo]
}

public struct Topic: Codable, Hashable, Identifiable, Sendable {
    public let id: String
    public let code: String
    public let name: String
    public let icon: String
    public let hint: String
    public let groups: [String]?
}

public struct VehiclePath: Codable, Hashable, Sendable {
    public let d: String
    public let stop: Double
}

public struct JunctionVehicle: Hashable, Sendable, Decodable {
    public let id: String
    /// car, truck, bus, moto, bike, ambulance, fire, police
    public let kind: String
    public let from: String
    public let move: String
    public let label: String
    public let player: Bool
    public let inside: Bool
    public let queue: Int
    public let color: String?
    public let speed: Double
    public let path: VehiclePath

    private enum K: String, CodingKey { case id, kind, from, move, label, player, inside, queue, color, speed, path }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        id = try c.decode(String.self, forKey: .id)
        kind = try c.decode(String.self, forKey: .kind)
        from = try c.decode(String.self, forKey: .from)
        move = try c.decode(String.self, forKey: .move)
        label = try c.decodeIfPresent(String.self, forKey: .label) ?? ""
        player = try c.decodeIfPresent(Bool.self, forKey: .player) ?? false
        inside = try c.decodeIfPresent(Bool.self, forKey: .inside) ?? false
        queue = try c.decodeIfPresent(Int.self, forKey: .queue) ?? 0
        color = try c.decodeIfPresent(String.self, forKey: .color)
        speed = try c.decodeIfPresent(Double.self, forKey: .speed) ?? 1.0
        path = try c.decode(VehiclePath.self, forKey: .path)
    }
}

public struct PoliceSpec: Codable, Hashable, Sendable {
    public let pose: String
    public let facing: String
}

public struct SignAt: Codable, Hashable, Sendable {
    public let at: String
    public let code: String
}

public struct JunctionScene: Hashable, Sendable, Decodable {
    public let layout: String
    public let vehicles: [JunctionVehicle]
    public let order: [[String]]
    public let violators: [String]
    public let lights: [String: String]?
    public let police: PoliceSpec?
    public let signs: [SignAt]
    public let main: String?
    public let stopAll: Bool
    public let steps: [String]?
    public let centerLine: String?

    private enum K: String, CodingKey { case layout, vehicles, order, violators, lights, police, signs, main, stopAll, steps, centerLine }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        layout = try c.decode(String.self, forKey: .layout)
        vehicles = try c.decode([JunctionVehicle].self, forKey: .vehicles)
        order = try c.decode([[String]].self, forKey: .order)
        violators = try c.decodeIfPresent([String].self, forKey: .violators) ?? []
        lights = try c.decodeIfPresent([String: String].self, forKey: .lights)
        police = try c.decodeIfPresent(PoliceSpec.self, forKey: .police)
        signs = try c.decodeIfPresent([SignAt].self, forKey: .signs) ?? []
        main = try c.decodeIfPresent(String.self, forKey: .main)
        stopAll = try c.decodeIfPresent(Bool.self, forKey: .stopAll) ?? false
        steps = try c.decodeIfPresent([String].self, forKey: .steps)
        centerLine = try c.decodeIfPresent(String.self, forKey: .centerLine)
    }

    public func vehicle(_ id: String) -> JunctionVehicle? { vehicles.first { $0.id == id } }
}

public struct RoadScene: Hashable, Sendable, Decodable {
    public let props: [String]

    private enum K: String, CodingKey { case props }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        props = try c.decodeIfPresent([String].self, forKey: .props) ?? []
    }
}

/// Cảnh minh hoạ của câu hỏi — phân biệt bằng trường `kind` trong JSON.
public enum Scene: Hashable, Sendable, Decodable {
    case junction(JunctionScene)
    case road(RoadScene)

    private enum K: String, CodingKey { case kind }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        let kind = try c.decode(String.self, forKey: .kind)
        switch kind {
        case "junction": self = .junction(try JunctionScene(from: decoder))
        case "road": self = .road(try RoadScene(from: decoder))
        default:
            throw DecodingError.dataCorruptedError(forKey: .kind, in: c, debugDescription: "Loại cảnh không hỗ trợ: \(kind)")
        }
    }
}

/// Hậu quả giả lập khi chọn một đáp án (cùng chỉ số với options; đáp án đúng là null).
public struct Consequence: Codable, Hashable, Sendable {
    public let kind: String
    public let text: String
}

public struct Question: Hashable, Identifiable, Sendable, Decodable {
    public let id: Int
    public let chapter: Int
    public let text: String
    public let options: [String]
    /// Chỉ số (0-based) của đáp án đúng.
    public let answer: Int
    public let explanation: String
    public let critical: Bool
    public let only: String?
    public let signs: [String]
    public let scene: Scene?
    public let tip: String?
    public let topic: String
    public let consequences: [Consequence?]?

    private enum K: String, CodingKey { case id, chapter, text, options, answer, explanation, critical, only, signs, scene, tip, topic, consequences }

    public init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: K.self)
        id = try c.decode(Int.self, forKey: .id)
        chapter = try c.decode(Int.self, forKey: .chapter)
        text = try c.decode(String.self, forKey: .text)
        options = try c.decode([String].self, forKey: .options)
        answer = try c.decode(Int.self, forKey: .answer)
        explanation = try c.decode(String.self, forKey: .explanation)
        critical = try c.decodeIfPresent(Bool.self, forKey: .critical) ?? false
        only = try c.decodeIfPresent(String.self, forKey: .only)
        signs = try c.decodeIfPresent([String].self, forKey: .signs) ?? []
        scene = try c.decodeIfPresent(Scene.self, forKey: .scene)
        tip = try c.decodeIfPresent(String.self, forKey: .tip)
        topic = try c.decodeIfPresent(String.self, forKey: .topic) ?? "khai-niem"
        consequences = try c.decodeIfPresent([Consequence?].self, forKey: .consequences)
    }

    public var junction: JunctionScene? {
        if case .junction(let j) = scene { return j }
        return nil
    }

    public var road: RoadScene? {
        if case .road(let r) = scene { return r }
        return nil
    }

    public static func == (a: Question, b: Question) -> Bool { a.id == b.id }
    public func hash(into hasher: inout Hasher) { hasher.combine(id) }
}
