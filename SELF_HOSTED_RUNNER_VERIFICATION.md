# Self-Hosted Runner 검증 (Verification)

## 개요 (Overview)

이 프로젝트는 GitHub Actions에서 self-hosted runner를 사용합니다.
This project uses self-hosted runners in GitHub Actions.

## 검증 방법 (How to Verify)

### 1. 자동 검증 워크플로우 (Automated Verification Workflow)

`.github/workflows/verify-self-hosted.yml` 워크플로우를 사용하여 self-hosted runner가 정상적으로 작동하는지 확인할 수 있습니다.

You can verify that the self-hosted runner is working correctly using the `.github/workflows/verify-self-hosted.yml` workflow.

#### 수동 실행 (Manual Trigger)

1. GitHub 저장소의 "Actions" 탭으로 이동
2. 왼쪽 사이드바에서 "Verify Self-Hosted Runner" 워크플로우 선택
3. "Run workflow" 버튼 클릭
4. 워크플로우 실행 결과 확인

Steps in English:
1. Navigate to the "Actions" tab in your GitHub repository
2. Select "Verify Self-Hosted Runner" workflow from the left sidebar
3. Click "Run workflow" button
4. Check the workflow execution results

#### 검증 항목 (Verification Items)

워크플로우는 다음 항목들을 확인합니다:

- Runner 환경 변수 (RUNNER_NAME, RUNNER_OS, RUNNER_ARCH 등)
- 시스템 정보 (OS, architecture)
- Node.js 및 npm 설치 여부
- 디스크 공간
- 코드 체크아웃 기능

The workflow verifies:
- Runner environment variables (RUNNER_NAME, RUNNER_OS, RUNNER_ARCH, etc.)
- System information (OS, architecture)
- Node.js and npm installation
- Available disk space
- Code checkout functionality

### 2. 기존 워크플로우 확인 (Check Existing Workflows)

다음 워크플로우들이 self-hosted runner를 사용하고 있습니다:

The following workflows use self-hosted runners:

- `.github/workflows/ci.yml` - CI/CD Pipeline
  - Lint job
  - Type Check job
  - Test job
  - Build Android job

- `.github/workflows/deploy-pages.yml` - GitHub Pages 배포
  - Build job
  - Deploy job

이러한 워크플로우가 성공적으로 실행되면 self-hosted runner가 정상적으로 작동하는 것입니다.

If these workflows run successfully, it indicates that the self-hosted runner is working correctly.

## 문제 해결 (Troubleshooting)

### Runner가 작동하지 않는 경우 (If Runner is Not Working)

1. Self-hosted runner가 실행 중인지 확인
   - Check if the self-hosted runner is running
   
2. Runner가 올바른 저장소/조직에 등록되어 있는지 확인
   - Verify the runner is registered to the correct repository/organization
   
3. Runner의 상태가 "Idle" 또는 "Active"인지 확인
   - Check if the runner status is "Idle" or "Active"
   
4. Repository Settings > Actions > Runners에서 runner 상태 확인
   - Check runner status in Repository Settings > Actions > Runners

### 워크플로우 실행 실패 시 (If Workflow Fails)

1. Actions 탭에서 실패한 워크플로우의 로그 확인
   - Check the logs of failed workflow in Actions tab
   
2. 각 step의 오류 메시지 확인
   - Review error messages from each step
   
3. Runner 시스템의 리소스 확인 (CPU, 메모리, 디스크)
   - Check runner system resources (CPU, memory, disk)

## 참고 (References)

- [GitHub Actions Self-hosted runners documentation](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners)
- [Adding self-hosted runners](https://docs.github.com/en/actions/hosting-your-own-runners/adding-self-hosted-runners)
