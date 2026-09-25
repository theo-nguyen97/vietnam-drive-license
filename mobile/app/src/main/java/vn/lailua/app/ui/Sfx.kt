package vn.lailua.app.ui

import android.content.Context
import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

/** Âm báo + rung ngắn khi trả lời — dùng ToneGenerator nên không cần tệp âm thanh. */
class Sfx(context: Context) {
    @Volatile var enabled = true

    private val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= 31) {
        (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager)?.defaultVibrator
    } else {
        @Suppress("DEPRECATION")
        context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
    }

    private val tone: ToneGenerator? = runCatching { ToneGenerator(AudioManager.STREAM_MUSIC, 60) }.getOrNull()

    fun correct() {
        if (!enabled) return
        tone?.startTone(ToneGenerator.TONE_PROP_ACK, 120)
        vibrate(20)
    }

    fun wrong() {
        if (!enabled) return
        tone?.startTone(ToneGenerator.TONE_PROP_NACK, 200)
        vibrate(60)
    }

    fun tap() {
        if (!enabled) return
        vibrate(8)
    }

    private fun vibrate(ms: Long) {
        runCatching { vibrator?.vibrate(VibrationEffect.createOneShot(ms, VibrationEffect.DEFAULT_AMPLITUDE)) }
    }
}
