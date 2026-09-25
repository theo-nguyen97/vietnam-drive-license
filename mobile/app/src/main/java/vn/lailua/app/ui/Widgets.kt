package vn.lailua.app.ui

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import vn.lailua.app.ui.theme.Asphalt

/** Thẻ nền tối có viền mảnh — khối xây dựng chính của giao diện. */
@Composable
fun Card(
    modifier: Modifier = Modifier,
    color: Color = Asphalt.surface,
    shape: Shape = RoundedCornerShape(22.dp),
    padding: PaddingValues = PaddingValues(16.dp),
    onClick: (() -> Unit)? = null,
    content: @Composable BoxScope.() -> Unit,
) {
    Box(
        modifier
            .clip(shape)
            .background(color)
            .border(1.dp, Asphalt.line, shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(padding),
        content = content,
    )
}

enum class ButtonTone { PRIMARY, SUCCESS, DANGER, GHOST }

/**
 * Nút "phím bấm" 3D giống bản web: mặt gradient, đế đậm màu; nhấn xuống thì lún xuống.
 */
@Composable
fun PressButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    tone: ButtonTone = ButtonTone.PRIMARY,
    enabled: Boolean = true,
    compact: Boolean = false,
    leading: (@Composable RowScope.() -> Unit)? = null,
) {
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val lift by animateFloatAsState(if (pressed) 0f else 1f, label = "lift")
    val (top, bottom, base, fg) = when (tone) {
        ButtonTone.PRIMARY -> listOf(Color(0xFFFFE57A), Color(0xFFF5B700), Asphalt.laneDark, Color(0xFF0F172A))
        ButtonTone.SUCCESS -> listOf(Color(0xFF34D399), Color(0xFF059669), Asphalt.greenDark, Color.White)
        ButtonTone.DANGER -> listOf(Color(0xFFF87171), Color(0xFFDC2626), Asphalt.redDark, Color.White)
        ButtonTone.GHOST -> listOf(Color(0xFF2A3140), Color(0xFF1C2230), Color(0xFF0B0D12), Color.White)
    }
    val depth = if (compact) 3.dp else 5.dp
    val shape = RoundedCornerShape(if (compact) 12.dp else 16.dp)
    Box(modifier.height(if (compact) 44.dp else 56.dp)) {
        Box(Modifier.matchParentSize().offset(y = depth).clip(shape).background(base))
        Row(
            Modifier
                .matchParentSize()
                .offset(y = depth * (1 - lift))
                .clip(shape)
                .background(Brush.verticalGradient(listOf(top, bottom)))
                .clickable(interactionSource = interaction, indication = null, enabled = enabled, onClick = onClick)
                .padding(horizontal = if (compact) 14.dp else 20.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            if (leading != null) { leading(); Spacer(Modifier.width(8.dp)) }
            Text(
                text,
                color = if (enabled) fg else fg.copy(alpha = 0.5f),
                fontWeight = FontWeight.ExtraBold,
                fontSize = if (compact) 14.sp else 17.sp,
                textAlign = TextAlign.Center,
            )
        }
    }
}

/** Tiêu đề mục kiểu "HUD": chữ in hoa, giãn cách, màu vàng. */
@Composable
fun Eyebrow(text: String, modifier: Modifier = Modifier, color: Color = Asphalt.lane) {
    Text(text.uppercase(), modifier, color = color, fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 2.sp)
}

@Composable
fun SectionTitle(text: String, modifier: Modifier = Modifier, trailing: (@Composable () -> Unit)? = null) {
    Row(modifier.fillMaxWidth().padding(top = 22.dp, bottom = 10.dp), verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.SpaceBetween) {
        Text(text, color = Asphalt.text, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        trailing?.invoke()
    }
}

/** Thanh tiến độ mảnh. */
@Composable
fun Bar(fraction: Float, modifier: Modifier = Modifier, color: Color = Asphalt.lane, height: Dp = 8.dp) {
    val f by animateFloatAsState(fraction.coerceIn(0f, 1f), label = "bar")
    Box(modifier.fillMaxWidth().height(height).clip(CircleShape).background(Color.White.copy(alpha = 0.1f))) {
        Box(Modifier.fillMaxWidth(f).height(height).clip(CircleShape).background(color))
    }
}

/** Ô màu hạng bằng (chữ A1, B…) */
@Composable
fun LicenseBadge(id: String, colorHex: String, size: Dp = 48.dp, modifier: Modifier = Modifier) {
    Box(
        modifier.size(width = size * 1.2f, height = size).clip(RoundedCornerShape(size / 4)).background(parseColor(colorHex)),
        contentAlignment = Alignment.Center,
    ) {
        Text(id, color = Color(0xFF0F172A), fontWeight = FontWeight.Black, fontSize = (size.value * 0.42f).sp)
    }
}

@Composable
fun Chip(text: String, modifier: Modifier = Modifier, color: Color = Color.White.copy(alpha = 0.1f), fg: Color = Asphalt.muted, border: Color? = null) {
    Box(
        modifier
            .clip(RoundedCornerShape(8.dp))
            .background(color)
            .then(if (border != null) Modifier.border(BorderStroke(1.dp, border), RoundedCornerShape(8.dp)) else Modifier)
            .padding(horizontal = 8.dp, vertical = 3.dp),
    ) { Text(text, color = fg, fontSize = 11.sp, fontWeight = FontWeight.Bold) }
}

/** Số liệu lớn kiểu HUD */
@Composable
fun Stat(value: String, label: String, modifier: Modifier = Modifier, color: Color = Asphalt.lane) {
    Column(modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, color = color, fontSize = 26.sp, fontWeight = FontWeight.Black)
        Text(label, color = Asphalt.faint, fontSize = 11.sp, fontWeight = FontWeight.Bold)
    }
}

fun parseColor(hex: String): Color = runCatching { Color(android.graphics.Color.parseColor(hex)) }.getOrDefault(Asphalt.lane)
