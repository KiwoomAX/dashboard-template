/* 메뉴 목록 — 기능을 붙이는 곳이다.

   기능 하나는 이 목록의 줄 하나다. 줄 하나가 사이드바 메뉴와 주소와 페이지를 함께 정한다.
   줄의 모양은 src/shell/menu.ts 가 정한다.

     { name: '경영 현황', path: '/status', page: ManagementStatus }   ← 여는 기능
     { name: '경영계획 · 예산', locked: true }                        ← 권한이 없어 잠긴 기능
     { cat: '계획 · 실적', items: [ …기능 줄… ] }                      ← 기능 몇 개를 묶는 소제목

   카테고리는 한 단만 묶고, 낱개 기능보다 먼저 적고, 안에 기능을 둘 이상 넣는다.
   기능 API 는 백엔드의 /api/<기능 이름> 아래에 둔다. */
import type { MenuEntry } from './shell/menu';

export const menu: MenuEntry[] = [];
