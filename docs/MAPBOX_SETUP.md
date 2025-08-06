# Mapbox 3D Integration Setup Guide

This guide will help you set up the new 3D map feature using Mapbox GL for React Native.

## 📋 Prerequisites

- React Native development environment
- Android/iOS development setup
- Mapbox account (free tier available)

## 🔑 1. Get Mapbox Access Token

1. **Create a Mapbox Account**
   - Go to [https://account.mapbox.com/](https://account.mapbox.com/)
   - Sign up for a free account

2. **Create an Access Token**
   - Navigate to [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
   - Click "Create a token"
   - Give it a name like "NearMe Mobile App"
   - Select the following scopes:
     - `styles:tiles` (required)
     - `styles:read` (required)
     - `fonts:read` (optional, for custom fonts)
     - `datasets:read` (optional, for custom data)
   - Click "Create token"
   - **Copy the token** - you'll need it in the next step

## 🛠️ 2. Install Dependencies

Install the required Mapbox package:

\`\`\`bash
npm install @rnmapbox/maps
\`\`\`

### For iOS (if supporting iOS in the future):
\`\`\`bash
cd ios && pod install
\`\`\`

## 🔧 3. Configure Access Token

### Option A: Environment Variables (Recommended)

1. Create a `.env` file in your project root (if it doesn't exist):
\`\`\`bash
# .env
MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
GOOGLE_MAPS_API_KEY=your_existing_google_maps_key
\`\`\`

2. Install dotenv if not already installed:
\`\`\`bash
npm install react-native-dotenv
\`\`\`

3. Update your `babel.config.js` to include the dotenv plugin:
\`\`\`javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
    // ... other plugins
  ],
};
\`\`\`

4. Update the config file to use environment variables:
\`\`\`typescript
// src/lib/config/mapbox.ts
export const MAPBOX_CONFIG = {
  ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN || 'YOUR_MAPBOX_ACCESS_TOKEN_HERE',
  // ... rest of config
};
\`\`\`

### Option B: Direct Configuration

1. Open `src/lib/config/mapbox.ts`
2. Replace `YOUR_MAPBOX_ACCESS_TOKEN_HERE` with your actual token:

\`\`\`typescript
export const MAPBOX_CONFIG = {
  ACCESS_TOKEN: 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNrYWJjZGVmZzAwMDAzZm8xbGJkZWZnaWoifQ.example',
  // ... rest of config
};
\`\`\`

⚠️ **Security Note**: Never commit access tokens to version control. Use environment variables for production.

## 📱 4. Android Configuration

### Add Mapbox Maven Repository

Add the following to your `android/build.gradle` (project level):

\`\`\`gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://api.mapbox.com/downloads/v2/releases/maven' }
        maven { url 'https://www.jitpack.io' }
        // ... other repositories
    }
}
\`\`\`

### Configure Mapbox Downloads Token

1. Go to [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
2. Create a **Downloads Token** with `DOWNLOADS:READ` scope
3. Add it to your `android/gradle.properties`:

\`\`\`properties
MAPBOX_DOWNLOADS_TOKEN=sk.your_downloads_token_here
\`\`\`

4. Update `android/app/build.gradle`:

\`\`\`gradle
android {
    // ... existing config
}

dependencies {
    implementation 'com.mapbox.maps:android:10.16.1'
    // ... other dependencies
}
\`\`\`

## 🚀 5. Test the Integration

1. **Clean and rebuild**:
\`\`\`bash
# Clean previous builds
npm run clean
rm -rf node_modules && npm install

# Rebuild native code
npx expo prebuild --clean

# Build and install
npm run quick-build
\`\`\`

2. **Run the app**:
\`\`\`bash
npx expo start --dev-client
\`\`\`

3. **Verify the map loads**:
   - Navigate to the Map tab
   - You should see a 3D map with Mapbox styling
   - Test the controls (zoom, pan, tilt)
   - Verify merchant markers are displayed

## 🎨 6. Customize Map Styles

The app includes several built-in map styles. You can switch between them using the layer button in the map controls:

- **Dark Mode**: `mapbox://styles/mapbox/dark-v11` (default)
- **Satellite**: `mapbox://styles/mapbox/satellite-streets-v12`
- **Streets**: `mapbox://styles/mapbox/streets-v12`
- **Outdoors**: `mapbox://styles/mapbox/outdoors-v12`

### Creating Custom Styles

1. Go to [Mapbox Studio](https://studio.mapbox.com/)
2. Create a new style or customize an existing one
3. Publish your style
4. Copy the style URL
5. Add it to `MAPBOX_CONFIG.STYLES` in the config file

## 🔧 7. Performance Optimization

The 3D map includes several performance optimizations:

### Clustering
- Automatically groups nearby markers
- Configurable cluster radius and max zoom
- Reduces render load for large datasets

### Camera Controls
- Smooth animations with configurable duration
- Pitch control for 3D perspective (0-60 degrees)
- Optimized for mobile touch interactions

### Memory Management
- Efficient marker rendering with Mapbox's native optimization
- Lazy loading of map tiles
- Automatic cleanup of unused resources

## 🐛 8. Troubleshooting

### Common Issues

**1. Map doesn't load / White screen**
- Check that your access token is correct
- Verify the token has the required scopes
- Check network connectivity

**2. Build errors on Android**
- Ensure Mapbox Maven repository is added
- Verify Downloads token is configured
- Clean and rebuild: `npx expo prebuild --clean`

**3. Markers not appearing**
- Check data format (must be valid GeoJSON)
- Verify coordinate format (longitude, latitude)
- Check console for JavaScript errors

**4. Performance issues**
- Reduce cluster radius for fewer clusters
- Increase cluster max zoom level
- Consider data pagination for large datasets

### Debug Mode

Enable debug logging by setting:
\`\`\`typescript
// In your component
useEffect(() => {
  if (__DEV__) {
    MapboxGL.setTelemetryEnabled(false); // Disable telemetry in development
  }
}, []);
\`\`\`

## 📚 9. Additional Resources

- [Mapbox React Native Documentation](https://github.com/rnmapbox/maps)
- [Mapbox GL JS API Reference](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Mapbox Studio Documentation](https://docs.mapbox.com/studio/)
- [React Native Mapbox Examples](https://github.com/rnmapbox/maps/tree/main/example)

## 🔄 10. Migration from WebView Map

The new 3D map maintains all existing functionality:

✅ **Preserved Features**:
- Merchant and WiFi hotspot markers
- Category-based marker colors
- User location tracking
- Country navigation
- Search functionality
- Modal details
- WiFi/Merchant toggle
- Confetti animations

🆕 **New 3D Features**:
- Native 3D rendering
- Smooth camera animations
- Multiple map styles
- Advanced clustering
- Better performance
- Native touch controls
- Compass navigation

The old WebView-based map (`MapScreen.tsx`) is still available if you need to revert.

---

**Need Help?** 
- Check the [Mapbox Community Forum](https://community.mapbox.com/)
- Review the troubleshooting section above
- Create an issue in the project repository