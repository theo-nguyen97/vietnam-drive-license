package vn.lailua.app.ui.scene

import androidx.compose.foundation.Canvas
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.sp
import vn.lailua.app.LocalApp
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

enum class RoadPhase { INTRO, IDLE, PASS, FAIL }

/*
 * Tình huống trên đường nhìn từ sau xe (giản lược từ DriveScene.tsx):
 * xe người chơi chạy tới "trạm kiểm tra" rồi dừng; đúng thì đi tiếp, sai thì rung + viền đỏ.
 * Hệ toạ độ 640×360; đường vẽ theo phối cảnh với độ sâu z (0..70).
 */
@Composable
fun RoadCanvas(props: List<String>, vehicle: String, phase: RoadPhase, runKey: Any, seed: Int, modifier: Modifier = Modifier) {
    val repo = LocalApp.current.repo
    val measurer = rememberTextMeasurer()
    var d by remember { mutableStateOf(0.0) }
    var t by remember { mutableStateOf(0.0) }
    var shake by remember { mutableStateOf(0.0) }
    var dFrom by remember { mutableStateOf(0.0) }

    // Chỉ chạy vòng lặp khung hình trong lúc có chuyển động; hết hoạt hình thì dừng.
    LaunchedEffect(phase, runKey) {
        var t0 = -1L
        dFrom = d
        val duration = when (phase) { RoadPhase.INTRO -> 2.2; RoadPhase.IDLE -> 0.0; RoadPhase.PASS -> 2.4; RoadPhase.FAIL -> 0.9 }
        var running = true
        while (running) {
            withFrameNanos { now ->
                if (t0 < 0) t0 = now
                val el = (now - t0) / 1e9
                t += 1 / 60.0
                when (phase) {
                    RoadPhase.INTRO -> { d = STOP * easeOut(min(1.0, el / 2.2)); shake = 0.0 }
                    RoadPhase.IDLE -> d = STOP
                    RoadPhase.PASS -> d = STOP + (GATE + 30 - STOP) * min(1.0, el / 2.4)
                    RoadPhase.FAIL -> { d = dFrom + 0.45 * easeOut(min(1.0, el / 0.3)); shake = if (el < 0.9) 1 - el / 0.9 else 0.0 }
                }
                if (el >= duration) running = false
            }
        }
    }

    val has = { p: String -> p in props }
    val night = has("night"); val rain = has("rain"); val fog = has("fog"); val highway = has("highway")
    val light = props.firstOrNull { it.startsWith("light-") }?.removePrefix("light-")
    val police = props.firstOrNull { it.startsWith("police-") }?.removePrefix("police-")
    val sunset = !night && !rain && !fog && seed % 5 == 3

    Canvas(modifier) {
        val sc = max(size.width / VW, size.height / VH)
        val ox = (size.width - VW * sc) / 2f
        val oy = (size.height - VH * sc) / 2f
        clipRect {
            withTransform({ translate(ox + (if (shake > 0) (sin(t * 70) * 6 * shake).toFloat() * sc else 0f), oy); scale(sc, sc, Offset.Zero) }) {
                val skyTop = if (night) Color(0xFF050816) else if (rain || fog) Color(0xFF64748B) else if (sunset) Color(0xFFF97316) else Color(0xFF38BDF8)
                val skyBot = if (night) Color(0xFF1E1B4B) else if (rain || fog) Color(0xFFCBD5E1) else if (sunset) Color(0xFFFDE68A) else Color(0xFFE0F2FE)
                drawRect(Brush.verticalGradient(listOf(skyTop, skyBot), endY = HZ), Offset(-20f, -20f), Size(VW + 40, HZ + 22))
                if (night) for (i in 0 until 40) { val x = ((seed * 31 + i * 97) % 640).toFloat(); val y = ((seed * 13 + i * 53) % (HZ.toInt() - 20)).toFloat(); drawCircle(Color.White, if (i % 5 == 0) 1.6f else 1f, Offset(x, y), alpha = 0.8f) }
                if (!night && !rain && !fog) drawCircle(if (sunset) Color(0xFFFB923C) else Color(0xFFFDE047), if (sunset) 30f else 22f, Offset(if (sunset) 520f else 120f, if (sunset) HZ - 16 else 46f))
                // Cảnh xa: dãy nhà/đồi
                val far = if (night) Color(0xFF0F172A) else Color(0xFF334155)
                for (i in 0 until 12) {
                    val bx = (i * 62 - ((d * 3) % 62)).toFloat()
                    val bh = 18f + ((seed + i) * 37 % 40)
                    drawRect(far, Offset(bx, HZ - bh), Size(40f, bh), alpha = 0.55f)
                }
                // Mặt đất
                drawRect(if (night) Color(0xFF14532D) else if (rain || fog) Color(0xFF4D7C0F) else Color(0xFF65A30D), Offset(-20f, HZ), Size(VW + 40, VH - HZ + 20))
                // Đường
                val roadL = if (highway) -4.7f else -2.3f
                val roadR = if (highway) 4.5f else 2.3f
                val road = Path().apply {
                    moveTo(px(roadL, Z_FAR), py(Z_FAR)); lineTo(px(roadR, Z_FAR), py(Z_FAR)); lineTo(px(roadR, Z_NEAR), py(Z_NEAR)); lineTo(px(roadL, Z_NEAR), py(Z_NEAR)); close()
                }
                drawPath(road, if (night) Color(0xFF1F2937) else Color(0xFF3F4450))
                // Vạch kẻ
                val lanes = if (highway) listOf(-1.6f, 1.4f) else listOf(0f)
                for (lx in lanes) {
                    var z = Z_NEAR + ((-d) % 4.0).toFloat()
                    while (z < Z_FAR) {
                        val z2 = min(Z_FAR, z + 2f)
                        if (z2 > Z_NEAR) {
                            val a = max(Z_NEAR, z)
                            val p = Path().apply { moveTo(px(lx - 0.06f, a), py(a)); lineTo(px(lx + 0.06f, a), py(a)); lineTo(px(lx + 0.06f, z2), py(z2)); lineTo(px(lx - 0.06f, z2), py(z2)); close() }
                            drawPath(p, Color(0xFFFACC15), alpha = 0.9f)
                        }
                        z += 4f
                    }
                }
                drawLine(Color.White, Offset(px(roadL + 0.08f, Z_FAR), py(Z_FAR)), Offset(px(roadL + 0.08f, Z_NEAR), py(Z_NEAR)), strokeWidth = 2f)
                drawLine(Color.White, Offset(px(roadR - 0.08f, Z_FAR), py(Z_FAR)), Offset(px(roadR - 0.08f, Z_NEAR), py(Z_NEAR)), strokeWidth = 2f)
                // Cây / cột ven đường
                var k = 0
                while (k < 11) {
                    val z = (k * 6.5 - (d % 6.5) + 1.2).toFloat()
                    if (z > Z_NEAR + 0.3f) {
                        tree(roadR + 1.3f, z, night)
                        tree(roadL - 1.3f, z + 3.25f, night)
                    }
                    k++
                }
                // Trạm kiểm tra tại z = GATE - d
                val zg = (GATE - d).toFloat()
                if (zg > Z_NEAR) {
                    val s = 1f / zg
                    val gx = px(0f, zg); val gy = py(zg)
                    if (has("crosswalk")) {
                        var lx = roadL + 0.2f
                        while (lx < roadR - 0.2f) {
                            val p = Path().apply { moveTo(px(lx, zg + 0.9f), py(zg + 0.9f)); lineTo(px(lx + 0.3f, zg + 0.9f), py(zg + 0.9f)); lineTo(px(lx + 0.3f, zg), py(zg)); lineTo(px(lx, zg), py(zg)); close() }
                            drawPath(p, Color.White, alpha = 0.9f)
                            lx += 0.6f
                        }
                    }
                    if (has("rail")) {
                        for (dz in listOf(0.2f, 0.6f)) drawLine(Color(0xFF9CA3AF), Offset(px(roadL - 2, zg + dz), py(zg + dz)), Offset(px(roadR + 2, zg + dz), py(zg + dz)), strokeWidth = 40f * s)
                        // rào chắn
                        val bx = px(roadR + 0.3f, zg); val by = py(zg)
                        drawLine(Color(0xFFDC2626), Offset(bx, by), Offset(bx - 260f * s, by - 6f * s), strokeWidth = 12f * s)
                        drawLine(Color.White, Offset(bx - 60f * s, by - 1.4f * s), Offset(bx - 120f * s, by - 2.8f * s), strokeWidth = 12f * s)
                        drawLine(Color.White, Offset(bx - 180f * s, by - 4.2f * s), Offset(bx - 240f * s, by - 5.5f * s), strokeWidth = 12f * s)
                    }
                    if (light != null) {
                        val lx = px(roadR + 0.5f, zg); val ly = py(zg)
                        drawLine(Color(0xFF334155), Offset(lx, ly), Offset(lx, ly - 220f * s), strokeWidth = 8f * s)
                        drawRoundRect(Color(0xFF0F172A), Offset(lx - 22f * s, ly - 330f * s), Size(44f * s, 118f * s), CornerRadius(8f * s, 8f * s))
                        listOf("red" to Color(0xFFEF4444), "yellow" to Color(0xFFF59E0B), "green" to Color(0xFF22C55E)).forEachIndexed { i, (c, col) ->
                            val cy = ly - 310f * s + i * 38f * s
                            if (light == c) drawCircle(col, 24f * s, Offset(lx, cy), alpha = 0.35f)
                            drawCircle(if (light == c) col else Color(0xFF1F2937), 14f * s, Offset(lx, cy))
                        }
                    }
                    if (police != null) policeFigure(gx, gy, s, police)
                    if (has("school")) signPost(px(roadR + 0.6f, zg), py(zg), s, repo.signBitmap("W.225"))
                    if (has("garage")) signPost(px(roadR + 0.6f, zg), py(zg), s, repo.signBitmap("I.408"))
                    if (has("ambulance") || has("fire")) {
                        // xe ưu tiên phía sau (gương) — hiển thị xe chạy tới trước mặt để dễ nhận biết
                        val vx = px(-1.2f, zg + 0.5f); val vy = py(zg + 0.5f); val vs = 1f / (zg + 0.5f)
                        drawRoundRect(if (has("fire")) Color(0xFFDC2626) else Color.White, Offset(vx - 120f * vs, vy - 170f * vs), Size(240f * vs, 170f * vs), CornerRadius(20f * vs, 20f * vs))
                        drawRoundRect(if (((t * 3).toInt() % 2) == 0) Color(0xFFEF4444) else Color(0xFF3B82F6), Offset(vx - 60f * vs, vy - 190f * vs), Size(120f * vs, 22f * vs), CornerRadius(6f * vs, 6f * vs))
                    }
                    if (has("accident")) {
                        val vx = px(0.9f, zg + 0.4f); val vy = py(zg + 0.4f); val vs = 1f / (zg + 0.4f)
                        drawRoundRect(Color(0xFF64748B), Offset(vx - 120f * vs, vy - 150f * vs), Size(240f * vs, 150f * vs), CornerRadius(20f * vs, 20f * vs))
                        val tri = Path().apply { moveTo(px(-0.9f, zg), py(zg) - 60f * s); lineTo(px(-0.9f, zg) - 40f * s, py(zg)); lineTo(px(-0.9f, zg) + 40f * s, py(zg)); close() }
                        drawPath(tri, Color(0xFFEF4444)); drawPath(tri, Color(0xFFFCD34D), style = Stroke(8f * s))
                    }
                    // Barie trạm kiểm tra
                    if (phase != RoadPhase.PASS) {
                        val bx = px(roadL - 0.1f, zg); val by = py(zg)
                        drawLine(Color(0xFF1F2937), Offset(bx, by), Offset(bx, by - 120f * s), strokeWidth = 10f * s)
                        val len = (px(roadR, zg) - bx)
                        drawLine(Color(0xFFDC2626), Offset(bx, by - 110f * s), Offset(bx + len, by - 110f * s), strokeWidth = 14f * s)
                        var i = 0
                        while (i < 6) { drawLine(Color.White, Offset(bx + len * (i + 0.5f) / 6, by - 110f * s), Offset(bx + len * (i + 1f) / 6, by - 110f * s), strokeWidth = 14f * s); i += 1 }
                    }
                }
                // Xe người chơi
                withTransform({ translate(VW / 2, VH + 4f); scale(0.62f, 0.62f, Offset.Zero) }) {
                    drawRearVehicle(vehicle, braking = phase == RoadPhase.FAIL || phase == RoadPhase.IDLE)
                }
                if (night) drawRect(Brush.verticalGradient(listOf(Color(0x00FEF08A), Color(0x55FEF08A)), startY = HZ, endY = VH), Offset(VW / 2 - 120, HZ), Size(240f, VH - HZ), alpha = 0.6f)
                if (rain) for (i in 0 until 60) { val x = ((i * 53 + (t * 400).toInt()) % 660 - 10).toFloat(); val y = ((i * 97 + (t * 900).toInt()) % 380 - 10).toFloat(); drawLine(Color(0x99E0F2FE), Offset(x, y), Offset(x - 3, y + 14), strokeWidth = 1.5f) }
                if (fog) drawRect(Brush.verticalGradient(listOf(Color(0xD9F1F5F9), Color(0x26F1F5F9)), startY = HZ - 60, endY = VH), Offset(-20f, -20f), Size(VW + 40, VH + 40))
                if (phase == RoadPhase.FAIL) drawRect(Brush.radialGradient(listOf(Color(0x00EF4444), Color(0xA6EF4444)), center = Offset(VW / 2, VH / 2), radius = VW * 0.7f), Offset.Zero, Size(VW, VH))
                if (phase == RoadPhase.IDLE || phase == RoadPhase.INTRO) {
                    val txt = measurer.measure("TRẠM KIỂM TRA", TextStyle(fontSize = 10.sp, fontWeight = FontWeight.Black, color = Color(0xFFFACC15), letterSpacing = 2.sp))
                    withTransform({ scale(1 / sc, 1 / sc, Offset(VW / 2, 14f)) }) { drawText(txt, topLeft = Offset(VW / 2 - txt.size.width / 2f, 14f - txt.size.height / 2f)) }
                }
            }
        }
    }
}

