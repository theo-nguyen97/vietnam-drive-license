# 📱 Lái Lụa — ứng dụng iOS (Swift + SwiftUI)

Bản native iOS của [Lái Lụa](../README.md): ôn thi lý thuyết giấy phép lái xe theo phong cách game giao thông.
Dùng **chung ngân hàng câu hỏi, bộ đề, mô phỏng, nội dung tin tức/mẹo và định dạng tiến độ** với bản web và bản Android (`mobile/`) —
tính năng tương đương bản Android.

## Tính năng

- **Vào là học ngay**: lần đầu mở app hỏi *bạn định thi bằng gì?* và *khi nào thi?* (trước/sau 01/3/2027) để chọn đúng cấu trúc đề.
- **5 tab như bản web & Android**: Học · Thi thử · Tin tức · Khám phá · Tôi.
- **Học**: ôn tập hôm nay (lặp lại ngắt quãng Leitner), đề tiếp theo, dự đoán khả năng đậu (mô phỏng Poisson-nhị thức),
  luyện điểm yếu / điểm liệt / câu hay sai / câu đã lưu / học theo mẹo / tình huống mô phỏng, ôn theo chương, 3 tin mới nhất.
- **Câu hỏi có hình động**: sa hình giao lộ vẽ bằng SwiftUI `Canvas` (đèn tín hiệu, CSGT, vòng xuyến, biển ưu tiên, xe vi phạm);
  tình huống trên đường nhìn từ sau xe với trạm kiểm tra — đúng thì barie mở, sai thì rung + viền đỏ.
- **Mô phỏng "chọn sai thì sao"**: sa hình diễn lại **đúng theo đáp án người học chọn** — xe đi sai lượt lao vào giao lộ và
  **va chạm** (nổ, rung, chú thích đỏ). Thẻ hậu quả (va chạm, biên bản, mất an toàn) và bảng **"Thử cách xử lý khác"**:
  bấm từng đáp án để xem sa hình diễn lại theo cách đó. Kịch bản sinh bằng cùng thuật toán với web và Android
  (`WhatIf.swift` ⇄ `src/lib/whatif.ts`, test đối chiếu mọi câu × mọi đáp án với bảng tham chiếu của web).
- **Đọc câu hỏi bằng giọng nói** (AVSpeechSynthesizer, giọng tiếng Việt): nút 🔊 ở từng câu, hoặc bật *Tự đọc câu hỏi* trong mục Tôi.
- **Thi thử**: bộ đề cố định (10 đề xe máy / 20 đề ô tô) **trùng khớp từng câu với bản web và Android** (cùng thuật toán
  mulberry32, có unit test đối chiếu), đề ngẫu nhiên, đếm ngược, câu điểm liệt, xem lại từng câu.
  **Đề hiện hành (TT12/2025) và đề từ 01/3/2027 (TT108/2026)** chuyển qua lại trong tab Thi thử hoặc Tôi.
- **Tin tức luật giao thông**: lọc theo chuyên mục, bài ghim về đề 2027 có đếm ngược + bảng so sánh số câu từng hạng
  và nút chuyển sang bộ đề 2027.
- **Khám phá**:
  - *Lộ trình lấy bằng* (ô tô / xe máy): đánh dấu từng bước; các bài sa hình thực hành với mẹo và lỗi bị trừ điểm.
  - *Học mẹo*: mẹo nhớ theo nhóm, nút "Luyện ngay" các câu liên quan.
  - *Phân tích điểm yếu*: chủ đề chấm đỏ / vàng / xanh, bấm để luyện chủ đề.
  - *Thư viện biển báo* (114 biển).
  - Mini game *Săn biển báo* (60 giây, đúng +1s, sai −3s, combo) và *Thử thách 12 điểm* (mỗi câu 20 giây, sai trừ điểm GPLX
    như luật mới, hết 12 điểm là bị tước bằng). Kỷ lục được lưu.
- **Tôi**: hạng bằng, cấu trúc đề, cỡ chữ, âm thanh/rung (haptics), tự đọc câu hỏi, hồ sơ XP & cấp bậc, độ chính xác theo chương,
  lịch sử thi, **xuất/nhập tiến độ JSON dùng chung với web & Android** (qua Files; gồm cả kỷ lục game và lộ trình).
- Hoàn toàn offline — dữ liệu nằm trong bundle.

## Cấu trúc

