package vn.lailua.app.ui

import android.content.Context
import android.speech.tts.TextToSpeech
import androidx.compose.runtime.mutableStateOf
import java.util.Locale

/**
 * Đọc câu hỏi bằng giọng nói tiếng Việt (TextToSpeech của hệ thống).
 * Khởi tạo lười ở lần bấm đầu tiên; máy không có giọng vi-VN thì [available] = false.
 */
class Speech(private val context: Context) {
    private var tts: TextToSpeech? = null
    private var ready = false
    private var pending: String? = null

    /** false khi máy không có dữ liệu giọng tiếng Việt. */
    val available = mutableStateOf(true)
    val speaking = mutableStateOf(false)

    private fun ensure() {
        if (tts != null) return
        tts = TextToSpeech(context.applicationContext) { status ->
            val engine = tts ?: return@TextToSpeech
            if (status != TextToSpeech.SUCCESS) { available.value = false; return@TextToSpeech }
            val res = engine.setLanguage(Locale.forLanguageTag("vi-VN"))
            if (res == TextToSpeech.LANG_MISSING_DATA || res == TextToSpeech.LANG_NOT_SUPPORTED) { available.value = false; return@TextToSpeech }
            engine.setSpeechRate(0.95f)
            engine.setOnUtteranceProgressListener(object : android.speech.tts.UtteranceProgressListener() {
                override fun onStart(id: String?) { speaking.value = true }
                override fun onDone(id: String?) { speaking.value = false }
                @Deprecated("Deprecated in Java") override fun onError(id: String?) { speaking.value = false }
            })
            ready = true
            pending?.let { speakNow(it) }
            pending = null
        }
    }

    private fun speakNow(text: String) {
        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "lai-lua")
    }

    fun speak(text: String) {
        ensure()
        if (ready) speakNow(text) else pending = text
    }

    fun stop() {
        pending = null
        tts?.stop()
        speaking.value = false
    }

    companion object {
        private val LETTERS = listOf("A", "B", "C", "D", "E", "F")

        /** Văn bản đọc cho một câu hỏi: đề bài rồi từng đáp án. */
        fun questionText(text: String, options: List<String>) =
            buildString {
                append(text)
                options.forEachIndexed { i, o -> append(". Đáp án ${LETTERS[i]}: ").append(o) }
            }
    }
}
