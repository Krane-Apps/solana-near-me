#!/bin/bash

echo "🏗️  Building Signed Production APK for Solana dApp Store"
echo "=================================================="

# Prompt for keystore credentials
echo ""
echo "Please provide your keystore details:"
read -p "Enter keystore password: " -s KEYSTORE_PASSWORD
echo ""
read -p "Enter key alias: " KEY_ALIAS
read -p "Enter key password: " -s KEY_PASSWORD
echo ""

# Navigate to project root
cd ..

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf android/app/build/outputs/

# Create gradle.properties for this build
echo "🔑 Setting up keystore configuration..."
cat > gradle.properties << EOF
# Keystore configuration for release build
NEARME_KEYSTORE_PASSWORD=$KEYSTORE_PASSWORD
NEARME_KEY_ALIAS=$KEY_ALIAS
NEARME_KEY_PASSWORD=$KEY_PASSWORD

# Android configuration
android.useAndroidX=true
android.enableJetifier=true
android.nonTransitiveRClass=true
android.defaults.buildfeatures.buildconfig=true
android.enableDexingArtifactTransform.desugaring=false
hermesEnabled=true
newArchEnabled=true
reactNativeArchitectures=arm64-v8a,armeabi-v7a,x86,x86_64
EOF

# Build the release APK
echo "🚀 Building production APK..."
cd android && ./gradlew assembleRelease

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Production APK created at:"
    echo "   android/app/build/outputs/apk/release/app-release.apk"
    echo ""
    echo "📁 Copying APK to publishing folder..."
    cp app/build/outputs/apk/release/app-release.apk ../publishing/NearMe-v1.0.3-production.apk
echo "   ✅ APK copied to: publishing/NearMe-v1.0.3-production.apk"
    echo ""
    echo "🔍 APK Info:"
    ls -lh ../publishing/NearMe-v1.0.3-production.apk
else
    echo "❌ Build failed! Check the output above for errors."
    exit 1
fi

# Clean up gradle.properties (security)
echo "🔐 Cleaning up keystore credentials..."
rm -f ../gradle.properties

echo ""
echo "🎉 Production APK ready for dApp Store submission!"