```
ios/
  project.yml                       # đặc tả XcodeGen → LaiLua.xcodeproj (không commit project)
  Packages/LaiLuaCore/              # Swift Package thuần logic, chạy `swift test` được cả trên macOS lẫn Linux
    Sources/LaiLuaCore/
      Models.swift    Repo.swift    Random.swift (mulberry32 = web)   Exam.swift (bộ đề, chấm)
      Sets.swift (bài ôn, chủ đề, điểm yếu)   Stats.swift (tiến độ, dự đoán)
      Progress.swift (trạng thái + Leitner + kỷ lục game + xuất/nhập JSON)   SVGPath.swift (quỹ đạo xe → polyline)
      Content.swift (tin tức, lộ trình, mẹo)   WhatIf.swift (kịch bản "chọn sai thì sao")
    Tests/LaiLuaCoreTests/          # ExamParityTests (bộ đề & RNG giống hệt web/Android), WhatIfParityTests (đọc bảng tham chiếu
                                    # mobile/app/src/test/resources/whatif-ref.tsv sinh từ web), ContentTests, ProgressTests, SVGPathTests
  LaiLua/                           # app SwiftUI
    App/        LaiLuaApp, AppContainer (nạp dữ liệu), RootView (onboarding / tab / điều hướng), Navigation
    Store/      ProgressStore (JSON trong Application Support, cùng định dạng progress.json của Android), SignImages
    UI/         Theme (bảng màu, cỡ chữ), Widgets (thẻ, nút 3D, chip…), Sfx (âm + haptics), Speech (đọc giọng nói)
    UI/Scene/   JunctionCanvas (sa hình + va chạm), RoadCanvas, TopVehicles, RearVehicle, GraphicsHelpers
    UI/Quiz/    QuestionView (câu hỏi, hậu quả, thử cách khác), QuizCommon
    UI/Screens/ Onboarding, Home, Practice, Exam, ExamSets, NewsViews, ExploreViews (Khám phá, Lộ trình, Mẹo, Điểm yếu),
                GameViews (Săn biển báo, Thử thách 12 điểm), Signs, Me
    Resources/  Assets.xcassets (icon, màu)
  LaiLuaTests/                      # AppSmokeTests: dựng toàn bộ màn hình trên simulator để bắt crash + chụp ảnh từng màn
  scripts/make-icon.mjs             # vẽ icon 1024 px từ logo của web
```

Dữ liệu (`questions.json`, `licenses.json`, PNG biển báo…) **không copy riêng cho iOS**: `project.yml` tham chiếu thẳng thư mục
`../mobile/app/src/main/assets` và đưa nguyên thư mục `assets/` vào bundle. Chỉ cần chạy `npx tsx scripts/export-mobile-data.tsx`
ở thư mục gốc là cả Android lẫn iOS cùng được cập nhật.

## Build

Yêu cầu macOS + Xcode 15 trở lên (iOS 16+), [XcodeGen](https://github.com/yonaskolb/XcodeGen):

```bash
cd ios
brew install xcodegen
xcodegen generate                 # tạo LaiLua.xcodeproj
open LaiLua.xcodeproj             # chọn Team trong Signing & Capabilities rồi Run lên máy/simulator
```

Kiểm thử:

```bash
swift test --package-path Packages/LaiLuaCore     # logic: bộ đề trùng web, Leitner, xuất/nhập, parser quỹ đạo (chạy được trên Linux)
xcodebuild test -project LaiLua.xcodeproj -scheme LaiLua -destination 'platform=iOS Simulator,name=iPhone 16'
# thêm TEST_RUNNER_SCREENSHOT_DIR=$PWD/build/screenshots trước lệnh trên để lưu ảnh chụp từng màn thành PNG
```

### GitHub Actions

Workflow `.github/workflows/ios.yml` chạy trên macOS khi có thay đổi trong `ios/` hoặc dữ liệu dùng chung: `swift test`,
sinh project, chạy smoke test trên simulator (ảnh chụp từng màn: artifact `lai-lua-ios-screenshots`), build bản simulator (`LaiLua-simulator.zip`) và archive **IPA chưa ký**
(`LaiLua-unsigned.ipa`) đính kèm dưới dạng artifact. Đẩy tag `ios-v1.0.0` sẽ tạo GitHub Release kèm hai tệp này.
IPA chưa ký có thể ký lại bằng Xcode / AltStore / Sideloadly với Apple ID của bạn; muốn lên App Store cần
ký bằng tài khoản Apple Developer trong Xcode (Product → Archive).

## Hướng phát triển

- Widget / Live Activity đếm ngược ngày thi.
- Ký và phát hành qua TestFlight khi có tài khoản Apple Developer.
