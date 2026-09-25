# 🚦 Lái Lụa — Ôn thi lý thuyết bằng lái xe như chơi game

Web ôn thi lý thuyết giấy phép lái xe Việt Nam (Next.js 16 + React 19 + Tailwind CSS 4), thiết kế theo phong cách **giao thông / game**:
mỗi câu hỏi là một **trạm kiểm tra** trên đường — người chơi lái chiếc xe của hạng bằng mình chọn đi vào tình huống, trả lời đúng thì barie
mở và xe chạy tiếp, trả lời sai thì bị "thổi còi" kèm giải thích.

## Tính năng

- **Vào là học ngay**: lần đầu mở web chỉ hỏi 2 câu — *bạn định thi bằng gì?* và *khi nào thi?* (trước/sau 01/3/2027, tự chọn cấu trúc đề).
  Sau đó trang chủ chính là trang học của hạng đó (ôn tập hôm nay, đề tiếp theo, dự đoán đậu, luyện tập, ôn theo chương).
- **Điều hướng 5 mục**: Học · Thi thử · Tin tức · Khám phá · Tôi (thanh tab dưới đáy trên điện thoại, menu trên cùng trên máy tính).
  *Tôi* gồm cài đặt (đổi hạng, cấu trúc đề, cỡ chữ, âm thanh, tải offline) và tiến độ; *Khám phá* gom lộ trình, biển báo, mini game.
- **Tin tức luật giao thông** (`/tin-tuc`): bài tóm tắt về đề thi 2027, bỏ thi mô phỏng, 12 điểm GPLX, nồng độ cồn, tốc độ, phân hạng…
  Thông tin đề 2027 nằm riêng trong bài `/tin-tuc/de-thi-2027` (đếm ngược, bảng so sánh từng hạng) thay vì banner khắp nơi.
- **15 hạng GPLX** theo Luật TTATGT đường bộ 2024: A1, A, B1, B, C1, C, D1, D2, D, BE, C1E, CE, D1E, D2E, DE — mỗi hạng một chiếc xe riêng
  (xe tay ga, mô tô phân khối lớn, ô tô con, xe tải, xe khách, đầu kéo container…).
- **Chế độ ôn tập**: theo 6 chương, câu điểm liệt, câu hay sai, câu đã lưu, chạy ngẫu nhiên; phản hồi ngay, giải thích + mẹo nhớ,
  combo & XP, phím tắt (1–4, Enter, ←/→).
- **Sa hình động**: giao lộ nhìn từ trên xuống với đèn tín hiệu, CSGT, biển báo, vòng xuyến, đường ưu tiên… Sau khi trả lời,
  mô phỏng chạy các xe **đúng thứ tự** kèm chú thích từng bước; xe vi phạm được đánh dấu.
- **Cảnh lái 3D giả lập** cho câu hỏi thường: xe người chơi chạy tới trạm, biển báo dựng bên đường, đèn tín hiệu, CSGT, đường sắt có tàu
  chạy qua, trời mưa, sương mù, ban đêm, xe cứu thương trong gương chiếu hậu…
- **Bộ đề 2026**: mỗi hạng có bộ đề cố định (10 đề cho A1, A, B1 · 20 đề cho các hạng ô tô), cấu trúc theo Thông tư 12/2025/TT-BCA
  (bộ câu hỏi áp dụng từ 01/6/2025), lưu kết quả từng đề. Ngoài ra có **thi thử ngẫu nhiên** trộn đề mới mỗi lần.
- **Thi**: đúng số câu / thời gian / điểm đạt, đúng 01 câu điểm liệt mỗi đề (sai là trượt), đếm ngược 3‑2‑1,
  tự nộp khi hết giờ, xem lại bài có lọc câu sai / điểm liệt.
- **Ôn tập hôm nay** — lặp lại ngắt quãng (hộp Leitner): câu sai quay lại sau 10 phút, câu đúng giãn dần 1 – 3 – 7 – 16 – 35 ngày;
  mỗi ngày 20 câu gồm câu đến hạn + câu mới.
- **Thử thách 12 điểm** — chế độ sinh tồn theo luật trừ điểm GPLX: mỗi câu 20 giây, sai/hết giờ trừ 2 điểm (câu điểm liệt trừ 6),
  5 câu đúng liên tiếp phục hồi 1 điểm, hết 12 điểm là "tước bằng"; lưu kỷ lục theo hạng.
