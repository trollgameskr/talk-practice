# Deployment Guide

This guide covers deploying GeminiTalk to various platforms.

## Table of Contents
- [GitHub Pages Deployment (Web)](#github-pages-deployment-web)
- [Android Deployment](#android-deployment)
- [iOS Deployment](#ios-deployment)
- [Environment Configuration](#environment-configuration)
- [CI/CD Setup](#cicd-setup)
- [Release Process](#release-process)

## GitHub Pages Deployment (Web)

GeminiTalk can be deployed as a web application using GitHub Pages.

### Automatic Deployment

The repository is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

**Live URL**: [https://trollgameskr.github.io/talk-practice/](https://trollgameskr.github.io/talk-practice/)

### How It Works

1. **GitHub Actions Workflow** (`.github/workflows/deploy-pages.yml`):
   - Triggers on push to `main` branch
   - Installs dependencies
   - Builds the web application with `npm run build:web`
   - Uploads the build to GitHub Pages
   - Deploys automatically

2. **Build Configuration**:
   - Webpack is configured to use `/talk-practice/` as the base path
   - The `GITHUB_PAGES` environment variable enables the correct publicPath
   - Production build is optimized and minified

### Manual Deployment

If you need to deploy manually:

1. **Build the web application**:
   ```bash
   GITHUB_PAGES=true npm run build:web
   ```

2. **The output will be in the `web-build/` directory**

3. **Deploy using GitHub Pages**:
   - Go to repository Settings > Pages
   - Select "GitHub Actions" as the source
   - The workflow will handle deployment automatically

### Local Testing

To test the production build locally:

```bash
# Build for GitHub Pages
GITHUB_PAGES=true npm run build:web

# Serve the build directory
npx serve web-build
```

### Configuration

The web version is configured in:
- `webpack.config.js`: Build configuration
- `.github/workflows/deploy-pages.yml`: Deployment workflow
- `public/index.html`: HTML template

### Requirements

- Node.js 18 or higher
- GitHub repository with Pages enabled
- GitHub Actions enabled in repository settings

### Troubleshooting

**Issue**: Assets not loading
- **Solution**: Ensure the `publicPath` in `webpack.config.js` matches your repository name

**Issue**: 404 errors on page refresh
- **Solution**: The workflow includes a `.nojekyll` file to prevent Jekyll processing

**Issue**: Build fails in GitHub Actions
- **Solution**: Check the Actions logs and ensure all dependencies are properly listed in `package.json`

## Android Deployment

### Prerequisites
- Android Studio installed
- Java Development Kit (JDK) 17 or higher
- Android SDK with appropriate API levels
- Signing keystore for release builds

### Development Build

1. **Start Metro bundler**
   ```bash
   npm start
   ```

2. **Run on device/emulator**
   ```bash
   npm run android
   ```

### Release Build

1. **Generate signing key**
   ```bash
   cd android/app
   keytool -genkeypair -v -storetype PKCS12 -keystore gemini-talk-release.keystore -alias gemini-talk -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Configure gradle.properties**
   Create `android/gradle.properties`:
   ```properties
   GEMINI_TALK_UPLOAD_STORE_FILE=gemini-talk-release.keystore
   GEMINI_TALK_UPLOAD_KEY_ALIAS=gemini-talk
   GEMINI_TALK_UPLOAD_STORE_PASSWORD=your_keystore_password
   GEMINI_TALK_UPLOAD_KEY_PASSWORD=your_key_password
   ```

3. **Build release APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. **Build release Bundle (for Play Store)**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

5. **Output location**
   - APK: `android/app/build/outputs/apk/release/app-release.apk`
   - Bundle: `android/app/build/outputs/bundle/release/app-release.aab`

### Publishing to Google Play Store

1. **Prepare store listing**
   - App name: GeminiTalk
   - Description: (Use README description)
   - Screenshots: Prepare 2-8 screenshots
   - Icon: High-res 512x512 PNG

2. **Upload to Play Console**
   - Go to Google Play Console
   - Create new application
   - Upload AAB file
   - Complete store listing
   - Submit for review

3. **Update versions**
   Edit `android/app/build.gradle`:
   ```gradle
   android {
       defaultConfig {
           versionCode 2
           versionName "1.0.1"
       }
   }
   ```

## iOS Deployment

### Prerequisites
- macOS with Xcode installed
- Apple Developer account
- CocoaPods installed
- Valid provisioning profiles and certificates

### Development Build

1. **Install pods**
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Run on simulator**
   ```bash
   npm run ios
   ```

3. **Run on device**
   - Open `ios/GeminiTalk.xcworkspace` in Xcode
   - Select your device
   - Click Run

### Release Build

1. **Configure signing**
   - Open project in Xcode
   - Select target
   - Go to Signing & Capabilities
   - Enable "Automatically manage signing"
   - Select your team

2. **Archive the app**
   - Product > Archive
   - Wait for archive to complete
   - Organizer window will open

3. **Distribute to App Store**
   - Click "Distribute App"
   - Select "App Store Connect"
   - Follow the wizard
   - Upload to TestFlight

4. **Update versions**
   Edit `ios/GeminiTalk/Info.plist`:
   ```xml
   <key>CFBundleShortVersionString</key>
   <string>1.0.1</string>
   <key>CFBundleVersion</key>
   <string>2</string>
   ```

### Publishing to App Store

1. **Prepare App Store listing**
   - Go to App Store Connect
   - Create new app
   - Fill in metadata
   - Upload screenshots
   - Add description

2. **Submit for review**
   - Select build from TestFlight
   - Complete all required information
   - Submit for review

## Environment Configuration

### Development

Create `.env.development`:
```env
GEMINI_API_KEY=your_dev_api_key
NODE_ENV=development
API_BASE_URL=https://dev-api.example.com
```

### Production

Create `.env.production`:
```env
GEMINI_API_KEY=your_prod_api_key
NODE_ENV=production
API_BASE_URL=https://api.example.com
```

### Environment Variables

Configure these in your CI/CD:
- `GEMINI_API_KEY`: Gemini API key
- `ANDROID_KEYSTORE_PASSWORD`: Android keystore password
- `ANDROID_KEY_PASSWORD`: Android key password
- `IOS_CERTIFICATE_PASSWORD`: iOS certificate password

## CI/CD Setup

### GitHub Actions

The project includes automated CI/CD in `.github/workflows/ci.yml`:

- **Lint**: Code quality checks
- **Type Check**: TypeScript validation
- **Test**: Run test suite
- **Build**: Create Android/iOS builds
- **Deploy**: Automated deployment

### Secrets Configuration

Add these secrets in GitHub Settings > Secrets:

```
GEMINI_API_KEY
ANDROID_KEYSTORE_BASE64
ANDROID_KEYSTORE_PASSWORD
ANDROID_KEY_PASSWORD
IOS_CERTIFICATE_BASE64
IOS_CERTIFICATE_PASSWORD
APPLE_ID
APPLE_TEAM_ID
```

### Automated Releases

1. **Tag a release**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

2. **GitHub Actions will**
   - Run all tests
   - Build Android APK/AAB
   - Build iOS Archive
   - Create GitHub Release
   - Upload artifacts

## Release Process

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes

Example: `1.2.3`
- 1 = Major version
- 2 = Minor version
- 3 = Patch version

### Release Checklist

- [ ] Update version numbers
  - [ ] `package.json`
  - [ ] `android/app/build.gradle`
  - [ ] `ios/GeminiTalk/Info.plist`
- [ ] Update CHANGELOG.md
- [ ] Run full test suite
- [ ] Build and test locally
- [ ] Create git tag
- [ ] Push to GitHub
- [ ] Wait for CI/CD to pass
- [ ] Create GitHub Release
- [ ] Submit to app stores
- [ ] Announce release

### Rollback Procedure

If issues are found after release:

1. **Emergency fix**
   ```bash
   git checkout -b hotfix/issue-name
   # Make fixes
   git commit -m "fix: critical issue"
   git push origin hotfix/issue-name
   ```

2. **Fast-track testing**
3. **Create patch release**
4. **Deploy immediately**

### Beta Testing

#### Android Beta (Google Play)
1. Upload to Play Console
2. Choose "Internal testing" or "Closed testing"
3. Add testers
4. Share testing link

#### iOS Beta (TestFlight)
1. Upload to TestFlight
2. Add internal testers (automatically)
3. Add external testers (requires review)
4. Share TestFlight link

## Monitoring

### Crash Reporting

Consider integrating:
- Firebase Crashlytics
- Sentry
- Bugsnag

### Analytics

Track user behavior with:
- Firebase Analytics
- Mixpanel
- Amplitude

### Performance Monitoring

Monitor app performance:
- Firebase Performance
- New Relic
- Datadog

## Maintenance

### Regular Updates
- Update dependencies monthly
- Patch security vulnerabilities immediately
- Test on new OS versions
- Monitor app store reviews

### Support
- Respond to user feedback
- Track and fix reported bugs
- Release patches as needed
- Maintain documentation

## Troubleshooting

### Common Build Issues

**Android:**
```bash
# Clean build
cd android && ./gradlew clean

# Clear cache
cd .. && npm start -- --reset-cache

# Rebuild
npm run android
```

**iOS:**
```bash
# Clean build
cd ios && xcodebuild clean

# Reinstall pods
rm -rf Pods Podfile.lock
pod install

# Rebuild
cd .. && npm run ios
```

### Release Build Issues

**Android signing:**
- Verify keystore path and passwords
- Check gradle.properties configuration
- Ensure signing config in build.gradle

**iOS provisioning:**
- Check certificate validity
- Verify provisioning profile
- Ensure bundle ID matches

## Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Android Developer Guide](https://developer.android.com/distribute)
- [iOS Developer Guide](https://developer.apple.com/app-store/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
