/* 이 대시보드의 조직 이름과 다른 본부 대시보드 주소 — 레포 하나에 한 번만 적는다.
   사이드바 머리와 상태바 경로가 여기서 읽는다. */
import type { DashboardConfig } from './shell/ShellContext';

export const dashboard: DashboardConfig = {
  /* 자기 조직 이름으로 바꾼다. 끝이 「본부」면 사이드바 무리 이름이 「본부 기능」, 「팀」이면
     「팀 기능」이 된다 */
  org: '경영전략본부',
  /* 사이드바 머리 드롭다운에 뜨는 다른 본부 대시보드. 비어 있으면 드롭다운을 달지 않는다.
     로그인이 연결되면 그 사람이 들어갈 수 있는 본부 목록에서 온다.
       { name: '주식운용본부', url: 'https://…' } */
  others: [],
};
