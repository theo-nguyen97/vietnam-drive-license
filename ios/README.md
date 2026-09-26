# 📱 Lái Lụa — ứng dụng iOS (Swift + SwiftUI)

Bản native iOS của [Lái Lụa](../README.md): ôn thi lý thuyết giấy phép lái xe theo phong cách game giao thông.
Dùng **chung ngân hàng câu hỏi, bộ đề và định dạng tiến độ** với bản web và bản Android (`mobile/`).

## Tính năng

- **Vào là học ngay**: lần đầu mở app hỏi *bạn định thi bằng gì?* và *khi nào thi?* (trước/sau 01/3/2027) để chọn đúng cấu trúc đề.
- **4 tab**: Học · Thi thử · Biển báo · Tôi.
- **Học**: ôn tập hôm nay (lặp lại ngắt quãng Leitner), đề tiếp theo, dự đoán khả năng đậu (mô phỏng Poisson-nhị thức),
  luyện điểm yếu / điểm liệt / câu hay sai / câu đã lưu, ôn theo chương với thanh tiến độ.
- **Câu hỏi có hình động**: sa hình giao lộ vẽ bằng SwiftUI `Canvas`, mô phỏng **thứ tự xe đi** khi xem đáp án
  (đèn tín hiệu, CSGT, vòng xuyến, biển ưu tiên, xe vi phạm); tình huống trên đường nhìn từ sau xe với
  trạm kiểm tra — đúng thì barie mở, sai thì rung + viền đỏ.
- **Thi thử**: bộ đề cố định (10 đề xe máy / 20 đề ô tô) **trùng khớp từng câu với bản web và Android** (cùng thuật toán
  mulberry32, có unit test đối chiếu), đề ngẫu nhiên, đếm ngược, câu điểm liệt, xem lại từng câu.
- **Đề hiện hành (TT12/2025) và đề từ 01/3/2027 (TT108/2026)** chuyển qua lại trong tab Thi thử hoặc Tôi.
- **Tôi**: hạng bằng, cấu trúc đề, cỡ chữ, âm thanh/rung (haptics), hồ sơ XP & cấp bậc, độ chính xác theo chương,
  lịch sử thi, **xuất/nhập tiến độ JSON dùng chung với web & Android** (qua Files).
- Hoàn toàn offline — dữ liệu nằm trong bundle.

## Cấu trúc

```
ios/
  project.yml                       # đặc tả XcodeGen → LaiLua.xcodeproj (không commit project)
  Packages/LaiLuaCore/              # Swift Package thuần logic, chạy `swift test` được cả trên macOS lẫn Linux
    Sources/LaiLuaCore/
      Models.swift    Repo.swift    Random.swift (mulberry32 = web)   Exam.swift (bộ đề, chấm)
      Sets.swift (bài ôn, chủ đề, điểm yếu)   Stats.swift (tiến độ, dự đoán)
      Progress.swift (trạng thái + Leitner + xuất/nhập JSON)   SVGPath.swift (quỹ đạo xe → polyline)
    Tests/LaiLuaCoreTests/          # ExamParityTests (bộ đề & RNG giống hệt web/Android), ProgressTests, SVGPathTests
  LaiLua/                           # app SwiftUI
    App/        LaiLuaApp, AppContainer (nạp dữ liệu), RootView (onboarding / tab / điều hướng), Navigation
    Store/      ProgressStore (JSON trong Application Support, cùng định dạng progress.json của Android), SignImages
    UI/         Theme (bảng màu, cỡ chữ), Widgets (thẻ, nút 3D, chip…), Sfx (âm + haptics)
    UI/Scene/   JunctionCanvas, RoadCanvas, TopVehicles, RearVehicle, GraphicsHelpers
    UI/Quiz/    QuestionView, QuizCommon
    UI/Screens/ Onboarding, Home, Practice, Exam, ExamSets, Signs, Me
    Resources/  Assets.xcassets (icon, màu)
  LaiLuaTests/                      # AppSmokeTests: dựng toàn bộ màn hình trên simulator để bắt crash
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
```

### GitHub Actions

Workflow `.github/workflows/ios.yml` chạy trên macOS khi có thay đổi trong `ios/` hoặc dữ liệu dùng chung: `swift test`,
sinh project, chạy smoke test trên simulator, build bản simulator (`LaiLua-simulator.zip`) và archive **IPA chưa ký**
(`LaiLua-unsigned.ipa`) đính kèm dưới dạng artifact. Đẩy tag `ios-v1.0.0` sẽ tạo GitHub Release kèm hai tệp này.
IPA chưa ký có thể ký lại bằng Xcode / AltStore / Sideloadly với Apple ID của bạn; muốn lên App Store cần
ký bằng tài khoản Apple Developer trong Xcode (Product → Archive).

## Chưa có / hướng phát triển

- Mini game Săn biển báo, Thử thách 12 điểm, lộ trình lấy bằng, tin tức luật, trang Học mẹo — hiện chỉ có trên web.
- Mô phỏng "chọn sai thì sao" (xe đi sai lượt va chạm, hậu quả từng đáp án): dữ liệu `consequences` đã có trong
  `questions.json` nhưng app mới hiển thị mô phỏng thứ tự đúng.
- Đọc câu hỏi bằng giọng nói (AVSpeechSynthesizer), widget/Live Activity đếm ngược ngày thi.
