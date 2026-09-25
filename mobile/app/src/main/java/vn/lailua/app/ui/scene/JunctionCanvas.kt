package vn.lailua.app.ui.scene

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.runtime.withFrameNanos
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.PathMeasure
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.drawText
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import vn.lailua.app.LocalApp
import vn.lailua.app.data.JunctionScene
import vn.lailua.app.data.JunctionVehicle
import kotlin.math.atan2
import kotlin.math.pow

enum class JunctionPhase { INTRO, IDLE, PLAY, DONE }

private const val SPEED = 190.0
private val PALETTE = listOf(0xFF3B82F6, 0xFFEF4444, 0xFF10B981, 0xFF8B5CF6, 0xFFF59E0B, 0xFFEC4899, 0xFF14B8A6).map { Color(it) }
private const val C = 200f

private class Geo(val v: JunctionVehicle, val path: Path, val measure: PathMeasure, val stop: Float) {
    val len = measure.length
    fun at(s: Float): Triple<Float, Float, Float> {
        val d = s.coerceIn(0f, len)
        val p = measure.getPosition(d)
        val t = measure.getTangent(if (d >= len - 0.5f) len - 0.5f else d)
        val ang = Math.toDegrees(atan2(t.y.toDouble(), t.x.toDouble())).toFloat()
        return Triple(p.x, p.y, ang)
    }
}

/**
 * Sa hình giao lộ nhìn từ trên xuống, mô phỏng thứ tự đi (chuyển từ JunctionScene.tsx).
 * Hệ toạ độ gốc 400×400 (tâm giao lộ 200,200); khung nhìn -120..520 × 20..380.
 */
