# 🚀 Solana dApp Store Release Steps

This guide provides step-by-step instructions for releasing updates to the NearMe app on the Solana dApp Store.

## 📋 Prerequisites

Before starting a release, ensure you have:

- [ ] Android development environment set up
- [ ] Access to the production keystore (`nearme.keystore`)
- [ ] Publisher wallet keypair (`publishing/solana-wallet/publisher-keypair.json`)
- [ ] Publisher wallet funded with ~0.1 SOL on mainnet
- [ ] All code changes tested and ready for release

## 🔄 Release Process

### Step 1: Version Increment

**File:** `android/app/build.gradle`

1. Open `android/app/build.gradle`
2. Locate the `defaultConfig` section (around line 91-96)
3. Increment both version numbers:
   ```gradle
   defaultConfig {
       applicationId 'com.bluntbrain.NearMe'
       minSdkVersion rootProject.ext.minSdkVersion
       targetSdkVersion rootProject.ext.targetSdkVersion
       versionCode 4      // Increment by 1 (was 3)
       versionName "1.0.3" // Update version string (was "1.0.2")
   }
   ```

**Important:** 
- `versionCode` must always increment by 1
- `versionName` should follow semantic versioning (e.g., 1.0.3, 1.1.0, 2.0.0)

### Step 2: Build Production APK

**Directory:** `publishing/`

1. Navigate to publishing directory:
   ```bash
   cd publishing
   ```

2. Run the build script:
   ```bash
   ./build-production.sh
   ```

3. Enter keystore credentials when prompted:
   - Keystore password: `[YOUR_KEYSTORE_PASSWORD]`
   - Key alias: `[YOUR_KEY_ALIAS]`
   - Key password: `[YOUR_KEY_PASSWORD]`

4. Verify APK was created:
   ```bash
   ls -la NearMe-v*.apk
   ```

**Expected Output:** APK file named `NearMe-v[VERSION]-production.apk` (e.g., `NearMe-v1.0.3-production.apk`)

### Step 3: Update Configuration

**File:** `publishing/config.yaml`

1. Update the APK file reference:
   ```yaml
   files:
     - purpose: install
       uri: NearMe-v1.0.3-production.apk  # Update version
   ```

2. Update the `new_in_version` description:
   ```yaml
   new_in_version: |
     Version 1.0.3 - [Brief description of changes]

     ✨ What's new in this update:
     • [Feature 1]
     • [Feature 2]
     • [Bug fix 1]
     • [Improvement 1]
   ```

3. **Optional:** Update other descriptions if needed:
   - `short_description` (max 30 characters)
   - `long_description` 
   - `saga_features`

### Step 4: Create Release NFT

**Directory:** `publishing/`

1. Create the release NFT on mainnet:
   ```bash
   npx dapp-store create release -k solana-wallet/publisher-keypair.json -u https://api.mainnet-beta.solana.com
   ```

2. **Copy the Release NFT address** from the success output:
   ```
   Release NFT successfully minted:
   https://explorer.solana.com/address/[RELEASE_NFT_ADDRESS]?cluster=mainnet
   ```

**Expected Output:** New Release NFT address and transaction hash

### Step 5: Calculate APK Hash

**Directory:** `publishing/`

1. Calculate the SHA256 hash of the new APK:
   ```bash
   openssl dgst -sha256 -binary NearMe-v1.0.3-production.apk | openssl base64
   ```

2. **Copy the hash output** for the next step

### Step 6: Update Config with Release Details

**File:** `publishing/config.yaml`

Update the following sections with new release information:

1. **Release address:**
   ```yaml
   release:
     address: [NEW_RELEASE_NFT_ADDRESS]  # From Step 4
   ```

2. **Last submitted version:**
   ```yaml
   lastSubmittedVersionOnChain:
     address: [NEW_RELEASE_NFT_ADDRESS]  # From Step 4
     version_code: 4                     # From Step 1
     apk_hash: [APK_HASH]               # From Step 5
   ```

3. **Last updated version:**
   ```yaml
   lastUpdatedVersionOnStore:
     address: [NEW_RELEASE_NFT_ADDRESS]  # From Step 4
   ```

### Step 7: Validate Configuration

**Directory:** `publishing/`

