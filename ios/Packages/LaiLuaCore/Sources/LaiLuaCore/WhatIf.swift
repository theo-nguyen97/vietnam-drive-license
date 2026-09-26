import Foundation

/// Mô phỏng "nếu làm vậy thì sao" — chuyển từ src/lib/whatif.ts (cùng thuật toán với logic/WhatIf.kt của Android):
/// từ đáp án người học chọn, suy ra kịch bản chạy sa hình (xe nào đi trước, xe nào bị cắt ngang, xe nào vượt đèn đỏ…)
/// để JunctionCanvas diễn lại hậu quả thay vì chỉ chiếu cách đi đúng.
public enum WhatIf {
    public struct Conflict: Hashable, Sendable {
        public let offender: String
        public let victim: String
        public let reason: String
    }

    public struct Plan: Hashable, Sendable {
        public let correct: Bool
        public let order: [[String]]
        public let steps: [String]
        public let conflict: Conflict?
        public let violators: [String]
        public let verdict: Consequence

        func with(correct: Bool? = nil, verdict: Consequence? = nil) -> Plan {
            Plan(correct: correct ?? self.correct, order: order, steps: steps, conflict: conflict, violators: violators, verdict: verdict ?? self.verdict)
        }
    }

    // MARK: - Chuẩn hoá & nhận diện nhãn xe

    /// Bỏ dấu tiếng Việt + chữ thường để so khớp nhãn xe trong đáp án.
    public static func fold(_ s: String) -> String {
        var out = String.UnicodeScalarView()
        for u in s.decomposedStringWithCanonicalMapping.unicodeScalars {
            if (0x300...0x36F).contains(u.value) { continue }
            if u == "đ" { out.append("d"); continue }
            if u == "Đ" { out.append("D"); continue }
            out.append(u)
        }
        return String(out).lowercased()
    }

    private static func lowerFirst(_ s: String) -> String {
        guard let f = s.first else { return s }
        return f.lowercased() + s.dropFirst()
    }

    private struct Hit { let id: String; let at: Int; let text: [Unicode.Scalar] }

    private static func scalars(_ s: String) -> [Unicode.Scalar] { Array(s.unicodeScalars) }

    private static func indexOf(_ hay: [Unicode.Scalar], _ key: [Unicode.Scalar], from: Int) -> Int? {
        guard !key.isEmpty, hay.count >= key.count, from <= hay.count - key.count else { return nil }
        var i = max(0, from)
        while i <= hay.count - key.count {
            if hay[i] == key[0] && Array(hay[i..<(i + key.count)]) == key { return i }
            i += 1
        }
        return nil
    }

    /// Vị trí xuất hiện của từng xe trong đoạn văn (theo nhãn), tránh nhãn lồng nhau ("Xe con" trong "Xe con A").
    private static func findVehicles(_ text: String, _ vehicles: [JunctionVehicle]) -> [Hit] {
        let hay = scalars(fold(text))
        let labels = vehicles.map { ($0.id, scalars(fold($0.label))) }.sorted { $0.1.count > $1.1.count }
        var taken: [Range<Int>] = []
        var hits: [Hit] = []
        for (id, key) in labels where !key.isEmpty {
            var from = 0
            while from < hay.count, let i = indexOf(hay, key, from: from) {
                let overlaps = taken.contains { i < $0.upperBound && i + key.count > $0.lowerBound }
                if !overlaps {
                    taken.append(i..<(i + key.count))
                    hits.append(Hit(id: id, at: i, text: hay))
                    break
                }
                from = i + 1
            }
        }
        return hits.sorted { $0.at < $1.at }
    }

    private static func matches(_ pattern: String, _ s: String) -> Bool {
        guard let re = try? NSRegularExpression(pattern: pattern) else { return false }
        return re.firstMatch(in: s, range: NSRange(s.startIndex..., in: s)) != nil
    }

    private static func replacing(_ pattern: String, in s: String, options: NSRegularExpression.Options = []) -> String {
        guard let re = try? NSRegularExpression(pattern: pattern, options: options) else { return s }
        return re.stringByReplacingMatches(in: s, range: NSRange(s.startIndex..., in: s), withTemplate: "")
    }

