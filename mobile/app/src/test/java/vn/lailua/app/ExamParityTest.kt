package vn.lailua.app

import org.junit.Assert.assertEquals
import org.junit.Test
import vn.lailua.app.data.ExamVersion
import vn.lailua.app.data.Repo
import vn.lailua.app.logic.ExamBuilder
import vn.lailua.app.logic.Rng
import vn.lailua.app.logic.jsHash
import java.io.File

/**
 * Bộ đề trên app phải trùng khớp với bản web (giá trị tham chiếu sinh bằng
 * `npx tsx` từ src/lib/exam.ts).
 */
class ExamParityTest {
    private val repo = Repo.fromJson(read = { name -> File("src/main/assets/data/$name").readText() })
    private val exams = ExamBuilder(repo)

    private fun ids(qs: List<vn.lailua.app.data.Question>) = qs.joinToString(",") { it.id.toString() }

    @Test
    fun rngMatchesWeb() {
        val r = Rng(jsHash(12345))
        assertEquals("0.209238795331,0.946848918218,0.266431833152", listOf(r.next(), r.next(), r.next()).joinToString(",") { "%.12f".format(it) })
        assertEquals(2403959625L, jsHash(987654321))
    }

    @Test
    fun fixedSetsMatchWeb() {
        assertEquals("21,64,65,93,1035,1048,1065,1072,1015,114,3030,401,408,433,434,5018,5067,5107,5109,522,524,532,6020,6050,6064", ids(exams.sets("A1", ExamVersion.TT12)[0]))
        assertEquals("13,15,22,37,44,85,91,1024,1025,1032,1037,1060,1083,1087,7,102,105,115,203,3039,403,410,419,426,5023,5027,5044,5047,5067,5079,5083,5115,512,514,516,530,6028,6035,6046,6049", ids(exams.sets("A1", ExamVersion.TT108)[1]))
        assertEquals("11,13,45,46,92,1025,1035,1073,1002,118,3008,4018,443,5006,5026,5052,5084,5085,5106,5107,5117,518,525,529,6009,6028,6036,6051,6064,6066", ids(exams.sets("B", ExamVersion.TT12)[0]))
        assertEquals("20,27,39,44,61,96,121,1038,1049,1064,2,2004,209,3043,4019,417,433,434,446,447,450,5032,5038,5047,5049,5053,5055,5067,5078,510,522,524,528,530,6003,6016,6029,6040,6060,6066", ids(exams.sets("C", ExamVersion.TT12)[0]))
        assertEquals(
            "18,27,30,35,55,58,60,61,87,91,92,95,97,1028,1045,1054,1063,1085,1086,1006,107,2007,2009,209,3009,3042,302,4023,406,411,415,427,441,447,453,5004,5008,5010,5019,5047,5051,5064,5066,5076,5077,5087,5092,5102,5112,5118,512,515,520,521,523,524,530,536,6010,6013,6015,6019,6023,6026,6039,6040,6048,6057,6062,6063",
            ids(exams.sets("C", ExamVersion.TT108)[1]),
        )
    }

    @Test
    fun randomExamMatchesWeb() {
        assertEquals("23,59,92,1019,1051,1063,1068,1087,1012,118,3017,434,453,5012,5053,5111,5116,5117,5118,509,6014,6026,6032,6042,6044", ids(exams.build("A1", 1000, ExamVersion.TT12)))
        assertEquals("27,30,46,54,99,1033,1063,1088,71,117,3005,301,405,442,454,456,5045,5059,5063,5069,5087,502,531,6002,6006,6020,6026,6053,6058,6064", ids(exams.build("B", 1000, ExamVersion.TT12)))
    }

    @Test
    fun gradeUsesPassMarkAndCriticalRule() {
        val set = exams.sets("A1", ExamVersion.TT12)[0]
        val allRight = set.associate { it.id to it.answer }
        assertEquals(true, exams.grade("A1", set, allRight, ExamVersion.TT12).passed)
        val crit = set.first { it.critical }
        val critWrong = allRight + (crit.id to (crit.answer + 1) % crit.options.size)
        val r = exams.grade("A1", set, critWrong, ExamVersion.TT12)
        assertEquals(false, r.passed)
        assertEquals(true, r.criticalFail)
    }
}
