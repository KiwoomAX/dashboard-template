import { screen } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';
import { renderShell } from './testing';

function contentArea(contentAlign?: 'left' | 'right') {
  const Home = () => <DashboardLayout title="정렬" contentAlign={contentAlign} />;
  renderShell({ home: Home });
  return screen.getByRole('main', { name: '내용' });
}

test('내용 구획은 따로 정하지 않으면 정렬 속성이 없어 제안값인 중앙으로 그려진다', () => {
  expect(contentArea().getAttribute('data-align')).toBeNull();
});

test.each(['left', 'right'] as const)('페이지가 %s 를 고르면 내용 구획에 정렬 속성이 붙는다', (align) => {
  expect(contentArea(align).getAttribute('data-align')).toBe(align);
});
