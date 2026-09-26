package vn.lailua.app

import org.junit.Assert.assertEquals
import org.junit.Test
import vn.lailua.app.data.Emoji

class EmojiTest {
    @Test
    fun replacesOnlyWhatTheDeviceLacks() {
        assertEquals("🔎 Luyện điểm yếu", Emoji.compat("🩺 Luyện điểm yếu", sdk = 26))
        assertEquals("🩺 Luyện điểm yếu", Emoji.compat("🩺 Luyện điểm yếu", sdk = 29))
        assertEquals("🗻", Emoji.compat("🪨", sdk = 29))
        assertEquals("🪨", Emoji.compat("🪨", sdk = 30))
        // Emoji 14 luôn được thay
        assertEquals("🆔 🚘", Emoji.compat("🪪 🛞", sdk = 34))
        assertEquals("Không đổi 🚦", Emoji.compat("Không đổi 🚦", sdk = 26))
    }
}
