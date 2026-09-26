import XCTest
@testable import LaiLuaCore

/// Kịch bản "nếu chọn đáp án này" phải giống hệt web & Android với mọi câu sa hình × mọi đáp án.
/// Giá trị tham chiếu dùng chung với Android: mobile/app/src/test/resources/whatif-ref.tsv (sinh từ src/lib/whatif.ts).
final class WhatIfParityTests: XCTestCase {
    private var root: URL {
        var r = URL(fileURLWithPath: #filePath)
        for _ in 0..<6 { r.deleteLastPathComponent() }
        return r
    }

    private func orderJSON(_ order: [[String]]) -> String {
        "[" + order.map { "[" + $0.map { "\"\($0)\"" }.joined(separator: ",") + "]" }.joined(separator: ",") + "]"
    }

    func testMatchesWebForEveryJunctionOption() throws {
        let repo = ExamParityTests.repo
        let text = try String(contentsOf: root.appendingPathComponent("mobile/app/src/test/resources/whatif-ref.tsv"), encoding: .utf8)
        let lines = text.trimmingCharacters(in: .whitespacesAndNewlines).components(separatedBy: "\n")
        XCTAssertGreaterThan(lines.count, 100)
        for line in lines {
            let f = line.components(separatedBy: "\t")
            let q = try XCTUnwrap(repo.question(Int(f[0])!))
            let p = try XCTUnwrap(WhatIf.plan(q, choice: Int(f[1])!))
            let at = "câu \(f[0]), đáp án \(f[1])"
            XCTAssertEqual(p.correct, f[2] == "1", at)
            XCTAssertEqual(orderJSON(p.order), f[3], at)
            XCTAssertEqual(p.conflict.map { "\($0.offender)>\($0.victim)" } ?? "-", f[4], at)
            XCTAssertEqual(p.verdict.kind, f[5], at)
            XCTAssertEqual(p.verdict.text, f[6], at)
        }
    }

    func testCrashPointExistsForWrongOrder() throws {
        let q = try XCTUnwrap(ExamParityTests.repo.question(501))
        let spec = try XCTUnwrap(q.junction)
        let p = try XCTUnwrap(WhatIf.plan(q, choice: 1))
        let c = try XCTUnwrap(p.conflict)
        let a = try XCTUnwrap(spec.vehicle(c.offender)), b = try XCTUnwrap(spec.vehicle(c.victim))
        let hit = WhatIf.crossing(SVGPath.polyline(a.path.d), stopA: a.path.stop, SVGPath.polyline(b.path.d), stopB: b.path.stop)
        XCTAssertNotNil(hit)
    }

    func testFoldStripsVietnameseMarks() {
        XCTAssertEqual(WhatIf.fold("Xe cứu thương ĐI TRƯỚC"), "xe cuu thuong di truoc")
    }
}
