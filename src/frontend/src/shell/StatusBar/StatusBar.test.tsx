import { fireEvent, screen } from '@testing-library/react';
import { Download } from 'lucide-react';
import DashboardLayout, { type DashboardLayoutProps } from '../DashboardLayout';
import { renderShell } from '../testing';

/* 상태바 값을 받은 페이지 하나를 '/status' 에 올린다 */
function renderStatus(props: Omit<DashboardLayoutProps, 'title'> & { title?: string } = {}) {
  const Status = () => <DashboardLayout title="경영 현황" {...props} />;
  return renderShell({ path: '/status', menu: [{ name: '경영 현황', path: '/status', page: Status }] });
}

describe('제목과 경로', () => {
  test('메뉴에 있는 화면이면 제목 앞에 조직 이름을 붙이고 탭 제목을 바꾼다', () => {
    const { container } = renderStatus();
    expect(screen.getByRole('heading', { name: '경영 현황' })).toBeInTheDocument();
    expect(container.querySelector('.crumb')).toHaveTextContent('경영전략본부');
    expect(document.title).toBe('경영 현황 · 경영전략본부');
  });

  test('메뉴에 없는 화면(첫 화면)에는 경로를 붙이지 않는다', () => {
    const { container } = renderShell({ path: '/' });
    expect(screen.getByRole('heading', { name: '첫 화면' })).toBeInTheDocument();
    expect(container.querySelector('.crumb')).toBeNull();
  });
});

describe('기준 시각', () => {
  test('문구를 넘기면 시계와 문구를 그린다', () => {
    const { container } = renderStatus({ asof: '2026.08.26 08:40 기준 데이터' });
    expect(container.querySelector('.asof')).toHaveTextContent('2026.08.26 08:40 기준 데이터');
  });

  test('"-" 를 넘기면 시계와 「-」를 그린다', () => {
    const { container } = renderStatus({ asof: '-' });
    expect(container.querySelector('.asof')).toHaveTextContent('-');
    expect(container.querySelector('.asof .cyc')).not.toBeNull();
  });

  test('넘기지 않으면 기준 시각 줄이 없다', () => {
    const { container } = renderStatus();
    expect(container.querySelector('.asof')).toBeNull();
  });

  test('갱신 주기는 시계 툴팁에 달고, 없으면 툴팁을 달지 않는다', () => {
    const { container, unmount } = renderStatus({ asof: '-', cycle: '매일 자정 자동 갱신' });
    const cyc = container.querySelector('.asof .cyc');
    expect(cyc).toHaveAttribute('title', '매일 자정 자동 갱신');
    expect(cyc).toHaveAttribute('aria-label', '매일 자정 자동 갱신');
    unmount();

    const again = renderStatus({ asof: '-' });
    expect(again.container.querySelector('.asof .cyc')).not.toHaveAttribute('title');
  });
});

describe('새로고침', () => {
  test('기준 시각이 있으면 그 줄에 붙는다', () => {
    const refresh = vi.fn();
    const { container } = renderStatus({ asof: '-', refresh });
    fireEvent.click(screen.getByRole('button', { name: '새로고침' }));
    expect(refresh).toHaveBeenCalledOnce();
    expect(container.querySelector('.asof .asof-refresh')).not.toBeNull();
    expect(container.querySelector('.topbar > .icon-btn')).toBeNull();
  });

  test('기준 시각이 없으면 오른쪽 아이콘 줄로 간다', () => {
    const { container } = renderStatus({ refresh: () => {} });
    expect(container.querySelector('.topbar > .icon-btn')).toHaveAttribute('aria-label', '새로고침');
  });

  test('함수를 넘기지 않으면 단추가 없다', () => {
    renderStatus({ asof: '-' });
    expect(screen.queryByRole('button', { name: '새로고침' })).toBeNull();
  });
});

describe('화면 고유 단추', () => {
  test('이름과 아이콘으로 단추를 그리고 누르면 넘긴 함수를 실행한다', () => {
    const onClick = vi.fn();
    const { container } = renderStatus({ actions: [{ name: '내려받기', icon: Download, onClick }] });
    const btn = screen.getByRole('button', { name: '내려받기' });
    expect(btn).toHaveClass('btn-ghost');
    expect(container.querySelector('.btn-ghost .ic')).not.toBeNull();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
