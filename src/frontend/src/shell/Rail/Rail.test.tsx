import { fireEvent, screen, waitFor } from '@testing-library/react';
import { RAIL_KEY, THEME_KEY } from '../prefs';
import { Page, renderShell } from '../testing';

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-rail');
  document.documentElement.setAttribute('data-theme', 'light');
});

describe('기능 목록', () => {
  test('무리 이름은 조직 이름 끝의 단위를 따른다', () => {
    renderShell();
    expect(screen.getByRole('button', { name: '본부 기능' })).toBeInTheDocument();
  });

  test('팀 대시보드면 「팀 기능」이다', () => {
    renderShell({ config: { org: '리스크관리팀', others: [] } });
    expect(screen.getByRole('button', { name: '팀 기능' })).toBeInTheDocument();
  });

  test('지금 주소의 기능 하나만 켠다', () => {
    renderShell({ path: '/kpi' });
    const on = screen.getByRole('link', { name: '실적 · KPI 관리' });
    expect(on).toHaveClass('is-on');
    expect(on).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: '전략과제 관리' })).not.toHaveClass('is-on');
    expect(document.querySelectorAll('.nav-item.is-on')).toHaveLength(1);
  });

  test('카테고리 안 기능은 카테고리 소제목 아래에 들여 그린다', () => {
    const { container } = renderShell();
    expect(container.querySelector('.nav-cat')).toHaveTextContent('계획 · 실적');
    expect(container.querySelectorAll('.nav-sub .nav-item')).toHaveLength(3);
    expect(container.querySelectorAll('.nav-group > .nav-item')).toHaveLength(1);
  });

  test('잠긴 기능은 링크가 아니고 잠긴 이유를 툴팁에 붙인다', () => {
    renderShell();
    const locked = screen.getByRole('button', { name: '경영계획 · 예산' });
    expect(locked).toHaveAttribute('aria-disabled', 'true');
    expect(locked.getAttribute('title')).toContain('접근 권한이 없습니다');
    expect(screen.queryByRole('link', { name: '경영계획 · 예산' })).toBeNull();
  });

  test('무리 이름을 누르면 무리가 접힌다', () => {
    const { container } = renderShell();
    const label = screen.getByRole('button', { name: '본부 기능' });
    fireEvent.click(label);
    expect(container.querySelector('.nav-group')).toHaveClass('is-closed');
    expect(label).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('주소', () => {
  test('메뉴에 없는 주소는 「없는 주소」 페이지를 보여 준다', () => {
    renderShell({ path: '/nope' });
    expect(screen.getByRole('heading', { name: '없는 주소' })).toBeInTheDocument();
  });

  test('메뉴에 / 가 없으면 첫 화면이 / 를 맡는다', () => {
    renderShell({ path: '/' });
    expect(screen.getByRole('heading', { name: '첫 화면' })).toBeInTheDocument();
  });

  test('메뉴에 / 가 있으면 그 기능이 / 를 맡는다', () => {
    renderShell({ path: '/', menu: [{ name: '경영 현황', path: '/', page: Page }] });
    expect(screen.getByRole('heading', { name: '페이지' })).toBeInTheDocument();
  });
});

describe('사이드바 접기', () => {
  test('여닫기 단추가 <html data-rail> 을 바꾸고 저장한다', () => {
    renderShell();
    fireEvent.click(screen.getByRole('button', { name: '사이드바 접기' }));
    expect(document.documentElement.getAttribute('data-rail')).toBe('collapsed');
    expect(localStorage.getItem(RAIL_KEY)).toBe('collapsed');

    fireEvent.click(screen.getByRole('button', { name: '사이드바 펼치기' }));
    expect(document.documentElement.hasAttribute('data-rail')).toBe(false);
    expect(localStorage.getItem(RAIL_KEY)).toBe('open');
  });
});

describe('본부 전환', () => {
  test('다른 대시보드가 없으면 드롭다운을 달지 않는다', () => {
    const { container } = renderShell();
    expect(container.querySelector('.org-pop')).toBeNull();
    expect(container.querySelector('.org-cv')).toBeNull();
  });

  test('다른 대시보드가 있으면 조직 이름을 눌러 목록을 열고 Esc 로 닫는다', () => {
    const { container } = renderShell({
      config: { org: '경영전략본부', others: [{ name: '주식운용본부', url: 'https://stock.example' }] },
    });
    fireEvent.click(screen.getByRole('button', { name: /경영전략본부/ }));
    const pop = container.querySelector('.org-pop');
    expect(pop).toHaveClass('is-open');
    expect(screen.getByRole('link', { name: '주식운용본부' })).toHaveAttribute('href', 'https://stock.example');
    expect(container.querySelector('.org-pop a.is-cur')).toHaveTextContent('경영전략본부');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(pop).not.toHaveClass('is-open');
  });
});

describe('하단 프로필', () => {
  // 조회 중에 「사용자」를 그리면 게이트웨이 뒤에서 「사용자」가 잠깐 보였다가 이름으로 바뀐다.
  test('조회 중에는 이름과 아바타 글자를 비워 둔다', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    const { container } = renderShell();
    expect(container.querySelector('.rail-me .av')).toBeEmptyDOMElement();
    expect(container.querySelector('.rail-me .nm')).toBeEmptyDOMElement();
    expect(screen.queryByRole('button', { name: '로그아웃' })).toBeNull();
  });

  // 게이트웨이 밖(개발 서버 등)에서는 조회가 실패한다.
  test('계정을 모르면 「사용자」로 그리고 아이디 칸을 두지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('끊김'); }));
    const { container } = renderShell();
    await waitFor(() => expect(container.querySelector('.rail-me .nm')).toHaveTextContent('사용자'));
    expect(container.querySelector('.rail-me .av')).toHaveTextContent('사');
    expect(container.querySelector('.rail-me .id')).toBeNull();
  });

  // 게이트웨이 뒤에서는 /auth/api/me 가 로그인한 사람을 돌려준다.
  test('로그인한 사람의 이름과 아이디를 그리고 로그아웃 단추를 둔다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ userId: 7, name: '홍길동', emailId: 'hong.gd' })));
    const { container } = renderShell();

    expect(await screen.findByText('홍길동')).toBeInTheDocument();
    expect(container.querySelector('.rail-me .av')).toHaveTextContent('홍');
    expect(container.querySelector('.rail-me .id')).toHaveTextContent('hong.gd');
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
  });

  test('로그인하지 않았으면 「사용자」로 그리고 로그아웃 단추를 두지 않는다', async () => {
    const fetchMock = vi.fn(async () => Response.json({ authenticated: false }));
    vi.stubGlobal('fetch', fetchMock);
    const { container } = renderShell();

    expect(fetchMock).toHaveBeenCalledWith('/auth/api/me', expect.anything());
    await waitFor(() => expect(container.querySelector('.rail-me .nm')).toHaveTextContent('사용자'));
    expect(screen.queryByRole('button', { name: '로그아웃' })).toBeNull();
  });

  test('프로필을 눌러 설정 판을 열고 밤을 고른다', () => {
    const { container } = renderShell();
    fireEvent.click(screen.getByRole('button', { name: '내 계정 · 설정' }));
    expect(container.querySelector('.rail-pop')).toHaveClass('is-open');

    fireEvent.click(screen.getByRole('button', { name: '밤' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(screen.getByRole('button', { name: '밤' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('접힌 사이드바에서는 설정 판을 열지 않는다', () => {
    const { container } = renderShell();
    fireEvent.click(screen.getByRole('button', { name: '사이드바 접기' }));
    fireEvent.click(screen.getByRole('button', { name: '내 계정 · 설정' }));
    expect(container.querySelector('.rail-pop')).not.toHaveClass('is-open');
  });
});
