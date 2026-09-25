package vn.lailua.app.logic

/**
 * Bộ sinh số giả ngẫu nhiên mulberry32 — cùng thuật toán và cùng kết quả với bản web
 * (src/lib/random.ts) để "Đề số N" trên app và trên web là một.
 */
class Rng(seed: Long) {
    private var a: Int = (seed and 0xFFFFFFFFL).toInt()

    fun next(): Double {
        a += 0x6d2b79f5
        var t = a
        t = (t xor (t ushr 15)) * (t or 1)
        t = t xor (t + (t xor (t ushr 7)) * (t or 61))
        return ((t xor (t ushr 14)).toLong() and 0xFFFFFFFFL).toDouble() / 4294967296.0
    }
}

fun <T> List<T>.shuffled(rng: Rng): List<T> {
    val a = toMutableList()
    for (i in a.size - 1 downTo 1) {
        val j = kotlin.math.floor(rng.next() * (i + 1)).toInt()
        val tmp = a[i]; a[i] = a[j]; a[j] = tmp
    }
    return a
}

/** Giống `hash()` của web, kể cả việc JS nhân số thực 64-bit rồi mới ép về 32-bit. */
fun jsHash(n: Long): Long {
    val x = n.toDouble() * 2654435761.0
    val u = toUint32(x)
    val r = u.toInt() xor (u ushr 16).toInt()
    return r.toLong() and 0xFFFFFFFFL
}

private fun toUint32(d: Double): Long {
    val m = kotlin.math.abs(d) % 4294967296.0
    val v = kotlin.math.floor(m).toLong()
    return if (d < 0) (4294967296L - v) and 0xFFFFFFFFL else v
}

/** `key.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 1_000_000_007, 7)` */
fun jsStringSeed(key: String): Long {
    var a = 7L
    for (c in key) a = (a * 31 + c.code) % 1_000_000_007L
    return a
}
