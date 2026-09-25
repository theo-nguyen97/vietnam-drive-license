# 🚦 Lái Lụa — Ôn thi lý thuyết bằng lái xe như chơi game

Web ôn thi lý thuyết giấy phép lái xe Việt Nam (Next.js 16 + React 19 + Tailwind CSS 4), thiết kế theo phong cách **giao thông / game**:
mỗi câu hỏi là một **trạm kiểm tra** trên đường — người chơi lái chiếc xe của hạng bằng mình chọn đi vào tình huống, trả lời đúng thì barie
mở và xe chạy tiếp, trả lời sai thì bị "thổi còi" kèm giải thích.

## Tính năng

- **15 hạng GPLX** theo Luật TTATGT đường bộ 2024: A1, A, B1, B, C1, C, D1, D2, D, BE, C1E, CE, D1E, D2E, DE — mỗi hạng một chiếc xe riêng
  (xe tay ga, mô tô phân khối lớn, ô tô con, xe tải, xe khách, đầu kéo container…).
- **Chế độ ôn tập**: theo 6 chương, câu điểm liệt, câu hay sai, câu đã lưu, chạy ngẫu nhiên; phản hồi ngay, giải thích + mẹo nhớ,
  combo & XP, phím tắt (1–4, Enter, ←/→).
- **Sa hình động**: giao lộ nhìn từ trên xuống với đèn tín hiệu, CSGT, biển báo, vòng xuyến, đường ưu tiên… Sau khi trả lời,
  mô phỏng chạy các xe **đúng thứ tự** kèm chú thích từng bước; xe vi phạm được đánh dấu.
- **Cảnh lái 3D giả lập** cho câu hỏi thường: xe người chơi chạy tới trạm, biển báo dựng bên đường, đèn tín hiệu, CSGT, đường sắt có tàu
  chạy qua, trời mưa, sương mù, ban đêm, xe cứu thương trong gương chiếu hậu…
- **Thi thử**: đề ngẫu nhiên đúng số câu / thời gian / điểm đạt của từng hạng, luôn có câu điểm liệt (sai là trượt), đếm ngược 3‑2‑1,
  tự nộp khi hết giờ, xem lại bài có lọc câu sai / điểm liệt.
- **Lưu tiến độ** (localStorage): thống kê từng câu, lịch sử thi, XP & cấp bậc, chuỗi ngày học, câu đã lưu; xuất/nhập tệp JSON.
- **Thư viện biển báo** vẽ bằng SVG, có tìm kiếm không dấu.

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # xuất trang tĩnh vào thư mục out/ (output: "export")
npm run lint
```

Bản build là **trang tĩnh** nên có thể đưa lên Vercel, Netlify, GitHub Pages, Cloudflare Pages…

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

Ngân hàng câu hỏi hiện tại (~180 câu) được biên soạn theo Luật Trật tự, an toàn giao thông đường bộ 2024, các quy định về tốc độ,
khoảng cách an toàn và QCVN 41 về báo hiệu đường bộ để phục vụ ôn luyện. Đây **không phải** bản sao bộ 600 câu sát hạch chính thức —
hãy đối chiếu với bộ đề do cơ quan có thẩm quyền ban hành. Cấu trúc dữ liệu cho phép nhập bộ đề chính thức khi có nguồn.
