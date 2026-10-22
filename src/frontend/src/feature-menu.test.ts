import { buildMenu, collectFeatureMenus, type FeatureMenu } from './feature-menu';
import { checkMenu, type MenuEntry } from './shell/menu';

const P = () => null;
const feature = (name: string, extra: Partial<FeatureMenu> = {}): FeatureMenu => ({ name, page: P, ...extra });

describe('collectFeatureMenus — import.meta.glob 결과에서 폴더 이름별로 모은다', () => {
  test('경로에서 폴더 이름을 뽑는다 — 하이픈이 든 기능 이름도 그대로다', () => {
    const modules = {
      './features/email-summary/menu.ts': { default: feature('메일 요약') },
      './features/fund_list/menu.ts': { default: feature('펀드 목록') },
    };

    expect(Object.keys(collectFeatureMenus(modules)).sort()).toEqual(['email-summary', 'fund_list']);
    expect(collectFeatureMenus(modules)['email-summary'].name).toBe('메일 요약');
  });

  test('menu.ts 가 아닌 경로는 건너뛴다', () => {
    const modules = { './features/x/other.ts': { default: feature('x') } };

    expect(collectFeatureMenus(modules)).toEqual({});
  });
});

describe('buildMenu — 기능 폴더의 menu.ts 로 메뉴 목록을 만든다', () => {
  test('기능이 없으면 빈 목록이다', () => {
    expect(buildMenu({})).toEqual([]);
  });

  test('주소를 안 적으면 /<폴더 이름> 이고, 적으면 그 값이다', () => {
    const menu = buildMenu({
      'email-summary': feature('메일 요약'),
      'fund-list': feature('펀드 목록', { path: '/' }),
    });

    // 폴더 이름순이라 email-summary 가 fund-list 보다 앞이다
    expect(menu).toEqual([
      { name: '메일 요약', path: '/email-summary', page: P },
      { name: '펀드 목록', path: '/', page: P },
    ]);
  });

  test('같은 조건의 기능은 폴더 이름순으로 놓는다', () => {
    const menu = buildMenu({
      b: feature('B'),
      c: feature('C'),
      a: feature('A'),
    });

    expect(menu.map((entry) => ('name' in entry ? entry.name : entry.cat))).toEqual(['A', 'B', 'C']);
  });

  test('같은 cat 은 한 카테고리로 합치고, 낱개 기능은 카테고리 앞에 모은다', () => {
    const menu = buildMenu({
      kpi: feature('실적', { cat: '계획 · 실적' }),
      home: feature('경영 현황'),
      plan: feature('계획', { cat: '계획 · 실적' }),
      audit: feature('감사', { cat: '지배구조' }),
    });

    // 폴더 이름순(audit, home, kpi, plan)으로 처음 나온 카테고리부터 놓는다
    expect(menu).toEqual([
      { name: '경영 현황', path: '/home', page: P },
      { cat: '지배구조', items: [{ name: '감사', path: '/audit', page: P }] },
      {
        cat: '계획 · 실적',
        items: [
          { name: '실적', path: '/kpi', page: P },
          { name: '계획', path: '/plan', page: P },
        ],
      },
    ]);
  });

  test('카테고리는 처음 나온 순서로 놓는다 — 폴더 이름순으로 센다', () => {
    const menu = buildMenu({
      b: feature('나', { cat: '둘째' }),
      a: feature('가', { cat: '첫째' }),
    });

    expect(menu.map((entry) => ('cat' in entry ? entry.cat : entry.name))).toEqual(['첫째', '둘째']);
  });

  test('손으로 적은 항목은 적은 순서를 그대로 지킨다 — 카테고리 뒤에 적은 낱개 항목도 뒤에 남는다', () => {
    const manual: MenuEntry[] = [
      { name: '예산', locked: true },
      { cat: '계획 · 실적', items: [{ name: '월간 실적', path: '/monthly', page: P }] },
      { name: '리스크', locked: true },
    ];
    const menu = buildMenu({ home: feature('경영 현황'), audit: feature('감사', { cat: '지배구조' }) }, manual);

    expect(menu).toEqual([
      { name: '예산', locked: true },
      { name: '경영 현황', path: '/home', page: P },
      { cat: '계획 · 실적', items: [{ name: '월간 실적', path: '/monthly', page: P }] },
      { name: '리스크', locked: true },
      { cat: '지배구조', items: [{ name: '감사', path: '/audit', page: P }] },
    ]);
  });

  test('손으로 적은 항목은 기능보다 앞에 오고, 같은 이름의 카테고리는 기능과 합쳐진다', () => {
    const manual: MenuEntry[] = [
      { name: '예산', locked: true },
      { cat: '계획 · 실적', items: [{ name: '월간 실적', path: '/monthly', page: P }] },
    ];
    const menu = buildMenu({ kpi: feature('실적', { cat: '계획 · 실적' }) }, manual);

    expect(menu).toEqual([
      { name: '예산', locked: true },
      {
        cat: '계획 · 실적',
        items: [
          { name: '월간 실적', path: '/monthly', page: P },
          { name: '실적', path: '/kpi', page: P },
        ],
      },
    ]);
  });

  test('만든 목록은 셸의 규칙 검사(낱개 기능은 카테고리 사이에 끼우지 않는다)를 통과한다', () => {
    const menu = buildMenu(
      {
        a: feature('가', { cat: '첫째' }),
        b: feature('나'),
        c: feature('다', { cat: '둘째' }),
        d: feature('라'),
      },
      [{ name: '예산', locked: true }],
    );

    expect(checkMenu(menu)).toEqual([]);
  });
});
