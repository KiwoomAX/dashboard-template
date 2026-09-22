/* 셸 테스트가 함께 쓰는 도구. 앱과 같은 구성(ShellProvider + ShellRoutes)을 메모리 라우터에 올린다. */
import { render } from '@testing-library/react';
import type { ComponentType } from 'react';
import { MemoryRouter } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import type { MenuEntry } from './menu';
import { ShellProvider, type DashboardConfig } from './ShellContext';
import ShellRoutes from './ShellRoutes';

export const Page = () => <DashboardLayout title="페이지" />;
const DefaultHome = () => <DashboardLayout title="첫 화면" />;

export const sampleMenu: MenuEntry[] = [
  {
    cat: '계획 · 실적',
    items: [
      { name: '경영계획 · 예산', locked: true },
      { name: '실적 · KPI 관리', path: '/kpi', page: Page },
      { name: '전략과제 관리', path: '/tasks', page: Page },
    ],
  },
  { name: '경영 현황', path: '/status', page: Page },
];

export function renderShell({
  path = '/',
  menu = sampleMenu,
  config = { org: '경영전략본부', others: [] },
  home = DefaultHome,
}: { path?: string; menu?: MenuEntry[]; config?: DashboardConfig; home?: ComponentType } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ShellProvider menu={menu} config={config}>
        <ShellRoutes home={home} />
      </ShellProvider>
    </MemoryRouter>,
  );
}
