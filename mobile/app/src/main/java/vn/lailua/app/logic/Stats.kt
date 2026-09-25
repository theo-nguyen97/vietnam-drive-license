package vn.lailua.app.logic

import vn.lailua.app.data.ExamVersion
import vn.lailua.app.data.Question
import vn.lailua.app.data.Repo
import vn.lailua.app.store.ExamRecord
import vn.lailua.app.store.QStat

data class Rank(val xp: Int, val name: String, val icon: String)

val RANKS = listOf(
    Rank(0, "Học viên", "🔰"),
    Rank(150, "Tài xế tập sự", "🚲"),
    Rank(400, "Tài xế", "🛵"),
    Rank(900, "Tay lái cứng", "🚗"),
    Rank(1800, "Tay lái lụa", "🏎️"),
    Rank(3500, "Huyền thoại đường phố", "🏆"),
)

data class RankInfo(val rank: Rank, val level: Int, val next: Rank?, val progress: Float)

fun rankOf(xp: Int): RankInfo {
    var idx = 0
    RANKS.forEachIndexed { i, r -> if (xp >= r.xp) idx = i }
    val cur = RANKS[idx]
    val next = RANKS.getOrNull(idx + 1)
    val progress = if (next != null) (xp - cur.xp).toFloat() / (next.xp - cur.xp) else 1f
    return RankInfo(cur, idx + 1, next, progress.coerceIn(0f, 1f))
}

data class ChapterProgress(var total: Int = 0, var mastered: Int = 0, var seen: Int = 0)

data class LicenseProgress(
    val total: Int,
    val mastered: Int,
    val seen: Int,
    val wrong: Int,
    val pct: Float,
    val chapters: Map<Int, ChapterProgress>,
    val exams: Int,
    val passed: Int,
    val best: Float,
    val critical: Int,
    val criticalMastered: Int,
)

fun licenseProgress(repo: Repo, licenseId: String, stats: Map<Int, QStat>, exams: List<ExamRecord>): LicenseProgress {
    val qs = repo.questionsFor(licenseId)
    var mastered = 0; var seen = 0; var wrong = 0
    val chapters = HashMap<Int, ChapterProgress>()
    for (q in qs) {
        val ch = chapters.getOrPut(q.chapter) { ChapterProgress() }
        ch.total++
        val s = stats[q.id] ?: continue
        seen++; ch.seen++
        if (s.last == 1) { mastered++; ch.mastered++ } else wrong++
    }
    val mine = exams.filter { it.license.equals(licenseId, true) }
    val critical = qs.filter { it.critical }
    return LicenseProgress(
        total = qs.size, mastered = mastered, seen = seen, wrong = wrong,
        pct = if (qs.isEmpty()) 0f else mastered.toFloat() / qs.size,
        chapters = chapters,
        exams = mine.size, passed = mine.count { it.passed },
        best = mine.maxOfOrNull { it.correct.toFloat() / it.total } ?: 0f,
        critical = critical.size, criticalMastered = critical.count { stats[it.id]?.last == 1 },
    )
}

// ---------- Dự đoán khả năng đậu (src/lib/predict.ts) ----------

data class Reason(val icon: String, val text: String, val good: Boolean)

data class Prediction(val p: Double, val confidence: String, val label: String, val tone: String, val reasons: List<Reason>)

class Predictor(private val repo: Repo, private val exams: ExamBuilder, private val sets: SetBuilder) {

    private fun probCorrect(q: Question, s: QStat?, topicAcc: Map<String, Double>): Double {
        if (s == null) {
            val acc = topicAcc[q.topic] ?: return 0.42
            return 0.25 + 0.5 * acc
        }
        return if (s.last == 1) minOf(0.97, 0.8 + 0.035 * s.box - 0.04 * minOf(s.w, 2))
        else minOf(0.55, 0.3 + 0.06 * minOf(s.c, 3))
    }

    /** P(số câu đúng ≥ k) — phân phối Poisson-nhị thức. */
    private fun atLeast(ps: List<Double>, k: Int): Double {
        var dist = doubleArrayOf(1.0)
        for (p in ps) {
            val next = DoubleArray(dist.size + 1)
            for (i in dist.indices) {
                next[i] += dist[i] * (1 - p)
                next[i + 1] += dist[i] * p
            }
            dist = next
        }
        var sum = 0.0
        for (i in maxOf(0, k) until dist.size) sum += dist[i]
        return sum
    }

    fun predict(licenseId: String, version: ExamVersion, stats: Map<Int, QStat>, history: List<ExamRecord>, samples: Int = 60): Prediction {
        val lic = repo.license(licenseId)!!
        val cfg = lic.config(version)
        val pool = repo.questionsFor(licenseId)
        val reports = sets.analyze(licenseId, stats)
        val topicAcc = HashMap<String, Double>()
        for (r in reports) if (r.accuracy != null && r.attempts >= 2) topicAcc[r.topic.id] = r.accuracy

        var total = 0.0
        for (i in 0 until samples) {
            val exam = exams.build(licenseId, 1000L + i * 7919L, version)
            val crit = exam.firstOrNull { it.critical }
            val rest = exam.filter { it !== crit }.map { probCorrect(it, stats[it.id], topicAcc) }
            val pc = if (crit != null) probCorrect(crit, stats[crit.id], topicAcc) else 1.0
            total += pc * atLeast(rest, cfg.pass - (if (crit != null) 1 else 0))
        }
        var p = total / samples

        val recent = history.filter { it.license.equals(licenseId, true) && (it.version ?: "tt12") == version.key }.take(5)
        if (recent.size >= 2) {
            val rate = recent.count { it.passed }.toDouble() / recent.size
            p = 0.7 * p + 0.3 * rate
        }

        val seen = pool.count { stats[it.id] != null }
        val coverage = seen.toDouble() / pool.size
        val confidence = if (coverage < 0.3) "low" else if (coverage < 0.7) "medium" else "high"
        val critical = pool.filter { it.critical }
        val critOk = critical.count { stats[it.id]?.last == 1 }
        val weak = reports.firstOrNull { it.status == SetBuilder.Status.DANGER }

        val reasons = ArrayList<Reason>()
        val unseen = pool.size - seen
        reasons += if (unseen > 0) Reason("📚", "Còn $unseen/${pool.size} câu chưa học", unseen < pool.size * 0.1)
        else Reason("📚", "Đã học hết ngân hàng câu hỏi", true)
        reasons += Reason("⚠️", "Điểm liệt đã thuộc $critOk/${critical.size} câu", critOk == critical.size)
        if (weak != null) reasons += Reason(weak.topic.icon, "Hay sai: ${weak.topic.name} (đúng ${Math.round((weak.accuracy ?: 0.0) * 100)}%)", false)
        if (recent.isNotEmpty()) {
            val ok = recent.count { it.passed }
            reasons += Reason("🏁", "Thi thử gần đây: đạt $ok/${recent.size} lần", ok.toDouble() / recent.size >= 0.8)
        }
        val tone = if (p >= 0.8) "green" else if (p >= 0.5) "amber" else "red"
        val label = when {
            p >= 0.9 -> "Sẵn sàng đi thi"; p >= 0.8 -> "Khả năng cao"; p >= 0.5 -> "Cần luyện thêm"; p >= 0.2 -> "Chưa sẵn sàng"; else -> "Mới bắt đầu"
        }
        return Prediction(p, confidence, label, tone, reasons)
    }
}
