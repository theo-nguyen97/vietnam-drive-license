# 📱 Lái Lụa — ứng dụng Android (Kotlin + Jetpack Compose)

Bản native Android của [Lái Lụa](../README.md): ôn thi lý thuyết giấy phép lái xe theo phong cách game giao thông.
Dùng **chung ngân hàng câu hỏi, bộ đề, mô phỏng và định dạng tiến độ** với bản web (bản iOS ở [`ios/`](../ios/README.md)
dùng chung thư mục `assets/` này).

## Tính năng

- **Vào là học ngay**: lần đầu mở app hỏi *bạn định thi bằng gì?* và *khi nào thi?* (trước/sau 01/3/2027) để chọn đúng cấu trúc đề.
- **5 tab như bản web**: Học · Thi thử · Tin tức · Khám phá · Tôi.
- **Học**: ôn tập hôm nay (lặp lại ngắt quãng Leitner), đề tiếp theo, dự đoán khả năng đậu (mô phỏng Poisson-nhị thức),
  luyện điểm yếu / điểm liệt / câu hay sai / câu đã lưu / học theo mẹo / tình huống mô phỏng, ôn theo chương, 3 tin mới nhất.
- **Câu hỏi có hình động**: sa hình giao lộ vẽ bằng Compose Canvas (đèn tín hiệu, CSGT, vòng xuyến, biển ưu tiên, xe vi phạm);
  tình huống trên đường nhìn từ sau xe với trạm kiểm tra — đúng thì barie mở, sai thì rung + viền đỏ.
- **Mô phỏng "chọn sai thì sao"**: sa hình diễn lại **đúng theo đáp án người học chọn** — xe đi sai lượt lao vào giao lộ và
  **va chạm** (nổ, rung, chú thích đỏ), xe vượt đèn đỏ / không chấp hành CSGT bị đánh dấu. Thẻ hậu quả (va chạm, biên bản,
  mất an toàn) và bảng **"Thử cách xử lý khác"**: bấm từng đáp án để xem sa hình diễn lại theo cách đó. Kịch bản sinh bằng
  cùng thuật toán với web (`logic/WhatIf.kt` ⇄ `src/lib/whatif.ts`, có test đối chiếu mọi câu × mọi đáp án).
- **Đọc câu hỏi bằng giọng nói** (TextToSpeech tiếng Việt): nút 🔊 ở từng câu, hoặc bật *Tự đọc câu hỏi* trong mục Tôi.
- **Thi thử**: bộ đề cố định (10 đề xe máy / 20 đề ô tô) **trùng khớp từng câu với bản web** (cùng thuật toán
  mulberry32, có unit test đối chiếu), đề ngẫu nhiên, đếm ngược, câu điểm liệt, xem lại từng câu.
  **Đề hiện hành (TT12/2025) và đề từ 01/3/2027 (TT108/2026)** chuyển qua lại trong tab Thi thử hoặc Tôi.
- **Tin tức luật giao thông**: lọc theo chuyên mục, bài ghim về đề 2027 có đếm ngược + bảng so sánh số câu từng hạng
  và nút chuyển sang bộ đề 2027.
- **Khám phá**:
  - *Lộ trình lấy bằng* (ô tô / xe máy): đánh dấu từng bước; các bài sa hình thực hành với mẹo và lỗi bị trừ điểm.
  - *Học mẹo*: 53 mẹo nhớ theo 9 nhóm, nút "Luyện ngay" các câu liên quan.
  - *Phân tích điểm yếu*: 23 chủ đề chấm đỏ / vàng / xanh, bấm để luyện chủ đề.
  - *Thư viện biển báo* (114 biển).
  - Mini game *Săn biển báo* (60 giây, đúng +1s, sai −3s, combo) và *Thử thách 12 điểm* (mỗi câu 20 giây, sai trừ điểm GPLX
    như luật mới, hết 12 điểm là bị tước bằng). Kỷ lục được lưu.
- **Tôi**: hạng bằng, cấu trúc đề, cỡ chữ, âm thanh/rung, tự đọc câu hỏi, hồ sơ XP & cấp bậc, độ chính xác theo chương,
  lịch sử thi, **xuất/nhập tiến độ JSON dùng chung với web**.
- Chạy được từ Android 8.0 (API 26); emoji mới được thay bằng emoji tương đương trên máy đời cũ (`data/Emoji.kt`).
- Hoàn toàn offline — dữ liệu nằm trong `assets/`.

## Cấu trúc

