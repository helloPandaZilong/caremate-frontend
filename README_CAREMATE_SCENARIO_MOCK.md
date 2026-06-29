# CareMate Part3 시나리오 목업

## 시나리오

### 1. 기본 고객

- 로그인 이메일: `test01@test.com`
- 비밀번호: 아무 값 입력 가능. 추천: `test1234!`
- 역할: `CUSTOMER`
- 화면: `/customer/dashboard`
- 데이터 상태:
  - 진행 중인 A/S 주문 `#102`
  - 현재 상태: `REPAIR_DONE` 수리완료
  - 결제요청 알림 `PAYMENT_REQUESTED` 1건 미읽음
  - 상태 이력: 접수 → 예약확정 → 수리중 → 수리완료

### 2. 수리점

- 로그인 이메일: `shop01@test.com`
- 비밀번호: 아무 값 입력 가능. 추천: `test1234!`
- 역할: `REPAIR_SHOP`
- 화면: `/shop/dashboard` 또는 `/shop/orders`
- 데이터 상태:
  - 예약확정 주문 `#201`
  - 방문 예정 시간: 현재 시각 기준 1시간 후
  - 노쇼 1시간 전 경고 알림 `NO_SHOW_WARNING` 1건 미읽음

## 적용 방법

압축을 풀면 아래 파일이 들어 있습니다.

```text
src/mocks/caremateScenarioMockData.js
src/mocks/installCareMateScenarioMocks.js
src/main.jsx
.env.scenario-mock
README_CAREMATE_SCENARIO_MOCK.md
```

프로젝트 루트 기준으로 같은 경로에 덮어쓰기/추가하세요.

```bash
# 압축 해제 후 프로젝트 루트에서 복사 예시
cp -r src/mocks ./src/
cp src/main.jsx ./src/main.jsx
cp .env.scenario-mock .env.local
```

Windows PowerShell에서는 수동으로 복사하거나 아래처럼 입력하세요.

```powershell
Copy-Item -Recurse -Force .\src\mocks .\src\
Copy-Item -Force .\src\main.jsx .\src\main.jsx
Copy-Item -Force .\.env.scenario-mock .\.env.local
```

그 다음 실행합니다.

```bash
npm run dev
```

## 끄는 방법

`.env.local`에서 아래 값을 지우거나 false로 바꾸면 실제 백엔드 API를 다시 사용합니다.

```text
VITE_USE_SCENARIO_MOCKS=false
```

## 주의

이 목업은 프론트 화면 확인용입니다. 실제 백엔드 DB에 데이터를 넣는 파일이 아닙니다.
