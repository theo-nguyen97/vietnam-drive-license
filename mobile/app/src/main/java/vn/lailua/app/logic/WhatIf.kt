package vn.lailua.app.logic

import vn.lailua.app.data.Consequence
import vn.lailua.app.data.JunctionScene
import vn.lailua.app.data.JunctionVehicle
import vn.lailua.app.data.Question
import java.text.Normalizer

/**
 * Mô phỏng "nếu làm vậy thì sao" — chuyển từ src/lib/whatif.ts: từ đáp án người học chọn, suy ra
 * kịch bản chạy sa hình (xe nào đi trước, xe nào bị cắt ngang, xe nào vượt đèn đỏ…) để
 * JunctionCanvas diễn lại hậu quả thay vì chỉ chiếu cách đi đúng.
 */
object WhatIf {
    data class Conflict(val offender: String, val victim: String, val reason: String)

    data class Plan(
        val correct: Boolean,
        val order: List<List<String>>,
        val steps: List<String>,
        val conflict: Conflict? = null,
        val violators: List<String>,
        val verdict: Consequence,
    )

    /** Bỏ dấu tiếng Việt + chữ thường để so khớp nhãn xe trong đáp án. */
    fun fold(s: String): String =
        Normalizer.normalize(s, Normalizer.Form.NFD).replace(Regex("[\\u0300-\\u036f]"), "").replace('đ', 'd').replace('Đ', 'D').lowercase()

    private fun lowerFirst(s: String) = if (s.isEmpty()) s else s[0].lowercaseChar() + s.substring(1)

    private data class Hit(val id: String, val at: Int, val text: String)

    /** Vị trí xuất hiện của từng xe trong đoạn văn (theo nhãn), tránh nhãn lồng nhau ("Xe con" trong "Xe con A"). */
    private fun findVehicles(text: String, vehicles: List<JunctionVehicle>): List<Hit> {
        val hay = fold(text)
        val labels = vehicles.map { it.id to fold(it.label) }.sortedByDescending { it.second.length }
        val taken = ArrayList<IntRange>()
        val hits = ArrayList<Hit>()
        for ((id, key) in labels) {
            if (key.isEmpty()) continue
            var from = 0
            while (from < hay.length) {
                val i = hay.indexOf(key, from)
                if (i < 0) break
                val overlaps = taken.any { i < it.last + 1 && i + key.length > it.first }
                if (!overlaps) {
                    taken += i until i + key.length
                    hits += Hit(id, i, hay)
                    break
                }
                from = i + 1
            }
        }
        return hits.sortedBy { it.at }
    }

    data class Parsed(val groups: List<List<String>>, val movesAll: Boolean, val stopsAll: Boolean)

    /** Phân tích một đáp án thành các nhóm xe đi lần lượt; xe trong phần "…; xe X dừng lại" không đi. */
    fun parseOption(option: String, spec: JunctionScene): Parsed? {
        val parts = option.split(";")
        val main = parts.first()
        val stopPart = parts.drop(1).joinToString(";")
        val stopped = findVehicles(stopPart, spec.vehicles).map { it.id }.toSet()
        val f = fold(main)
        val stopsAll = Regex("tat ca (cac )?xe (deu )?(phai )?dung").containsMatchIn(f) || Regex("khong xe nao (duoc )?di").containsMatchIn(f)
        val movesAll = Regex("(hai|ba|bon|cac|tat ca) xe (deu |cung |duoc )?(di |chay )?(cung luc|cung di|duoc di|di cung)").containsMatchIn(f) ||
            Regex("^ca (hai|ba|bon|cac) xe\\.?$").containsMatchIn(f.trim())
        if (stopsAll) return Parsed(emptyList(), movesAll = false, stopsAll = true)
        if (movesAll) return Parsed(listOf(spec.vehicles.filter { it.id !in stopped }.map { it.id }), movesAll = true, stopsAll = false)
        if (Regex("dung lai|phai dung").containsMatchIn(f) && !Regex("duoc di|di truoc|di sau").containsMatchIn(f)) {
            val named = findVehicles(main, spec.vehicles).map { it.id }.toSet()
            if (named.isEmpty()) return null
            val movers = spec.vehicles.filter { it.id !in named && it.id !in stopped }.map { it.id }
            return Parsed(if (movers.isNotEmpty()) listOf(movers) else emptyList(), movesAll = false, stopsAll = false)
        }
        val hits = findVehicles(main, spec.vehicles).filter { it.id !in stopped }
        if (hits.isEmpty()) return null
        val groups = ArrayList<MutableList<String>>()
        hits.forEachIndexed { i, h ->
            if (i == 0) { groups += mutableListOf(h.id); return@forEachIndexed }
            val between = h.text.substring(hits[i - 1].at, h.at)
            val together = Regex("\\b(va|cung|dong thoi)\\b").containsMatchIn(between) && !Regex(",|;| sau | truoc | tiep | roi ").containsMatchIn(between)
            if (together) groups.last() += h.id else groups += mutableListOf(h.id)
        }
        return Parsed(groups, movesAll = false, stopsAll = false)
    }

