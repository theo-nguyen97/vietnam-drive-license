import XCTest
@testable import LaiLuaCore

final class SVGPathTests: XCTestCase {
    func testStraightLine() {
        let p = SVGPath.polyline("M230.0,580.0 L230.0,-200.0")
        XCTAssertEqual(p.length, 780, accuracy: 1e-9)
        let mid = p.point(at: 270)
        XCTAssertEqual(mid.x, 230, accuracy: 1e-9)
        XCTAssertEqual(mid.y, 310, accuracy: 1e-9)
        XCTAssertEqual(p.angle(at: 100), -90, accuracy: 1e-9)
        XCTAssertEqual(p.point(at: 10_000).y, -200, accuracy: 1e-9)
    }

    func testCurvesAndArcs() {
        let d = "M230.0,580.0 L230.0,335.0 Q230.0,292.0 256.6,267.4 A88,88 0 0 0 244.0,123.8 Q230.0,116.0 230.0,80.0 L230.0,-200.0"
        let p = SVGPath.polyline(d)
        XCTAssertGreaterThan(p.points.count, 40)
        // Cung tròn: mọi điểm cách tâm (200,200) ≈ 88 (điểm đầu/cuối cung nằm trên vòng xuyến)
        let onArc = p.points.filter { $0.y > 130 && $0.y < 260 && $0.x > 240 }
        XCTAssertFalse(onArc.isEmpty)
        for pt in onArc { XCTAssertEqual(hypot(pt.x - 200, pt.y - 200), 88, accuracy: 3) }
        XCTAssertEqual(p.point(at: p.length).y, -200, accuracy: 1e-6)
        let seg = p.segment(from: 100, to: 300)
        XCTAssertGreaterThan(seg.count, 2)
        XCTAssertEqual(seg.first!.y, 480, accuracy: 1e-9)
    }

    func testCubicAndRelative() {
        let p = SVGPath.polyline("M-220,230 L70,230 C120,230 130,170 180,170 L330,170 c50,0 60,60 110,60 L760,230")
        XCTAssertEqual(p.point(at: p.length).x, 760, accuracy: 1e-6)
        XCTAssertEqual(p.point(at: p.length).y, 230, accuracy: 1e-6)
        XCTAssertGreaterThan(p.length, 980)
    }

    func testAllBankPathsParse() throws {
        let repo = ExamParityTests.repo
        var n = 0
        for q in repo.questions {
            guard let j = q.junction else { continue }
            for v in j.vehicles {
                let p = SVGPath.polyline(v.path.d)
                XCTAssertGreaterThan(p.length, v.path.stop, "câu \(q.id) xe \(v.id)")
                n += 1
            }
        }
        XCTAssertGreaterThan(n, 100)
    }
}
