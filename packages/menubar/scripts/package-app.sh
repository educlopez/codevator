#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$ROOT_DIR/.build/release"
ARCH=$(uname -m)
ARCH_BUILD_DIR="$ROOT_DIR/.build/${ARCH}-apple-macosx/release"
APP_DIR="$ROOT_DIR/release/Codevator.app"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"
DMG_PATH="$ROOT_DIR/release/Codevator.dmg"

swift build --package-path "$ROOT_DIR" -c release

rm -rf "$APP_DIR"
mkdir -p "$MACOS_DIR" "$RESOURCES_DIR"

cp "$BUILD_DIR/CodevatorMenuBar" "$MACOS_DIR/Codevator"
chmod +x "$MACOS_DIR/Codevator"

BUNDLE_PATH="$ARCH_BUILD_DIR/CodevatorMenuBar_CodevatorMenuBar.bundle"
if [[ ! -d "$BUNDLE_PATH" ]]; then
  echo "Error: resource bundle not found at $BUNDLE_PATH" >&2
  exit 1
fi
cp -R "$BUNDLE_PATH" "$RESOURCES_DIR/"

cat > "$CONTENTS_DIR/Info.plist" <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "https://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>en</string>
  <key>CFBundleExecutable</key>
  <string>Codevator</string>
  <key>CFBundleIdentifier</key>
  <string>com.codevator.menubar</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>Codevator</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>0.1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSMinimumSystemVersion</key>
  <string>26.0</string>
  <key>LSUIElement</key>
  <true/>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
EOF

# TODO: For distribution builds, add codesign + notarytool steps here before
# creating the DMG. Unsigned builds will be quarantined by Gatekeeper on other machines.
rm -f "$DMG_PATH"
mkdir -p "$ROOT_DIR/release"
hdiutil create -volname "Codevator" -srcfolder "$APP_DIR" -ov -format UDZO "$DMG_PATH" >/dev/null

echo "Created $APP_DIR"
echo "Created $DMG_PATH"
