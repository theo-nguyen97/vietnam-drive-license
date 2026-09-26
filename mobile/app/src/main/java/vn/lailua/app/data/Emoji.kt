package vn.lailua.app.data

import android.os.Build

/**
 * Emoji mới (Unicode 11–14) hiện thành ô vuông trên Android đời cũ. Thay bằng emoji cũ có ý
 * nghĩa gần nhất tuỳ theo phiên bản Android của máy (minSdk 26 = Android 8, chỉ có Emoji 5).
 */
object Emoji {
    /** emoji → (API tối thiểu có sẵn emoji đó, emoji thay thế) */
    private val REPLACE = mapOf(
        "🧭" to (28 to "🗺️"),  // Emoji 11 — Android 9
        "🩺" to (29 to "🔎"),  // Emoji 12 — Android 10
        "🟡" to (29 to "🔶"),
        "🟢" to (29 to "✅"),
        "🪨" to (30 to "🗻"),  // Emoji 13 — Android 11
        // Emoji 14 (Android 13) thiếu trong font của nhiều máy tuỳ biến → luôn thay
        "🛞" to (Int.MAX_VALUE to "🚘"),
        "🪪" to (Int.MAX_VALUE to "🆔"),
    )

    fun compat(s: String, sdk: Int = Build.VERSION.SDK_INT): String {
        var out = s
        for ((e, rule) in REPLACE) if (sdk < rule.first && out.contains(e)) out = out.replace(e, rule.second)
        return out
    }
}
