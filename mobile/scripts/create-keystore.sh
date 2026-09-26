#!/usr/bin/env bash
# Tạo khoá ký bản phát hành cho Lái Lụa (Android) và in ra giá trị cần dán vào GitHub Secrets.
#
#   ./scripts/create-keystore.sh                 # tạo release.jks trong thư mục hiện tại
#   ./scripts/create-keystore.sh ~/keys/lai.jks  # tự chọn nơi lưu
#
# GIỮ KỸ tệp .jks và mật khẩu: mất khoá thì không thể cập nhật app đã phát hành trên Google Play
# (trừ khi dùng Play App Signing). KHÔNG commit tệp .jks vào git — .gitignore đã chặn *.jks.
set -euo pipefail

OUT="${1:-release.jks}"
ALIAS="${ANDROID_KEY_ALIAS:-lailua}"

if [ -e "$OUT" ]; then
  echo "Đã có $OUT — xoá hoặc chọn tên khác để tránh ghi đè khoá cũ." >&2
  exit 1
fi
command -v keytool >/dev/null || { echo "Cần JDK (keytool) — cài Temurin 17 hoặc Android Studio." >&2; exit 1; }

read -rsp "Mật khẩu keystore (≥ 6 ký tự): " PASS; echo
read -rsp "Nhập lại: " PASS2; echo
[ "$PASS" = "$PASS2" ] || { echo "Hai lần nhập không khớp." >&2; exit 1; }
[ ${#PASS} -ge 6 ] || { echo "Mật khẩu quá ngắn." >&2; exit 1; }

keytool -genkeypair \
  -keystore "$OUT" -storetype PKCS12 \
  -alias "$ALIAS" -keyalg RSA -keysize 4096 -validity 10000 \
  -storepass "$PASS" -keypass "$PASS" \
  -dname "CN=Lai Lua, OU=Mobile, O=Lai Lua, C=VN" 2>/dev/null

B64_FILE="$OUT.base64.txt"
base64 < "$OUT" | tr -d '\n' > "$B64_FILE"

cat <<MSG

✅ Đã tạo $OUT (alias: $ALIAS).

Vào GitHub → repo → Settings → Secrets and variables → Actions → New repository secret, thêm 4 secret:

  ANDROID_KEYSTORE_BASE64   = nội dung tệp $B64_FILE (mở tệp, copy toàn bộ một dòng)
  ANDROID_KEYSTORE_PASSWORD = mật khẩu vừa nhập
  ANDROID_KEY_ALIAS         = $ALIAS
  ANDROID_KEY_PASSWORD      = mật khẩu vừa nhập

Sau đó mỗi lần push, workflow "Android app" sẽ ký APK/AAB release bằng khoá này.
Xoá $B64_FILE sau khi dán xong, cất $OUT ở nơi an toàn (và sao lưu).
MSG
