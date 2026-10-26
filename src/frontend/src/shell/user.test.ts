import { logout } from './user';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('로그아웃', () => {
  test('kiwoom-auth 에 로그아웃을 보내고 페이지를 다시 읽는다', async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const reload = vi.fn();

    await logout(reload);

    expect(fetchMock).toHaveBeenCalledWith('/auth/api/logout', expect.objectContaining({ method: 'POST', body: '{}' }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  // 다시 읽으면 게이트웨이가 로그인 화면으로 보낸다. 호출이 실패해도 화면에 머물지 않는다.
  test('로그아웃 호출이 실패해도 페이지를 다시 읽는다', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network'); }));
    const reload = vi.fn();

    await logout(reload);

    expect(reload).toHaveBeenCalledTimes(1);
  });
});
