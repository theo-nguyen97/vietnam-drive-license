package vn.lailua.app.ui.scene

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.withTransform

/*
 * Xe của người chơi nhìn từ phía sau (chuyển từ sprites.tsx / RearVehicle).
 * Hệ toạ độ gốc: x ∈ [-130, 130], y ∈ [-205, 10]; gốc (0,0) ở mặt đường dưới đuôi xe.
 */

@Composable
fun VehicleIcon(kind: String, modifier: Modifier = Modifier, braking: Boolean = false) {
    Canvas(modifier) {
        val s = minOf(size.width / 260f, size.height / 215f)
        withTransform({
            translate(size.width / 2f, size.height - (size.height - 215f * s) / 2f - 10f * s)
            scale(s, s, Offset.Zero)
        }) { drawRearVehicle(kind, braking) }
    }
}

private fun DrawScope.rr(color: Color, x: Float, y: Float, w: Float, h: Float, r: Float = 0f) =
    drawRoundRect(color, Offset(x, y), Size(w, h), CornerRadius(r, r))

private fun DrawScope.tail(x: Float, y: Float, on: Boolean, w: Float, h: Float) {
    rr(if (on) Color(0xFFFF3B3B) else Color(0xFF7F1D1D), x, y, w, h, 3f)
    if (on) rr(Color(0x66FF3B3B), x - 4, y - 4, w + 8, h + 8, 6f)
}

private fun DrawScope.plate(y: Float, w: Float) {
    rr(Color(0xFFF8FAFC), -w / 2, y, w, 14f, 2f)
    rr(Color(0xFF1E3A8A), -w / 2 + 3, y + 3, w - 6, 8f, 1f)
}

