# GeminiTalk 웹 버전 빠른 시작 가이드
# GeminiTalk Web Version Quick Start Guide

## 🚀 5분 안에 시작하기 (Get Started in 5 Minutes)

### Windows 사용자를 위한 간단한 3단계

#### 1️⃣ Node.js 설치 (Install Node.js)

[Node.js 다운로드](https://nodejs.org/) - LTS 버전 권장

설치 확인:
```bash
node --version
# v16.0.0 이상이면 OK
```

#### 2️⃣ 앱 다운로드 및 실행 (Download & Run)

```bash
# 저장소 다운로드
git clone https://github.com/trollgameskr/talk-practice.git

# 폴더 이동
cd talk-practice

# 패키지 설치 (처음 한 번만)
npm install

# 웹 앱 실행
npm run web
```

#### 3️⃣ 브라우저에서 사용 (Use in Browser)

1. 브라우저가 자동으로 열립니다: **http://localhost:3000**
2. Settings (⚙️) 메뉴에서 Gemini API 키 입력
3. Start Practice (🎯) 버튼을 눌러 시작!

---

## 🔑 API 키 발급 받기 (Get API Key)

1. [Google AI Studio](https://makersuite.google.com/app/apikey) 방문
2. "Create API Key" 클릭
3. API 키 복사
4. GeminiTalk Settings에 붙여넣기

**무료로 사용 가능!** (Free to use!)

---

## 💡 사용 팁 (Tips)

### Chrome 또는 Edge 브라우저 권장
- 최고의 음성 인식 품질
- 모든 기능 완벽 지원

### 마이크 권한 허용
- 처음 사용 시 브라우저에서 마이크 권한 요청
- "허용" 클릭 필수

### 조용한 환경에서 사용
- 배경 소음이 적을수록 인식률 향상

---

## 🎯 주요 기능 (Key Features)

### 🏠 홈 화면
- 학습 통계 확인
- 총 세션 수, 연습 시간, 전체 점수

### 📚 5가지 대화 주제
1. **일상 대화** - 일상생활 주제
2. **여행 영어** - 호텔, 레스토랑, 관광
3. **비즈니스** - 회의, 프레젠테이션
4. **캐주얼** - 영화, 음악, 취미
5. **전문직** - 업무 커뮤니케이션

### 🎤 음성 대화
- 마이크 버튼 클릭 → 말하기
- AI가 실시간 응답
- 자연스러운 대화 흐름

### 📊 실시간 피드백
- 발음 점수
- 문법 교정
- 어휘 제안
- 유창성 평가

---

## ❓ 문제 해결 (Troubleshooting)

### "마이크를 찾을 수 없습니다"
1. 브라우저 설정에서 마이크 권한 확인
2. 시스템 설정에서 마이크 활성화
3. Chrome 설정 → 개인정보 및 보안 → 사이트 설정 → 마이크

### "API 키 오류"
1. API 키가 정확히 복사되었는지 확인
2. 앞뒤 공백 제거
3. Google AI Studio에서 키 활성화 상태 확인

### "앱이 느립니다"
1. 브라우저 캐시 삭제
2. 다른 탭 닫기
3. 브라우저 재시작

### "음성이 인식되지 않습니다"
1. 마이크에 가까이 말하기
2. 명확하게 발음하기
3. 배경 소음 줄이기
4. Chrome 또는 Edge 브라우저 사용

---

## 📱 모바일 브라우저에서도 사용 가능!

스마트폰 브라우저에서도 동일한 주소로 접속:
- **http://localhost:3000**

단, 개발 서버가 PC에서 실행 중이어야 합니다.

---

## 🌐 인터넷에 배포하기 (Deploy Online)

로컬호스트가 아닌 인터넷에서 사용하려면:

```bash
# 프로덕션 빌드 생성
npm run build:web

# web-build 폴더를 호스팅 서비스에 업로드
# Netlify, Vercel, GitHub Pages 등
```

자세한 내용: [WEB_SETUP.md](./WEB_SETUP.md)

---

## 🤝 도움이 필요하신가요? (Need Help?)

- [GitHub Issues](https://github.com/trollgameskr/talk-practice/issues)
- [전체 문서](./WEB_SETUP.md)
- [프로젝트 README](./README.md)

---

## 🎉 시작해보세요!

```bash
npm run web
```

**Windows에서 편하게 영어 회화 연습하세요!**  
**Practice English conversation easily on Windows!**

Made with ❤️ for English learners
