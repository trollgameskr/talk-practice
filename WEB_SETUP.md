# GeminiTalk Web Version Setup Guide

## 🌐 Windows OS에서 웹으로 접근하기 (Windows OS Web Access)

이제 GeminiTalk를 Windows OS의 웹 브라우저에서 바로 사용할 수 있습니다!  
You can now use GeminiTalk directly in your Windows web browser!

## 📋 Prerequisites (필수 요구사항)

- Node.js 16 이상 (16 or higher)
- 최신 웹 브라우저 (Chrome, Edge, Firefox 등)
- Modern web browser (Chrome, Edge, Firefox, etc.)
- Gemini API 키 ([Google AI Studio](https://makersuite.google.com/app/apikey)에서 발급)

## 🚀 Quick Start (빠른 시작)

### 1. 저장소 클론 (Clone Repository)

```bash
git clone https://github.com/trollgameskr/talk-practice.git
cd talk-practice
```

### 2. 의존성 설치 (Install Dependencies)

```bash
npm install
```

### 3. 웹 개발 서버 시작 (Start Web Development Server)

```bash
npm run web
```

서버가 시작되면 브라우저에서 자동으로 열립니다.  
The server will start and your browser will open automatically.

기본 주소: **http://localhost:3000**

**포트 3000이 사용 중인 경우:**  
If port 3000 is already in use:

```bash
# Use a different port
PORT=3001 npm run web

# Or create a .env file with:
# PORT=3001
```

### 4. API 키 설정 (Configure API Key)

1. 웹 앱이 열리면 Settings (⚙️) 메뉴로 이동
2. Gemini API Key 입력란에 API 키 입력
3. "Save API Key" 버튼 클릭
4. 이제 대화를 시작할 수 있습니다!

## 🏗️ Production Build (프로덕션 빌드)

웹사이트를 배포하려면 프로덕션 빌드를 생성하세요:

```bash
npm run build:web
```

빌드된 파일은 `web-build/` 디렉토리에 생성됩니다.

## 📱 Web Features (웹 기능)

### ✅ 지원되는 기능 (Supported Features)

- ✅ 모든 화면 및 내비게이션 (All screens and navigation)
- ✅ 주제 선택 (Topic selection)
- ✅ 설정 관리 (Settings management)
- ✅ 데이터 저장 (Data storage via localStorage)
- ✅ 음성 인식 (Speech recognition via Web Speech API)
- ✅ 텍스트 음성 변환 (Text-to-speech via Web Speech Synthesis API)
- ✅ 진도 추적 (Progress tracking)
- ✅ 반응형 디자인 (Responsive design)

### 🎤 Web Speech API

웹 버전은 브라우저의 내장 Web Speech API를 사용합니다:

- **음성 인식**: 브라우저의 SpeechRecognition API
- **음성 합성**: 브라우저의 SpeechSynthesis API

**주의**: 처음 마이크 사용 시 브라우저에서 권한을 요청합니다.

## 🌐 Browser Compatibility (브라우저 호환성)

| Browser | Speech Recognition | Speech Synthesis |
|---------|-------------------|------------------|
| Chrome  | ✅ Full Support    | ✅ Full Support  |
| Edge    | ✅ Full Support    | ✅ Full Support  |
| Firefox | ⚠️ Limited         | ✅ Full Support  |
| Safari  | ⚠️ Limited         | ✅ Full Support  |

**권장 브라우저**: Google Chrome 또는 Microsoft Edge (Recommended: Google Chrome or Microsoft Edge)

## 🔧 Configuration (설정)

### Environment Variables (환경 변수)

프로덕션 배포 시 환경 변수를 설정할 수 있습니다:

```bash
# .env 파일 생성
GEMINI_API_KEY=your_api_key_here
```

**보안 주의사항**: 프론트엔드 코드에 API 키를 하드코딩하지 마세요. 프로덕션 환경에서는 백엔드 서버를 통해 API를 호출하는 것을 권장합니다.

## 📦 Deployment (배포)

### Static Hosting (정적 호스팅)

빌드된 `web-build/` 디렉토리를 다음 서비스에 배포할 수 있습니다:

- **Netlify**
- **Vercel**
- **GitHub Pages**
- **Firebase Hosting**
- **AWS S3 + CloudFront**

### Example: Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build:web

# Deploy
netlify deploy --prod --dir=web-build
```

## 🎯 Usage Instructions (사용 방법)

### 1. 홈 화면 (Home Screen)

- 현재 학습 통계 확인
- 세 가지 주요 버튼:
  - 🎯 **Start Practice**: 대화 연습 시작
  - 📊 **View Progress**: 학습 진도 확인
  - ⚙️ **Settings**: 설정 및 API 키 관리

### 2. 주제 선택 (Topic Selection)

5가지 대화 주제 중 선택:
- 🏠 일상 대화 (Daily Conversation)
- ✈️ 여행 영어 (Travel English)
- 💼 비즈니스 영어 (Business English)
- 😊 캐주얼 대화 (Casual Chat)
- 👔 전문직 커뮤니케이션 (Professional Communication)

### 3. 대화 연습 (Conversation Practice)

- 마이크 버튼을 클릭하여 말하기 시작
- AI가 실시간으로 응답
- 대화 종료 후 상세한 피드백 확인

### 4. 진도 확인 (Progress Tracking)

- 총 세션 수
- 연습 시간
- 전체 점수
- 주제별 통계

## 🐛 Troubleshooting (문제 해결)

### 마이크가 작동하지 않음

1. 브라우저에서 마이크 권한 허용 확인
2. 시스템 설정에서 마이크 활성화 확인
3. Chrome://settings/content/microphone 에서 권한 확인

### API 키 오류

1. API 키가 올바르게 입력되었는지 확인
2. Google AI Studio에서 API 키 활성화 상태 확인
3. API 사용량 제한 확인

### 빌드 오류

```bash
# 캐시 정리
rm -rf node_modules package-lock.json
npm install

# 재빌드
npm run build:web
```

## 📚 Additional Resources (추가 자료)

- [Main README](./README.md)
- [API Documentation](./docs/API.md)
- [Setup Guide](./docs/SETUP.md)
- [Web Speech API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 🤝 Contributing (기여하기)

웹 버전 개선에 기여하고 싶으시다면:

1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Test on multiple browsers
5. Submit a pull request

## 📄 License

MIT License - See [LICENSE](./LICENSE) file for details

---

**Made with ❤️ for English learners worldwide**  
**Windows OS 사용자를 위한 편리한 웹 접근!**
