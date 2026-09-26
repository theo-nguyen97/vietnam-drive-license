package vn.lailua.app.data

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonClassDiscriminator

/*
 * Nội dung đọc thêm dùng chung với web: tin tức luật (news.json), lộ trình lấy bằng + sa hình
 * thực hành (journey.json), học mẹo (tips.json). Xuất bởi scripts/export-mobile-data.tsx.
 */

// ---------- Tin tức ----------

@OptIn(ExperimentalSerializationApi::class)
@Serializable
@JsonClassDiscriminator("type")
sealed class NewsBlock {
    @Serializable @SerialName("p") data class Para(val text: String) : NewsBlock()
    @Serializable @SerialName("h") data class Heading(val text: String) : NewsBlock()
    @Serializable @SerialName("list") data class Bullets(val items: List<String>) : NewsBlock()
    @Serializable @SerialName("table") data class Table(val head: List<String>, val rows: List<List<String>>) : NewsBlock()
    @Serializable @SerialName("timeline") data class Timeline(val items: List<TimelineItem>) : NewsBlock()
    @Serializable @SerialName("tip") data class Tip(val text: String) : NewsBlock()
    /** Khối đếm ngược + bảng so sánh đề 2027. */
    @Serializable @SerialName("exam2027") data object Exam2027 : NewsBlock()
}

@Serializable
data class TimelineItem(val date: String, val text: String)

@Serializable
data class NewsItem(
    val slug: String,
    val title: String,
    val category: String,
    val date: String,
    val emoji: String,
    val summary: String,
    val body: List<NewsBlock>,
    val sources: List<String> = emptyList(),
    val pinned: Boolean = false,
)

@Serializable
data class OfficialLink(val href: String, val label: String)

@Serializable
data class NewsBundle(val categories: List<String>, val items: List<NewsItem>, val links: List<OfficialLink> = emptyList())

// ---------- Lộ trình lấy bằng ----------

@Serializable
data class StepLink(val href: String, val label: String)

@Serializable
data class JourneyStep(
    val key: String,
    val title: String,
    val icon: String,
    val desc: String,
    val items: List<String>,
    val link: StepLink? = null,
    val isNew: String? = null,
)

@Serializable
data class Fault(val text: String, val pts: String)

@Serializable
data class CourseExercise(
    val id: String,
    val no: Int,
    val title: String,
    val diagram: String,
    val goal: String,
    val tips: List<String>,
    val faults: List<Fault>,
)

@Serializable
data class JourneyBundle(val steps: Map<String, List<JourneyStep>>, val course: Map<String, List<CourseExercise>>)

// ---------- Học mẹo ----------

@Serializable
data class TipGroup(
    val id: String,
    val name: String,
    val icon: String,
    val desc: String,
    val topics: List<String> = emptyList(),
    val chapters: List<Int> = emptyList(),
)

@Serializable
data class TipItem(
    val id: String,
    val group: String,
    val title: String,
    val mnemonic: String,
    val body: String,
    val signs: List<String> = emptyList(),
    val questions: List<Int> = emptyList(),
)

@Serializable
data class TipBundle(val groups: List<TipGroup>, val tips: List<TipItem>)
