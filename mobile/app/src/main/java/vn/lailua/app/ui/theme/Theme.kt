package vn.lailua.app.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.sp

/** Bảng màu "nhựa đường" giống bản web. */
object Asphalt {
    val bg = Color(0xFF0B0D12)
    val surface = Color(0xFF151923)
    val surfaceHigh = Color(0xFF1C2230)
    val line = Color(0x1AFFFFFF)
    val lane = Color(0xFFFFD23F)
    val laneDark = Color(0xFFA87800)
    val green = Color(0xFF10B981)
    val greenDark = Color(0xFF065F46)
    val red = Color(0xFFEF4444)
    val redDark = Color(0xFF7F1D1D)
    val sky = Color(0xFF38BDF8)
    val text = Color.White
    val muted = Color(0x99FFFFFF)
    val faint = Color(0x66FFFFFF)
}

private val scheme = darkColorScheme(
    primary = Asphalt.lane,
    onPrimary = Color(0xFF0F172A),
    secondary = Asphalt.green,
    onSecondary = Color.White,
    background = Asphalt.bg,
    onBackground = Asphalt.text,
    surface = Asphalt.surface,
    onSurface = Asphalt.text,
    surfaceVariant = Asphalt.surfaceHigh,
    onSurfaceVariant = Asphalt.muted,
    error = Asphalt.red,
    outline = Asphalt.line,
)

val AppTypography = Typography(
    displayLarge = TextStyle(fontWeight = FontWeight.Black, fontSize = 34.sp, lineHeight = 38.sp, fontFamily = FontFamily.SansSerif),
    headlineMedium = TextStyle(fontWeight = FontWeight.ExtraBold, fontSize = 26.sp, lineHeight = 30.sp),
    headlineSmall = TextStyle(fontWeight = FontWeight.ExtraBold, fontSize = 22.sp, lineHeight = 26.sp),
    titleLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 19.sp, lineHeight = 24.sp),
    titleMedium = TextStyle(fontWeight = FontWeight.Bold, fontSize = 16.sp, lineHeight = 22.sp),
    // Không đặt lineHeight cố định: Text đổi fontSize (chữ nhỏ) sẽ dùng khoảng cách dòng tự nhiên của font thay vì
    // 25sp thưa thớt. Không dùng đơn vị em vì TextField nội suy giữa các kiểu chữ và không trộn được em với sp.
    bodyLarge = TextStyle(fontSize = 17.sp, lineHeight = TextUnit.Unspecified),
    bodyMedium = TextStyle(fontSize = 15.sp, lineHeight = 22.sp),
    bodySmall = TextStyle(fontSize = 13.sp, lineHeight = 18.sp),
    labelLarge = TextStyle(fontWeight = FontWeight.Bold, fontSize = 15.sp),
    labelMedium = TextStyle(fontWeight = FontWeight.Bold, fontSize = 12.sp, letterSpacing = 0.8.sp),
    labelSmall = TextStyle(fontWeight = FontWeight.Bold, fontSize = 11.sp, letterSpacing = 1.sp),
)

val AppShapes = Shapes(
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(18.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(28.dp),
)

@Composable
fun LaiLuaTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = scheme, typography = AppTypography, shapes = AppShapes, content = content)
}
