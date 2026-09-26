import SwiftUI
import LaiLuaCore

/// Tab Tin tức: bài ghim lớn ở đầu, lọc theo chuyên mục.
struct NewsListView: View {
    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var nav: Nav
    @Environment(\.openURL) private var openURL
    @State private var cat: String?

    var body: some View {
        let news = app.repo.news
        let items = news.items.filter { cat == nil || $0.category == cat }
        ScrollView {
            VStack(alignment: .leading, spacing: 10) {
                VStack(alignment: .leading, spacing: 0) {
                    Eyebrow("Cập nhật")
                    Text("Tin tức luật giao thông").afont(24, .black).foregroundColor(.white)
                    Text("Thay đổi về đề thi, luật và mức phạt — tóm tắt ngắn cho người học lái.").afont(13).foregroundColor(Asphalt.muted)
                        .padding(.top, 4).fixedSize(horizontal: false, vertical: true)
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            FilterChip(text: "Tất cả", active: cat == nil) { cat = nil }
                            ForEach(news.categories, id: \.self) { c in FilterChip(text: c, active: cat == c) { cat = c } }
                        }
                    }
                    .padding(.top, 12)
                }
                ForEach(items) { n in
                    NewsCard(n: n, big: n.slug == items.first?.slug) { nav.push(.article(n.slug)) }
                }
                if !news.links.isEmpty {
                    CardView {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Tra cứu văn bản chính thức").afont(15, .bold).foregroundColor(.white)
                            ForEach(news.links, id: \.href) { l in
                                Button { if let u = URL(string: l.href) { openURL(u) } } label: {
                                    Text("↗ \(l.label)").afont(13).foregroundColor(Asphalt.muted).multilineTextAlignment(.leading)
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                    .padding(.top, 8)
                }
                Spacer().frame(height: 16)
            }
            .padding(16)
        }
        .background(Asphalt.bg.ignoresSafeArea())
    }
}

struct NewsCard: View {
    let n: NewsItem
    let big: Bool
    let action: () -> Void

    var body: some View {
        CardView(padding: big ? 16 : 12, action: action) {
            HStack(alignment: .top, spacing: 12) {
                Text(n.emoji).font(.system(size: big ? 34 : 22))
                    .frame(width: big ? 64 : 44, height: big ? 64 : 44)
                    .background(big ? Asphalt.lane.opacity(0.15) : Color.white.opacity(0.06))
                    .clipShape(RoundedRectangle(cornerRadius: big ? 20 : 14, style: .continuous))
                VStack(alignment: .leading, spacing: 0) {
                    HStack(spacing: 6) {
                        if n.pinned { Chip("📌 Ghim", color: Asphalt.lane.opacity(0.15), fg: Asphalt.lane) }
                        Chip(n.category)
                        Text(n.date).afont(11).foregroundColor(Asphalt.faint).lineLimit(1)
                    }
                    Text(n.title).afont(big ? 18 : 15, .heavy).foregroundColor(.white).multilineTextAlignment(.leading)
                        .fixedSize(horizontal: false, vertical: true).padding(.top, 6)
                    Text(n.summary).afont(13).foregroundColor(Asphalt.muted).lineLimit(big ? 4 : 2).multilineTextAlignment(.leading)
                        .padding(.top, 4)
                }
                Spacer(minLength: 0)
            }
        }
    }
}

/// Bài viết: các khối nội dung + khối tương tác đề 2027.
struct NewsArticleView: View {
    let slug: String
    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var nav: Nav

