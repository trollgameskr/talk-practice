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
const BASE_PATH = process.env.GITHUB_PAGES ? '/talk-practice' : '';

module.exports = {
  output: {
    publicPath: BASE_PATH ? BASE_PATH + '/' : '/',
  },
  plugins: [
    new webpack.DefinePlugin({
      __BASE_PATH__: JSON.stringify(BASE_PATH),
    }),
  ],
};
```

When the `GITHUB_PAGES` environment variable is set, the build will:
- Use `/talk-practice/` as the base path in `publicPath`
- Inject `__BASE_PATH__` constant into the bundle for runtime use
- Update `manifest.json` with correct `start_url` and `scope`
- Process `404.html` with the correct base path

### HTML Base Tag

**중요 변경사항**: 이제 HTML `<base>` 태그를 사용하여 basePath를 처리합니다.

`public/index.html`에 추가된 `<base>` 태그:

```html
<base href="/talk-practice/">
```

이 태그는 브라우저에게 모든 상대 경로(리소스, 링크, 히스토리 API)를 해석할 때 사용할 기준 URL을 알려줍니다.

**장점**:
- 브라우저가 자동으로 모든 상대 경로를 basePath 기준으로 해석
- React Navigation이 basePath를 제거할 필요 없음
- 코드가 더 단순하고 표준 웹 기술 활용

### React Navigation Configuration

The app uses standard linking configuration in `src/utils/HistoryRouter.ts`:

```typescript
export const linkingConfig = {
  prefixes: [
    'https://trollgameskr.github.io/talk-practice/',
    'http://localhost:3000',
    'gemini-talk://',
  ],
  config: { /* screen mappings */ },
};
```

`<base>` 태그 덕분에 React Navigation은 복잡한 basePath 처리 로직 없이 표준 설정만으로 작동합니다.

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
   - `404.html` - SPA routing fallback
   - `bundle.js` - JavaScript bundle
   - `*.png` - Image assets
   - `.nojekyll` - Tells GitHub Pages to serve all files

## 🔄 Client-Side Routing

GeminiTalk는 브라우저 History API를 사용한 클라이언트 사이드 라우팅을 지원합니다:

### URL 구조

모든 화면이 고유한 URL을 가지며, 직접 접근 및 북마크가 가능합니다:

- `/talk-practice/` - 홈 화면
- `/talk-practice/topics` - 주제 선택
- `/talk-practice/conversation/:topic` - 대화 화면 (예: `/talk-practice/conversation/daily`)
- `/talk-practice/progress` - 진도 확인
- `/talk-practice/settings` - 설정
- `/talk-practice/settings/appearance` - 외관 설정
- `/talk-practice/settings/language` - 언어 설정
- `/talk-practice/settings/:category` - 기타 설정 카테고리
- `/talk-practice/feedback/:sessionId` - 피드백 화면

**참고**: 모든 URL은 GitHub Pages 프로젝트 페이지 베이스 경로 `/talk-practice/`를 포함합니다.

### 베이스 경로 처리

GitHub Pages 프로젝트 페이지는 `/<owner>/<repo>/` 형식의 베이스 경로를 사용합니다. 이 앱은 HTML `<base>` 태그를 사용하여 베이스 경로를 처리합니다:

1. **빌드 타임**: Webpack이 `index.html`에 `<base href="/talk-practice/">` 태그를 주입
2. **브라우저**: `<base>` 태그 덕분에 모든 상대 경로(리소스, 링크, 히스토리 API)를 `/talk-practice/` 기준으로 자동 해석
3. **React Navigation**: 표준 linking 설정만 사용 - 브라우저가 basePath를 자동으로 처리
4. **결과**: 브라우저 주소창에 항상 `/talk-practice/` prefix가 자연스럽게 유지됨

### 뒤로가기 동작

- 브라우저 뒤로가기 버튼 또는 Alt+← 사용
- 안드로이드 뒤로가기 제스처/버튼 지원
- React Navigation stack과 브라우저 히스토리 자동 동기화
- 외부 사이트로 이탈하지 않고 이전 화면으로 이동
- 베이스 경로 `/talk-practice/`는 모든 네비게이션에서 유지됨

### 404 Fallback 처리

GitHub Pages는 정적 호스팅이므로 직접 URL 접근 시 404 에러가 발생할 수 있습니다.
이를 해결하기 위해 다음과 같은 메커니즘을 구현했습니다:

1. `404.html`: 요청된 경로를 sessionStorage에 저장하고 index.html로 리다이렉션
2. `index.html`: 저장된 경로를 복원하여 History API에 등록
3. React Navigation: 복원된 URL을 읽어 올바른 화면 렌더링

이를 통해 다음 기능들이 정상 작동합니다:
- 직접 URL 접근 (예: `/topics` 입력 시 주제 선택 화면 표시)
- 페이지 새로고침 (F5) 시 현재 화면 유지
- URL 북마크 및 공유
- 브라우저 앞으로가기/뒤로가기

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

### Enable GitHub Pages

To enable GitHub Pages for your repository:

1. Go to repository Settings
2. Navigate to "Pages" section
3. Under "Build and deployment":
   - Source: Select "GitHub Actions"
4. The workflow will handle the rest automatically

### Configure Firebase (Optional but Recommended)

To enable Firebase features (authentication, cloud storage, cross-device sync):

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret** and add each of the following secrets:
   - `FIREBASE_API_KEY` - Your Firebase API key
   - `FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain (e.g., `your-project.firebaseapp.com`)
   - `FIREBASE_PROJECT_ID` - Your Firebase project ID
   - `FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket (e.g., `your-project.appspot.com`)
   - `FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
   - `FIREBASE_APP_ID` - Your Firebase app ID

