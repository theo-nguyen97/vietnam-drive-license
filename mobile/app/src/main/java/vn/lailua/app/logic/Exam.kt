package vn.lailua.app.logic

import vn.lailua.app.data.ExamVersion
import vn.lailua.app.data.Question
import vn.lailua.app.data.Repo
import kotlin.math.floor
import kotlin.math.sign

/** Sinh đề & chấm thi — chuyển từ src/lib/exam.ts, giữ nguyên thuật toán. */
class ExamBuilder(private val repo: Repo) {

    private val planTt12: Map<Int, Map<Int, Int>> = mapOf(
        25 to mapOf(1 to 8, 2 to 1, 3 to 1, 5 to 8, 6 to 6),
        30 to mapOf(1 to 8, 2 to 1, 3 to 1, 4 to 1, 5 to 9, 6 to 9),
        35 to mapOf(1 to 10, 2 to 1, 3 to 2, 4 to 1, 5 to 10, 6 to 10),
        40 to mapOf(1 to 10, 2 to 1, 3 to 2, 4 to 1, 5 to 14, 6 to 11),
        45 to mapOf(1 to 10, 2 to 1, 3 to 2, 4 to 1, 5 to 16, 6 to 14),
    )

    private val planTt108: Map<String, Map<Int, Int>> = mapOf(
        "moto-40" to mapOf(1 to 14, 2 to 3, 3 to 2, 5 to 12, 6 to 8),
        "moto-50" to mapOf(1 to 17, 2 to 3, 3 to 3, 5 to 14, 6 to 12),
        "car-50" to mapOf(1 to 14, 2 to 3, 3 to 2, 4 to 1, 5 to 15, 6 to 14),
        "car-60" to mapOf(1 to 17, 2 to 3, 3 to 3, 4 to 2, 5 to 17, 6 to 17),
        "car-70" to mapOf(1 to 19, 2 to 3, 3 to 3, 4 to 2, 5 to 22, 6 to 20),
        "car-80" to mapOf(1 to 21, 2 to 4, 3 to 3, 4 to 2, 5 to 26, 6 to 23),
        "car-90" to mapOf(1 to 23, 2 to 4, 3 to 4, 4 to 2, 5 to 30, 6 to 26),
    )

    /** Phân bổ số câu theo chương (không tính câu điểm liệt). Thứ tự chương tăng dần. */
    fun plan(licenseId: String, version: ExamVersion): List<Pair<Int, Int>> {
        val lic = repo.license(licenseId)!!
        val total = lic.config(version).total
        val base = if (version == ExamVersion.TT108) {
            planTt108["${lic.group}-$total"] ?: planTt108[if (lic.isMoto) "moto-40" else "car-90"]!!
        } else planTt12[total] ?: planTt12[45]!!
        return fitPlan(base, total - 1, lic.isMoto)
    }

    private fun fitPlan(plan: Map<Int, Int>, target: Int, moto: Boolean): List<Pair<Int, Int>> {
        val entries = plan.entries.sortedBy { it.key }.map { it.key to it.value }.filter { (ch, n) -> n > 0 && !(moto && ch == 4) }
        val sum = entries.sumOf { it.second }
        if (sum == target) return entries
        val scaled = entries.map { (ch, n) -> intArrayOf(ch, maxOf(1, floor(n.toDouble() * target / sum).toInt())) }.toMutableList()
        var diff = target - scaled.sumOf { it[1] }
        var i = 0
        while (diff != 0 && i < scaled.size * 4) {
            val candidates = listOf(1, 5, 6, 2, 3, 4).map { c -> scaled.indexOfFirst { it[0] == c } }.filter { it >= 0 }
            val idx = candidates.getOrNull(i % minOf(3, scaled.size)) ?: break
            scaled[idx][1] += diff.sign
            diff -= diff.sign
            i++
        }
        return scaled.map { it[0] to it[1] }
    }

    /** Chương 1 → câu điểm liệt → các chương còn lại. */
    private fun orderExam(qs: List<Question>): List<Question> {
        fun rank(q: Question) = if (q.critical) 1.5 else q.chapter.toDouble()
        return qs.sortedWith(compareBy<Question> { rank(it) }.thenBy { it.id })
    }

    private class Cycle(private val items: List<Question>) {
        private var i = 0
        fun take(n: Int, used: MutableSet<Int>): List<Question> {
            val out = ArrayList<Question>()
            if (items.isEmpty()) return out
            var guard = 0
            while (out.size < n && guard < items.size * 2) {
                val it = items[i % items.size]
                i++; guard++
                if (used.add(it.id)) out.add(it)
            }
            return out
        }
    }

    /** pick(chapter hoặc 0 = điểm liệt, n, used) */
    private fun compose(licenseId: String, version: ExamVersion, pick: (Int, Int, MutableSet<Int>) -> List<Question>): List<Question> {
        val lic = repo.license(licenseId)!!
        val total = lic.config(version).total
        val used = HashSet<Int>()
        val out = ArrayList<Question>(pick(0, 1, used))
        for ((ch, n) in plan(licenseId, version)) out += pick(ch, n, used)
        for (ch in intArrayOf(1, 5, 6)) {
            if (out.size >= total) break
            out += pick(ch, total - out.size, used)
        }
        return orderExam(out.take(total))
    }

    /** Đề ngẫu nhiên theo seed. */
    fun build(licenseId: String, seed: Long, version: ExamVersion): List<Question> {
        val rng = Rng(seed)
        val pool = repo.questionsFor(licenseId)
        return compose(licenseId, version) { ch, n, used ->
            val src = if (ch == 0) pool.filter { it.critical } else pool.filter { it.chapter == ch && !it.critical }
            src.shuffled(rng).filter { it.id !in used }.take(n).onEach { used.add(it.id) }
        }
    }

    fun setCount(licenseId: String) = if (repo.license(licenseId)?.isMoto == true) 10 else 20

    private val setCache = HashMap<String, List<List<Question>>>()

    /** Bộ đề cố định "Đề số 1…N" — tất định theo mã hạng, giống hệt bản web. */
    fun sets(licenseId: String, version: ExamVersion): List<List<Question>> {
        val key = "${licenseId.uppercase()}-${version.key}"
        setCache[key]?.let { return it }
        val rng = Rng(jsHash(jsStringSeed(key)))
        val pool = repo.questionsFor(licenseId)
        val cycles = HashMap<Int, Cycle>()
        cycles[0] = Cycle(pool.filter { it.critical }.shuffled(rng))
        for (ch in 1..6) cycles[ch] = Cycle(pool.filter { it.chapter == ch && !it.critical }.shuffled(rng))
        val sets = List(setCount(licenseId)) { compose(licenseId, version) { ch, n, used -> cycles[ch]!!.take(n, used) } }
        setCache[key] = sets
        return sets
    }

    data class Result(val correct: Int, val total: Int, val passed: Boolean, val criticalFail: Boolean, val wrongIds: List<Int>)

    fun grade(licenseId: String, questions: List<Question>, answers: Map<Int, Int>, version: ExamVersion): Result {
        val cfg = repo.license(licenseId)!!.config(version)
        var correct = 0
        var criticalFail = false
        val wrong = ArrayList<Int>()
        for (q in questions) {
            if (answers[q.id] == q.answer) correct++ else {
                wrong += q.id
                if (q.critical) criticalFail = true
            }
        }
        return Result(correct, questions.size, !criticalFail && correct >= cfg.pass, criticalFail, wrong)
    }
}
