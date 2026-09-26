package vn.lailua.app.data

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonClassDiscriminator

/*
 * Mô hình dữ liệu dùng chung với bản web (xuất bởi scripts/export-mobile-data.tsx).
 * Tên trường giữ nguyên như JSON để hai bên luôn khớp.
 */

@Serializable
data class ExamConfig(val total: Int, val minutes: Int, val pass: Int)

@Serializable
data class License(
    val id: String,
    val bank: Int,
    val name: String,
    val short: String,
    val desc: String,
    /** "moto" hoặc "car" */
    val group: String,
    val family: String,
    val vehicle: String,
    val exam: ExamConfig,
    val exam2027: ExamConfig,
    val minAge: Int,
    val validity: String,
    val color: String,
) {
    val isMoto get() = group == "moto"
    fun config(version: ExamVersion) = if (version == ExamVersion.TT108) exam2027 else exam
}

enum class ExamVersion(val key: String, val title: String, val law: String) {
    TT12("tt12", "Đề hiện hành", "TT12/2025"),
    TT108("tt108", "Đề từ 01/3/2027", "TT108/2026");

    companion object {
        fun of(key: String?) = entries.firstOrNull { it.key == key }
    }
}

@Serializable
data class Chapter(val id: Int, val name: String, val short: String, val icon: String, val groups: List<String>)

@Serializable
data class SignInfo(val code: String, val name: String, val group: String, val meaning: String)

@Serializable
data class SignGroup(val id: String, val name: String, val desc: String)

@Serializable
data class SignBundle(val groups: List<SignGroup>, val signs: List<SignInfo>)

@Serializable
data class Topic(val id: String, val code: String, val name: String, val icon: String, val hint: String, val groups: List<String>? = null)

@Serializable
data class VehiclePath(val d: String, val stop: Double)

@Serializable
data class JunctionVehicle(
    val id: String,
    /** car, truck, bus, moto, bike, ambulance, fire, police */
    val kind: String,
    val from: String,
    val move: String,
    val label: String = "",
    val player: Boolean = false,
    val inside: Boolean = false,
    val queue: Int = 0,
    val color: String? = null,
    val speed: Double = 1.0,
    val path: VehiclePath,
)

@Serializable
data class PoliceSpec(val pose: String, val facing: String)

@Serializable
data class SignAt(val at: String, val code: String)

@OptIn(ExperimentalSerializationApi::class)
@Serializable
@JsonClassDiscriminator("kind")
sealed class Scene

@Serializable
@SerialName("junction")
data class JunctionScene(
    val layout: String,
    val vehicles: List<JunctionVehicle>,
    val order: List<List<String>>,
    val violators: List<String> = emptyList(),
    val lights: Map<String, String>? = null,
    val police: PoliceSpec? = null,
    val signs: List<SignAt> = emptyList(),
    val main: String? = null,
    val stopAll: Boolean = false,
    val steps: List<String>? = null,
    val centerLine: String? = null,
) : Scene()

@Serializable
@SerialName("road")
data class RoadScene(val props: List<String> = emptyList()) : Scene()

/** Hậu quả giả lập khi chọn một đáp án (cùng chỉ số với options; đáp án đúng là null). */
@Serializable
data class Consequence(val kind: String, val text: String)

@Serializable
data class Question(
    val id: Int,
    val chapter: Int,
    val text: String,
    val options: List<String>,
    /** Chỉ số (0-based) của đáp án đúng. */
    val answer: Int,
    val explanation: String,
    val critical: Boolean = false,
    val only: String? = null,
    val signs: List<String> = emptyList(),
    val scene: Scene? = null,
    val tip: String? = null,
    val topic: String = "khai-niem",
    val consequences: List<Consequence?>? = null,
)
