package vn.lailua.app.logic

import vn.lailua.app.data.Question
import vn.lailua.app.data.Repo
import vn.lailua.app.store.QStat

/** Các bài ôn tập (chuyển từ src/lib/sets.ts). */
class SetBuilder(private val repo: Repo) {
    companion object {
        const val DAILY_SIZE = 20
        val STATIC = listOf("hom-nay", "tat-ca", "diem-liet", "cau-sai", "ngau-nhien", "da-luu", "co-meo", "mo-phong")
    }

    data class Meta(val title: String, val desc: String, val icon: String)

    fun meta(key: String): Meta = when {
        key.startsWith("chu-de-") -> repo.topic(key.removePrefix("chu-de-"))?.let { Meta(it.name, it.hint, it.icon) } ?: Meta("Ôn tập", "", "📘")
        key.startsWith("meo-") -> repo.tips.groups.firstOrNull { it.id == key.removePrefix("meo-") }?.let { Meta("Luyện mẹo: ${it.name}", it.desc, it.icon) } ?: Meta("Ôn tập", "", "📘")
        key == "diem-yeu" -> Meta("Luyện điểm yếu", "Câu hỏi từ các chủ đề bạn hay sai nhất", vn.lailua.app.data.Emoji.compat("🩺"))
        key.startsWith("chuong-") -> repo.chapters.firstOrNull { it.id == key.removePrefix("chuong-").toIntOrNull() }
            ?.let { Meta(it.short, it.name, it.icon) } ?: Meta("Ôn tập", "", "📘")
        key == "hom-nay" -> Meta("Ôn tập hôm nay", "Lặp lại ngắt quãng: câu đến hạn ôn + câu mới", "📅")
        key == "tat-ca" -> Meta("Toàn bộ câu hỏi", "Chạy lần lượt qua tất cả các trạm", "🛣️")
        key == "diem-liet" -> Meta("Câu điểm liệt", "Sai một câu là trượt — phải thuộc lòng", "⚠️")
        key == "cau-sai" -> Meta("Câu hay sai", "Những câu bạn trả lời sai ở lần gần nhất", "🔁")
        key == "ngau-nhien" -> Meta("Chạy ngẫu nhiên", "20 câu bất kỳ — khởi động nhanh", "🎲")
        key == "da-luu" -> Meta("Câu đã lưu", "Các câu bạn đánh dấu để ôn lại", "🔖")
        key == "co-meo" -> Meta("Học theo mẹo", "Các câu có mẹo nhớ — luyện để thuộc mẹo", "💡")
        key == "mo-phong" -> Meta("Tình huống mô phỏng", "Câu có hình động — thử chọn sai để xem hậu quả", "🎬")
        else -> Meta("Ôn tập", "", "📘")
    }

    fun build(licenseId: String, key: String, stats: Map<Int, QStat>, bookmarks: List<Int>): List<Question> {
        val all = repo.questionsFor(licenseId)
        return when {
            key.startsWith("chuong-") -> all.filter { it.chapter == key.removePrefix("chuong-").toIntOrNull() }
            key.startsWith("chu-de-") -> topicSet(licenseId, key.removePrefix("chu-de-"), stats)
            key == "diem-yeu" -> weaknessSet(licenseId, stats)
            key == "hom-nay" -> dailySet(all, stats)
            key == "diem-liet" -> all.filter { it.critical }
            key == "cau-sai" -> all.filter { stats[it.id]?.last == 0 }
            key == "ngau-nhien" -> all.shuffled().take(20)
            key == "da-luu" -> all.filter { it.id in bookmarks }
            key == "co-meo" -> all.filter { it.tip != null }
            key == "mo-phong" -> all.filter { it.scene != null || it.consequences != null }.shuffled()
            key.startsWith("meo-") -> tipQuestions(licenseId, key.removePrefix("meo-"))
            else -> all
        }
    }

    /** Câu minh hoạ của một nhóm mẹo (Học mẹo → "Luyện ngay"): câu được mẹo trỏ tới, rồi câu thuộc chủ đề của nhóm. */
    fun tipQuestions(licenseId: String, groupId: String): List<Question> {
        val all = repo.questionsFor(licenseId)
        val group = repo.tips.groups.firstOrNull { it.id == groupId } ?: return emptyList()
        val linked = repo.tips.tips.filter { it.group == groupId }.flatMap { it.questions }.toSet()
        val byTopic = all.filter { it.topic in group.topics }
        return (all.filter { it.id in linked } + byTopic).distinctBy { it.id }
    }

