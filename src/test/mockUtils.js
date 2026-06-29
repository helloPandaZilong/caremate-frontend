import { vi } from 'vitest';
import { makeApiResponse, makePage } from '../mocks/mockApi';

export function mockApiEnvelope(data) {
  return Promise.resolve({ data: makeApiResponse(data) });
}

export function mockApiPage(content, pageOptions) {
  return mockApiEnvelope(makePage(content, pageOptions));
}

export function setMockAccessToken(token = 'mock-access-token') {
  localStorage.setItem('caremate_access_token', token);
  return token;
}

export function mockNavigate() {
  const navigate = vi.fn();
  vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useNavigate: () => navigate,
    };
  });
  return navigate;
}