@Composable
fun JunctionCanvas(spec: JunctionScene, phase: JunctionPhase, runKey: Any, onIntroDone: () -> Unit = {}, onDone: () -> Unit = {}, modifier: Modifier = Modifier) {
    val repo = LocalApp.current.repo
    val measurer = rememberTextMeasurer()
    val geo = remember(spec) {
        spec.vehicles.map { v ->
            val path = PathParser().parsePathString(v.path.d).toPath()
            Geo(v, path, PathMeasure().apply { setPath(path, false) }, v.path.stop.toFloat())
        }
    }
    val schedule = remember(spec) {
        val gaps = spec.order.map { group ->
            val minSpeed = group.minOf { id -> spec.vehicles.firstOrNull { it.id == id }?.speed ?: 1.0 }
            maxOf(1.0, 250 / (SPEED * minSpeed))
        }
        spec.order.mapIndexed { i, group -> group to (0.2 + gaps.take(i).sum()) }
    }
    val moving = remember(spec) { spec.order.flatten().toSet() }

    var pos by remember { mutableStateOf<Map<String, Float>>(emptyMap()) }
    var step by remember { mutableStateOf(-1) }
    var clock by remember { mutableStateOf(0.0) }
    val introCb by rememberUpdatedState(onIntroDone)
    val doneCb by rememberUpdatedState(onDone)

    // Vòng lặp khung hình chỉ chạy khi còn hoạt hình (vào vị trí / mô phỏng thứ tự);
    // xong là dừng để không tốn pin và để Compose có thể "idle".
    LaunchedEffect(phase, runKey, geo) {
        var fired = false
        var t0 = -1L
        var running = true
        while (running) {
            withFrameNanos { now ->
                if (t0 < 0) t0 = now
                val el = if (phase == JunctionPhase.IDLE || phase == JunctionPhase.DONE) 1e6 else (now - t0) / 1e9
                clock = el
                val next = HashMap<String, Float>()
                var st = -1
                if (phase == JunctionPhase.INTRO || phase == JunctionPhase.IDLE) {
                    var allDone = true
                    geo.forEachIndexed { i, g ->
                        val k = ((el - i * 0.12) / 1.5).coerceIn(0.0, 1.0)
                        if (k < 1) allDone = false
                        next[g.v.id] = (g.stop * (1 - (1 - k).pow(3))).toFloat()
                    }
                    if (allDone) {
                        running = false
                        if (!fired && phase == JunctionPhase.INTRO) { fired = true; introCb() }
                    }
                } else {
                    var finished = true
                    geo.forEach { g -> if (g.v.id !in moving) next[g.v.id] = g.stop }
                    schedule.forEachIndexed { gi, (ids, start) ->
                        if (el >= start) st = gi
                        for (id in ids) {
                            val g = geo.firstOrNull { it.v.id == id } ?: continue
                            val v = SPEED * g.v.speed
                            val tt = maxOf(0.0, el - start)
                            val acc = 0.45
                            val dist = if (tt < acc) v * tt * tt / (2 * acc) else v * (tt - acc / 2)
                            val s = minOf(g.len.toDouble(), g.stop + dist).toFloat()
                            next[id] = s
                            if (s < g.len - 1) finished = false
                        }
                    }
                    if (spec.stopAll && el < 1.8) finished = false
                    if (finished) {
                        running = false
                        if (!fired && phase == JunctionPhase.PLAY) { fired = true; doneCb() }
                    }
                }
                pos = next
                step = st
            }
        }
    }

    val playing = phase == JunctionPhase.PLAY || phase == JunctionPhase.DONE
    val caption = when {
        !playing -> null
        spec.stopAll -> "Tất cả các xe phải dừng lại!"
        step >= 0 -> "${step + 1}. " + (spec.steps?.getOrNull(step) ?: spec.order[step].joinToString(" + ") { id -> spec.vehicles.first { it.id == id }.label })
        else -> null
    }
    val tick = ((clock * 2.5).toInt() % 2) == 0

    Box(modifier) {
        Canvas(Modifier.fillMaxSize()) {
            val sc = maxOf(size.width / 640f, size.height / 360f)
            val ox = (size.width - 640f * sc) / 2f + 120f * sc
            val oy = (size.height - 360f * sc) / 2f - 20f * sc
            clipRect {
                withTransform({ translate(ox, oy); scale(sc, sc, Offset.Zero) }) {
                    drawBoard(spec, repo::signBitmap)
                    if (!playing) geo.forEach { g -> drawIntent(g, g.v.player) }
                    spec.police?.let { drawPoliceTop(it.facing, it.pose) }
                    geo.forEachIndexed { i, g ->
                        val s = pos[g.v.id] ?: 0f
                        if (s >= g.len - 1) return@forEachIndexed
                        val (x, y, ang) = g.at(s)
                        val violator = g.v.id in spec.violators
                        val waiting = playing && g.v.id !in moving
                        val blink = when (g.v.move) { "left", "uturn" -> "left"; "right" -> "right"; else -> null }
                        withTransform({ translate(x, y); rotate(ang, Offset.Zero) }) {
                            if (g.v.player) ring(30f, Color(0xFFFACC15), 3f, dashed = true)
                            if (playing && violator) drawCircle(Color(0x4DEF4444), 32f, Offset.Zero)
                            if ((spec.stopAll || waiting) && playing) ring(30f, Color(0xCCEF4444), 3f)
                            drawTopVehicle(g.v.kind, g.v.color?.let { c -> runCatching { Color(android.graphics.Color.parseColor(c)) }.getOrDefault(PALETTE[i % PALETTE.size]) } ?: PALETTE[i % PALETTE.size], if (s <= g.stop + 60) blink else null, tick)
                        }
                        // nhãn
                        val text = when {
                            playing && violator -> "${g.v.label} · VI PHẠM"
                            g.v.player -> "${g.v.label} · BẠN"
                            else -> g.v.label
                        }
                        val layout = measurer.measure(text, TextStyle(fontSize = (10.5f / 1f).sp, fontWeight = FontWeight.ExtraBold, color = if (g.v.player && !(playing && violator)) Color(0xFF111111) else Color.White))
                        val w = layout.size.width / sc + 14f
                        val h = 17f
                        drawRoundRect(if (playing && violator) Color(0xFFDC2626) else if (g.v.player) Color(0xFFFACC15) else Color(0xFF0F172A), Offset(x - w / 2, y - 30 - 10), Size(w, h), CornerRadius(8.5f, 8.5f), alpha = 0.92f)
                        withTransform({ scale(1 / sc, 1 / sc, Offset(x, y - 30 - 10 + h / 2)) }) {
                            drawText(layout, topLeft = Offset(x - layout.size.width / 2f, y - 30 - 10 + h / 2 - layout.size.height / 2f))
                        }
                    }
                    spec.police?.let { drawPoseCard(it.pose, measurer, sc) }
                }
            }
        }
        if (caption != null) {
            Box(Modifier.align(Alignment.BottomCenter).padding(8.dp).clip(RoundedCornerShape(50)).background(Color(0xD90F172A)).padding(horizontal = 14.dp, vertical = 6.dp)) {
                Text(caption, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            }
        }
    }
}

private fun DrawScope.drawIntent(g: Geo, player: Boolean) {
    if (g.len <= 0f) return
    val seg = minOf(g.len - g.stop - 5f, 230f)
    if (seg <= 30f) return
    val color = if (player) Color(0xFFFACC15) else Color.White
    val sub = Path()
    g.measure.getSegment(g.stop + 26f, g.stop + seg - 4f, sub, true)
    drawPath(sub, color, alpha = 0.9f, style = Stroke(3f, cap = StrokeCap.Butt))
    val (x, y, ang) = g.at(g.stop + seg)
    withTransform({ translate(x, y); rotate(ang, Offset.Zero) }) { arrowHead(color) }
}

/* ---------------- Mặt bằng giao lộ ---------------- */

private val ROAD = Color(0xFF3F4450)
private val WALK = Color(0xFFD6D3D1)
private val GRASS = Color(0xFF5F9139)
private val YEL = Color(0xFFFACC15)

private val ROT = mapOf("S" to 0, "W" to 1, "N" to 2, "E" to 3)

/** Quay một điểm quanh tâm giao lộ theo hướng tiếp cận (giống approachPoint của web). */
private fun approach(x: Float, y: Float, from: String): Offset {
    var px = x; var py = y
    repeat(ROT[from] ?: 0) { val nx = C - (py - C); val ny = C + (px - C); px = nx; py = ny }
    return Offset(px, py)
}

private fun DrawScope.rect(color: Color, x: Float, y: Float, w: Float, h: Float, r: Float = 0f, alpha: Float = 1f) =
    drawRoundRect(color, Offset(x, y), Size(w, h), CornerRadius(r, r), alpha = alpha)

private fun DrawScope.drawBoard(spec: JunctionScene, sign: (String) -> android.graphics.Bitmap?) {
    val layout = spec.layout
    val hasN = layout != "tee"
    rect(GRASS, -140f, 0f, 680f, 400f)
    drawDecor(layout)
    if (layout == "road") {
        rect(WALK, -140f, 128f, 680f, 144f)
        rect(ROAD, -140f, 140f, 680f, 120f)
        drawLine(Color.White, Offset(-140f, 143f), Offset(540f, 143f), strokeWidth = 2f)
        drawLine(Color.White, Offset(-140f, 257f), Offset(540f, 257f), strokeWidth = 2f)
        if (spec.centerLine == "solid") {
            drawLine(YEL, Offset(-140f, 197.5f), Offset(540f, 197.5f), strokeWidth = 2.5f)
            drawLine(YEL, Offset(-140f, 202.5f), Offset(540f, 202.5f), strokeWidth = 2.5f)
        } else drawLine(YEL, Offset(-140f, 200f), Offset(540f, 200f), strokeWidth = 3f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(18f, 14f)))
    } else {
        rect(WALK, -140f, 128f, 680f, 144f)
        rect(WALK, 128f, if (hasN) -20f else 128f, 144f, if (hasN) 440f else 292f)
        rect(ROAD, -140f, 140f, 680f, 120f)
        rect(ROAD, 140f, if (hasN) -20f else 140f, 120f, if (hasN) 440f else 280f)
        if (layout == "roundabout") {
            drawCircle(WALK, 132f, Offset(200f, 200f))
            drawCircle(ROAD, 122f, Offset(200f, 200f))
            rect(ROAD, -140f, 140f, 680f, 120f)
            rect(ROAD, 140f, -20f, 120f, 440f)
            drawCircle(ROAD, 122f, Offset(200f, 200f))
            drawCircle(Color(0xFFE7E5E4), 52f, Offset(200f, 200f))
            drawCircle(Color(0xFF4D7C0F), 46f, Offset(200f, 200f))
            drawCircle(Color(0xFF166534), 16f, Offset(200f, 200f))
            drawCircle(Color(0xFF15803D), 10f, Offset(188f, 190f))
            drawCircle(Color(0xFF15803D), 11f, Offset(212f, 210f))
            drawCircle(Color(0x22FFFFFF), 88f, Offset(200f, 200f), style = Stroke(2f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 12f))))
        }
        // tim đường
        val inner = if (layout == "roundabout") 136f else 128f
        val dash = PathEffect.dashPathEffect(floatArrayOf(16f, 12f))
        if (layout != "tee") drawLine(YEL, Offset(200f, -20f), Offset(200f, 200 - inner), strokeWidth = 3f, pathEffect = dash)
        drawLine(YEL, Offset(200f, 200 + inner), Offset(200f, 420f), strokeWidth = 3f, pathEffect = dash)
        drawLine(YEL, Offset(-140f, 200f), Offset(200 - inner, 200f), strokeWidth = 3f, pathEffect = dash)
        drawLine(YEL, Offset(200 + inner, 200f), Offset(540f, 200f), strokeWidth = 3f, pathEffect = dash)
        val dirs = if (layout == "tee") listOf("S", "E", "W") else listOf("S", "E", "W", "N")
        if (layout != "roundabout") {
            for (d in dirs) {
                var x = 144f
                while (x < 258f) {
                    val a = approach(x, 264f, d); val b = approach(x + 7, 282f, d)
                    rect(Color(0xFFF8FAFC), minOf(a.x, b.x), minOf(a.y, b.y), kotlin.math.abs(b.x - a.x), kotlin.math.abs(b.y - a.y), alpha = 0.9f)
                    x += 13f
                }
            }
        }
        // vạch dừng / nhường đường
        val y = if (layout == "roundabout") 330f else 288f
        for (d in dirs) {
            val yieldLine = layout == "roundabout" || (spec.main == "NS" && (d == "E" || d == "W")) || (spec.main == "EW" && (d == "N" || d == "S"))
            val a = approach(202f, y, d); val b = approach(258f, y, d)
            drawLine(Color.White, a, b, strokeWidth = if (yieldLine) 3f else 4f, pathEffect = if (yieldLine) PathEffect.dashPathEffect(floatArrayOf(7f, 5f)) else null)
        }
        if (spec.main == "EW") rect(Color(0xFFFDE68A), -70f, 152f, 118f, 16f, 4f, alpha = 0.85f)
        if (spec.main == "NS") rect(Color(0xFFFDE68A), 144f, -10f, 16f, 118f, 4f, alpha = 0.85f)
    }
    spec.lights?.let { lights ->
        for (d in listOf("S", "N", "E", "W")) {
            if (!hasN && d == "N") continue
            val c = if (d == "N" || d == "S") lights["NS"] else lights["EW"]
            if (c == null) continue
            val p = approach(280f, 292f, d)
            drawLightBox(p.x, p.y, c)
        }
    }
    for (s in spec.signs) {
        val p = approach(296f, 336f, s.at)
        drawCircle(Color(0x55000000), 3f, Offset(p.x, p.y + 17))
        sign(s.code)?.let { bmp ->
            drawImage(bmp.asImageBitmap(), srcOffset = IntOffset.Zero, srcSize = IntSize(bmp.width, bmp.height), dstOffset = IntOffset((p.x - 17).toInt(), (p.y - 17).toInt()), dstSize = IntSize(34, 34))
        }
    }
}