    public struct Parsed: Hashable, Sendable {
        public let groups: [[String]]
        public let movesAll: Bool
        public let stopsAll: Bool
    }

    /// Phân tích một đáp án thành các nhóm xe đi lần lượt; xe trong phần "…; xe X dừng lại" không đi.
    public static func parseOption(_ option: String, _ spec: JunctionScene) -> Parsed? {
        let parts = option.components(separatedBy: ";")
        let main = parts.first ?? ""
        let stopPart = parts.dropFirst().joined(separator: ";")
        let stopped = Set(findVehicles(stopPart, spec.vehicles).map { $0.id })
        let f = fold(main)
        let stopsAll = matches("tat ca (cac )?xe (deu )?(phai )?dung", f) || matches("khong xe nao (duoc )?di", f)
        let movesAll = matches("(hai|ba|bon|cac|tat ca) xe (deu |cung |duoc )?(di |chay )?(cung luc|cung di|duoc di|di cung)", f)
            || matches("^ca (hai|ba|bon|cac) xe\\.?$", f.trimmingCharacters(in: .whitespacesAndNewlines))
        if stopsAll { return Parsed(groups: [], movesAll: false, stopsAll: true) }
        if movesAll { return Parsed(groups: [spec.vehicles.filter { !stopped.contains($0.id) }.map { $0.id }], movesAll: true, stopsAll: false) }
        if matches("dung lai|phai dung", f) && !matches("duoc di|di truoc|di sau", f) {
            let named = Set(findVehicles(main, spec.vehicles).map { $0.id })
            if named.isEmpty { return nil }
            let movers = spec.vehicles.filter { !named.contains($0.id) && !stopped.contains($0.id) }.map { $0.id }
            return Parsed(groups: movers.isEmpty ? [] : [movers], movesAll: false, stopsAll: false)
        }
        let hits = findVehicles(main, spec.vehicles).filter { !stopped.contains($0.id) }
        if hits.isEmpty { return nil }
        var groups: [[String]] = []
        for (i, h) in hits.enumerated() {
            if i == 0 { groups.append([h.id]); continue }
            var between = String.UnicodeScalarView()
            between.append(contentsOf: h.text[hits[i - 1].at..<h.at])
            let b = String(between)
            let together = matches("\\b(va|cung|dong thoi)\\b", b) && !matches(",|;| sau | truoc | tiep | roi ", b)
            if together { groups[groups.count - 1].append(h.id) } else { groups.append([h.id]) }
        }
        return Parsed(groups: groups, movesAll: false, stopsAll: false)
    }

    // MARK: - Lý do xe phải dừng

    private static func axis(_ dir: String) -> String { dir == "N" || dir == "S" ? "NS" : "EW" }

    private static func stopReason(_ v: JunctionVehicle, _ spec: JunctionScene) -> String? {
        if spec.stopAll { return "phải dừng theo hiệu lệnh tay giơ thẳng đứng" }
        if let lights = spec.lights {
            switch lights[axis(v.from)] {
            case "red": return "đang gặp đèn đỏ"
            case "yellow": return "gặp đèn vàng (phải dừng trước vạch)"
            default: break
            }
        }
        if spec.police != nil { return "bị người điều khiển giao thông ra hiệu lệnh dừng" }
        return nil
    }

    private static func nameOf(_ spec: JunctionScene, _ id: String) -> String { spec.vehicle(id)?.label ?? id }

    private static let dashPrefix = "^[^—–-]*[—–-]\\s*"
    private static let violationSuffix = "\\s*[—–-]?\\s*vi phạm!?$"

    private static func stepFor(_ spec: JunctionScene, _ id: String) -> String {
        guard let gi = spec.order.firstIndex(where: { $0.contains(id) }), let s = spec.steps?[safe: gi] else { return "" }
        return replacing(violationSuffix, in: replacing(dashPrefix, in: s), options: .caseInsensitive)
    }

    private static func violationOf(_ spec: JunctionScene, _ id: String) -> String {
        let name = fold(nameOf(spec, id))
        let s = spec.steps?.first { fold($0).contains(name) } ?? ""
        return replacing(violationSuffix, in: s, options: .caseInsensitive).trimmingCharacters(in: .whitespacesAndNewlines)
    }

