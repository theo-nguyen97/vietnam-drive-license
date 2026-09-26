import XCTest
@testable import LaiLuaCore

/// Bộ đề trên iOS phải trùng khớp với bản web và Android (giá trị tham chiếu sinh bằng
/// `npx tsx` từ src/lib/exam.ts — cùng bộ số với mobile/.../ExamParityTest.kt).
final class ExamParityTests: XCTestCase {
    static let repo: Repo = {
        // Tests/LaiLuaCoreTests/<file> → …/ios/Packages/LaiLuaCore → repo root
        var root = URL(fileURLWithPath: #filePath)
        for _ in 0..<6 { root.deleteLastPathComponent() }
        let data = root.appendingPathComponent("mobile/app/src/main/assets/data")
        return try! Repo.load { name in try Data(contentsOf: data.appendingPathComponent(name)) }
    }()

    let exams = ExamBuilder(repo: ExamParityTests.repo)

    private func ids(_ qs: [Question]) -> String { qs.map { String($0.id) }.joined(separator: ",") }

    func testLoadsBank() {
        XCTAssertEqual(Self.repo.questions.count, 600)
        XCTAssertEqual(Self.repo.licenses.count, 15)
        XCTAssertGreaterThan(Self.repo.questionsFor("A1").count, 200)
        XCTAssertLessThan(Self.repo.questionsFor("A1").count, Self.repo.questionsFor("B").count)
        XCTAssertEqual(Self.repo.chaptersFor("A1").count, 5)
        XCTAssertEqual(Self.repo.chaptersFor("B").count, 6)
        XCTAssertTrue(Self.repo.questions.contains { $0.junction != nil })
        XCTAssertTrue(Self.repo.questions.contains { $0.road != nil })
    }

    func testRngMatchesWeb() {
        var r = Rng(seed: jsHash(12345))
        let s = [r.next(), r.next(), r.next()].map { String(format: "%.12f", $0) }.joined(separator: ",")
        XCTAssertEqual(s, "0.209238795331,0.946848918218,0.266431833152")
        XCTAssertEqual(jsHash(987654321), 2403959625)
    }

    func testFixedSetsMatchWeb() {
        XCTAssertEqual(ids(exams.sets("A1", .tt12)[0]), "21,64,65,93,1035,1048,1065,1072,1015,114,3030,401,408,433,434,5018,5067,5107,5109,522,524,532,6020,6050,6064")
        XCTAssertEqual(ids(exams.sets("A1", .tt108)[1]), "13,15,22,37,44,85,91,1024,1025,1032,1037,1060,1083,1087,7,102,105,115,203,3039,403,410,419,426,5023,5027,5044,5047,5067,5079,5083,5115,512,514,516,530,6028,6035,6046,6049")
        XCTAssertEqual(ids(exams.sets("B", .tt12)[0]), "11,13,45,46,92,1025,1035,1073,1002,118,3008,4018,443,5006,5026,5052,5084,5085,5106,5107,5117,518,525,529,6009,6028,6036,6051,6064,6066")
        XCTAssertEqual(ids(exams.sets("C", .tt12)[0]), "20,27,39,44,61,96,121,1038,1049,1064,2,2004,209,3043,4019,417,433,434,446,447,450,5032,5038,5047,5049,5053,5055,5067,5078,510,522,524,528,530,6003,6016,6029,6040,6060,6066")
        XCTAssertEqual(
            ids(exams.sets("C", .tt108)[1]),
            "18,27,30,35,55,58,60,61,87,91,92,95,97,1028,1045,1054,1063,1085,1086,1006,107,2007,2009,209,3009,3042,302,4023,406,411,415,427,441,447,453,5004,5008,5010,5019,5047,5051,5064,5066,5076,5077,5087,5092,5102,5112,5118,512,515,520,521,523,524,530,536,6010,6013,6015,6019,6023,6026,6039,6040,6048,6057,6062,6063"
        )
    }

    func testRandomExamMatchesWeb() {
        XCTAssertEqual(ids(exams.build("A1", seed: 1000, version: .tt12)), "23,59,92,1019,1051,1063,1068,1087,1012,118,3017,434,453,5012,5053,5111,5116,5117,5118,509,6014,6026,6032,6042,6044")
        XCTAssertEqual(ids(exams.build("B", seed: 1000, version: .tt12)), "27,30,46,54,99,1033,1063,1088,71,117,3005,301,405,442,454,456,5045,5059,5063,5069,5087,502,531,6002,6006,6020,6026,6053,6058,6064")
    }

    func testEverySetHasRightSizeAndOneCritical() {
        for lic in Self.repo.licenses {
            for v in ExamVersion.allCases {
                let sets = exams.sets(lic.id, v)
                XCTAssertEqual(sets.count, exams.setCount(lic.id))
                for s in sets {
                    XCTAssertEqual(s.count, lic.config(v).total, "\(lic.id) \(v)")
                    XCTAssertEqual(s.filter { $0.critical }.count, 1, "\(lic.id) \(v)")
                    XCTAssertEqual(Set(s.map { $0.id }).count, s.count)
                }
            }
        }
    }

    func testGradeUsesPassMarkAndCriticalRule() {
        let set = exams.sets("A1", .tt12)[0]
        var allRight: [Int: Int] = [:]
        for q in set { allRight[q.id] = q.answer }
        XCTAssertTrue(exams.grade("A1", questions: set, answers: allRight, version: .tt12).passed)
        let crit = set.first { $0.critical }!
        var critWrong = allRight
        critWrong[crit.id] = (crit.answer + 1) % crit.options.count
        let r = exams.grade("A1", questions: set, answers: critWrong, version: .tt12)
        XCTAssertFalse(r.passed)
        XCTAssertTrue(r.criticalFail)
    }

    func testSetsAndPredictorRun() {
        let sets = SetBuilder(repo: Self.repo)
        var stats: [Int: QStat] = [:]
        for q in Self.repo.questionsFor("B").prefix(80) { stats[q.id] = QStat(c: q.id % 3 == 0 ? 0 : 2, w: q.id % 3 == 0 ? 2 : 0, last: q.id % 3 == 0 ? 0 : 1, t: 1, box: 1, due: 1) }
        for key in SetBuilder.staticKeys + ["diem-yeu", "chuong-1", "chuong-6", "chu-de-diem-liet"] {
            _ = sets.meta(key)
            let qs = sets.build("B", key: key, stats: stats, bookmarks: [1, 2, 3])
            XCTAssertLessThanOrEqual(qs.count, Self.repo.questionsFor("B").count, key)
        }
        XCTAssertEqual(sets.build("B", key: "hom-nay", stats: stats, bookmarks: []).count, 20)
        XCTAssertFalse(sets.analyze("B", stats: stats).isEmpty)
        let p = Predictor(repo: Self.repo, exams: exams, sets: sets).predict("B", version: .tt12, stats: stats, history: [], samples: 5)
        XCTAssertTrue(p.p >= 0 && p.p <= 1)
        XCTAssertFalse(p.reasons.isEmpty)
        XCTAssertEqual(licenseProgress(Self.repo, "B", stats: stats, exams: []).seen, 80)
    }
}