private fun DrawScope.drawLightBox(x: Float, y: Float, color: String) {
    rect(Color(0xFF0F172A), x - 7, y - 23, 14f, 36f, 4f)
    drawRoundRect(Color(0xFF475569), Offset(x - 7, y - 23), Size(14f, 36f), CornerRadius(4f, 4f), style = Stroke(1f))
    listOf("red" to Color(0xFFEF4444), "yellow" to Color(0xFFF59E0B), "green" to Color(0xFF22C55E)).forEachIndexed { i, (c, fill) ->
        val cy = y - 16 + i * 11
        if (color == c) drawCircle(fill, 9f, Offset(x, cy), alpha = 0.35f)
        drawCircle(if (color == c) fill else Color(0xFF1F2937), 4.2f, Offset(x, cy))
    }
}

private fun DrawScope.drawDecor(layout: String) {
    val houses = if (layout == "road") listOf(
        floatArrayOf(-100f, 40f, 70f, 60f) to 0xFFF97316, floatArrayOf(60f, 44f, 90f, 56f) to 0xFFE11D48, floatArrayOf(260f, 36f, 70f, 64f) to 0xFF0EA5E9,
        floatArrayOf(380f, 290f, 90f, 60f) to 0xFFA855F7, floatArrayOf(-60f, 300f, 80f, 56f) to 0xFF22C55E, floatArrayOf(150f, 296f, 70f, 60f) to 0xFFEAB308,
    ) else listOf(
        floatArrayOf(-100f, 40f, 70f, 60f) to 0xFFF97316, floatArrayOf(20f, 60f, 80f, 50f) to 0xFFE11D48, floatArrayOf(300f, 40f, 80f, 64f) to 0xFF0EA5E9,
        floatArrayOf(410f, 58f, 70f, 50f) to 0xFFA855F7, floatArrayOf(-90f, 292f, 80f, 60f) to 0xFF22C55E, floatArrayOf(30f, 300f, 72f, 52f) to 0xFFEAB308,
        floatArrayOf(310f, 296f, 76f, 56f) to 0xFF14B8A6, floatArrayOf(420f, 290f, 70f, 64f) to 0xFF64748B,
    )
    for ((h, c) in houses) {
        rect(Color(0x33000000), h[0] + 3, h[1] + 3, h[2], h[3], 4f)
        rect(Color(c), h[0], h[1], h[2], h[3], 4f)
        drawLine(Color(0x22000000), Offset(h[0], h[1] + h[3] / 2), Offset(h[0] + h[2], h[1] + h[3] / 2), strokeWidth = 2f)
    }
    val trees = listOf(-110f to 118f, 110f to 110f, 300f to 116f, 500f to 112f, -20f to 285f, 120f to 290f, 290f to 286f, 505f to 290f, 470f to 20f, -20f to 20f)
    for ((x, y) in trees) {
        drawCircle(Color(0x33000000), 10f, Offset(x + 2, y + 2))
        drawCircle(Color(0xFF166534), 10f, Offset(x, y))
        drawCircle(Color(0xFF22C55E), 5f, Offset(x - 3, y - 3), alpha = 0.6f)
    }
}