fun DrawScope.drawRearVehicle(kind: String, braking: Boolean = false) {
    when (kind) {
        "scooter", "bigbike", "trike" -> {
            val big = kind == "bigbike"
            drawOval(Color(0x55000000), Offset(if (kind == "trike") -70f else -44f, -13f), Size(if (kind == "trike") 140f else 88f, 18f))
            if (kind == "trike") {
                rr(Color(0xFF111111), -66f, -40f, 20f, 38f, 8f)
                rr(Color(0xFF111111), 46f, -40f, 20f, 38f, 8f)
                rr(Color(0xFF0F766E), -56f, -70f, 112f, 32f, 8f)
            }
            rr(Color(0xFF111111), -11f, -44f, 22f, 42f, 9f)
            val hw = if (big) 34f else 30f
            val top = if (big) 92f else 84f
            val lw = if (big) 30f else 26f
            val body = Path().apply {
                moveTo(-hw, -58f); quadraticTo(0f, -top, hw, -58f); lineTo(lw, -40f); lineTo(-lw, -40f); close()
            }
            drawPath(body, if (big) Color(0xFFDC2626) else Color(0xFFE5E7EB))
            tail(-12f, -60f, braking, 24f, 8f)
            plate(-46f, 34f)
            drawLine(Color(0xFF1F2937), Offset(-58f, -118f), Offset(58f, -118f), strokeWidth = 6f, cap = StrokeCap.Round)
            drawCircle(Color(0xFF94A3B8), 5f, Offset(-60f, -118f))
            drawCircle(Color(0xFF94A3B8), 5f, Offset(60f, -118f))
            rider(-150f, if (big) Color(0xFF111827) else Color(0xFF2563EB), if (big) Color(0xFFF97316) else Color(0xFFFACC15))
        }
        "car" -> {
            drawOval(Color(0x66000000), Offset(-112f, -15f), Size(224f, 24f))
            rr(Color(0xFF111111), -100f, -34f, 30f, 32f, 8f)
            rr(Color(0xFF111111), 70f, -34f, 30f, 32f, 8f)
            val body = Path().apply {
                moveTo(-104f, -30f); lineTo(-104f, -78f); quadraticTo(-100f, -92f, -86f, -96f); lineTo(86f, -96f)
                quadraticTo(100f, -92f, 104f, -78f); lineTo(104f, -30f); quadraticTo(104f, -22f, 96f, -22f); lineTo(-96f, -22f)
                quadraticTo(-104f, -22f, -104f, -30f); close()
            }
            drawPath(body, Color(0xFFDC2626))
            val roof = Path().apply {
                moveTo(-78f, -96f); lineTo(-62f, -140f); quadraticTo(-58f, -148f, -48f, -148f); lineTo(48f, -148f)
                quadraticTo(58f, -148f, 62f, -140f); lineTo(78f, -96f); close()
            }
            drawPath(roof, Color(0xFFB91C1C))
            val glass = Path().apply {
                moveTo(-66f, -100f); lineTo(-54f, -134f); quadraticTo(-51f, -140f, -44f, -140f); lineTo(44f, -140f)
                quadraticTo(51f, -140f, 54f, -134f); lineTo(66f, -100f); close()
            }
            drawPath(glass, Color(0xFF1E293B))
            tail(-98f, -82f, braking, 34f, 14f)
            tail(64f, -82f, braking, 34f, 14f)
            rr(Color(0x22000000), -104f, -44f, 208f, 8f)
            plate(-66f, 56f)
        }
        "pickup", "truck", "trailer" -> {
            val w = if (kind == "pickup") 104f else 122f
            val h = if (kind == "pickup") 150f else if (kind == "trailer") 190f else 176f
            val box = when (kind) { "trailer" -> Color(0xFF2563EB); "truck" -> Color(0xFFF97316); else -> Color(0xFF64748B) }
            drawOval(Color(0x66000000), Offset(-w - 12, -15f), Size((w + 12) * 2, 24f))
            rr(Color(0xFF111111), -w + 6, -36f, 30f, 34f, 6f)
            rr(Color(0xFF111111), w - 36, -36f, 30f, 34f, 6f)
            rr(box, -w, -h, w * 2, h - 26, 6f)
            drawLine(Color(0x33000000), Offset(0f, -h + 8), Offset(0f, -34f), strokeWidth = 3f)
            drawLine(Color(0x22000000), Offset(-w + 20, -h + 14), Offset(-w + 20, -34f), strokeWidth = 4f)
            drawLine(Color(0x22000000), Offset(w - 20, -h + 14), Offset(w - 20, -34f), strokeWidth = 4f)
            rr(Color(0xFF1F2937), -w, -34f, w * 2, 10f)
            tail(-w + 4, -52f, braking, 26f, 12f)
            tail(w - 30, -52f, braking, 26f, 12f)
            plate(-56f, 56f)
        }
        else -> { // van, bus
            val van = kind == "van"
            val w = if (van) 100f else 124f
            val h = if (van) 158f else 190f
            drawOval(Color(0x66000000), Offset(-w - 12, -15f), Size((w + 12) * 2, 24f))
            rr(Color(0xFF111111), -w + 6, -34f, 28f, 32f, 6f)
            rr(Color(0xFF111111), w - 34, -34f, 28f, 32f, 6f)
            rr(if (van) Color(0xFFF8FAFC) else Color(0xFFFACC15), -w, -h, w * 2, h - 24, 16f)
            rr(Color(0xFF1E293B), -w + 14, -h + 14, w * 2 - 28, h * 0.38f, 8f)
            tail(-w + 6, -68f, braking, 24f, 22f)
            tail(w - 30, -68f, braking, 24f, 22f)
            plate(-58f, 56f)
            rr(Color(0xFF1F2937), -w, -36f, w * 2, 10f, 4f)
        }
    }
}

private fun DrawScope.rider(y: Float, shirt: Color, helmet: Color) {
    rr(shirt, -22f, y + 20, 44f, 44f, 14f)
    drawCircle(helmet, 17f, Offset(0f, y + 4))
    rr(Color(0xFF1E293B), -14f, y + 2, 28f, 8f, 3f)
    drawLine(shirt, Offset(-20f, y + 34), Offset(-50f, y + 26), strokeWidth = 11f, cap = StrokeCap.Round)
    drawLine(shirt, Offset(20f, y + 34), Offset(50f, y + 26), strokeWidth = 11f, cap = StrokeCap.Round)
}
