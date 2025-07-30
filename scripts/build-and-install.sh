#!/bin/bash

# 🚀 Build and Install Script for NearMe Android App
# This script builds the app and installs it on an emulator or device

set -e  # Exit on any error

echo "🚀 NearMe Android Build & Install Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Parse command line arguments
BUILD_TYPE="debug"
INSTALL_TARGET="emulator"
CLEAN_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dev|--development)
            BUILD_TYPE="development"
            shift
            ;;
        --preview)
            BUILD_TYPE="preview"
            shift
            ;;
        --production)
            BUILD_TYPE="production"
            shift
            ;;
        --device)
            INSTALL_TARGET="device"
            shift
            ;;
        --emulator)
            INSTALL_TARGET="emulator"
            shift
            ;;
        --clean)
            CLEAN_BUILD=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Build Types:"
            echo "  --dev, --development    Build development version (default: debug)"
            echo "  --preview              Build preview version"
            echo "  --production           Build production version"
            echo ""
            echo "Install Target:"
            echo "  --emulator             Install on emulator (default)"
            echo "  --device               Install on connected device"
            echo ""
            echo "Options:"
            echo "  --clean                Clean build (prebuild + clean)"
            echo "  --help, -h             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                     # Build debug and install on emulator"
            echo "  $0 --dev --device      # Build development and install on device"
            echo "  $0 --clean --preview   # Clean build preview version"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

print_step "Build Configuration:"
echo "  Build Type: $BUILD_TYPE"
echo "  Install Target: $INSTALL_TARGET"
echo "  Clean Build: $CLEAN_BUILD"
echo ""

# Step 1: Check prerequisites
print_step "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

# Check if ADB is installed
if ! command -v adb &> /dev/null; then
    print_error "ADB is not installed. Please install Android SDK Platform Tools"
    exit 1
fi

print_success "Prerequisites check passed"

# Step 2: Clean build if requested
if [ "$CLEAN_BUILD" = true ]; then
    print_step "Cleaning project..."
    npm run clean
    npm run clean:android
    print_success "Project cleaned"
fi

# Step 3: Install dependencies
print_step "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 4: Check for connected devices/emulators
print_step "Checking for connected devices..."
adb devices -l

DEVICE_COUNT=$(adb devices | grep -E "(device|emulator)" | wc -l)
if [ "$DEVICE_COUNT" -eq 0 ]; then
    print_error "No devices or emulators connected"
    print_warning "Please start an emulator or connect a device"
    exit 1
fi

print_success "Found $DEVICE_COUNT connected device(s)"

# Step 5: Build the app
print_step "Building the app..."

case $BUILD_TYPE in
    "development")
        print_step "Building development version with EAS..."
        npm run build:dev
        APK_PATH="dist/NearMe-development.apk"
        ;;
    "preview")
        print_step "Building preview version with EAS..."
        npm run build:preview
        APK_PATH="dist/NearMe-preview.apk"
        ;;
    "production")
        print_step "Building production version with EAS..."
        npm run build:production
        APK_PATH="dist/NearMe-production.apk"
        ;;
    "debug"|*)
        print_step "Building debug version with Gradle..."
        npm run prebuild
        npm run build:android
        APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"
        ;;
esac

print_success "Build completed"

# Step 6: Check if APK exists
if [ ! -f "$APK_PATH" ]; then
    print_error "APK not found at: $APK_PATH"
    
    # Try to find APK in common locations
    print_step "Searching for APK files..."
    find . -name "*.apk" -type f 2>/dev/null | head -5
    
    exit 1
fi

print_success "APK found: $APK_PATH"

# Step 7: Install the APK
print_step "Installing APK on $INSTALL_TARGET..."

if [ "$BUILD_TYPE" = "debug" ]; then
    npm run install:debug
else
    case $INSTALL_TARGET in
        "device")
            npm run install:device
            ;;
        "emulator"|*)
            npm run install:emulator
            ;;
    esac
fi

print_success "APK installed successfully"

# Step 8: Launch the app (optional)
print_step "Launching the app..."
adb shell am start -n com.bluntbrain.NearMe/.MainActivity

print_success "🎉 Build and installation completed successfully!"
print_step "The NearMe app should now be running on your $INSTALL_TARGET"

# Step 9: Show logs (optional)
echo ""
echo "📱 To view app logs, run:"
echo "   adb logcat -s ReactNativeJS:V ReactNative:V NearMe:V"
echo ""
echo "🔧 To rebuild and reinstall quickly:"
echo "   npm run build:android && npm run install:debug"