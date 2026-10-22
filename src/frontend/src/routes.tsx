/* 메뉴 목록 — 기능 폴더를 모아 만든다. 기능을 붙일 때 이 파일을 고치지 않는다.

   기능은 src/features/<기능 이름>/ 폴더 하나이고, 그 안의 menu.ts 가 메뉴 한 줄을 내보낸다.
   menu.ts 의 칸은 feature-menu.ts 의 FeatureMenu 타입에 있다.

     // src/features/kpi/menu.ts
     import Kpi from './page';
     import type { FeatureMenu } from '../../feature-menu';
     const menu: FeatureMenu = { name: '실적 · KPI 관리', page: Kpi, cat: '계획 · 실적' };
     export default menu;

   폴더가 없는 항목은 아래 manualMenu 에 직접 적는다.
   예: { name: '경영계획 · 예산', locked: true } (권한이 없어 잠긴 기능) */
import { buildMenu, collectFeatureMenus, type FeatureMenu } from './feature-menu';
import type { MenuEntry } from './shell/menu';

const manualMenu: MenuEntry[] = [];

const featureMenus = collectFeatureMenus(
  import.meta.glob<{ default: FeatureMenu }>('./features/*/menu.ts', { eager: true }),
);

export const menu: MenuEntry[] = buildMenu(featureMenus, manualMenu);
