# Google Cloud TTS API 설정 가이드 (한국어)

## 개요

이제 GitHub Pages에서 Google Cloud Text-to-Speech Neural2를 프록시 서버 없이 사용할 수 있습니다! 

## 설정 방법

### 1단계: GitHub Repository에 Secret 추가

1. GitHub 저장소 설정으로 이동
2. **Settings** → **Secrets and variables** → **Actions** 선택
3. **New repository secret** 클릭
4. 다음 정보 입력:
   - Name: `GOOGLE_TTS_API_KEY`
   - Value: 귀하의 Google Cloud API 키 (예: `AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
5. **Add secret** 클릭

### 2단계: Google Cloud Console에서 API 키 제한 설정 (중요!)

⚠️ **이 단계는 필수입니다!** API 키가 무단으로 사용되는 것을 방지합니다.

1. [Google Cloud Console - API 인증정보](https://console.cloud.google.com/apis/credentials)로 이동
2. 사용 중인 API 키를 선택
3. **애플리케이션 제한사항** 섹션:
   - **HTTP 리퍼러(웹사이트)** 선택
   - 허용할 리퍼러 추가:
     ```
     https://yourusername.github.io/talk-practice/*
     http://localhost:3000/*
     ```
     (실제 GitHub 사용자 이름으로 변경하세요)

4. **API 제한사항** 섹션:
   - **키 제한** 선택
   - 다음 API만 선택:
     - Cloud Text-to-Speech API
     - Generative Language API (Gemini용)
     - Firebase API들 (Firebase 사용 시)

5. **저장** 클릭

### 3단계: 배포

코드를 main 브랜치에 병합하면 GitHub Actions가 자동으로 배포를 진행합니다.

## 작동 방식

- **로컬 개발**: `npm run web` 실행 시 `http://localhost:4000` 프록시 서버 사용 (선택사항)
- **GitHub Pages**: API 키를 사용하여 Google Cloud TTS API에 직접 연결

## 보안 고려사항

### API 키가 클라이언트 코드에 포함되나요?
네, GitHub Pages는 정적 호스팅이므로 API 키가 JavaScript 번들에 포함됩니다.

### 안전한가요?
네, 다음과 같은 보안 조치가 있습니다:

1. **HTTP 리퍼러 제한**: API 키는 귀하의 GitHub Pages 도메인에서만 작동
2. **API 제한**: 특정 Google Cloud API만 사용 가능
3. **사용량 모니터링**: Google Cloud Console에서 사용량 추적 가능
4. **할당량 제한**: 과도한 사용 방지

자세한 보안 정보는 [SECURITY_SUMMARY.md](./SECURITY_SUMMARY.md)를 참조하세요.

### 프로덕션 환경에는 어떤가요?
개인 프로젝트나 데모에는 현재 방식이 적합합니다. 상용 서비스의 경우 백엔드 프록시 서버 사용을 권장합니다.

## 테스트

TTS가 작동하는지 확인하려면:

1. https://yourusername.github.io/talk-practice/ 접속
2. 대화 시작
3. AI 응답이 Neural2 음성으로 재생되는지 확인

## 문제 해결

### TTS가 작동하지 않는 경우

1. **GitHub Secret 확인**: `GOOGLE_TTS_API_KEY`가 올바르게 설정되었는지 확인
2. **API 키 제한 확인**: HTTP 리퍼러가 올바르게 설정되었는지 확인
3. **브라우저 콘솔 확인**: 에러 메시지 확인
   - 403 Forbidden: API 키 제한 문제
   - 429 Too Many Requests: 할당량 초과

### 일반적인 오류 코드

- `403 Forbidden`: API 키 제한 또는 잘못된 키
  - 해결: Google Cloud Console에서 HTTP 리퍼러 확인
- `429 Too Many Requests`: 할당량 초과
  - 해결: Google Cloud Console에서 할당량 확인
- `400 Bad Request`: 잘못된 요청 매개변수
  - 해결: 코드 확인 또는 이슈 제기

## 추가 정보

- [Direct TTS API 문서](./docs/DIRECT_TTS_API.md) - 상세 기술 문서
- [보안 요약](./SECURITY_SUMMARY.md) - 보안 분석 및 권장사항
- [README.md](./README.md) - 프로젝트 전체 설명

## 지원

문제가 있으시면:
- [GitHub Issues](https://github.com/trollgameskr/talk-practice/issues)에 문의
- 문서를 다시 확인

---
업데이트: 2025-10-29
