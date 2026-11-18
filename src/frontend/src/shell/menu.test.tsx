import { render } from '@testing-library/react';
import { checkMenu, findTrail, firstOpen, flatten, type MenuCategory, type MenuEntry, type ParentItem } from './menu';
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
  const audit = { name: '감사 이력', path: '/audit', page: P };

  test('규칙을 지킨 목록과 빈 목록은 경고가 없다', () => {
    expect(checkMenu([{ cat: '계획 · 실적', items: [kpi, tasks] }, status])).toEqual([]);
    expect(checkMenu([])).toEqual([]);
  });

  test('낱개 기능이 카테고리 앞에 와도 경고가 없다', () => {
    expect(checkMenu([status, { cat: '계획 · 실적', items: [kpi, tasks] }])).toEqual([]);
  });

  test('카테고리 안 기능이 하나여도 경고가 없다', () => {
    expect(checkMenu([{ cat: '계획 · 실적', items: [kpi] }])).toEqual([]);
  });

  test('낱개 기능이 카테고리 사이에 끼면 알린다', () => {
    expect(
      checkMenu([{ cat: '계획 · 실적', items: [kpi, tasks] }, status, { cat: '지배구조', items: [audit] }]),
    ).toEqual(['낱개 기능은 카테고리 사이에 끼우지 않는다 — 경영 현황']);
  });

  test('두 기능이 같은 주소를 쓰면 알린다 — 카테고리 안에 든 기능도 센다', () => {
    const dup = { name: '실적 요약', path: '/kpi', page: P };
    expect(checkMenu([{ cat: '계획 · 실적', items: [kpi, tasks] }, dup])).toEqual([
      '주소는 기능마다 달라야 한다 — /kpi : 실적 · KPI 관리 · 실적 요약',
    ]);
  });

  test('셸이 메뉴를 받으면 콘솔에 한 번 알린다', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const menu: MenuEntry[] = [
      { cat: '계획 · 실적', items: [kpi, tasks] },
      status,
      { cat: '지배구조', items: [audit] },
    ];
    const config = { org: '경영전략본부', others: [] };

    const { rerender } = render(<ShellProvider menu={menu} config={config}>{null}</ShellProvider>);
    rerender(<ShellProvider menu={menu} config={config}>{null}</ShellProvider>);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('[shell] 낱개 기능은 카테고리 사이에 끼우지 않는다 — 경영 현황');
    warn.mockRestore();
  });
});

describe('하위 기능을 가진 기능', () => {
  const P2 = () => null;
  const a = { name: '일간 현황', path: '/daily', page: P2 };
  const b = { name: '월간 현황', path: '/monthly', page: P2 };
  const locked = { name: '비공개', locked: true as const };
  const menu: MenuEntry[] = [
    { cat: '현황', items: [{ name: '펀드 현황', items: [locked, a, b] }, { name: '단독', path: '/solo', page: P2 }] },
    { name: '리스크', items: [{ name: '한도', path: '/limit', page: P2 }] },
  ];

  test('flatten 은 하위 기능만 남기고 화면이 있는 기능을 한 줄로 편다', () => {
    expect(flatten(menu).map((it) => it.name)).toEqual(['비공개', '일간 현황', '월간 현황', '단독', '한도']);
  });

  test('firstOpen 은 잠긴 기능을 지나 처음 열리는 기능을 고른다', () => {
    const parent = (menu[0] as { items: ParentItem[] }).items[0];
    expect(firstOpen(parent)?.path).toBe('/daily');
    expect(firstOpen(menu[0] as MenuCategory)?.path).toBe('/daily');
  });

  test('findTrail 은 카테고리와 기능과 하위 기능을 함께 돌려준다', () => {
    const t = findTrail(menu, '/monthly');
    expect(t?.item.name).toBe('월간 현황');
    expect(t?.parent?.name).toBe('펀드 현황');
    expect(t?.category?.cat).toBe('현황');
    expect(findTrail(menu, '/solo')?.parent).toBeUndefined();
    expect(findTrail(menu, '/limit')?.category).toBeUndefined();
    expect(findTrail(menu, '/limit')?.parent?.name).toBe('리스크');
  });

  test('하위 기능이 하나도 없는 기능은 낱개 기능으로 적으라고 경고한다', () => {
    expect(checkMenu([{ name: '빈 기능', items: [] }])).toEqual(['하위 기능이 없는 기능은 낱개 기능으로 적는다 — 빈 기능']);
    expect(checkMenu(menu)).toEqual([]);
  });
});