private const val VW = 640f
private const val VH = 360f
private const val HZ = 150f
private const val STOP = 26.0
private const val GATE = 32.0
private const val Z_FAR = 70f
private const val Z_NEAR = 0.6f
private const val F = 60f

private fun easeOut(k: Double) = 1 - Math.pow(1 - k, 3.0)

/** Phối cảnh: x theo đơn vị làn, z độ sâu → toạ độ màn hình. */
private fun px(x: Float, z: Float) = VW / 2 + x * F * 4f / z
private fun py(z: Float) = HZ + F * 1.75f / z

private fun DrawScope.tree(x: Float, z: Float, night: Boolean) {
    if (z < Z_NEAR + 0.2f || z > Z_FAR) return
    val s = 1f / z
    val cx = px(x, z); val cy = py(z)
    drawRect(Color(0xFF78350F), Offset(cx - 6f * s, cy - 60f * s), Size(12f * s, 60f * s))
    drawCircle(if (night) Color(0xFF14532D) else Color(0xFF16A34A), 34f * s, Offset(cx, cy - 78f * s))
}

private fun DrawScope.signPost(x: Float, y: Float, s: Float, bmp: android.graphics.Bitmap?) {
    drawLine(Color(0xFF475569), Offset(x, y), Offset(x, y - 160f * s), strokeWidth = 6f * s)
    val sz = (90f * s).toInt().coerceAtLeast(1)
    bmp?.let { drawImage(it.asImageBitmap(), srcOffset = IntOffset.Zero, srcSize = IntSize(it.width, it.height), dstOffset = IntOffset((x - sz / 2).toInt(), (y - 160f * s - sz).toInt()), dstSize = IntSize(sz, sz)) }
}

