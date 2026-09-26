import XCTest
@testable import LaiLuaCore

final class ProgressTests: XCTestCase {
    func testRecordAndLeitner() {
        var s = ProgressState()
        s = ProgressLogic.record(s, qid: 5, correct: true, now: 1000)
        XCTAssertEqual(s.stats[5]?.box, 2)
        XCTAssertEqual(s.stats[5]?.due, 1000 + REVIEW_INTERVALS[2])
        s = ProgressLogic.record(s, qid: 5, correct: true, now: 2000)
        XCTAssertEqual(s.stats[5]?.box, 3)
        s = ProgressLogic.record(s, qid: 5, correct: false, now: 3000)
        XCTAssertEqual(s.stats[5]?.box, 0)
        XCTAssertEqual(s.stats[5]?.c, 2)
        XCTAssertEqual(s.stats[5]?.w, 1)
        XCTAssertEqual(s.stats[5]?.last, 0)
        XCTAssertEqual(ProgressLogic.activeStreak(s.streak), 1)
    }

    func testStreakCounting() {
        let cal = Calendar.current
        let d1 = Date(timeIntervalSince1970: 1_800_000_000)
        let d2 = cal.date(byAdding: .day, value: 1, to: d1)!
        let d4 = cal.date(byAdding: .day, value: 3, to: d1)!
        var st = ProgressLogic.nextStreak(Streak(), today: d1)
        XCTAssertEqual(st.days, 1)
        st = ProgressLogic.nextStreak(st, today: d1)
        XCTAssertEqual(st.days, 1)
        st = ProgressLogic.nextStreak(st, today: d2)
        XCTAssertEqual(st.days, 2)
        XCTAssertEqual(ProgressLogic.activeStreak(st, today: d2), 2)
        XCTAssertEqual(ProgressLogic.activeStreak(st, today: d4), 0)
        st = ProgressLogic.nextStreak(st, today: d4)
        XCTAssertEqual(st.days, 1)
    }

    /// Tệp xuất phải đọc lại được, và đọc được cả tệp do bản web tạo (stats là object khoá số).
    func testExportImportRoundTripAndWebFormat() {
        var s = ProgressState()
        s = ProgressLogic.record(s, qid: 501, correct: true, now: 123)
        s = ProgressLogic.addExam(s, ExamRecord(id: "B-1", license: "B", setNo: 1, version: "tt12", at: 1, correct: 27, total: 30, passed: true, criticalFail: false, duration: 100, wrongIds: [5, 6]))
        s.xp = 42; s.bookmarks = [1, 2, 2]; s.driverName = "Tí"
        let text = ProgressLogic.exportJSON(s)
        XCTAssertTrue(text.contains("\"app\":\"lai-lua\""))
        XCTAssertTrue(text.contains("\"501\":{"))
        XCTAssertFalse(text.contains("driverName\":\"Tí\""), "cài đặt không nằm trong tệp xuất")
        let back = ProgressLogic.importJSON(text, into: ProgressState())!
        XCTAssertEqual(back.stats[501]?.c, 1)
        XCTAssertEqual(back.exams.first?.correct, 27)
        XCTAssertEqual(back.xp, 42)
        XCTAssertEqual(back.bookmarks, [1, 2])

        let web = """
        {"app":"lai-lua","version":1,"exportedAt":"2026-01-01T00:00:00.000Z","state":{"stats":{"7":{"c":1,"w":0,"last":1,"t":5}},"exams":[],"xp":10,"streak":{"days":3,"last":"2026-01-01"},"bestCombo":4,"bookmarks":[7]}}
        """
        let w = ProgressLogic.importJSON(web, into: s)!
        XCTAssertEqual(w.stats[7]?.last, 1)
        XCTAssertEqual(w.stats[7]?.box, 0)
        XCTAssertEqual(w.bestCombo, 4)
        XCTAssertEqual(w.driverName, "Tí", "nhập tiến độ giữ nguyên cài đặt")
        XCTAssertNil(ProgressLogic.importJSON("not json", into: s))
    }

    func testStatePersistsAllFields() throws {
        var s = ProgressState()
        s.lastLicense = "C1"; s.examVersion = "tt108"; s.fontScale = 1.3; s.sound = false; s.onboarded = true; s.examTiming = "after"
        s.stats[9] = QStat(c: 1, w: 2, last: 0, t: 3, box: 0, due: 4)
        let data = try JSONEncoder().encode(s)
        let back = try JSONDecoder().decode(ProgressState.self, from: data)
        XCTAssertEqual(back, s)
    }
}
