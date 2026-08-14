# CareMate Frontend

> ## 📌 이 저장소에 대하여
>
> 이 저장소는 **멋쟁이사자처럼(LikeLion) 팀 프로젝트**로 개발한 [likelion-caremate/caremate-frontend](https://github.com/likelion-caremate/caremate-frontend)의 전체 커밋 히스토리를 개인 포트폴리오용으로 이전(mirror)한 저장소입니다.
>
> **담당 파트**
> - **인증/인가(Auth) 연동** — 전역 인증 상태 관리(AuthContext), axios 인터셉터(JWT 자동 주입 + 401 시 토큰 자동 재발급), 역할 기반 라우트 가드(ProtectedRoute), Google 소셜 로그인 연동
> - **관리자(Admin) 페이지 전체** — 수리점 가입 승인, 보험 약관 관리, 회원 차단/해제, LMS 관리, 수수료 청구, 통합 대시보드
> - **감사(Audit) 페이지** — 정산 엔진 이력, 결제 무결성, 로그인 이력, DLQ 관리 UI
> - **전역 UI/UX 설계** — 다크모드, CSS 변수 기반 디자인 토큰 테마 시스템, 초기 프로젝트 스캐폴딩
> - **Kakao Map API 연동** — 회원가입 시 주소 검색 및 좌표 변환
> - 실제 기여 내역은 커밋 히스토리에서 확인 가능합니다.
>
> ---

스마트폰 A/S 보험 통합관리 플랫폼 **케어메이트(CareMate)** 프론트엔드 레포지토리입니다.

## 기술 스택

| 기술 | 용도 |
|---|---|
| React 18 | SPA 메인 UI (고객 접수, 수리점 대시보드, 관리자) |
| Vite | 개발/빌드 도구 |
| React Router (v7) | 클라이언트 라우팅 |
| Tailwind CSS v3 | 유틸리티 기반 스타일링 / 반응형 퍼블리싱 |
| shadcn/ui · Radix UI | 공통 UI 컴포넌트 |
| Axios | 백엔드 API 통신 |
| HTML / CSS | 반응형 퍼블리싱 |
| jQuery | 일부 동적 UI 보조 |

## 디렉토리 구조

```
src/
├── api/                  # axios 클라이언트, API 호출 모듈 (예정)
├── app/
│   ├── routes.jsx        # 라우트 정의 (React Router)
│   └── components/
│       ├── ui/           # shadcn/ui 기반 공통 UI 컴포넌트
│       └── figma/        # 이미지 폴백 등 보조 컴포넌트
├── components/           # AppShell, 공통 레이아웃 컴포넌트
├── hooks/                # 커스텀 훅 (예: 다크모드)
├── pages/
│   ├── customer/         # 고객: 보험 관리, 비대면 A/S 접수
│   ├── repairshop/       # 수리점: 대시보드, LMS 가이드
│   ├── admin/            # 관리자: 정산, 정책, 감사
│   ├── LandingPage.jsx   # 랜딩
│   └── AuthPage.jsx      # 로그인 / 인증
├── styles/               # 전역 스타일 (Tailwind, 테마 변수)
├── App.jsx               # 라우터 렌더링 (RouterProvider)
└── main.jsx              # 진입점
```

## 실행

```bash
npm install

아래 에러발생시 (npm install '@rollup/rollup-win32-x64-msvc') < 모듈 설치
[cause]: Error: Cannot find module '@rollup/rollup-win32-x64-msvc'

npm run dev      # http://localhost:3000
npm run build
```

백엔드 API(`http://localhost:8080`)는 `/api` 경로로 프록시됩니다.

## 연관 레포지토리

- Backend: https://github.com/likelion-caremate/caremate-backend