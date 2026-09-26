package vn.lailua.app

import org.junit.Assert.assertEquals
import org.junit.Test
import vn.lailua.app.data.Repo
import vn.lailua.app.logic.WhatIf
import java.io.File

/**
 * Kịch bản "nếu chọn đáp án này" phải giống hệt bản web với mọi câu sa hình và mọi đáp án.
 * whatif-ref.tsv sinh từ src/lib/whatif.ts (id, đáp án, đúng?, thứ tự, xung đột, loại, kết luận) — sinh lại ở thư mục gốc:
 *
 *   npx tsx -e 'import {QUESTIONS} from "@/data/questions"; import {whatIf} from "@/lib/whatif";
 *     for (const q of QUESTIONS) if (q.scene?.kind === "junction") q.options.forEach((_, c) => { const p = whatIf(q, c)!;
 *     console.log([q.id, c, p.correct ? 1 : 0, JSON.stringify(p.order), p.conflict ? p.conflict.offender + ">" + p.conflict.victim : "-",
 *     p.verdict.kind, p.verdict.text].join("\t")) })' > mobile/app/src/test/resources/whatif-ref.tsv
 */
class WhatIfParityTest {
    private val repo = Repo.fromJson(read = { name -> File("src/main/assets/data/$name").readText() })

    private fun orderJson(order: List<List<String>>) = order.joinToString(",", "[", "]") { g -> g.joinToString(",", "[", "]") { "\"$it\"" } }

    @Test
    fun matchesWebForEveryJunctionOption() {
        val lines = javaClass.classLoader!!.getResource("whatif-ref.tsv")!!.readText().trim().lines()
        var checked = 0
        for (line in lines) {
            val (id, choice, correct, order, conflict, kind, text) = line.split("\t").let { Seven(it[0], it[1], it[2], it[3], it[4], it[5], it[6]) }
            val q = repo.question(id.toInt())!!
            val p = WhatIf.plan(q, choice.toInt())!!
            val where = "câu $id, đáp án $choice"
            assertEquals(where, correct == "1", p.correct)
            assertEquals(where, order, orderJson(p.order))
            assertEquals(where, conflict, p.conflict?.let { "${it.offender}>${it.victim}" } ?: "-")
            assertEquals(where, kind, p.verdict.kind)
            assertEquals(where, text, p.verdict.text)
            checked++
        }
        assertEquals(lines.size, checked)
    }

    private data class Seven(val a: String, val b: String, val c: String, val d: String, val e: String, val f: String, val g: String)
}
