# CareMate Frontend

스마트폰 A/S 보험 통합관리 플랫폼 **케어메이트(CareMate)** 프론트엔드 레포지토리입니다.

## 기술 스택

| 기술 | 용도 |
|---|---|
| React 18 | SPA 메인 UI (고객 접수, 수리점 대시보드, 관리자) |
| Vite | 개발/빌드 도구 |
| React Router | 클라이언트 라우팅 |
| Axios | 백엔드 API 통신 |
| HTML / CSS | 반응형 퍼블리싱 |
| jQuery | 일부 동적 UI 보조 |

## 디렉토리 구조

```
src/
├── api/              # axios 클라이언트, API 호출 모듈
├── components/       # 공통 컴포넌트
├── pages/
│   ├── customer/     # 고객: 보험 관리, 비대면 A/S 접수
│   ├── repairshop/   # 수리점: 대시보드, LMS 가이드
│   └── admin/        # 관리자
├── styles/           # 전역 스타일
├── App.jsx           # 라우팅
└── main.jsx          # 진입점
```

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

백엔드 API(`http://localhost:8080`)는 `/api` 경로로 프록시됩니다.

## 연관 레포지토리

- Backend: https://github.com/likelion-caremate/caremate-backend
