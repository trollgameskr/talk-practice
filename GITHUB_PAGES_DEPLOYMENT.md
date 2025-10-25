# GitHub Pages Deployment Guide

This document explains how GeminiTalk is deployed to GitHub Pages.

## 🌐 Live URL

**[https://trollgameskr.github.io/talk-practice/](https://trollgameskr.github.io/talk-practice/)**

## 📋 Overview

GeminiTalk is automatically deployed to GitHub Pages whenever changes are pushed to the `main` branch. The deployment process is fully automated using GitHub Actions.

## 🔧 Configuration

### Webpack Configuration

The `webpack.config.js` has been configured to support GitHub Pages deployment:

```javascript
publicPath: process.env.GITHUB_PAGES ? '/talk-practice/' : '/',
```

When the `GITHUB_PAGES` environment variable is set, the build will use `/talk-practice/` as the base path, which matches the GitHub Pages URL structure.

### GitHub Actions Workflow

The deployment workflow is located at `.github/workflows/deploy-pages.yml` and includes:

1. **Build Job**:
   - Checks out the code
   - Sets up Node.js 18
   - Installs dependencies with `npm ci`
   - Builds the web application with `GITHUB_PAGES=true npm run build:web`
   - Adds a `.nojekyll` file to prevent Jekyll processing
   - Uploads the build artifacts

2. **Deploy Job**:
   - Deploys the artifacts to GitHub Pages
   - Provides the deployment URL

## 🚀 How to Deploy

### Automatic Deployment

1. Make your changes to the code
2. Commit and push to the `main` branch
3. GitHub Actions will automatically build and deploy
4. The site will be available at https://trollgameskr.github.io/talk-practice/

### Manual Deployment

You can also trigger the deployment manually:

1. Go to the repository on GitHub
2. Click on "Actions" tab
3. Select "Deploy to GitHub Pages" workflow
4. Click "Run workflow"
5. Select the `main` branch
6. Click "Run workflow"

## 📦 Build Process

The build process:

1. **Install dependencies**: `npm ci`
2. **Build web app**: `npm run build:web` with `GITHUB_PAGES=true`
3. **Output location**: `web-build/` directory
4. **Assets included**:
   - `index.html` - Main HTML file
   - `bundle.js` - JavaScript bundle
   - `*.png` - Image assets
   - `.nojekyll` - Tells GitHub Pages to serve all files

## 🔍 Local Testing

To test the production build locally:

```bash
# Build with GitHub Pages configuration
GITHUB_PAGES=true npm run build:web

# Serve the build directory
npx serve web-build

# Or use a simple HTTP server
cd web-build
python -m http.server 8000
```

Then open http://localhost:8000 in your browser (without the /talk-practice/ path, as you're serving from the web-build directory root).

## 🛠️ Repository Settings

To enable GitHub Pages for your repository:

1. Go to repository Settings
2. Navigate to "Pages" section
3. Under "Build and deployment":
   - Source: Select "GitHub Actions"
4. The workflow will handle the rest automatically

## ⚠️ Important Notes

1. **Base Path**: All URLs in the app must account for the `/talk-practice/` base path when deployed to GitHub Pages
2. **Jekyll**: The `.nojekyll` file prevents GitHub from processing files through Jekyll
3. **Cache**: Browser cache may need to be cleared to see updates after deployment
4. **HTTPS**: GitHub Pages serves sites over HTTPS by default

## 🐛 Troubleshooting

### Assets not loading

**Issue**: CSS, JavaScript, or images not loading  
**Solution**: Ensure webpack's `publicPath` is correctly set to `/talk-practice/`

### 404 errors

**Issue**: Getting 404 errors when refreshing the page  
**Solution**: This is a known limitation of GitHub Pages for SPAs with client-side routing. The `.nojekyll` file prevents Jekyll processing but doesn't solve client-side routing 404s. For a complete solution, you would need to:
- Create a custom 404.html page that redirects to index.html
- Configure the app to handle routing properly
- Consider using hash-based routing instead of browser history API

### Deployment fails

**Issue**: GitHub Actions workflow fails  
**Solution**: 
- Check the Actions log for specific errors
- Ensure all dependencies are in `package.json`
- Verify that the build works locally with `npm run build:web`

### Old version still showing

**Issue**: Updates not visible after deployment  
**Solution**: 
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check the deployment status in GitHub Actions
- Verify the latest commit triggered the workflow

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Webpack Documentation](https://webpack.js.org/)

## 🎉 Success Indicators

After deployment, you should see:

1. ✅ Green checkmark on the GitHub Actions workflow
2. ✅ Deployment environment listed in the repository's "Environments" section
3. ✅ Live site accessible at https://trollgameskr.github.io/talk-practice/
4. ✅ All assets loading correctly (check browser console)

---

For more information, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
