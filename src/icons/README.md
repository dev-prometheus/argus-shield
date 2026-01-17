# Icon Generation

The extension includes `icon.svg` which needs to be converted to PNG for Chrome.

## Required Sizes

Chrome extensions need PNG icons at these sizes:
- icon16.png  (16x16)   - Toolbar
- icon32.png  (32x32)   - Windows computers
- icon48.png  (48x48)   - Extensions page
- icon128.png (128x128) - Chrome Web Store

## Convert SVG to PNG

### Option 1: Online Converter
1. Go to https://svgtopng.com or https://cloudconvert.com
2. Upload icon.svg
3. Download at each size: 16, 32, 48, 128

### Option 2: Command Line (ImageMagick)
```bash
# Install ImageMagick first
# macOS: brew install imagemagick
# Ubuntu: sudo apt install imagemagick

convert -background none icon.svg -resize 16x16 icon16.png
convert -background none icon.svg -resize 32x32 icon32.png
convert -background none icon.svg -resize 48x48 icon48.png
convert -background none icon.svg -resize 128x128 icon128.png
```

### Option 3: Inkscape
```bash
inkscape icon.svg --export-filename=icon16.png -w 16 -h 16
inkscape icon.svg --export-filename=icon32.png -w 32 -h 32
inkscape icon.svg --export-filename=icon48.png -w 48 -h 48
inkscape icon.svg --export-filename=icon128.png -w 128 -h 128
```

## After Generating PNGs

Update manifest.json to add:

```json
{
  "action": {
    "default_popup": "src/popup/popup.html",
    "default_title": "Argus Security Shield",
    "default_icon": {
      "16": "src/icons/icon16.png",
      "32": "src/icons/icon32.png",
      "48": "src/icons/icon48.png",
      "128": "src/icons/icon128.png"
    }
  },
  
  "icons": {
    "16": "src/icons/icon16.png",
    "32": "src/icons/icon32.png",
    "48": "src/icons/icon48.png",
    "128": "src/icons/icon128.png"
  }
}
```

## Current Status

The extension works without custom icons - Chrome shows a default puzzle piece icon.
Icons are cosmetic only and do not affect functionality.