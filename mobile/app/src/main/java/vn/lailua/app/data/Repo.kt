package vn.lailua.app.data

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import kotlinx.serialization.json.Json
import java.time.ZoneId
import java.time.ZonedDateTime

/** Ngân hàng câu hỏi & danh mục, nạp một lần từ assets. */
class Repo private constructor(
    val questions: List<Question>,
    val licenses: List<License>,
    val chapters: List<Chapter>,
    val signs: List<SignInfo>,
    val signGroups: List<SignGroup>,
    val topics: List<Topic>,
    val news: NewsBundle,
    val journey: JourneyBundle,
    val tips: TipBundle,
    private val signLoader: (String) -> Bitmap?,
) {
    private val byId = questions.associateBy { it.id }
    private val poolCache = HashMap<String, List<Question>>()
    private val signCache = HashMap<String, Bitmap?>()

    fun question(id: Int) = byId[id]
    fun license(id: String) = licenses.firstOrNull { it.id.equals(id, ignoreCase = true) }
    fun chapter(id: Int) = chapters.first { it.id == id }
    fun sign(code: String) = signs.firstOrNull { it.code == code }
    fun topic(id: String) = topics.firstOrNull { it.id == id }

    /** Câu hỏi áp dụng cho một hạng bằng (theo nhóm xe máy / ô tô). */
    fun questionsFor(licenseId: String): List<Question> = poolCache.getOrPut(licenseId.uppercase()) {
        val group = license(licenseId)?.group ?: "car"
        val chapterGroups = chapters.associate { it.id to it.groups }
        questions.filter { q -> (q.only == null || q.only == group) && chapterGroups[q.chapter]?.contains(group) == true }
    }

    fun chaptersFor(licenseId: String): List<Chapter> {
        val group = license(licenseId)?.group ?: "car"
        return chapters.filter { group in it.groups }
    }

    fun topicsFor(licenseId: String): List<Topic> {
        val group = license(licenseId)?.group ?: "car"
        val used = questionsFor(licenseId).map { it.topic }.toSet()
        return topics.filter { it.id in used && (it.groups == null || group in it.groups) }
    }

    /** Ảnh biển báo (PNG 256 px) — cache trong bộ nhớ. */
    fun signBitmap(code: String): Bitmap? = signCache.getOrPut(code) { runCatching { signLoader(code) }.getOrNull() }

    companion object {
        /** Ngày áp dụng cấu trúc đề mới (Thông tư 108/2026/TT-BCA). */
        val TT108_DATE: ZonedDateTime = ZonedDateTime.of(2027, 3, 1, 0, 0, 0, 0, ZoneId.of("Asia/Ho_Chi_Minh"))
        val TT108_MILLIS = TT108_DATE.toInstant().toEpochMilli()

        val json = Json { ignoreUnknownKeys = true; classDiscriminator = "kind"; encodeDefaults = false }

        @Volatile private var instance: Repo? = null

        fun get(context: Context): Repo = instance ?: synchronized(this) {
            instance ?: load(context.applicationContext).also { instance = it }
        }

        private fun load(context: Context): Repo {
            val am = context.assets
            return fromJson(
                read = { name -> Emoji.compat(am.open("data/$name").bufferedReader().use { it.readText() }) },
                signLoader = { code -> am.open("signs/$code.png").use { BitmapFactory.decodeStream(it) } },
            )
        }

        /** Dựng kho từ các tệp JSON — dùng cho app lẫn kiểm thử trên JVM. */
        fun fromJson(read: (String) -> String, signLoader: (String) -> Bitmap? = { null }): Repo {
            val signs = json.decodeFromString<SignBundle>(read("signs.json"))
            return Repo(
                questions = json.decodeFromString(read("questions.json")),
                licenses = json.decodeFromString(read("licenses.json")),
                chapters = json.decodeFromString(read("chapters.json")),
                signs = signs.signs,
                signGroups = signs.groups,
                topics = json.decodeFromString(read("topics.json")),
                news = json.decodeFromString(read("news.json")),
                journey = json.decodeFromString(read("journey.json")),
                tips = json.decodeFromString(read("tips.json")),
                signLoader = signLoader,
            )
        }

        fun defaultExamVersion(nowMillis: Long = System.currentTimeMillis()) =
            if (nowMillis >= TT108_MILLIS) ExamVersion.TT108 else ExamVersion.TT12
    }
}