    // MARK: - Lập kịch bản

    private static func correctPlan(_ spec: JunctionScene, text: String? = nil) -> Plan {
        let viol = spec.violators
        let fallback: String
        if !viol.isEmpty {
            let list = viol.map { id -> String in
                let v = violationOf(spec, id)
                return v.trimmingCharacters(in: .whitespaces).isEmpty ? nameOf(spec, id) : v
            }
            fallback = "Nhận diện đúng: \(list.joined(separator: "; ").lowercased()) — đó là hành vi vi phạm."
        } else if spec.stopAll {
            fallback = "Tất cả các xe dừng lại theo hiệu lệnh — an toàn."
        } else {
            fallback = "Các xe đi đúng thứ tự — qua giao lộ an toàn, không xung đột."
        }
        return Plan(
            correct: true,
            order: spec.order,
            steps: spec.order.enumerated().map { i, g in spec.steps?[safe: i] ?? g.map { nameOf(spec, $0) }.joined(separator: " + ") },
            conflict: nil,
            violators: viol,
            verdict: Consequence(kind: "ok", text: text ?? fallback)
        )
    }

    private static func sameGroups(_ a: [[String]], _ b: [[String]]) -> Bool {
        a.count == b.count && a.indices.allSatisfy { i in a[i].count == b[i].count && a[i].allSatisfy { b[i].contains($0) } }
    }

    private static func dropDot(_ s: String) -> String { s.hasSuffix(".") ? String(s.dropLast()) : s }

    /// Kịch bản khi chọn đáp án `choice` cho câu sa hình `q`; nil nếu câu không có sa hình giao lộ.
    public static func plan(_ q: Question, choice: Int) -> Plan? {
        guard let spec = q.junction else { return nil }
        let explicit = q.consequences?[safe: choice] ?? nil
        if choice == q.answer { return correctPlan(spec, text: explicit?.text) }

        let qText = fold(q.text)
        let chosenText = q.options[safe: choice] ?? ""
        let correctText = q.options[safe: q.answer] ?? ""

        // Câu "xe nào vi phạm": diễn đúng tình huống, kết luận chỉ ra xe vi phạm thật.
        if qText.contains("vi pham") || (!spec.violators.isEmpty && !qText.contains("thu tu")) {
            let real = spec.violators.map { nameOf(spec, $0) }
            let picked = findVehicles(chosenText, spec.vehicles).map { nameOf(spec, $0.id) }
            let why = spec.violators.map { violationOf(spec, $0) }.filter { !$0.isEmpty }.joined(separator: "; ")
            let text: String
            if let e = explicit?.text {
                text = e
            } else if !real.isEmpty {
                text = (picked.isEmpty ? "" : "Bạn chọn \"\(dropDot(chosenText))\" — chưa đúng. ")
                    + "Xe vi phạm là \(real.joined(separator: " và ").lowercased())\(why.isEmpty ? "" : ": \(why.lowercased())")."
            } else {
                text = "Không xe nào vi phạm trong tình huống này — đáp án đúng là \"\(dropDot(correctText))\"."
            }
            return correctPlan(spec).with(correct: false, verdict: Consequence(kind: explicit?.kind ?? "ticket", text: text))
        }

        guard let parsed = parseOption(chosenText, spec) else {
            return correctPlan(spec).with(correct: false, verdict: explicit ?? Consequence(kind: "danger", text: "Cách hiểu này chưa đúng. Đáp án đúng: \(correctText)"))
        }
        if sameGroups(parsed.groups, spec.order) { return correctPlan(spec, text: explicit?.text) }

        let shouldMove = Set(spec.order.flatMap { $0 })
        var done = Set<String>()
        var order: [[String]] = []
        var steps: [String] = []

        for g in parsed.groups {
            let group = g.filter { !done.contains($0) }
            if group.isEmpty { continue }
            let nextCorrect = spec.order.map { $0.filter { !done.contains($0) } }.first { !$0.isEmpty } ?? []
            let legal = group.allSatisfy { nextCorrect.contains($0) }
            if legal {
                order.append(group)
                if group.count == nextCorrect.count, let gi = spec.order.firstIndex(where: { gr in gr.contains { group.contains($0) } }), let s = spec.steps?[safe: gi] {
                    steps.append(s)
                } else {
                    steps.append(group.map { nameOf(spec, $0) }.joined(separator: " + "))
                }
                done.formUnion(group)
                continue
            }
            // Có xe đi sai lượt
            let offenders = group.filter { !nextCorrect.contains($0) }
            let offender = offenders[0]
            let mustStop = shouldMove.contains(offender) ? nil : spec.vehicle(offender).flatMap { stopReason($0, spec) }
            let victim = nextCorrect.first
            let reason = victim.map { stepFor(spec, $0) } ?? ""
            let oName = nameOf(spec, offender)
            let vName = victim.map { nameOf(spec, $0) } ?? ""
            let why = reason.isEmpty ? "" : " (\(lowerFirst(reason)))"
            let kind: String
            let text: String
            if victim != nil {
                kind = "crash"
                text = mustStop.map { "\(oName) \($0) nhưng vẫn đi, cắt ngang \(lowerFirst(vName)) đang được đi\(why) — va chạm ngay giữa giao lộ." }
                    ?? "\(oName) đi trước \(lowerFirst(vName)) trong khi \(lowerFirst(vName)) đang có quyền đi trước\(why) — va chạm ngay giữa giao lộ."
            } else {
                kind = "ticket"
                text = mustStop.map { "\(oName) \($0) nhưng vẫn đi — vi phạm hiệu lệnh, tín hiệu giao thông." } ?? "\(oName) đi không đúng thứ tự — vi phạm quy tắc nhường đường."
            }
            order.append(victim.map { [offender, $0] } ?? [offender])
            steps.append(victim != nil ? "\(oName) và \(lowerFirst(vName)) cùng lao vào giao lộ" : "\(oName) đi sai lượt")
            return Plan(
                correct: false, order: order, steps: steps,
                conflict: victim.map { Conflict(offender: offender, victim: $0, reason: reason) },
                violators: offenders,
                verdict: explicit ?? Consequence(kind: kind, text: text)
            )
        }

        let missing = spec.order.flatMap { $0 }.filter { !done.contains($0) }.map { nameOf(spec, $0) }
        return Plan(
            correct: false, order: order, steps: steps, conflict: nil, violators: [],
            verdict: explicit ?? Consequence(
                kind: "ok",
                text: missing.isEmpty
                    ? "Thứ tự này chưa đúng — đáp án đúng: \(correctText)"
                    : "Không gây va chạm, nhưng \(missing.joined(separator: ", ").lowercased()) không cần dừng lại — đáp án đúng: \(correctText)"
            )
        )
    }