    private fun axis(dir: String) = if (dir == "N" || dir == "S") "NS" else "EW"

    private fun stopReason(v: JunctionVehicle, spec: JunctionScene): String? {
        if (spec.stopAll) return "phải dừng theo hiệu lệnh tay giơ thẳng đứng"
        spec.lights?.let { lights ->
            when (lights[axis(v.from)]) {
                "red" -> return "đang gặp đèn đỏ"
                "yellow" -> return "gặp đèn vàng (phải dừng trước vạch)"
            }
        }
        if (spec.police != null) return "bị người điều khiển giao thông ra hiệu lệnh dừng"
        return null
    }

    private fun nameOf(spec: JunctionScene, id: String) = spec.vehicles.first { it.id == id }.label

    private val DASH_PREFIX = Regex("^[^—–-]*[—–-]\\s*")
    private val VIOLATION_SUFFIX = Regex("\\s*[—–-]?\\s*vi phạm!?$", RegexOption.IGNORE_CASE)

    private fun stepFor(spec: JunctionScene, id: String): String {
        val gi = spec.order.indexOfFirst { id in it }
        val s = if (gi >= 0) spec.steps?.getOrNull(gi) else null
        return s?.replace(DASH_PREFIX, "")?.replace(VIOLATION_SUFFIX, "") ?: ""
    }

    private fun violationOf(spec: JunctionScene, id: String): String {
        val name = fold(nameOf(spec, id))
        val s = spec.steps?.firstOrNull { fold(it).contains(name) } ?: ""
        return s.replace(VIOLATION_SUFFIX, "").trim()
    }

    private fun correctPlan(spec: JunctionScene, text: String? = null): Plan {
        val viol = spec.violators
        val fallback = when {
            viol.isNotEmpty() -> "Nhận diện đúng: ${viol.joinToString("; ") { violationOf(spec, it).ifBlank { nameOf(spec, it) } }.lowercase()} — đó là hành vi vi phạm."
            spec.stopAll -> "Tất cả các xe dừng lại theo hiệu lệnh — an toàn."
            else -> "Các xe đi đúng thứ tự — qua giao lộ an toàn, không xung đột."
        }
        return Plan(
            correct = true,
            order = spec.order,
            steps = spec.order.mapIndexed { i, g -> spec.steps?.getOrNull(i) ?: g.joinToString(" + ") { nameOf(spec, it) } },
            violators = viol,
            verdict = Consequence("ok", text ?: fallback),
        )
    }

    private fun sameGroups(a: List<List<String>>, b: List<List<String>>) =
        a.size == b.size && a.indices.all { i -> a[i].size == b[i].size && a[i].all { it in b[i] } }