    /** Câu đến hạn ôn (theo hộp Leitner), ưu tiên câu điểm liệt và câu quá hạn lâu. */
    fun dueQuestions(all: List<Question>, stats: Map<Int, QStat>, now: Long = System.currentTimeMillis()): List<Question> =
        all.filter { q -> stats[q.id]?.let { (it.due ?: it.t) <= now } == true }
            .sortedWith(compareBy<Question> { if (it.critical) 0 else 1 }.thenBy { stats[it.id]?.due ?: 0 })

    fun dailySet(all: List<Question>, stats: Map<Int, QStat>): List<Question> {
        val due = dueQuestions(all, stats).take(DAILY_SIZE)
        if (due.size >= DAILY_SIZE) return due
        val fresh = all.filter { stats[it.id] == null }
        val critical = fresh.filter { it.critical }
        val others = fresh.filter { !it.critical }.shuffled()
        val picked = (critical.take(3) + others).take(DAILY_SIZE - due.size)
        return due + picked
    }

    /** Số câu đến hạn và số câu mới trong bài hôm nay. */
    fun dailyCounts(licenseId: String, stats: Map<Int, QStat>): Pair<Int, Int> {
        val all = repo.questionsFor(licenseId)
        val due = minOf(dueQuestions(all, stats).size, DAILY_SIZE)
        return due to maxOf(0, DAILY_SIZE - due)
    }

    // ---------- Chủ đề & điểm yếu (src/lib/topics.ts) ----------

    enum class Status { DANGER, WARN, GOOD, UNKNOWN }

    data class TopicReport(
        val topic: vn.lailua.app.data.Topic,
        val total: Int,
        val seen: Int,
        val attempts: Int,
        val correct: Int,
        val wrongNow: Int,
        val risk: Double,
        val accuracy: Double?,
        val status: Status,
    )

    fun analyze(licenseId: String, stats: Map<Int, QStat>): List<TopicReport> {
        val qs = repo.questionsFor(licenseId)
        val order = mapOf(Status.DANGER to 0, Status.WARN to 1, Status.GOOD to 2, Status.UNKNOWN to 3)
        return repo.topicsFor(licenseId).map { topic ->
            val list = qs.filter { it.topic == topic.id }
            var c = 0; var w = 0; var seen = 0; var wrongNow = 0
            for (q in list) {
                val s = stats[q.id] ?: continue
                seen++; c += s.c; w += s.w
                if (s.last == 0) wrongNow++
            }
            val attempts = c + w
            val risk = (w + wrongNow * 1.5 + 0.5) / (attempts + wrongNow * 1.5 + 4)
            val status = when {
                attempts < 2 -> Status.UNKNOWN
                risk >= 0.33 -> Status.DANGER
                risk >= 0.16 -> Status.WARN
                else -> Status.GOOD
            }
            TopicReport(topic, list.size, seen, attempts, c, wrongNow, risk, if (attempts > 0) c.toDouble() / attempts else null, status)
        }.sortedWith(compareBy<TopicReport> { order[it.status] }.thenByDescending { it.risk })
    }

    fun topicSet(licenseId: String, topicId: String, stats: Map<Int, QStat>): List<Question> {
        val list = repo.questionsFor(licenseId).filter { it.topic == topicId }
        fun rank(q: Question): Int {
            val s = stats[q.id] ?: return 1
            return if (s.last == 0) 0 else 2 + s.box
        }
        return list.sortedWith(compareBy<Question> { rank(it) }.thenByDescending { stats[it.id]?.w ?: 0 })
    }

    fun weaknessSet(licenseId: String, stats: Map<Int, QStat>, size: Int = 20): List<Question> {
        val reports = analyze(licenseId, stats).filter { it.status == Status.DANGER || it.status == Status.WARN }
        val out = ArrayList<Question>()
        val used = HashSet<Int>()
        val totalRisk = reports.sumOf { it.risk }.takeIf { it > 0 } ?: 1.0
        for (r in reports) {
            val quota = maxOf(2, Math.round(r.risk / totalRisk * size).toInt())
            for (q in topicSet(licenseId, r.topic.id, stats).take(quota)) {
                if (out.size >= size) break
                if (used.add(q.id)) out += q
            }
        }
        return out
    }
}