- **Săn biển báo** — mini game 60 giây nhận diện biển báo, combo, cuối lượt liệt kê biển nhận nhầm để ôn.
- **Luyện theo lỗi hay mắc** — "chẩn đoán tay lái": chia câu hỏi thành 23 chủ đề nhỏ (vượt xe, dừng đỗ, tốc độ, biển cấm,
  sa hình vòng xuyến…), tính mức rủi ro từng chủ đề từ lịch sử trả lời, báo "mã lỗi" và ra bài luyện đúng chỗ yếu
  (`/hang/[id]/diem-yeu`, bài tổng hợp `on-tap/diem-yeu`, từng chủ đề `on-tap/chu-de-*`).
- **Giao diện điện thoại kiểu ứng dụng** — thanh tab dưới đáy, bảng danh sách câu kéo từ dưới lên, vuốt ngang để chuyển câu,
  tự cuộn tới lời giải thích, rung khi trả lời, hỗ trợ tai thỏ (safe-area) và cài lên màn hình chính (web app manifest).
- **Đề 2027 song song đề hiện hành** — chuyển giữa cấu trúc Thông tư 12/2025 và Thông tư 108/2026 (áp dụng từ 01/3/2027:
  A1/A 40 câu – đạt 36, B1/B 50 – 45, C1 60 – 54, C 70 – 63, D1/D2/D 80 – 72, C1E/CE 90 – 81); bộ đề, thi thử, lịch sử tách theo
  cấu trúc; băng rôn đếm ngược; thêm câu hỏi nội dung mới (xử phạt, trách nhiệm hình sự, phòng chống rượu bia).
- **Dự đoán khả năng đậu** — mô phỏng 160 đề ngẫu nhiên từ lịch sử trả lời (xác suất đúng từng câu, câu điểm liệt), kết hợp kết quả thi
  thử gần đây; hiển thị lý do và độ tin cậy.
- **Học offline** — service worker (`public/sw.js`) lưu trang và tài nguyên; nút "Tải về" lưu trọn gói một hạng; nhãn báo khi mất mạng.
- **Lộ trình lấy bằng** (`/lo-trinh`) — các bước từ đăng ký đến nhận bằng cho ô tô và xe máy, đánh dấu tiến độ, hướng dẫn 11 bài sa hình
  ô tô + tình huống nguy hiểm và 4 phần thi xe máy với sơ đồ động, mẹo và lỗi trừ điểm.
- **Chế độ chữ lớn** — nút "Aa" chuyển 3 cỡ chữ, áp dụng toàn trang ngay khi tải.
- **Đọc câu hỏi** bằng giọng tiếng Việt của trình duyệt (Web Speech API).
- **Bằng lái ảo** — thẻ tổng hợp thành tích (tên, cấp bậc, hạng đã đạt thi thử), tải về ảnh PNG để chia sẻ.
- **Lưu tiến độ** (localStorage): thống kê từng câu, lịch sử thi, XP & cấp bậc, chuỗi ngày học, câu đã lưu; xuất/nhập tệp JSON.
- **Thư viện biển báo** vẽ bằng SVG, có tìm kiếm không dấu.

## Cấu trúc đề thi (Thông tư 12/2025/TT-BCA)

| Hạng | Bộ câu hỏi | Số câu | Thời gian | Đạt | Quy định chung | Điểm liệt | Văn hoá | Kỹ thuật | Cấu tạo | Báo hiệu | Sa hình |
|---|---|---|---|---|---|---|---|---|---|---|---|
| A1 | 250 | 25 | 19' | 21 | 8 | 1 | 1 | 1 | – | 8 | 6 |
| A, B1 | 300 | 25 | 19' | 23 | 8 | 1 | 1 | 1 | – | 8 | 6 |
| B | 600 | 30 | 20' | 27 | 8 | 1 | 1 | 1 | 1 | 9 | 9 |
| C1 | 600 | 35 | 22' | 32 | 10 | 1 | 1 | 2 | 1 | 10 | 10 |
| C | 600 | 40 | 24' | 36 | 10 | 1 | 1 | 2 | 1 | 14 | 11 |
| D1, D2, D, BE, C1E, CE, D1E, D2E, DE | 600 | 45 | 26' | 41 | 10 | 1 | 1 | 2 | 1 | 16 | 14 |

