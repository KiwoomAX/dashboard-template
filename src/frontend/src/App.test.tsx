import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

test('첫 화면은 빈 내용 구획을 그린다', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );
  expect(screen.getByRole('main', { name: '내용' })).toBeEmptyDOMElement();
});
