/* 로그인한 사람 — 셸 파일이다. 고치지 않는다.

   로그인은 아직 연결하지 않았다. 그 전까지 이 상수로 흉내 낸다. 모양은 챗봇의 로그인
   사용자(/auth/api/me 가 돌려주는 SessionUser 의 name · emailId)와 같다. 연결할 때 이
   상수만 인증 호출로 바꾸면 사이드바 하단 프로필이 그대로 그 사람을 그린다. */
export type SessionUser = { name: string; emailId: string };

/* 계정이 아직 없어 이름은 「사용자」로, 아이디는 비워 둔다 */
export const currentUser: SessionUser = { name: '사용자', emailId: '' };
