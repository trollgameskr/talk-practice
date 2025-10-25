# Troubleshooting Guide

This document contains solutions to common issues you might encounter when running GeminiTalk.

## Table of Contents
- [404 Errors for JavaScript Files](#404-errors-for-javascript-files)
- [Service Worker Issues](#service-worker-issues)
- [Build Issues](#build-issues)

## 404 Errors for JavaScript Files

### Symptom
When loading the app in your browser, you see errors like:
```
Failed to load resource: the server responded with a status of 404 (Not Found)
runtime.js:1 Failed to load resource: the server responded with a status of 404 (Not Found)
vendors.js:1 Failed to load resource: the server responded with a status of 404 (Not Found)
main.js:1 Failed to load resource: the server responded with a status of 404 (Not Found)
Refused to execute script from 'http://localhost:3000/runtime.js' because its MIME type ('text/html') is not executable
```

### Cause
This issue occurs when your browser or service worker has cached an old version of the application that referenced different JavaScript files. The current version of GeminiTalk uses a single `bundle.js` file, but older versions may have used code-splitting with separate `runtime.js`, `vendors.js`, and `main.js` files.

### Solution

#### Option 1: Clear Cache via Browser (Quick Fix)
1. Open your browser's Developer Tools (F12 or Cmd+Option+I on Mac)
2. Go to the "Application" tab (Chrome) or "Storage" tab (Firefox)
3. In the left sidebar, find "Cache Storage" and "Service Workers"
4. Delete all caches and unregister all service workers
5. Hard reload the page (Ctrl+Shift+R or Cmd+Shift+R on Mac)

#### Option 2: Use the Cache Clearing Utility
1. Navigate to `http://localhost:3000/clear-cache.html`
2. Click "Clear Everything & Reload"
3. The page will automatically reload with fresh content

#### Option 3: Manual Browser Cache Clear
1. **Chrome/Edge**:
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Select "Cached images and files"
   - Select "All time" as the time range
   - Click "Clear data"

2. **Firefox**:
   - Press Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Check "Cache"
   - Select "Everything" as the time range
   - Click "Clear Now"

3. **Safari**:
   - Go to Safari > Preferences > Advanced
   - Enable "Show Develop menu in menu bar"
   - Go to Develop > Empty Caches

#### Option 4: Rebuild and Restart Dev Server
If you're running the development server:
```bash
# Stop the dev server (Ctrl+C)
# Clear the build directory
rm -rf web-build

# Rebuild
npm run build:web

# Restart dev server
npm run web
```

### Prevention
The application now automatically:
- Clears old caches when a new version is deployed
- Immediately activates new service workers
- Auto-reloads the page when updates are available

These improvements should prevent this issue from occurring in the future.

## Service Worker Issues

### Service Worker Not Updating
If the service worker doesn't seem to update with new code:

1. Navigate to `http://localhost:3000/clear-cache.html`
2. Click "Unregister Service Worker"
3. Reload the page

Or manually:
1. Open Developer Tools > Application > Service Workers
2. Click "Unregister" next to the service worker
3. Reload the page

### Service Worker Causing Reload Loops
If you experience infinite reload loops:

1. **Disable service worker during development** (if needed):
   - Edit `public/index.html`
   - Comment out or modify the service worker registration code
   - This is only recommended during development

2. **Clear all service workers and caches**:
   - Navigate to `http://localhost:3000/clear-cache.html`
   - Click "Clear Everything & Reload"

## Build Issues

### Webpack Build Fails
If the webpack build fails:

```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf web-build

# Try building again
npm run build:web
```

### Module Not Found Errors
If you see errors about missing modules:

```bash
# Make sure all dependencies are installed
npm install

# Check for platform-specific dependencies
# For React Native modules, ensure you have the correct shims in place
```

### TypeScript Errors
If you see TypeScript compilation errors:

```bash
# Run type checking
npm run type-check

# This will show detailed type errors that need to be fixed
```

## Getting More Help

If none of these solutions work:

1. Check the [GitHub Issues](https://github.com/trollgameskr/talk-practice/issues) for similar problems
2. Create a new issue with:
   - Your browser and version
   - Operating system
   - Steps to reproduce the issue
   - Console error messages (from browser Developer Tools)
   - Network tab showing failed requests

## Additional Resources

- [Web Setup Guide](./WEB_SETUP.md)
- [PWA Implementation Details](./PWA_IMPLEMENTATION.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
