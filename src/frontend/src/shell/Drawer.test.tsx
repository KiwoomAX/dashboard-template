import { fireEvent, screen } from '@testing-library/react';
import DashboardLayout, { type DashboardDrawer } from './DashboardLayout';
import { renderShell } from './testing';

/* 서랍을 넘기는 페이지 하나. 두 주소가 같은 컴포넌트를 쓴다 */
function renderDrawer(drawer?: DashboardDrawer) {
  const WithDrawer = () => <DashboardLayout title="경영 현황" drawer={drawer} />;
  return renderShell({
    path: '/status',
    menu: [
      { name: '경영 현황', path: '/status', page: WithDrawer },
      { name: '실적 · KPI 관리', path: '/kpi', page: WithDrawer },
    ],
  });
}

const alerts: DashboardDrawer = { count: 4, children: <p>확인 필요 4건</p> };

test('서랍을 넘기지 않으면 종도 서랍도 없다', () => {
  const { container } = renderDrawer();
  expect(screen.queryByRole('button', { name: '알림' })).toBeNull();
  expect(container.querySelector('.side')).toBeNull();
});

test('종에 건수 배지를 달고, 건수가 0 이면 달지 않는다', () => {
  const { container, unmount } = renderDrawer(alerts);
  expect(container.querySelector('.side-toggle .cnt')).toHaveTextContent('4');
  unmount();

  const zero = renderDrawer({ count: 0, children: null });
  expect(zero.container.querySelector('.side-toggle .cnt')).toBeNull();
});

test('서랍 안에는 페이지가 넘긴 내용이 들어간다', () => {
  const { container } = renderDrawer(alerts);
  expect(container.querySelector('.side-in')).toHaveTextContent('확인 필요 4건');
});

test('닫힌 서랍은 탭으로 들어갈 수 없고, 종을 누르면 열리고 다시 누르면 닫힌다', () => {
  const { container } = renderDrawer(alerts);
  const shell = container.querySelector('.shell');
  const side = container.querySelector('.side');
  const bell = screen.getByRole('button', { name: '알림' });

  expect(shell).not.toHaveAttribute('data-side');
  expect(side).toHaveAttribute('inert');

  fireEvent.click(bell);
  expect(shell).toHaveAttribute('data-side', 'open');
  expect(bell).toHaveAttribute('aria-expanded', 'true');
  expect(side).not.toHaveAttribute('inert');

  fireEvent.click(bell);
  expect(shell).not.toHaveAttribute('data-side');
  expect(side).toHaveAttribute('inert');
});

test('Esc 로 닫고 종으로 초점을 돌려준다', () => {
  const { container } = renderDrawer(alerts);
  const bell = screen.getByRole('button', { name: '알림' });
  fireEvent.click(bell);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(container.querySelector('.shell')).not.toHaveAttribute('data-side');
  expect(bell).toHaveFocus();
});

test('다른 기능으로 옮겨 가면 닫힌다 — 같은 페이지 컴포넌트를 쓰는 주소 사이에서도', () => {
  const { container } = renderDrawer(alerts);
  fireEvent.click(screen.getByRole('button', { name: '알림' }));
  fireEvent.click(screen.getByRole('link', { name: '실적 · KPI 관리' }));
  expect(screen.getByRole('link', { name: '실적 · KPI 관리' })).toHaveClass('is-on');
  expect(container.querySelector('.shell')).not.toHaveAttribute('data-side');
});
