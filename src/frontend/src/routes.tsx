/* 메뉴 목록 — 기능을 붙이는 곳이다.

   기능은 src/features/<기능 이름>/ 폴더 하나이고, 그 안의 menu.ts 가 메뉴 한 줄을 내보낸다.
   이 파일은 그 폴더들을 모아 메뉴 목록을 만든다. 기능을 붙일 때 이 파일을 고치지 않는다.
   기능 이름은 영문 소문자와 숫자와 하이픈으로 짓는다. 기능 레포에서 이전한 기능은 그 레포 이름을 그대로 쓴다.

     // src/features/kpi/menu.ts
     import Kpi from './page';
     import type { FeatureMenu } from '../../feature-menu';
     const menu: FeatureMenu = { name: '실적 · KPI 관리', page: Kpi, cat: '계획 · 실적' };
     export default menu;

   menu.ts 의 칸은 feature-menu.ts 의 FeatureMenu 타입에 있다. 주소는 안 적으면 /<폴더 이름>이고,
   대시보드의 첫 화면이 될 기능 하나만 path: '/' 를 적는다. 줄의 모양과 카테고리 규칙은
   src/shell/menu.ts 가 정하고, 규칙을 어기면 브라우저 콘솔에 [shell] 경고가 나온다.
   기능 API 는 백엔드의 /api/<기능 이름> 아래에 저절로 붙는다(src/backend/features/<기능 이름>/router.py).

   폴더가 없는 항목은 아래 manualMenu 에 직접 적는다. 예를 들어 권한이 없어 잠긴 기능이다.

     { name: '경영계획 · 예산', locked: true }                        ← 권한이 없어 잠긴 기능
     { cat: '계획 · 실적', items: [ …기능 줄… ] }                      ← 기능 몇 개를 묶는 소제목 */
import { buildMenu, collectFeatureMenus, type FeatureMenu } from './feature-menu';
import type { MenuEntry } from './shell/menu';

const manualMenu: MenuEntry[] = [];

const featureMenus = collectFeatureMenus(
  import.meta.glob<{ default: FeatureMenu }>('./features/*/menu.ts', { eager: true }),
);

export const menu: MenuEntry[] = buildMenu(featureMenus, manualMenu);