1. Validate the updated configuration:
   ```bash
   npx dapp-store validate -k solana-wallet/publisher-keypair.json
   ```

2. **Expected Output:** "Input data is valid"

**If validation fails:** Fix the errors reported and re-run validation

### Step 8: Submit to dApp Store

**Directory:** `publishing/`

1. Submit the update for review:
   ```bash
   npx dapp-store publish submit -k solana-wallet/publisher-keypair.json -u https://api.mainnet-beta.solana.com --complies-with-solana-dapp-store-policies --requestor-is-authorized
   ```

2. **Expected Output:** Success message with review timeline (1-2 business days for updates)

**If you get "already submitted":** The release was already submitted successfully

### Step 9: Commit and Push Changes

**Directory:** `../` (project root)

1. Stage the changes:
   ```bash
   cd ..
   git add android/app/build.gradle publishing/config.yaml publishing/build-production.sh
   ```

2. Commit with a clear message:
   ```bash
   git commit -m "release: bump version to 1.0.3"
   ```

3. Push to repository:
   ```bash
   git push origin master
   ```

### Step 10: Update Documentation

**Files:** `README.md`, `release.md`

1. Update the README.md status panel with new version info
2. Update release.md with the new release details
3. Commit and push documentation updates

## 🔍 Verification Checklist

After completing the release:

- [ ] APK built successfully with correct version
- [ ] Release NFT created on mainnet
- [ ] Config.yaml updated with all new details
- [ ] Configuration validates without errors
- [ ] Update submitted to dApp Store
- [ ] Code changes committed and pushed
- [ ] Documentation updated

## 📝 Important Notes

### Version Numbering
- **Major releases** (2.0.0): Breaking changes or major new features
- **Minor releases** (1.1.0): New features, backward compatible
- **Patch releases** (1.0.1): Bug fixes, small improvements

### APK Naming Convention
- Format: `NearMe-v[VERSION]-production.apk`
- Example: `NearMe-v1.0.3-production.apk`

### Keystore Security
- Never commit keystore files to git
- Store keystore passwords securely
- Backup keystore file safely

### Publisher Wallet
- Keep publisher wallet funded with ~0.1 SOL
- Never commit private keys to git
- Backup wallet seed phrase securely

### Review Process
- **Initial submissions:** 3-5 business days
- **Updates:** 1-2 business days
- Monitor dApp Store portal for review status

## 🚨 Troubleshooting

### Common Issues

**Build Fails:**
- Check keystore credentials
- Verify Android environment setup
- Check gradle.properties file exists

**Release NFT Creation Fails:**
- Ensure publisher wallet has sufficient SOL
- Check network connectivity
- Verify mainnet URL is correct

**Validation Fails:**
- Check file paths in config.yaml
- Verify all required fields are present
- Ensure URLs are accessible

**Submission Fails:**
- Verify both compliance flags are included
- Check if version was already submitted
- Ensure Release NFT exists on mainnet

### Getting Help

- **Solana dApp Store Docs:** https://docs.solanamobile.com/dapp-publishing
- **Publisher Portal:** https://dapp-publishing.solanamobile.com/
- **Support:** Contact Solana Mobile team through publisher portal

## 📊 Release History Template

Track your releases:

| Version | Release Date | Release NFT | APK Hash | Status |
|---------|-------------|-------------|----------|---------|
| 1.0.3 | 2024-08-05 | `Bmf2uuF7Gat3TsMqXpECspM3ZXoi92ZmSyKBDwSoKxZC` | `HOneNGguunANX7421mHAvynWGh8R93Ld2H8OmZP6W9k=` | Submitted |
| 1.0.2 | 2024-08-05 | `4z5KrFivQmpkjEEFHTVf1jpqf1X3exC1E8xvzVntjjq7` | `VE1xsPnWF2/z5RhBY9CyNJsNRvskawbnWp2lUBHAoBE=` | Approved |
| 1.0.1 | 2024-08-03 | `56LowjT1m8Pzjgyz4zSA6YXHjjz6hwQhC1oE6yF5fJC4` | `[HASH]` | Approved |

---

**Created:** August 5, 2024  
**Last Updated:** August 5, 2024  
**Version:** 1.0.0