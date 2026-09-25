package vn.lailua.app.ui.scene

import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke

/*
 * Xe nhìn từ trên xuống (chuyển từ sprites.tsx / TopVehicle): mũi xe hướng +x, tâm tại gốc.
 */

private val GLASS = Color(0xFF1F2A3A)
private val SHADOW = Color(0x66000000)

val TOP_LENGTH = mapOf("car" to 40f, "truck" to 56f, "bus" to 64f, "moto" to 26f, "bike" to 22f, "ambulance" to 46f, "fire" to 58f, "police" to 42f)

private fun DrawScope.rr(color: Color, x: Float, y: Float, w: Float, h: Float, r: Float = 0f) =
    drawRoundRect(color, Offset(x, y), Size(w, h), CornerRadius(r, r))

private fun DrawScope.lightBar(x: Float, on: Boolean) {
    rr(Color(0xFF0F172A), x - 3, -7f, 6f, 14f, 2f)
    rr(if (on) Color(0xFFEF4444) else Color(0x55EF4444), x - 2.5f, -6.5f, 5f, 6f, 1.5f)
    rr(if (!on) Color(0xFF3B82F6) else Color(0x553B82F6), x - 2.5f, 0.5f, 5f, 6f, 1.5f)
}

private fun DrawScope.blinker(side: String, len: Float, w: Float, on: Boolean) {
    if (!on) return
    val y = if (side == "left") -w / 2 else w / 2
    drawCircle(Color(0xFFFBBF24), 2.6f, Offset(len / 2 - 2, y))
    drawCircle(Color(0xFFFBBF24), 2.6f, Offset(-len / 2 + 2, y))
}

/**
 * @param blink hướng xi-nhan ("left"/"right"/null)
 * @param tick pha nhấp nháy (đổi mỗi ~0,4 s) cho đèn ưu tiên & xi-nhan
 */
fun DrawScope.drawTopVehicle(kind: String, color: Color, blink: String?, tick: Boolean) {
    when (kind) {
        "car", "police" -> {
            val body = if (kind == "police") Color(0xFFF8FAFC) else color
            rr(SHADOW, -19f, -9f, 42f, 22f, 7f)
            rr(body, -21f, -11f, 42f, 22f, 7f)
            rr(GLASS, 3f, -9f, 8f, 18f, 2f)
            rr(GLASS, -15f, -8.5f, 5f, 17f, 2f)
            rr(body.copy(alpha = 0.85f), -10f, -8f, 13f, 16f, 2f)
            if (kind == "police") {
                rr(Color(0xE61D4ED8), -21f, -3f, 42f, 6f)
                lightBar(-3f, tick)
            }
            drawCircle(Color(0xFFFEF9C3), 1.8f, Offset(19f, -7f))
            drawCircle(Color(0xFFFEF9C3), 1.8f, Offset(19f, 7f))
            if (blink != null) blinker(blink, 42f, 22f, tick)
        }
        "truck" -> {
            rr(SHADOW, -26f, -10f, 56f, 24f, 3f)
            rr(color, -28f, -12f, 42f, 24f, 2f)
            for (y in listOf(-8f, 0f, 8f)) drawLine(Color(0x22000000), Offset(-24f, y), Offset(10f, y))
            rr(Color(0xFFF97316), 15f, -11f, 13f, 22f, 4f)
            rr(GLASS, 22f, -9f, 5f, 18f, 1.5f)
            if (blink != null) blinker(blink, 56f, 24f, tick)
        }
        "bus" -> {
            rr(SHADOW, -30f, -10f, 64f, 24f, 5f)
            rr(color, -32f, -12f, 64f, 24f, 5f)
            rr(GLASS, 25f, -10f, 5f, 20f, 2f)
            rr(Color(0x59FFFFFF), -27f, -8f, 48f, 16f, 3f)
            rr(Color(0x8064748B), -20f, -5f, 8f, 10f, 1.5f)
            rr(Color(0x8064748B), 0f, -5f, 8f, 10f, 1.5f)
            if (blink != null) blinker(blink, 64f, 24f, tick)
        }
        "ambulance" -> {
            rr(SHADOW, -21f, -9f, 46f, 22f, 5f)
            rr(Color.White, -23f, -11f, 46f, 22f, 5f)
            rr(GLASS, 10f, -9f, 7f, 18f, 2f)
            rr(Color(0xFFEF4444), -23f, -11f, 46f, 4f)
            rr(Color(0xFFEF4444), -23f, 7f, 46f, 4f)
            drawLine(Color(0xFFEF4444), Offset(-10f, -6f), Offset(-10f, 6f), strokeWidth = 4f)
            drawLine(Color(0xFFEF4444), Offset(-16f, 0f), Offset(-4f, 0f), strokeWidth = 4f)
            lightBar(4f, tick)
            if (blink != null) blinker(blink, 46f, 22f, tick)
        }
        "fire" -> {
            rr(SHADOW, -27f, -10f, 58f, 24f, 4f)
            rr(Color(0xFFDC2626), -29f, -12f, 58f, 24f, 4f)
            rr(GLASS, 20f, -10f, 6f, 20f, 2f)
            drawLine(Color(0xFFE5E7EB), Offset(-25f, -4f), Offset(12f, -4f), strokeWidth = 1.6f)
            drawLine(Color(0xFFE5E7EB), Offset(-25f, 4f), Offset(12f, 4f), strokeWidth = 1.6f)
            lightBar(14f, tick)
            if (blink != null) blinker(blink, 58f, 24f, tick)
        }
        "moto" -> {
            rr(SHADOW, -11f, -3f, 26f, 8f, 4f)
            rr(Color(0xFF111111), -13f, -3f, 8f, 6f, 3f)
            rr(Color(0xFF111111), 6f, -3f, 8f, 6f, 3f)
            rr(color, -8f, -4f, 18f, 8f, 4f)
            drawCircle(Color(0xFFFACC15), 4f, Offset(-1f, 0f))
            drawLine(Color(0xFF1F2937), Offset(7f, -6f), Offset(7f, 6f), strokeWidth = 2f)
            if (blink != null) blinker(blink, 26f, 10f, tick)
        }
        else -> { // bike
            rr(Color(0xFF111111), -11f, -2f, 7f, 4f, 2f)
            rr(Color(0xFF111111), 4f, -2f, 7f, 4f, 2f)
            drawLine(color, Offset(-8f, 0f), Offset(8f, 0f), strokeWidth = 3f)
            drawCircle(Color(0xFF2563EB), 3.5f, Offset(-1f, 0f))
            drawLine(Color(0xFF1F2937), Offset(6f, -5f), Offset(6f, 5f), strokeWidth = 1.5f)
        }
    }
}

/** Mũi tên ý định (tam giác) */
fun DrawScope.arrowHead(color: Color) {
    val p = Path().apply { moveTo(0f, 0f); lineTo(-12f, -7f); lineTo(-12f, 7f); close() }
    drawPath(p, color)
}

fun DrawScope.ring(radius: Float, color: Color, width: Float, dashed: Boolean = false) {
    drawCircle(
        color, radius, Offset.Zero,
        style = Stroke(width, pathEffect = if (dashed) androidx.compose.ui.graphics.PathEffect.dashPathEffect(floatArrayOf(6f, 5f)) else null),
    )
}
