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
        assertEquals("23,33,38,59,62,67,68,88,72,115,201,408,416,420,431,435,439,447,451,511,513,517,524,536,540", ids(exams.sets("A1", ExamVersion.TT12)[0]))
        assertEquals("15,18,23,25,34,44,46,51,56,59,60,68,86,87,2,103,104,120,203,204,403,405,408,419,420,423,425,427,430,431,439,446,503,510,514,517,521,523,531,536", ids(exams.sets("A1", ExamVersion.TT108)[1]))
        assertEquals("16,31,32,59,66,67,88,97,76,106,210,303,402,403,407,410,412,417,430,435,443,504,509,511,512,515,522,526,527,533", ids(exams.sets("B", ExamVersion.TT12)[0]))
        assertEquals("25,35,44,49,55,58,60,87,88,97,73,117,207,212,303,412,415,416,418,419,421,423,425,427,429,439,442,447,449,502,505,508,510,512,513,514,517,523,533,535", ids(exams.sets("C", ExamVersion.TT12)[0]))
        assertEquals(
            "13,15,18,25,40,44,47,49,53,59,61,66,85,90,94,98,100,121,122,83,107,109,113,208,210,214,303,307,401,406,407,415,420,427,429,430,433,434,438,440,441,442,445,446,448,450,452,453,454,455,502,503,504,509,510,512,514,515,516,519,521,524,525,526,529,530,537,538,540,541",
            ids(exams.sets("C", ExamVersion.TT108)[1]),
        )
    }

    @Test
    fun randomExamMatchesWeb() {
        assertEquals("24,25,27,31,56,61,68,121,72,112,201,414,419,420,438,447,450,453,455,510,511,515,527,531,541", ids(exams.build("A1", 1000, ExamVersion.TT12)))
        assertEquals("24,39,44,45,63,94,98,122,72,101,209,311,409,412,420,421,433,438,441,443,452,502,507,510,519,522,524,533,535,537", ids(exams.build("B", 1000, ExamVersion.TT12)))
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