```
mobile/
  app/src/main/assets/data/*.json     # câu hỏi, hạng bằng, chương, biển báo, chủ đề, tin tức, lộ trình, mẹo (sinh từ web)
  app/src/main/assets/signs/*.png     # 114 biển báo 256 px (vẽ từ SVG của web)
  app/src/main/java/vn/lailua/app/
    data/        Models.kt, Content.kt (tin tức/lộ trình/mẹo), Repo.kt (nạp assets), Emoji.kt
    logic/       Random.kt (mulberry32 = web), Exam.kt (bộ đề, chấm), Sets.kt (bài ôn, chủ đề, điểm yếu),
                 Stats.kt (tiến độ, dự đoán), WhatIf.kt (kịch bản "chọn sai thì sao")
    store/       ProgressStore.kt (DataStore JSON, Leitner, kỷ lục game, lộ trình, xuất/nhập)
    ui/          LaiLuaApp.kt (điều hướng), BottomBar.kt, Widgets.kt, Speech.kt (đọc giọng nói), Sfx.kt, theme/
    ui/quiz/     QuestionView.kt (câu hỏi, hậu quả, thử cách khác), QuizCommon.kt
    ui/scene/    JunctionCanvas.kt (sa hình + va chạm), RoadCanvas.kt, TopVehicles.kt, VehicleIcon.kt
    ui/screens/  Onboarding, Home, Practice, Exam, ExamSets, News, Explore, Journey, Tips, Weakness, Signs, Games, Me
  app/src/test/
    ExamParityTest.kt     # bộ đề & RNG giống hệt web
    WhatIfParityTest.kt   # kịch bản mô phỏng giống hệt web (resources/whatif-ref.tsv sinh từ src/lib/whatif.ts)
    ContentTest.kt        # tin tức / lộ trình / mẹo đọc được đầy đủ
    EmojiTest.kt
    AppSmokeTest.kt       # Robolectric: đi qua toàn bộ app như người dùng thật, chụp ảnh từng màn vào build/screenshots/
  scripts/create-keystore.sh          # tạo khoá ký bản phát hành + in giá trị cho GitHub Secrets
```

## Cập nhật dữ liệu từ web

Mỗi khi sửa câu hỏi, tin tức, lộ trình hoặc mẹo ở `src/data/`, chạy từ thư mục gốc:

```bash
npx tsx scripts/export-mobile-data.tsx
```

(Cần Chromium của Playwright để vẽ lại PNG biển báo; đặt `PLAYWRIGHT_MODULE` nếu Playwright cài toàn cục.)
Nếu sửa sa hình hoặc `src/lib/whatif.ts`, sinh lại `app/src/test/resources/whatif-ref.tsv` (xem đầu `WhatIfParityTest.kt`)
để test đối chiếu vẫn phản ánh bản web.

## Build

Yêu cầu JDK 17+ và Android SDK (platform 35, build-tools 35). Trong `mobile/`:

```bash
./gradlew assembleDebug          # app/build/outputs/apk/debug/app-debug.apk
./gradlew testDebugUnitTest      # test đối chiếu web + chạy thử toàn bộ app (ảnh chụp ở app/build/screenshots/)
./gradlew assembleRelease        # APK ký bằng khoá release (thiếu thì dùng khoá debug để cài thử)
./gradlew bundleRelease          # AAB để tải lên Google Play
```

Hoặc mở thư mục `mobile/` bằng Android Studio.

## Ký bản phát hành & đưa lên Google Play

1. Tạo khoá (một lần, trên máy của bạn — cần JDK):
   ```bash
   cd mobile && ./scripts/create-keystore.sh ~/lai-lua-release.jks
   ```
   Script in ra 4 giá trị cần thêm vào **GitHub → Settings → Secrets and variables → Actions**:
   `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.
   Cất tệp `.jks` và mật khẩu cẩn thận — mất khoá thì không cập nhật được app đã phát hành.
2. Từ lần push tiếp theo, workflow ký APK và AAB release bằng khoá đó. `versionCode` tự tăng theo số lần chạy workflow.
3. Tải `lai-lua-release-aab` (artifact của workflow) lên Google Play Console. Nên bật *Play App Signing*.

Chạy local: đặt các biến `ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` rồi `./gradlew bundleRelease`.

## GitHub Actions

Workflow `.github/workflows/android.yml` chạy khi có thay đổi trong `mobile/`: chạy toàn bộ test, build APK debug + release và AAB,
đính kèm dưới dạng artifact cùng **ảnh chụp từng màn hình** (`lai-lua-screenshots`). Đẩy tag `app-v1.1.0` sẽ tạo GitHub Release
kèm APK/AAB để tải trực tiếp.