    /// Chỗ hai quỹ đạo cắt nhau (quãng đường mỗi xe đi tới đó), bỏ qua đoạn trước vạch dừng + 20.
    /// Lấy mẫu mỗi 2 đơn vị, coi là chạm khi hai điểm cách nhau dưới 15 (giống JunctionScene.tsx).
    public static func crossing(_ a: Polyline, stopA: Double, _ b: Polyline, stopB: Double) -> (sA: Double, sB: Double)? {
        let step = 2.0
        let pa = stride(from: 0.0, through: a.length, by: step).map { a.point(at: $0) }
        let pb = stride(from: 0.0, through: b.length, by: step).map { b.point(at: $0) }
        let i0 = Int(ceil((stopA + 20) / step)), j0 = Int(ceil((stopB + 20) / step))
        guard i0 < pa.count, j0 < pb.count else { return nil }
        for i in i0..<pa.count {
            for j in j0..<pb.count {
                let dx = pa[i].x - pb[j].x, dy = pa[i].y - pb[j].y
                if dx * dx + dy * dy < 225 { return (Double(i) * step, Double(j) * step) }
            }
        }
        return nil
    }

    /// Hậu quả khi chọn một đáp án: sa hình dùng kịch bản, cảnh lái dùng trường `consequences`.
    public static func outcome(_ q: Question, choice: Int) -> Consequence? {
        if let p = plan(q, choice: choice) { return p.verdict }
        return choice == q.answer ? nil : (q.consequences?[safe: choice] ?? nil)
    }
}

extension Array {
    subscript(safe i: Int) -> Element? { indices.contains(i) ? self[i] : nil }
}