    var body: some View {
        let n = app.repo.news.items.first { $0.slug == slug }
        VStack(spacing: 0) {
            RunnerTopBar("Tin tức", subtitle: n?.category, onBack: { nav.pop() })
            if let n {
                ScrollView {
                    VStack(alignment: .leading, spacing: 0) {
                        Text("Cập nhật \(n.date)").afont(12).foregroundColor(Asphalt.faint)
                        Text("\(n.emoji) \(n.title)").afont(23, .black).foregroundColor(.white).lineSpacing(3)
                            .fixedSize(horizontal: false, vertical: true).padding(.top, 4)
                        Text(n.summary).afont(16).foregroundColor(.white.opacity(0.75)).lineSpacing(4)
                            .fixedSize(horizontal: false, vertical: true).padding(.top, 8).padding(.bottom, 12)
                        ForEach(Array(n.body.enumerated()), id: \.offset) { _, b in
                            NewsBlockView(block: b).padding(.bottom, 12)
                        }
                        Text("Nguồn: \(n.sources.joined(separator: " · ")). Nội dung tóm tắt để ôn luyện — hãy đối chiếu văn bản gốc khi cần.")
                            .afont(11).foregroundColor(Asphalt.faint).fixedSize(horizontal: false, vertical: true).padding(.top, 8)
                        Text("Đọc thêm").afont(16, .bold).foregroundColor(.white).padding(.top, 20).padding(.bottom, 8)
                        ForEach(app.repo.news.items.filter { $0.slug != slug }.prefix(3)) { m in
                            NewsCard(n: m, big: false) { nav.push(.article(m.slug)) }.padding(.bottom, 8)
                        }
                        Spacer().frame(height: 24)
                    }
                    .padding(.horizontal, 16)
                }
            } else {
                Text("Không tìm thấy bài viết.").afont(15).foregroundColor(Asphalt.muted).padding(16)
                Spacer()
            }
        }
        .background(Asphalt.bg.ignoresSafeArea())
        .toolbar(.hidden, for: .navigationBar)
        .navigationBarBackButtonHidden(true)
    }
}

private struct NewsBlockView: View {
    let block: NewsBlock

    var body: some View {
        switch block {
        case .para(let t):
            Text(t).afont(15).foregroundColor(.white.opacity(0.85)).lineSpacing(5).fixedSize(horizontal: false, vertical: true)
        case .heading(let t):
            Text(t).afont(18, .heavy).foregroundColor(.white).fixedSize(horizontal: false, vertical: true).padding(.top, 6)
        case .bullets(let items):
            VStack(alignment: .leading, spacing: 6) {
                ForEach(Array(items.enumerated()), id: \.offset) { _, t in
                    HStack(alignment: .top, spacing: 10) {
                        Circle().fill(Asphalt.lane).frame(width: 6, height: 6).padding(.top, 8)
                        Text(t).afont(15).foregroundColor(.white.opacity(0.85)).lineSpacing(4).fixedSize(horizontal: false, vertical: true)
                    }
                }
            }
        case .table(let head, let rows):
            NewsTable(head: head, rows: rows)
        case .timeline(let items):
            VStack(alignment: .leading, spacing: 12) {
                ForEach(Array(items.enumerated()), id: \.offset) { _, t in
                    HStack(alignment: .top, spacing: 12) {
                        Circle().fill(Asphalt.lane).frame(width: 12, height: 12).padding(.top, 4)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(t.date).afont(14, .black).foregroundColor(Asphalt.lane)
                            Text(t.text).afont(14).foregroundColor(.white.opacity(0.85)).lineSpacing(3).fixedSize(horizontal: false, vertical: true)
                        }
                    }
                }
            }
        case .tip(let t):
            HStack(alignment: .top, spacing: 10) {
                Text("💡").font(.system(size: 18))
                Text(t).afont(14).foregroundColor(Color(hex: 0xD1FAE5)).lineSpacing(3).fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
            }
            .padding(12)
            .background(Asphalt.green.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Asphalt.green.opacity(0.3), lineWidth: 1))
        case .exam2027:
            Exam2027Panel()
        case .unknown:
            EmptyView()
        }
    }
}

private struct NewsTable: View {
    let head: [String]
    let rows: [[String]]