To get these values, follow the [Firebase Setup Guide](./docs/FIREBASE_SETUP.md).

**Note**: If Firebase secrets are not configured, the app will run in local-only mode with a console warning: "Firebase is not configured. App will run with local storage only." The app will function normally but without cloud features.

## ⚠️ Important Notes

1. **Base Path**: HTML `<base>` 태그를 사용하여 `/talk-practice/` base path를 처리합니다
   - `<base href="/talk-practice/">` 태그가 모든 상대 경로의 기준점 설정
   - React Navigation은 표준 설정만 사용 - 브라우저가 자동으로 basePath 처리
   - 모든 히스토리 API 호출이 자동으로 basePath 포함
   - 브라우저 주소창에 항상 `/talk-practice/` prefix 표시
2. **Jekyll**: The `.nojekyll` file prevents GitHub from processing files through Jekyll
3. **Cache**: Browser cache may need to be cleared to see updates after deployment
4. **HTTPS**: GitHub Pages serves sites over HTTPS by default
5. **Manifest**: The `manifest.json` is automatically updated during build with correct `start_url` and `scope` for PWA support

## 🐛 Troubleshooting

### Assets not loading

**Issue**: CSS, JavaScript, or images not loading  
**Solution**: ✅ **이제 자동으로 처리됩니다!** Webpack의 `publicPath`가 빌드 시 자동으로 `/talk-practice/`로 설정됩니다.

### URL에서 베이스 경로가 사라짐

**Issue**: `/talk-practice/`로 접근했는데 브라우저 주소가 `/`로 변경됨  
**Solution**: ✅ **해결되었습니다!** HTML `<base>` 태그를 사용하여 브라우저가 자동으로 basePath를 유지합니다:
- `<base href="/talk-practice/">` 태그가 모든 상대 경로의 기준점 설정
- React Navigation이 표준 linking 설정만 사용 - 복잡한 커스텀 로직 불필요
- 브라우저 히스토리 API가 자동으로 basePath 포함
- 브라우저 주소창에 항상 `/talk-practice/` prefix가 표시됨

### 404 errors

**Issue**: Getting 404 errors when refreshing the page  
**Solution**: ✅ **이제 해결되었습니다!** 클라이언트 사이드 라우팅을 위한 404.html fallback이 구현되어 있습니다:
- `404.html` 파일이 직접 URL 접근 시 요청된 경로를 저장하고 index.html로 리다이렉션
- `index.html`이 저장된 경로를 복원하여 React Navigation이 올바른 화면을 렌더링
- 새로고침(F5) 시 현재 화면 유지
- 브라우저 뒤로가기/앞으로가기 정상 작동
- URL 북마크 및 직접 접근 지원

**동작 방식**:
1. 사용자가 `/talk-practice/topics` 직접 접근
2. GitHub Pages가 404.html 제공
3. 404.html이 `/topics` 경로를 sessionStorage에 저장
4. `/talk-practice/` (index.html)로 리다이렉션
5. index.html이 저장된 경로 복원 (History API 사용)
6. `<base>` 태그 덕분에 브라우저가 자동으로 `/talk-practice/topics`로 해석
7. React Navigation이 올바른 화면(TopicSelection) 렌더링

**베이스 경로 유지**:
- `<base>` 태그가 모든 히스토리 API 호출에 basePath를 자동 적용
- 내부 링크 클릭, 뒤로가기/앞으로가기 모두 자동으로 `/talk-practice/` prefix 유지
- React Navigation과 브라우저 히스토리가 자연스럽게 동기화

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
