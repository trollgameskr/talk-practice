# GeminiTalk - 실시간 영어 회화 코치

> Real-time English Conversation Coach powered by Gemini Live API

[![CI/CD Pipeline](https://github.com/trollgameskr/talk-practice/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/trollgameskr/talk-practice/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 개요 (Overview)

GeminiTalk는 Google의 Gemini Live API를 활용한 실시간 영어 회화 연습 앱입니다. AI와의 자연스러운 대화를 통해 영어 실력을 향상시키고, 발음·문법 피드백을 실시간으로 받을 수 있습니다.

GeminiTalk is a real-time English conversation practice app powered by Google's Gemini Live API. Improve your English skills through natural conversations with AI and receive instant feedback on pronunciation and grammar.

## ✨ 주요 기능 (Key Features)

### 🎤 실시간 음성 대화 (Real-time Voice Conversation)
- Gemini Live API 기반 실시간 음성 인식 및 응답
- 자연스러운 대화 흐름을 위한 TTS(Text-to-Speech) 지원
- 실시간 음성 녹음 및 텍스트 변환

### 📚 다양한 회화 주제 (Multiple Topics)
- **일상 대화** (Daily): 일상생활, 취미, 날씨 등
- **여행 영어** (Travel): 호텔 예약, 길 찾기, 주문하기 등
- **비즈니스** (Business): 회의, 프레젠테이션, 협상 등
- **캐주얼** (Casual): 영화, 음악, 스포츠 등
- **전문직** (Professional): 업무 커뮤니케이션, 팀워크 등

### 📊 실시간 피드백 (Instant Feedback)
- **발음 분석**: 발음 정확도 측정 및 개선점 제안
- **문법 교정**: 실시간 문법 오류 감지 및 수정
- **유창성 평가**: 대화 흐름 및 자연스러움 점수
- **어휘 제안**: 더 나은 단어 선택 및 표현 제안

### 📈 학습 진도 관리 (Progress Tracking)
- 모든 대화 세션 자동 저장
- 주제별/시간별 진도 통계
- 성취도 배지 시스템
- 학습 일관성 분석 (Retention Rate)

### 🔐 Firebase 통합 (Firebase Integration) - **NEW!**
- **사용자 인증**: 이메일/비밀번호 기반 로그인 및 회원가입
- **클라우드 저장**: 대화 기록 및 학습 진도를 클라우드에 안전하게 저장
- **토큰 사용량 추적**: API 사용량 및 비용을 실시간으로 모니터링
- **다중 기기 동기화**: 모든 기기에서 데이터 자동 동기화
- 자세한 설정 방법은 [Firebase Setup Guide](./docs/FIREBASE_SETUP.md) 참조

## 🚀 시작하기 (Getting Started)

### 🌐 온라인 웹 버전 (Online Web Version) - **LIVE!**

**GitHub Pages에서 바로 사용할 수 있습니다!**  
Directly available on GitHub Pages!

🔗 **[https://trollgameskr.github.io/talk-practice/](https://trollgameskr.github.io/talk-practice/)**

별도의 설치 없이 브라우저에서 바로 접속하여 사용하실 수 있습니다.  
Access directly from your browser without any installation.

### 📱 모바일에서 바로 사용하기 (Mobile Access) - **NEW!**

**모바일 기기에서 앱처럼 사용하세요!**  
Use it like a native app on your mobile device!

#### 📲 설치 방법 (Installation Guide)

**iOS (iPhone/iPad):**
1. Safari 브라우저로 https://trollgameskr.github.io/talk-practice/ 접속
2. 하단 공유 버튼(□↑) 탭
3. "홈 화면에 추가" 선택
4. "추가" 탭하여 설치 완료
5. 홈 화면의 GeminiTalk 아이콘으로 앱 실행!

**Android:**
1. Chrome 브라우저로 https://trollgameskr.github.io/talk-practice/ 접속
2. 메뉴(⋮) → "홈 화면에 추가" 또는 "앱 설치" 선택
3. "설치" 탭하여 완료
4. 홈 화면 또는 앱 서랍의 GeminiTalk 아이콘으로 앱 실행!

**주요 기능:**
- 📱 앱처럼 전체 화면으로 실행
- 🔄 오프라인에서도 기본 기능 사용 가능
- 🚀 빠른 로딩과 부드러운 성능
- 🏠 홈 화면에서 바로 실행

**참고사항:**
- ✅ **TTS (Text-to-Speech) 지원**: GitHub Pages 버전에서 AI 음성 합성(TTS) 기능이 이제 지원됩니다! Google Cloud Text-to-Speech Neural2 API를 직접 사용합니다.
- ✅ 음성 인식 및 텍스트 기반 대화는 정상적으로 작동합니다.
- ℹ️ TTS 기능의 보안 및 설정에 대한 자세한 내용은 [Direct TTS API 문서](./docs/DIRECT_TTS_API.md)를 참조하세요.

### 💻 로컬 웹 버전 (Local Web Version)

**Windows OS 사용자를 위한 웹 버전이 추가되었습니다!**  
Web version now available for Windows OS users!

브라우저에서 바로 사용하기:

```bash
# 저장소 클론
git clone https://github.com/trollgameskr/talk-practice.git
cd talk-practice

# 의존성 설치
npm install

# 웹 버전 실행
npm run web
```

웹 버전은 http://localhost:3000 에서 실행됩니다.  
자세한 사용법은 [WEB_SETUP.md](./WEB_SETUP.md)를 참조하세요.

**AI 음성 합성(TTS) 사용하기:**  
AI 음성 합성을 사용하려면 Settings에서 본인의 Google Cloud TTS API Key를 입력하세요:

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 무료 API 키 발급
2. 앱의 Settings → TTS API Configuration에서 키 입력
3. Gemini API Key와 동일한 키를 사용할 수 있습니다

**로컬 개발자를 위한 선택사항:**  
개발 환경에서는 프록시 서버를 사용할 수도 있습니다:
```bash
# 별도 터미널에서 프록시 서버 실행
npm run proxy
```

자세한 내용은 [Direct TTS API 문서](./docs/DIRECT_TTS_API.md)를 참조하세요.

### 📱 모바일 앱 (Mobile App)

#### 필수 요구사항 (Prerequisites)
- Node.js 18 이상 (16+ 호환)
- React Native 개발 환경
- Gemini API 키 ([Google AI Studio](https://makersuite.google.com/app/apikey)에서 발급)

#### 설치 (Installation)

```bash
# 저장소 클론
git clone https://github.com/trollgameskr/talk-practice.git
cd talk-practice

# 의존성 설치
npm install

# iOS 설정 (Mac only)
cd ios && pod install && cd ..

# 앱 실행
npm run ios    # iOS
npm run android # Android
```

### API 키 설정 (API Key Configuration)

#### Gemini API 키
1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 Gemini API 키 발급
2. 앱 실행 후 설정(Settings) 화면에서 API 키 입력

#### TTS API 키 (선택사항)
AI 음성 합성 기능을 사용하려면:
1. 위와 동일한 Gemini API 키를 사용하거나, 별도의 Google Cloud TTS API 키 사용
2. 앱의 설정(Settings) 화면 → TTS API Configuration에서 키 입력
3. TTS 키가 없어도 텍스트 기반 대화는 정상적으로 작동합니다

#### Firebase 설정 (선택사항)
Firebase를 사용하면 클라우드 저장 및 다중 기기 동기화가 가능합니다.

1. [Firebase Setup Guide](./docs/FIREBASE_SETUP.md)를 따라 Firebase 프로젝트 생성
2. Firebase 설정 정보를 `.env` 파일에 추가
3. 앱 실행 후 로그인 화면에서 계정 생성 또는 로그인

**참고**: Firebase 설정 없이도 앱을 사용할 수 있으며, 이 경우 데이터는 로컬에만 저장됩니다.

## 📱 사용 방법 (How to Use)

1. **홈 화면**: "Start Practice" 버튼 클릭
2. **주제 선택**: 원하는 대화 주제 선택
3. **대화 시작**: 마이크 버튼을 눌러 말하기 시작
4. **AI 응답**: AI가 자연스럽게 대화를 이어갑니다
5. **세션 종료**: 
   - 화면 상단의 🚪 버튼 또는 세션 정보 모달의 "End Session" 버튼 클릭
   - 종료 확인 후 "연습이 종료되었습니다" 안내 메시지 표시
   - "처음으로 이동" 버튼을 클릭하여 홈 화면으로 자동 이동
6. **피드백 확인**: 세션 종료 후 상세한 피드백 확인
7. **진도 확인**: Progress 화면에서 학습 진도 추적

### 🔙 뒤로가기 동작 (Back Navigation)

웹 및 모바일 환경에서 자연스러운 뒤로가기 동작을 지원합니다:

- **웹 브라우저**: 브라우저의 뒤로가기 버튼(←) 또는 Alt+← 사용
- **모바일**: 안드로이드 뒤로가기 제스처 또는 버튼 사용
- **동작**: 현재 화면에서 이전 화면으로 자연스럽게 이동
  - 대화 화면 → 주제 선택 화면
  - 주제 선택 화면 → 홈 화면
  - 설정 화면 → 홈 화면
  - 등...

**직접 URL 접근**: 웹에서 특정 화면의 URL을 직접 입력하거나 북마크로 접근 가능
- 예: `https://trollgameskr.github.io/talk-practice/topics` (주제 선택)
- 예: `https://trollgameskr.github.io/talk-practice/progress` (진도 확인)
- 예: `https://trollgameskr.github.io/talk-practice/settings` (설정)

**새로고침**: 웹에서 페이지 새로고침(F5 또는 Ctrl+R) 시 현재 화면 유지

## 🏗️ 프로젝트 구조 (Project Structure)

```
talk-practice/
├── src/
│   ├── services/          # 핵심 서비스
│   │   ├── GeminiService.ts     # Gemini API 통합
│   │   ├── VoiceService.ts      # 음성 인식/TTS
│   │   ├── StorageService.ts    # 데이터 저장
│   │   └── FirebaseService.ts   # Firebase 통합
│   ├── screens/           # 화면 컴포넌트
│   │   ├── LoginScreen.tsx      # 로그인 화면
│   │   ├── HomeScreen.tsx       # 홈 화면
│   │   └── ...
│   ├── types/             # TypeScript 타입 정의
│   ├── utils/             # 유틸리티 함수
│   ├── config/            # 설정 파일
│   │   └── firebase.config.ts   # Firebase 설정
│   └── data/              # 정적 데이터
├── .github/workflows/     # GitHub Actions CI/CD
├── docs/                  # 문서
│   └── FIREBASE_SETUP.md  # Firebase 설정 가이드
└── README.md
```

## 🔧 기술 스택 (Tech Stack)

- **Frontend**: React Native + TypeScript + React Native Web
- **AI/ML**: Google Gemini Live API
- **Authentication**: Firebase Authentication
- **Database**: Firebase Firestore
- **Storage**: AsyncStorage (mobile) / localStorage (web) + Firebase sync
- **Voice**: 
  - Mobile: React Native Voice, React Native TTS
  - Web: Web Speech API (SpeechRecognition & SpeechSynthesis)
- **Navigation**: React Navigation v6
- **Web Build**: Webpack 5
- **CI/CD**: GitHub Actions

## 📊 성과 지표 (Performance Metrics)

### 측정 항목
1. **일평균 세션 시간**: 자동 측정 및 기록
2. **사용자 유지율**: 세션 빈도 기반 계산
3. **회화 정확도 향상율**: 시간에 따른 점수 향상 추적

### 피드백 점수 (Feedback Scores)
- **발음 점수** (Pronunciation): 0-100
- **문법 점수** (Grammar): 0-100
- **유창성** (Fluency): 0-100
- **어휘 점수** (Vocabulary): 0-100

## 🤖 GitHub Agent Task 통합

프로젝트는 GitHub Actions를 통한 자동화된 배포 프로세스를 포함합니다:

- **자동 린팅**: 코드 품질 검사
- **타입 체크**: TypeScript 타입 검증
- **자동 빌드**: Android/iOS 빌드
- **문서 배포**: 자동 문서 업데이트

## 📖 문서 (Documentation)

자세한 문서는 [docs/README.md](./docs/README.md)를 참조하세요.

- [설치 가이드](./docs/README.md#setup--installation)
- [사용 가이드](./docs/README.md#usage-guide)
- [API 통합](./docs/README.md#api-integration)
- [개발 가이드](./docs/README.md#development)
- [Direct TTS API 설정](./docs/DIRECT_TTS_API.md) - GitHub Pages에서 TTS 기능 사용하기
- [문제 해결](./TROUBLESHOOTING.md) - 404 에러, 서비스 워커 등 일반적인 문제 해결

### 🔧 일반적인 문제 해결
404 에러나 캐시 문제가 발생하나요? [문제 해결 가이드](./TROUBLESHOOTING.md)를 확인하거나, 브라우저에서 `/clear-cache.html`을 방문하세요.

## 🎯 대상 사용자 (Target Users)

- 영어 회화를 실시간으로 연습하고 싶은 중급 학습자
- 학습 동기부여가 필요한 사용자
- 발음 및 문법 개선이 필요한 사용자
- 다양한 주제의 영어 회화 연습이 필요한 사용자

## 🤝 기여하기 (Contributing)

기여를 환영합니다! 다음 단계를 따라주세요:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스 (License)

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 Credits

- **Gemini Live API**: Google AI
- **React Native**: Facebook/Meta
- **Community Libraries**: See package.json

## 📧 지원 (Support)

문제나 질문이 있으시면:
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - 일반적인 문제 해결
- [Cache Clear Tool](http://localhost:3000/clear-cache.html) - 캐시/서비스 워커 문제 해결
- [GitHub Issues](https://github.com/trollgameskr/talk-practice/issues)
- [Documentation](./docs/README.md)

---

Made with ❤️ for English learners worldwide
