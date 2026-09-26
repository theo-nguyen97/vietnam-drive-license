# 📱 Lái Lụa — ứng dụng Android (Kotlin + Jetpack Compose)

Bản native Android của [Lái Lụa](../README.md): ôn thi lý thuyết giấy phép lái xe theo phong cách game giao thông.
Dùng **chung ngân hàng câu hỏi, bộ đề và định dạng tiến độ** với bản web.

## Tính năng

- **Vào là học ngay**: lần đầu mở app hỏi *bạn định thi bằng gì?* và *khi nào thi?* (trước/sau 01/3/2027) để chọn đúng cấu trúc đề.
- **4 tab**: Học · Thi thử · Biển báo · Tôi.
- **Học**: ôn tập hôm nay (lặp lại ngắt quãng Leitner), đề tiếp theo, dự đoán khả năng đậu (mô phỏng Poisson-nhị thức),
  luyện điểm yếu / điểm liệt / câu hay sai / câu đã lưu, ôn theo chương với thanh tiến độ.
- **Câu hỏi có hình động**: sa hình giao lộ vẽ bằng Compose Canvas, mô phỏng **thứ tự xe đi** khi xem đáp án
  (đèn tín hiệu, CSGT, vòng xuyến, biển ưu tiên, xe vi phạm); tình huống trên đường nhìn từ sau xe với
  trạm kiểm tra — đúng thì barie mở, sai thì rung + viền đỏ.
- **Thi thử**: bộ đề cố định (10 đề xe máy / 20 đề ô tô) **trùng khớp từng câu với bản web** (cùng thuật toán
  mulberry32, có unit test đối chiếu), đề ngẫu nhiên, đếm ngược, câu điểm liệt, xem lại từng câu.
- **Đề hiện hành (TT12/2025) và đề từ 01/3/2027 (TT108/2026)** chuyển qua lại trong tab Thi thử hoặc Tôi.
- **Tôi**: hạng bằng, cấu trúc đề, cỡ chữ, âm thanh/rung, hồ sơ XP & cấp bậc, độ chính xác theo chương,
  lịch sử thi, **xuất/nhập tiến độ JSON dùng chung với web**.
- Hoàn toàn offline — dữ liệu nằm trong `assets/`.

## Cấu trúc

```
mobile/
  app/src/main/assets/data/*.json     # câu hỏi, hạng bằng, chương, biển báo, chủ đề (sinh từ web)
  app/src/main/assets/signs/*.png     # 114 biển báo 256 px (vẽ từ SVG của web)
  app/src/main/java/vn/lailua/app/
    data/        Models.kt (kotlinx.serialization), Repo.kt (nạp assets)
    logic/       Random.kt (mulberry32 = web), Exam.kt (bộ đề, chấm), Sets.kt (bài ôn, chủ đề, điểm yếu), Stats.kt (tiến độ, dự đoán)
    store/       ProgressStore.kt (DataStore JSON, Leitner, xuất/nhập)
    ui/          LaiLuaApp.kt (điều hướng), Widgets.kt, theme/, quiz/QuestionView.kt
    ui/scene/    JunctionCanvas.kt, RoadCanvas.kt, TopVehicles.kt, VehicleIcon.kt
    ui/screens/  Onboarding, Home, Practice, Exam, ExamSets, Signs, Me
  app/src/test/  ExamParityTest.kt (bộ đề & RNG giống hệt web), AppSmokeTest.kt (Robolectric: chạy thử toàn bộ luồng app trên JVM)
```

## Cập nhật dữ liệu từ web

Mỗi khi sửa câu hỏi ở `src/data/questions/`, chạy từ thư mục gốc:

```bash
npx tsx scripts/export-mobile-data.tsx
```

(Cần Chromium của Playwright để vẽ lại PNG biển báo; đặt `PLAYWRIGHT_MODULE` nếu Playwright cài toàn cục.)

## Build

Yêu cầu JDK 17+ và Android SDK (platform 35, build-tools 35). Trong `mobile/`:

```bash
./gradlew assembleDebug          # app/build/outputs/apk/debug/app-debug.apk
./gradlew testDebugUnitTest      # bộ đề trùng web + chạy thử luồng app bằng Robolectric
./gradlew assembleRelease        # ký bằng ANDROID_KEYSTORE_PATH/PASSWORD, KEY_ALIAS/PASSWORD (thiếu thì dùng khoá debug)
```

Hoặc mở thư mục `mobile/` bằng Android Studio.

### GitHub Actions

Workflow `.github/workflows/android.yml` chạy khi có thay đổi trong `mobile/`: chạy test, build APK debug + release
và đính kèm dưới dạng artifact. Đẩy tag `app-v1.0.0` sẽ tạo GitHub Release kèm APK để tải trực tiếp.
Để ký bản release chính thức, thêm secrets `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

## Chưa có / hướng phát triển

- iOS (cần Swift/SwiftUI hoặc chuyển sang Kotlin Multiplatform + Compose Multiplatform để dùng chung mã).
- Mini game Săn biển báo, Thử thách 12 điểm, lộ trình lấy bằng, tin tức luật, trang Học mẹo — hiện chỉ có trên web.
- Mô phỏng "chọn sai thì sao" (xe đi sai lượt va chạm, hậu quả từng đáp án): dữ liệu `consequences` đã có trong `questions.json`
  nhưng app mới hiển thị mô phỏng thứ tự đúng; phần diễn lại theo đáp án sai chưa được chuyển sang Compose.
- Đọc câu hỏi bằng giọng nói (TextToSpeech của Android).
