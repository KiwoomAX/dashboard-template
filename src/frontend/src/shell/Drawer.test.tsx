import { fireEvent, screen } from '@testing-library/react';
import { useEffect, type ComponentType } from 'react';
import DashboardLayout from './DashboardLayout';
import { useAlertCount } from './Drawer/Drawer';
import { SIDE_KEY } from './prefs';
import { renderShell } from './testing';

const StatusPage = () => <DashboardLayout title="경영 현황" />;
const KpiPage = () => <DashboardLayout title="실적 · KPI 관리" />;
const menu = [
  { name: '경영 현황', path: '/status', page: StatusPage },
  { name: '실적 · KPI 관리', path: '/kpi', page: KpiPage },
];

let mounts = 0;
function FourAlerts() {
  useAlertCount(4);
  useEffect(() => {
    mounts += 1;
  }, []);
  return <p>확인 필요 4건</p>;
}

function renderDrawer(alerts: ComponentType = FourAlerts) {
  return renderShell({ path: '/status', menu, alerts });
}

beforeEach(() => {
  localStorage.clear();
  mounts = 0;
});

test('모든 페이지에 종과 알림 서랍이 있고, 알림 서랍 안에는 대시보드의 알림 내용이 들어간다', () => {
  const { container } = renderDrawer();
  expect(screen.getByRole('button', { name: '알림' })).toBeInTheDocument();
  expect(container.querySelector('.side-in')).toHaveTextContent('확인 필요 4건');

  fireEvent.click(screen.getByRole('link', { name: '실적 · KPI 관리' }));
  expect(screen.getByRole('heading', { name: '실적 · KPI 관리' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '알림' })).toBeInTheDocument();
});

test('알림 내용이 알린 건수를 종의 배지에 띄우고, 0 이면 달지 않는다', () => {
  const { container, unmount } = renderDrawer();
  expect(container.querySelector('.side-toggle .cnt')).toHaveTextContent('4');
  unmount();

  const None = () => {
    useAlertCount(0);
    return null;
  };
  const again = renderDrawer(None);
  expect(again.container.querySelector('.side-toggle .cnt')).toBeNull();
});

test('기본은 닫힌 상태이고 닫힌 알림 서랍에는 탭으로 들어갈 수 없다', () => {
  const { container } = renderDrawer();
  expect(container.querySelector('.shell')).not.toHaveAttribute('data-side');
  expect(container.querySelector('.side')).toHaveAttribute('inert');
});

test('종을 누르면 열리고 다시 누르면 닫히며, 그때마다 저장한다', () => {
  const { container } = renderDrawer();
  const bell = screen.getByRole('button', { name: '알림' });

  fireEvent.click(bell);
  expect(container.querySelector('.shell')).toHaveAttribute('data-side', 'open');
  expect(bell).toHaveAttribute('aria-expanded', 'true');
  expect(container.querySelector('.side')).not.toHaveAttribute('inert');
  expect(localStorage.getItem(SIDE_KEY)).toBe('open');

  fireEvent.click(bell);
  expect(container.querySelector('.shell')).not.toHaveAttribute('data-side');
  expect(localStorage.getItem(SIDE_KEY)).toBe('closed');
});

test('Esc 로 닫고 종으로 초점을 돌려준다', () => {
  const { container } = renderDrawer();
  const bell = screen.getByRole('button', { name: '알림' });
  fireEvent.click(bell);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(container.querySelector('.shell')).not.toHaveAttribute('data-side');
  expect(bell).toHaveFocus();
});

test('다른 페이지로 옮겨도 열린 채로 있고, 알림 내용을 다시 그리지 않는다', () => {
  const { container } = renderDrawer();
  fireEvent.click(screen.getByRole('button', { name: '알림' }));
  fireEvent.click(screen.getByRole('link', { name: '실적 · KPI 관리' }));

  expect(screen.getByRole('heading', { name: '실적 · KPI 관리' })).toBeInTheDocument();
  expect(container.querySelector('.shell')).toHaveAttribute('data-side', 'open');
  expect(mounts).toBe(1);
});

test('다시 들어오면 저장한 상태로 그린다', () => {
  localStorage.setItem(SIDE_KEY, 'open');
  const { container } = renderDrawer();
  expect(container.querySelector('.shell')).toHaveAttribute('data-side', 'open');
});