private fun DrawScope.policeFigure(x: Float, y: Float, s: Float, pose: String) {
    val arm = Color(0xFFEAB308)
    drawRect(Color(0xFF1E3A8A), Offset(x - 20f * s, y - 80f * s), Size(16f * s, 80f * s))
    drawRect(Color(0xFF1E3A8A), Offset(x + 4f * s, y - 80f * s), Size(16f * s, 80f * s))
    drawRoundRect(arm, Offset(x - 28f * s, y - 150f * s), Size(56f * s, 76f * s), CornerRadius(12f * s, 12f * s))
    val w = 16f * s
    when (pose) {
        "up" -> { drawLine(arm, Offset(x + 22f * s, y - 140f * s), Offset(x + 30f * s, y - 230f * s), strokeWidth = w); drawLine(arm, Offset(x - 22f * s, y - 140f * s), Offset(x - 30f * s, y - 80f * s), strokeWidth = w) }
        "side" -> drawLine(arm, Offset(x - 110f * s, y - 138f * s), Offset(x + 110f * s, y - 138f * s), strokeWidth = w)
        else -> { drawLine(arm, Offset(x - 22f * s, y - 138f * s), Offset(x - 40f * s, y - 90f * s), strokeWidth = w); drawLine(arm, Offset(x + 22f * s, y - 138f * s), Offset(x + 60f * s, y - 128f * s), strokeWidth = w) }
    }
    drawCircle(Color(0xFFF1C27D), 20f * s, Offset(x, y - 170f * s))
    drawRoundRect(Color.White, Offset(x - 18f * s, y - 204f * s), Size(36f * s, 18f * s), CornerRadius(6f * s, 6f * s))
    drawOval(Color.White, Offset(x - 28f * s, y - 194f * s), Size(56f * s, 16f * s))
}
