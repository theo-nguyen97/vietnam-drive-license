package vn.lailua.app.store

import android.content.Context
import android.os.Handler
import android.os.Looper
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.datastore.core.CorruptionException
import androidx.datastore.core.DataStore
import androidx.datastore.core.DataStoreFactory
import androidx.datastore.core.Serializer
import androidx.datastore.dataStoreFile
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import kotlinx.serialization.SerializationException
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.put
import java.io.InputStream
import java.io.OutputStream
import java.time.LocalDate

/** Thống kê một câu hỏi — cùng tên trường với bản web để nhập/xuất tiến độ qua lại. */
@Serializable
data class QStat(
    val c: Int = 0,
    val w: Int = 0,
    /** 1 đúng, 0 sai ở lần gần nhất */
    val last: Int = 0,
    val t: Long = 0,
    val box: Int = 0,
    val due: Long? = null,
)

@Serializable
data class ExamRecord(
    val id: String,
    val license: String,
    val setNo: Int? = null,
    val version: String? = null,
    val at: Long,
    val correct: Int,
    val total: Int,
    val passed: Boolean,
    val criticalFail: Boolean,
    val duration: Long,
    val wrongIds: List<Int> = emptyList(),
)

@Serializable
data class Streak(val days: Int = 0, val last: String = "")

@Serializable
data class ProgressState(
    val stats: Map<Int, QStat> = emptyMap(),
    val exams: List<ExamRecord> = emptyList(),
    val xp: Int = 0,
    val streak: Streak = Streak(),
    val bestCombo: Int = 0,
    val bookmarks: List<Int> = emptyList(),
    val sound: Boolean = true,
    val lastLicense: String? = null,
    val driverName: String = "",
    /** "tt12" | "tt108" | null (tự động theo ngày) */
    val examVersion: String? = null,
    val fontScale: Float = 1f,
    val onboarded: Boolean = false,
    /** "before" | "after" | "unknown" */
    val examTiming: String? = null,
)

/** Khoảng cách ôn lại theo hộp Leitner: 10 phút, 1, 3, 7, 16, 35 ngày. */
val REVIEW_INTERVALS = longArrayOf(10 * 60_000L, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY)
private const val DAY = 86_400_000L

private val json = Json { ignoreUnknownKeys = true; encodeDefaults = true }

private object ProgressSerializer : Serializer<ProgressState> {
    override val defaultValue = ProgressState()
    override suspend fun readFrom(input: InputStream): ProgressState = try {
        json.decodeFromString(ProgressState.serializer(), input.readBytes().decodeToString())
    } catch (e: SerializationException) {
        throw CorruptionException("Không đọc được tiến độ", e)
    }

    override suspend fun writeTo(t: ProgressState, output: OutputStream) {
        output.write(json.encodeToString(ProgressState.serializer(), t).encodeToByteArray())
    }
}

/** Kho tiến độ học — một bản ghi JSON trong DataStore, cập nhật nguyên tử. */
class ProgressStore private constructor(context: Context) {
    private val store: DataStore<ProgressState> = DataStoreFactory.create(
        serializer = ProgressSerializer,
        corruptionHandler = androidx.datastore.core.handlers.ReplaceFileCorruptionHandler { ProgressState() },
    ) { context.dataStoreFile("progress.json") }

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    val flow: Flow<ProgressState> = store.data

    private val mainHandler = Handler(Looper.getMainLooper())
    private val _state = mutableStateOf<ProgressState?>(null)

    /** Trạng thái hiện tại cho Compose — luôn được ghi trên main thread (null khi chưa đọc xong). */
    val state: State<ProgressState?> get() = _state

    init {
        scope.launch { store.data.collect { s -> mainHandler.post { _state.value = s } } }
    }

    private fun update(fn: (ProgressState) -> ProgressState) {
        scope.launch { store.updateData(fn) }
    }

