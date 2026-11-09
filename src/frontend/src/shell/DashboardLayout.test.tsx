import { screen } from '@testing-library/react';
import DashboardLayout from './DashboardLayout';
import { renderShell } from './testing';

function contentArea(contentAlign?: 'left') {
  const Home = () => <DashboardLayout title="정렬" contentAlign={contentAlign} />;
  renderShell({ home: Home });
  return screen.getByRole('main', { name: '내용' });
}

test('내용 구획은 따로 정하지 않으면 정렬 속성이 없어 기본값인 중앙으로 그려진다', () => {
  expect(contentArea().getAttribute('data-align')).toBeNull();
});

test('페이지가 왼쪽을 고르면 내용 구획에 정렬 속성이 붙는다', () => {
  expect(contentArea('left').getAttribute('data-align')).toBe('left');
});