    var body: some View {
        let shape = RoundedRectangle(cornerRadius: 14, style: .continuous)
        VStack(spacing: 0) {
            HStack(alignment: .top, spacing: 6) {
                ForEach(Array(head.enumerated()), id: \.offset) { i, h in
                    Text(h.uppercased()).afont(10, .black).foregroundColor(Asphalt.faint)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .layoutPriority(i == 0 ? 1.2 : 1)
                }
            }
            .padding(.horizontal, 10).padding(.vertical, 8)
            .background(Color.white.opacity(0.06))
            ForEach(Array(rows.enumerated()), id: \.offset) { _, r in
                HStack(alignment: .top, spacing: 6) {
                    ForEach(Array(r.enumerated()), id: \.offset) { i, c in
                        Text(c).afont(13, i == 0 ? .bold : .regular).foregroundColor(i == 0 ? .white : .white.opacity(0.8))
                            .fixedSize(horizontal: false, vertical: true)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                .padding(.horizontal, 10).padding(.vertical, 8)
            }
        }
        .clipShape(shape)
        .overlay(shape.stroke(Asphalt.line, lineWidth: 1))
    }
}

/// Đếm ngược tới 01/3/2027 + bảng so sánh số câu từng hạng + nút chuyển sang đề 2027.
struct Exam2027Panel: View {
    @EnvironmentObject private var app: AppContainer
    @EnvironmentObject private var store: ProgressStore
    @EnvironmentObject private var nav: Nav

    var body: some View {
        let days = Int((Repo.tt108Date.timeIntervalSinceNow / 86_400).rounded(.down)) + 1
        let mine = store.state.lastLicense
        let on = store.version == .tt108
        let shape = RoundedRectangle(cornerRadius: 14, style: .continuous)
        VStack(alignment: .leading, spacing: 10) {
            VStack(alignment: .leading, spacing: 12) {
                HStack(spacing: 14) {
                    if days > 0 {
                        VStack(spacing: 0) {
                            Text("\(days)").afont(40, .black).foregroundColor(Asphalt.lane)
                            Text("NGÀY NỮA").afont(10, .black).foregroundColor(.white.opacity(0.6))
                        }
                    } else {
                        Text("Đang áp dụng").afont(15, .black).foregroundColor(Asphalt.lane)
                    }
                    VStack(alignment: .leading, spacing: 2) {
                        Text("ÁP DỤNG TỪ 01/3/2027").afont(11, .black).tracking(1).foregroundColor(Color(hex: 0xC7D2FE))
                        Text("Luyện song song cả hai cấu trúc; đổi bất cứ lúc nào trong mục Tôi.").afont(13).foregroundColor(.white.opacity(0.8))
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    Spacer(minLength: 0)
                }
                PressButton(text: on ? "Vào bộ đề 2027 →" : "Luyện đề 2027 →", tone: on ? .ghost : .primary, compact: true) {
                    store.setExamVersion("tt108")
                    nav.switchTab(.exams)
                }
            }
            .padding(16)
            .background(LinearGradient(colors: [Color(hex: 0x1E1B4B), Color(hex: 0x312E81), Color(hex: 0x4C1D95)], startPoint: .topLeading, endPoint: .bottomTrailing))
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))

            VStack(spacing: 0) {
                HStack(spacing: 6) {
                    Text("HẠNG").afont(10, .black).foregroundColor(Asphalt.faint).frame(width: 58, alignment: .leading)
                    Text("HIỆN HÀNH").afont(10, .black).foregroundColor(Asphalt.faint).frame(maxWidth: .infinity, alignment: .leading)
                    Text("TỪ 01/3/2027").afont(10, .black).foregroundColor(Asphalt.faint).frame(maxWidth: .infinity, alignment: .leading)
                }
                .padding(.horizontal, 10).padding(.vertical, 8)
                .background(Color.white.opacity(0.06))
                ForEach(app.repo.licenses) { l in
                    let me = l.id == mine
                    HStack(spacing: 6) {
                        Text(l.id + (me ? " ★" : "")).afont(13, .black).foregroundColor(.white).frame(width: 58, alignment: .leading)
                        Text("\(l.exam.total) · \(l.exam.minutes)′ · \(l.exam.pass)").afont(13).foregroundColor(Asphalt.muted).frame(maxWidth: .infinity, alignment: .leading)
                        Text("\(l.exam2027.total) · \(l.exam2027.minutes)′ · \(l.exam2027.pass)").afont(13, .bold).foregroundColor(.white).frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .padding(.horizontal, 10).padding(.vertical, 7)
                    .background(me ? Asphalt.lane.opacity(0.1) : Color.clear)
                }
            }
            .clipShape(shape)
            .overlay(shape.stroke(Asphalt.line, lineWidth: 1))
            Text("Số câu · thời gian (phút) · số câu đúng tối thiểu. BE, D1E, D2E, DE tạm tính như CE.").afont(11).foregroundColor(Asphalt.faint)
                .fixedSize(horizontal: false, vertical: true)
        }
    }
}
