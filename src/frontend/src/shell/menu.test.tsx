import { render } from '@testing-library/react';
import { checkMenu, type MenuEntry } from './menu';
import { ShellProvider } from './ShellContext';

const P = () => null;

describe('타입이 잘못된 줄을 막는다 — npm test 가 먼저 돌리는 tsc -b 가 검사한다', () => {
  /* @ts-expect-error 줄 다음 줄에 타입 오류가 없으면 tsc 가 실패한다.
     쓰지 않는 변수 오류가 섞이지 않게 값은 accept 에 넘긴다 */
  const accept = (_entry: MenuEntry) => {};

  test('여는 기능은 이름 · 주소 · 페이지를 모두 적어야 한다', () => {
    // @ts-expect-error 페이지가 없다
    accept({ name: '실적', path: '/kpi' });
    // @ts-expect-error 주소가 없다
    accept({ name: '실적', page: P });
    accept({ name: '실적', path: '/kpi', page: P });
  });

  test('잠긴 기능은 주소와 페이지를 받지 않는다', () => {
    // @ts-expect-error 잠긴 기능에 주소가 있다
    accept({ name: '예산', locked: true, path: '/budget' });
    accept({ name: '예산', locked: true });
  });

  test('카테고리는 한 단만 묶는다', () => {
    // @ts-expect-error 카테고리 안에 카테고리가 있다
    accept({ cat: '계획', items: [{ cat: '실적', items: [] }] });
    accept({ cat: '계획', items: [{ name: '예산', locked: true }] });
  });
});

describe('타입이 막지 못하는 규칙은 경고한다', () => {
  const kpi = { name: '실적 · KPI 관리', path: '/kpi', page: P };
  const tasks = { name: '전략과제 관리', path: '/tasks', page: P };
  const status = { name: '경영 현황', path: '/status', page: P };

  test('규칙을 지킨 목록과 빈 목록은 경고가 없다', () => {
    expect(checkMenu([{ cat: '계획 · 실적', items: [kpi, tasks] }, status])).toEqual([]);
    expect(checkMenu([])).toEqual([]);
  });

  test('카테고리가 낱개 기능 뒤에 오면 알린다', () => {
    expect(checkMenu([status, { cat: '계획 · 실적', items: [kpi, tasks] }])).toEqual([
      '카테고리는 낱개 기능보다 먼저 적는다 — 계획 · 실적',
    ]);
  });

  test('카테고리 안 기능이 하나면 알린다', () => {
    expect(checkMenu([{ cat: '계획 · 실적', items: [kpi] }])).toEqual([
      '카테고리 안 기능이 둘 미만이면 묶지 말고 낱개로 둔다 — 계획 · 실적 1개',
    ]);
  });

  test('두 기능이 같은 주소를 쓰면 알린다 — 카테고리 안에 든 기능도 센다', () => {
    const dup = { name: '실적 요약', path: '/kpi', page: P };
    expect(checkMenu([{ cat: '계획 · 실적', items: [kpi, tasks] }, dup])).toEqual([
      '주소는 기능마다 달라야 한다 — /kpi : 실적 · KPI 관리 · 실적 요약',
    ]);
  });

  test('셸이 메뉴를 받으면 콘솔에 한 번 알린다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const menu: MenuEntry[] = [status, { cat: '계획 · 실적', items: [kpi, tasks] }];
    const config = { org: '경영전략본부', others: [] };

    const { rerender } = render(<ShellProvider menu={menu} config={config}>{null}</ShellProvider>);
    rerender(<ShellProvider menu={menu} config={config}>{null}</ShellProvider>);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('[shell] 카테고리는 낱개 기능보다 먼저 적는다 — 계획 · 실적');
    warn.mockRestore();
  });
});