    /** Kịch bản khi chọn đáp án [choice] cho câu sa hình [q]; null nếu câu không có sa hình giao lộ. */
    fun plan(q: Question, choice: Int): Plan? {
        val spec = q.scene as? JunctionScene ?: return null
        val explicit = q.consequences?.getOrNull(choice)
        if (choice == q.answer) return correctPlan(spec, explicit?.text)

        val qText = fold(q.text)
        val chosenText = q.options.getOrNull(choice) ?: ""
        val correctText = q.options.getOrNull(q.answer) ?: ""

        // Câu "xe nào vi phạm": diễn đúng tình huống, kết luận chỉ ra xe vi phạm thật.
        if (qText.contains("vi pham") || (spec.violators.isNotEmpty() && !qText.contains("thu tu"))) {
            val real = spec.violators.map { nameOf(spec, it) }
            val picked = findVehicles(chosenText, spec.vehicles).map { nameOf(spec, it.id) }
            val why = spec.violators.map { violationOf(spec, it) }.filter { it.isNotBlank() }.joinToString("; ")
            val text = explicit?.text ?: if (real.isNotEmpty()) {
                (if (picked.isNotEmpty()) "Bạn chọn \"${chosenText.removeSuffix(".")}\" — chưa đúng. " else "") +
                    "Xe vi phạm là ${real.joinToString(" và ").lowercase()}${if (why.isNotBlank()) ": ${why.lowercase()}" else ""}."
            } else "Không xe nào vi phạm trong tình huống này — đáp án đúng là \"${correctText.removeSuffix(".")}\"."
            return correctPlan(spec).copy(correct = false, verdict = Consequence(explicit?.kind ?: "ticket", text))
        }

        val parsed = parseOption(chosenText, spec)
            ?: return correctPlan(spec).copy(correct = false, verdict = explicit ?: Consequence("danger", "Cách hiểu này chưa đúng. Đáp án đúng: $correctText"))

        if (sameGroups(parsed.groups, spec.order)) return correctPlan(spec, explicit?.text)

        val shouldMove = spec.order.flatten().toSet()
        val done = HashSet<String>()
        val order = ArrayList<List<String>>()
        val steps = ArrayList<String>()

        for (g in parsed.groups) {
            val group = g.filter { it !in done }
            if (group.isEmpty()) continue
            val nextCorrect = spec.order.map { gr -> gr.filter { it !in done } }.firstOrNull { it.isNotEmpty() } ?: emptyList()
            val legal = group.all { it in nextCorrect }
            if (legal) {
                order += group
                steps += if (group.size == nextCorrect.size) {
                    spec.steps?.getOrNull(spec.order.indexOfFirst { gr -> gr.any { it in group } }) ?: group.joinToString(" + ") { nameOf(spec, it) }
                } else group.joinToString(" + ") { nameOf(spec, it) }
                done += group
                continue
            }
            // Có xe đi sai lượt
            val offender = group.first { it !in nextCorrect }
            val offV = spec.vehicles.first { it.id == offender }
            val mustStop = if (offender !in shouldMove) stopReason(offV, spec) else null
            val victim = nextCorrect.firstOrNull()
            val reason = victim?.let { stepFor(spec, it) } ?: ""
            val oName = nameOf(spec, offender)
            val vName = victim?.let { nameOf(spec, it) } ?: ""
            val (kind, text) = if (victim != null) {
                "crash" to (if (mustStop != null)
                    "$oName $mustStop nhưng vẫn đi, cắt ngang ${lowerFirst(vName)} đang được đi${if (reason.isNotBlank()) " (${lowerFirst(reason)})" else ""} — va chạm ngay giữa giao lộ."
                else "$oName đi trước ${lowerFirst(vName)} trong khi ${lowerFirst(vName)} đang có quyền đi trước${if (reason.isNotBlank()) " (${lowerFirst(reason)})" else ""} — va chạm ngay giữa giao lộ.")
            } else {
                "ticket" to (if (mustStop != null) "$oName $mustStop nhưng vẫn đi — vi phạm hiệu lệnh, tín hiệu giao thông." else "$oName đi không đúng thứ tự — vi phạm quy tắc nhường đường.")
            }
            order += if (victim != null) listOf(offender, victim) else listOf(offender)
            steps += if (victim != null) "$oName và ${lowerFirst(vName)} cùng lao vào giao lộ" else "$oName đi sai lượt"
            return Plan(
                correct = false, order = order, steps = steps,
                conflict = victim?.let { Conflict(offender, it, reason) },
                violators = group.filter { it !in nextCorrect },
                verdict = explicit ?: Consequence(kind, text),
            )
        }

        val missing = spec.order.flatten().filter { it !in done }.map { nameOf(spec, it) }
        return Plan(
            correct = false, order = order, steps = steps, violators = emptyList(),
            verdict = explicit ?: Consequence(
                "ok",
                if (missing.isNotEmpty()) "Không gây va chạm, nhưng ${missing.joinToString(", ").lowercase()} không cần dừng lại — đáp án đúng: $correctText"
                else "Thứ tự này chưa đúng — đáp án đúng: $correctText",
            ),
        )
    }
}
