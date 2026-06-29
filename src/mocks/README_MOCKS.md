# CareMate 프론트 목업 파일

## 포함 파일

- `src/mocks/mockData.js`
  - 수리점, 운영시간, 보험 상품, 가입 보험, A/S 접수, 상태 이력, 알림, 결제 정보 목업 데이터
- `src/mocks/mockApi.js`
  - 백엔드 API 응답 형태 `{ success, data, error }`와 페이징 객체를 만들어주는 유틸
  - 실제 API 함수처럼 사용할 수 있는 `mockApiRepository`
- `src/mocks/mockEventSource.js`
  - Vitest/jsdom 환경에서 SSE `EventSource`를 대체하는 목업 클래스
- `src/test/renderWithRouter.jsx`
  - React Router 화면 테스트용 렌더 헬퍼
- `src/test/mockUtils.js`
  - API envelope, page response, access token 설정용 테스트 헬퍼

## 사용 예시

### API 함수 mock에 데이터 연결

```js
import { vi } from 'vitest';
import { mockRepairOrders } from '../../mocks/mockData';

vi.mock('../../api/customerRepairOrderApi', () => ({
  getCustomerRepairOrders: vi.fn(() => Promise.resolve({ content: mockRepairOrders })),
}));
```

### EventSource mock 사용

```js
import { MockEventSource } from '../../mocks/mockEventSource';

beforeEach(() => {
  MockEventSource.reset();
  MockEventSource.install();
});
```

### API envelope 만들기

```js
import { mockApiEnvelope } from '../../test/mockUtils';

apiClient.get.mockResolvedValueOnce(
  await mockApiEnvelope({ id: 101, status: 'REPAIR_DONE' }),
);
```

## 특징

- 백엔드 없이 프론트 테스트/화면 검증이 가능합니다.
- API 정의서의 공통 응답 envelope와 페이징 구조를 맞췄습니다.
- SSE 알림은 `notification`, `heartbeat`, `connected` 이벤트를 직접 발생시킬 수 있습니다.