private val FACE_ANGLE = mapOf("E" to 0f, "S" to 90f, "W" to 180f, "N" to -90f)

private fun DrawScope.drawPoliceTop(facing: String, pose: String) {
    withTransform({ translate(200f, 200f); rotate(FACE_ANGLE[facing] ?: 0f, Offset.Zero) }) {
        drawCircle(Color(0x33000000), 22f, Offset(2f, 2f))
        drawCircle(Color(0xFFE2E8F0), 22f, Offset.Zero)
        drawCircle(Color(0xFF64748B), 22f, Offset.Zero, style = Stroke(2f))
        drawCircle(Color(0xFF94A3B8), 16f, Offset.Zero, style = Stroke(1f, pathEffect = PathEffect.dashPathEffect(floatArrayOf(3f, 3f))))
        if (pose == "side") drawLine(Color(0xFFEAB308), Offset(0f, -26f), Offset(0f, 26f), strokeWidth = 5f, cap = StrokeCap.Round)
        if (pose == "forward") drawLine(Color(0xFFEAB308), Offset(0f, 8f), Offset(24f, 8f), strokeWidth = 5f, cap = StrokeCap.Round)
        drawOval(Color(0xFFEAB308), Offset(-6f, -11f), Size(12f, 22f))
        drawCircle(Color(0xFFF8FAFC), 5.5f, Offset.Zero)
        drawCircle(Color(0xFF94A3B8), 5.5f, Offset.Zero, style = Stroke(1f))
        if (pose == "up") drawCircle(Color(0xFFF1C27D), 3.5f, Offset(0f, 10f))
        val nose = Path().apply { moveTo(9f, 0f); lineTo(4f, -3f); lineTo(4f, 3f); close() }
        drawPath(nose, Color(0xFF1E293B))
    }
}

