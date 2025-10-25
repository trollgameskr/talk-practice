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

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에서 Gemini API 키 발급
2. 앱 실행 후 설정(Settings) 화면에서 API 키 입력
3. 저장 후 대화 시작!

## 📱 사용 방법 (How to Use)

1. **홈 화면**: "Start Practice" 버튼 클릭
2. **주제 선택**: 원하는 대화 주제 선택
3. **대화 시작**: 마이크 버튼을 눌러 말하기 시작
4. **AI 응답**: AI가 자연스럽게 대화를 이어갑니다
5. **피드백 확인**: 세션 종료 후 상세한 피드백 확인
6. **진도 확인**: Progress 화면에서 학습 진도 추적

## 🏗️ 프로젝트 구조 (Project Structure)

```
talk-practice/
├── src/
│   ├── services/          # 핵심 서비스
│   │   ├── GeminiService.ts     # Gemini API 통합
│   │   ├── VoiceService.ts      # 음성 인식/TTS
│   │   └── StorageService.ts    # 데이터 저장
│   ├── screens/           # 화면 컴포넌트
│   ├── types/             # TypeScript 타입 정의
│   ├── utils/             # 유틸리티 함수
│   ├── config/            # 설정 파일
│   └── data/              # 정적 데이터
├── .github/workflows/     # GitHub Actions CI/CD
├── docs/                  # 문서
└── README.md
```

## 🔧 기술 스택 (Tech Stack)

- **Frontend**: React Native + TypeScript + React Native Web
- **AI/ML**: Google Gemini Live API
- **Storage**: AsyncStorage (mobile) / localStorage (web)
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
- [문제 해결](./docs/README.md#troubleshooting)

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
- [GitHub Issues](https://github.com/trollgameskr/talk-practice/issues)
- [Documentation](./docs/README.md)

---

Made with ❤️ for English learners worldwide
