# 🚀 Quick Mapbox Setup for 3D Map

## Step 1: Get Mapbox Access Token

1. Go to [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
2. Click "Create a token"
3. Name: "NearMe Mobile App"
4. Keep default scopes selected
5. Click "Create token"
6. **Copy the token** (starts with `pk.`)

## Step 2: Get Mapbox Downloads Token

1. Go to [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
2. Click "Create a token"
3. Name: "NearMe Downloads"
4. Select **ONLY** the `DOWNLOADS:READ` scope
5. Click "Create token"
6. **Copy the token** (starts with `sk.`)

## Step 3: Create .env File

Create a `.env` file in your project root:

```bash
# Mapbox Tokens
MAPBOX_ACCESS_TOKEN=pk.your_public_token_here
MAPBOX_DOWNLOADS_TOKEN=sk.your_downloads_token_here

# Google Maps (existing)
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
```

## Step 4: Add Downloads Token to Android

Add this line to `android/gradle.properties`:

```properties
MAPBOX_DOWNLOADS_TOKEN=sk.your_downloads_token_here
```

## Step 5: Add Mapbox Repository Back

Add this to `android/build.gradle` in the `allprojects > repositories` section:

```gradle
// Mapbox repository
maven {
  url 'https://api.mapbox.com/downloads/v2/releases/maven'
  authentication {
    basic(BasicAuthentication)
  }
  credentials {
    username = "mapbox"
    password = project.hasProperty('MAPBOX_DOWNLOADS_TOKEN') ? project.property('MAPBOX_DOWNLOADS_TOKEN') : ""
  }
}
```

## Step 6: Build and Test

```bash
npm run quick-build
```

The app will automatically use the 3D map if tokens are configured, or fall back to the WebView map if not.

---

**Current Status**: The app will run with the original WebView map until you add the tokens above.