private val POSE_TEXT = mapOf("up" to "Tay giơ thẳng đứng", "side" to "Dang ngang tay", "forward" to "Tay phải giơ về trước")

private fun DrawScope.drawPoseCard(pose: String, measurer: androidx.compose.ui.text.TextMeasurer, sc: Float) {
    translate(402f, 28f) {
        rect(Color(0xE60F172A), 0f, 0f, 112f, 128f, 12f)
        drawRoundRect(Color(0x33FFFFFF), Offset.Zero, Size(112f, 128f), CornerRadius(12f, 12f), style = Stroke(1f))
        withTransform({ translate(56f, 124f); scale(0.36f, 0.36f, Offset.Zero) }) {
            rect(Color(0xFF1E3A8A), -20f, -80f, 16f, 80f)
            rect(Color(0xFF1E3A8A), 4f, -80f, 16f, 80f)
            rect(Color(0xFFEAB308), -28f, -150f, 56f, 76f, 12f)
            val arm = Color(0xFFEAB308)
            when (pose) {
                "up" -> {
                    drawLine(arm, Offset(22f, -140f), Offset(30f, -230f), strokeWidth = 16f, cap = StrokeCap.Round)
                    drawLine(arm, Offset(-22f, -140f), Offset(-30f, -80f), strokeWidth = 16f, cap = StrokeCap.Round)
                }
                "side" -> drawLine(arm, Offset(-110f, -138f), Offset(110f, -138f), strokeWidth = 16f, cap = StrokeCap.Round)
                else -> {
                    drawLine(arm, Offset(-22f, -138f), Offset(-40f, -90f), strokeWidth = 16f, cap = StrokeCap.Round)
                    drawLine(arm, Offset(22f, -138f), Offset(60f, -128f), strokeWidth = 16f, cap = StrokeCap.Round)
                    drawCircle(Color(0xFFF1C27D), 12f, Offset(70f, -126f))
                }
            }
            drawCircle(Color(0xFFF1C27D), 20f, Offset(0f, -170f))
            rect(Color.White, -18f, -204f, 36f, 18f, 6f)
            drawOval(Color.White, Offset(-28f, -194f), Size(56f, 16f))
        }
        val t1 = measurer.measure("CSGT", TextStyle(fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFFFACC15)))
        val t2 = measurer.measure(POSE_TEXT[pose] ?: "", TextStyle(fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Color.White))
        withTransform({ scale(1 / sc, 1 / sc, Offset(56f, 0f)) }) {
            drawText(t1, topLeft = Offset(56f - t1.size.width / 2f, 6f))
            drawText(t2, topLeft = Offset(56f - t2.size.width / 2f, 6f + t1.size.height))
        }
    }
}
