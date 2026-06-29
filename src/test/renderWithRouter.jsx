import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

export function renderWithRouter(ui, { route = '/', path = '/', extraRoutes = [] } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
        {extraRoutes.map((item) => (
          <Route key={item.path} path={item.path} element={item.element} />
        ))}
      </Routes>
    </MemoryRouter>,
  );
}