Bộ đề được sinh tất định trong `src/lib/exam.ts` (`examSets`): các câu được xoay vòng để phủ đều ngân hàng và mỗi đề có một câu điểm liệt khác nhau.

> Đề từ 01/3/2027: Thông tư 108/2026/TT-BCA chưa công bố tỉ lệ câu theo từng nhóm, nên phân bổ trong `src/lib/exam.ts`
> (`PLAN_TT108`) là dự kiến; BE, D1E, D2E, DE tạm tính như CE — cần đối chiếu văn bản chính thức.

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # xuất trang tĩnh vào thư mục out/ (output: "export")
npm run lint
```

Bản build là **trang tĩnh** nên có thể đưa lên Vercel, Netlify, GitHub Pages, Cloudflare Pages…

### GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` tự build và deploy mỗi lần push. Web chạy tại
`https://theo-nguyen97.github.io/vietnam-drive-license/` (build với `NEXT_PUBLIC_BASE_PATH=/vietnam-drive-license`).
Lần đầu cần: repo ở chế độ **Public** và **Settings → Pages → Source: GitHub Actions**.

## Cấu trúc

```
src/
  app/                       # các trang (App Router)
    page.tsx                 # trang chủ + garage chọn hạng bằng
    hang/[id]/               # bản đồ hành trình của một hạng
    hang/[id]/on-tap/[set]/  # ôn tập (chuong-1..6, diem-liet, cau-sai, ngau-nhien, da-luu, tat-ca)
    hang/[id]/thi-thu/       # thi thử
    tien-do/  bien-bao/
  data/
    licenses.ts              # hạng bằng + cấu trúc đề thi (số câu, phút, điểm đạt)
    chapters.ts  signs.ts
    questions/ch1..ch6.ts    # ngân hàng câu hỏi
  components/
    scene/DriveScene.tsx     # cảnh lái phối cảnh 3D (SVG)
    scene/JunctionScene.tsx  # sa hình giao lộ + mô phỏng thứ tự
    signs/SignGraphic.tsx    # vẽ biển báo
    quiz/                    # PracticeRunner, ExamRunner, QuestionView…
  lib/exam.ts                # tạo đề & chấm điểm
  store/progress.ts          # lưu tiến độ (zustand + localStorage)
```

## Thêm câu hỏi

Mỗi câu là một object `Question` (xem `src/lib/types.ts`):

```ts
{
  id: 444, chapter: 5,
  text: "Biển nào cấm đỗ xe?",
  options: ["Biển 1.", "Biển 2."],
  answer: 1,                       // chỉ số đáp án đúng (0-based)
  explanation: "…",
  critical: false,                 // câu điểm liệt
  only: "car",                     // chỉ cho nhóm ô tô (hoặc "moto"), bỏ trống = mọi hạng
  signs: ["P.130", "P.131a"],      // biển minh hoạ
  tip: "Mẹo nhớ…",
}
```

Câu **sa hình** khai báo cảnh giao lộ, thứ tự đi và (tuỳ chọn) đèn, CSGT, biển, đường ưu tiên, xe vi phạm:

```ts
scene: {
  kind: "junction", layout: "cross",            // cross | tee | roundabout | road
  lights: { NS: "green", EW: "red" },
  vehicles: [
    { id: "car", kind: "car", from: "S", move: "left", player: true },
    { id: "truck", kind: "truck", from: "N", move: "straight" },
  ],
  order: [["truck"], ["car"]],                  // mỗi nhóm đi cùng lúc
  steps: ["Xe tải — đi thẳng", "Xe con — rẽ trái"],
}
```

Câu thường có thể chọn bối cảnh cho cảnh lái: `scene: { kind: "road", props: ["rain", "light-yellow"] }`.

## Lưu ý về nội dung

Ngân hàng câu hỏi hiện tại (247 câu, 26 câu điểm liệt, 31 sa hình động) được biên soạn theo Luật Trật tự, an toàn giao thông đường bộ 2024, các quy định về tốc độ,
khoảng cách an toàn và QCVN 41 về báo hiệu đường bộ để phục vụ ôn luyện. Đây **không phải** bản sao bộ 600 câu sát hạch chính thức —
hãy đối chiếu với bộ đề do cơ quan có thẩm quyền ban hành. Cấu trúc dữ liệu cho phép nhập bộ đề chính thức khi có nguồn.
