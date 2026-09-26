package vn.lailua.app

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import vn.lailua.app.data.NewsBlock
import vn.lailua.app.data.Repo
import vn.lailua.app.logic.SetBuilder
import java.io.File

/** Dữ liệu đọc thêm (tin tức, lộ trình, mẹo) phải đọc được đầy đủ từ assets. */
class ContentTest {
    private val repo = Repo.fromJson(read = { name -> File("src/main/assets/data/$name").readText() })
    private val sets = SetBuilder(repo)

    @Test
    fun newsParsesAllBlockTypes() {
        assertTrue(repo.news.items.size >= 8)
        assertEquals("de-thi-2027", repo.news.items.first().slug) // bài ghim đứng đầu
        val kinds = repo.news.items.flatMap { it.body }.map { it::class }.toSet()
        assertTrue(NewsBlock.Exam2027::class in kinds)
        assertTrue(NewsBlock.Table::class in kinds)
        assertTrue(NewsBlock.Timeline::class in kinds)
    }

    @Test
    fun journeyHasCarAndMoto() {
        assertTrue(repo.journey.steps.getValue("car").isNotEmpty())
        assertTrue(repo.journey.steps.getValue("moto").isNotEmpty())
        assertTrue(repo.journey.course.getValue("car").size >= 10)
    }

    @Test
    fun tipsAndTipSets() {
        assertTrue(repo.tips.tips.size >= 40)
        val groups = repo.tips.tips.map { it.group }.toSet()
        assertTrue(repo.tips.groups.all { it.id in groups })
        assertTrue(sets.build("B", "co-meo", emptyMap(), emptyList()).isNotEmpty())
        assertTrue(sets.build("B", "mo-phong", emptyMap(), emptyList()).isNotEmpty())
        assertTrue(sets.build("B", "meo-sa-hinh", emptyMap(), emptyList()).isNotEmpty())
        // Học mẹo xe máy không có câu chương 4
        assertTrue(sets.build("A1", "meo-cau-tao", emptyMap(), emptyList()).none { it.chapter == 4 })
    }
}
