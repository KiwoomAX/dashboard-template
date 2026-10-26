/* 로그인한 사람 — 셸 파일이다. 고치지 않는다.

   게이트웨이(Kiwoom-Gateway) 뒤에서는 같은 출처의 /auth/api/me 가 로그인한 사람(kiwoom-auth 의
   SessionUser — name · emailId)을 돌려준다. 개발 서버나 아직 게이트웨이 뒤에 있지 않은 대시보드에서는
   그 주소가 JSON 이 아니거나 authenticated:false 를 돌려주므로 「사용자」로 그린다. */
import { useEffect, useState } from 'react';

export type SessionUser = { name: string; emailId: string };

/* 로그인한 사람을 모를 때 그리는 값 — 이름은 「사용자」, 아이디는 비워 둔다 */
export const GUEST: SessionUser = { name: '사용자', emailId: '' };

/** 로그인한 사람. 모르면(미로그인·게이트웨이 밖·호출 실패) null. */
export async function fetchCurrentUser(): Promise<SessionUser | null> {
  try {
    const r = await fetch('/auth/api/me', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    const body = await r.json();
    if (typeof body?.name !== 'string' || body.name === '') return null;
    return { name: body.name, emailId: typeof body.emailId === 'string' ? body.emailId : '' };
  } catch {
    return null;
  }
}

/** 화면이 열릴 때 한 번 묻는다. 답이 오기 전과 모를 때는 null. */
export function useCurrentUser(): SessionUser | null {
  const [user, setUser] = useState<SessionUser | null>(null);
  useEffect(() => {
    let alive = true;
    fetchCurrentUser().then((u) => {
      if (alive) setUser(u);
    });
    return () => {
      alive = false;
    };
  }, []);
  return user;
}

/* 로그아웃 쿠키를 지운 뒤 다시 읽는다 — 게이트웨이가 로그인 화면으로 보내고, 다시 로그인하면 이 포트로 돌아온다.
   호출이 실패해도 다시 읽는다. 화면에 머물면 로그아웃이 고장으로 읽힌다. */
export async function logout(reload: () => void = () => window.location.reload()): Promise<void> {
  try {
    await fetch('/auth/api/logout', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
  } catch {
    /* 다시 읽기로 넘어간다 */
  }
  reload();
}
