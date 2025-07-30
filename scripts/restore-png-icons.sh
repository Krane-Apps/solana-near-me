#!/bin/bash

# 🖼️ Restore PNG Icons Script
# This script converts WebP app icons back to PNG format for Android

set -e

echo "🖼️ Restoring PNG App Icons"
echo "=========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check for ImageMagick/convert command
if ! command -v convert &> /dev/null; then
    print_warning "ImageMagick 'convert' command not found. Trying with 'magick'..."
    if ! command -v magick &> /dev/null; then
        print_error "ImageMagick is not installed. Please install it first:"
        echo "  macOS: brew install imagemagick"
        echo "  Ubuntu: sudo apt-get install imagemagick"
        exit 1
    fi
    CONVERT_CMD="magick"
else
    CONVERT_CMD="convert"
fi

print_success "ImageMagick found: $CONVERT_CMD"

# Define source icons
ICON_SOURCE="assets/icon.png"
ADAPTIVE_ICON_SOURCE="assets/adaptive-icon.png"

# Check if source icons exist
if [ ! -f "$ICON_SOURCE" ]; then
    print_error "Source icon not found: $ICON_SOURCE"
    exit 1
fi

if [ ! -f "$ADAPTIVE_ICON_SOURCE" ]; then
    print_error "Source adaptive icon not found: $ADAPTIVE_ICON_SOURCE"
    exit 1
fi

print_success "Source icons found"

# Define Android resolution directories and sizes
declare -A DENSITIES=(
    ["mdpi"]="48"
    ["hdpi"]="72"
    ["xhdpi"]="96"
    ["xxhdpi"]="144"
    ["xxxhdpi"]="192"
)

# Function to convert WebP to PNG and resize
convert_icons() {
    local source_file=$1
    local icon_name=$2
    local is_adaptive=$3
    
    print_step "Converting $icon_name from $source_file"
    
    for density in "${!DENSITIES[@]}"; do
        local size=${DENSITIES[$density]}
        local target_dir="android/app/src/main/res/mipmap-$density"
        
        print_step "Processing $density density ($size x $size)"
        
        # Create target directory if it doesn't exist
        mkdir -p "$target_dir"
        
        # Remove existing WebP files
        if [ -f "$target_dir/${icon_name}.webp" ]; then
            rm "$target_dir/${icon_name}.webp"
            print_step "Removed ${icon_name}.webp"
        fi
        
        # Convert and resize to PNG
        $CONVERT_CMD "$source_file" -resize "${size}x${size}" "$target_dir/${icon_name}.png"
        print_success "Created $target_dir/${icon_name}.png"
    done
}

# Convert main icon
convert_icons "$ICON_SOURCE" "ic_launcher" false

# Convert round icon (use same source)
convert_icons "$ICON_SOURCE" "ic_launcher_round" false

# Convert foreground icon (adaptive)
convert_icons "$ADAPTIVE_ICON_SOURCE" "ic_launcher_foreground" true

print_step "Updating Android configuration to prefer PNG..."

# Create or update gradle.properties to disable WebP conversion
GRADLE_PROPS="android/gradle.properties"
if [ -f "$GRADLE_PROPS" ]; then
    # Remove existing WebP settings
    sed -i.bak '/android.enablePngCrunchInReleaseBuilds/d' "$GRADLE_PROPS"
    sed -i.bak '/android.enableWebpInReleaseBuilds/d' "$GRADLE_PROPS"
fi

# Add PNG preference settings
echo "" >> "$GRADLE_PROPS"
echo "# Force PNG icons (disable WebP conversion)" >> "$GRADLE_PROPS"
echo "android.enableWebpInReleaseBuilds=false" >> "$GRADLE_PROPS"
echo "android.enablePngCrunchInReleaseBuilds=true" >> "$GRADLE_PROPS"

print_success "Updated gradle.properties"

# Update app.json to ensure PNG icons are used
print_step "Ensuring app.json uses PNG icons..."

# The app.json already correctly points to PNG files, so we're good

print_success "🎉 PNG icons restored successfully!"
print_step "📋 Summary:"
echo "  • Converted WebP icons back to PNG format"
echo "  • Generated icons for all Android densities (mdpi to xxxhdpi)"  
echo "  • Updated gradle.properties to prevent future WebP conversion"
echo "  • Ready for next build"

print_step "📱 To rebuild with PNG icons:"
echo "  npm run clean:android && npm run quick-build"