    fun record(qid: Int, correct: Boolean) = update { s ->
        val prev = s.stats[qid] ?: QStat()
        val now = System.currentTimeMillis()
        val box = if (correct) minOf(REVIEW_INTERVALS.size - 1, prev.box + (if (prev.t != 0L) 1 else 2)) else 0
        s.copy(
            stats = s.stats + (qid to QStat(
                c = prev.c + if (correct) 1 else 0,
                w = prev.w + if (correct) 0 else 1,
                last = if (correct) 1 else 0,
                t = now,
                box = box,
                due = now + REVIEW_INTERVALS[box],
            )),
            streak = nextStreak(s.streak),
        )
    }

    fun addXp(n: Int) = update { it.copy(xp = maxOf(0, it.xp + n)) }
    fun setBestCombo(n: Int) = update { it.copy(bestCombo = maxOf(it.bestCombo, n)) }
    fun addExam(r: ExamRecord) = update { it.copy(exams = (listOf(r) + it.exams).take(50), streak = nextStreak(it.streak)) }
    fun toggleBookmark(qid: Int) = update { it.copy(bookmarks = if (qid in it.bookmarks) it.bookmarks - qid else it.bookmarks + qid) }
    fun setSound(v: Boolean) = update { it.copy(sound = v) }
    fun setDriverName(n: String) = update { it.copy(driverName = n.take(32)) }
    fun setExamVersion(v: String?) = update { it.copy(examVersion = v) }
    fun setFontScale(f: Float) = update { it.copy(fontScale = f) }
    fun setLastLicense(id: String) = update { it.copy(lastLicense = id) }

    fun completeOnboarding(license: String, timing: String) = update {
        it.copy(
            lastLicense = license,
            examTiming = timing,
            examVersion = when (timing) { "after" -> "tt108"; "before" -> "tt12"; else -> null },
            onboarded = true,
        )
    }

    /** Xoá tiến độ nhưng giữ cài đặt. */
    fun reset() = update {
        ProgressState(
            sound = it.sound, driverName = it.driverName, fontScale = it.fontScale, examVersion = it.examVersion,
            onboarded = it.onboarded, lastLicense = it.lastLicense, examTiming = it.examTiming,
        )
    }

    /** Xuất theo đúng định dạng tệp của bản web để dùng chéo. */
    suspend fun exportJson(state: ProgressState): String {
        val st = buildJsonObject {
            put("stats", json.encodeToJsonElement(state.stats))
            put("exams", json.encodeToJsonElement(state.exams))
            put("xp", state.xp)
            put("streak", json.encodeToJsonElement(state.streak))
            put("bestCombo", state.bestCombo)
            put("bookmarks", json.encodeToJsonElement(state.bookmarks))
        }
        return json.encodeToString(buildJsonObject {
            put("app", "lai-lua"); put("version", 1); put("exportedAt", java.time.Instant.now().toString()); put("state", st)
        })
    }

    /** Nhập tệp JSON (từ app hoặc web). Trả về false nếu tệp không hợp lệ. */
    suspend fun importJson(text: String): Boolean = runCatching {
        val root = json.parseToJsonElement(text).jsonObject
        val st: JsonObject = (root["state"] as? JsonObject) ?: root
        val partial = json.decodeFromJsonElement(ProgressState.serializer(), st)
        store.updateData { cur ->
            cur.copy(
                stats = partial.stats, exams = partial.exams.take(50), xp = maxOf(0, partial.xp),
                streak = partial.streak, bestCombo = partial.bestCombo, bookmarks = partial.bookmarks.distinct(),
            )
        }
        true
    }.getOrDefault(false)

    companion object {
        @Volatile private var instance: ProgressStore? = null
        fun get(context: Context): ProgressStore = instance ?: synchronized(this) {
            instance ?: ProgressStore(context.applicationContext).also { instance = it }
        }

        fun dayKey(d: LocalDate = LocalDate.now()): String = d.toString()

        fun nextStreak(s: Streak): Streak {
            val today = dayKey()
            if (s.last == today) return s
            val yesterday = dayKey(LocalDate.now().minusDays(1))
            return Streak(days = if (s.last == yesterday) s.days + 1 else 1, last = today)
        }

        /** Số ngày học liên tiếp còn hiệu lực. */
        fun activeStreak(s: Streak): Int {
            val today = dayKey()
            val yesterday = dayKey(LocalDate.now().minusDays(1))
            return if (s.last == today || s.last == yesterday) s.days else 0
        }
    }
}
