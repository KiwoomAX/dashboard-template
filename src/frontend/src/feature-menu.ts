/* 기능 폴더의 menu.ts 로 메뉴 목록을 만든다.

   기능은 src/features/<기능 이름>/ 폴더 하나이고, 그 안의 menu.ts 가 메뉴 한 줄을 내보낸다.
   routes.tsx 가 이 폴더들을 모아 buildMenu 로 메뉴 목록을 만든다. 그래서 기능을 붙일 때
   routes.tsx 를 고치지 않는다. 셸 파일이 아니므로 대시보드에서 고쳐도 된다. */
import type { ComponentType } from 'react';
import type { MenuCategory, MenuEntry, MenuItem } from './shell/menu';
import { isCategory } from './shell/menu';

/** 기능 폴더의 menu.ts 가 `export default` 로 내보내는 모양 */
export type FeatureMenu = {
  /** 사이드바에 보일 이름 */
  name: string;
  /** 기능 화면 */
  page: ComponentType;
  /** 주소. 안 적으면 /<폴더 이름>. 대시보드의 첫 화면이 될 기능 하나만 '/' 를 적는다 */
  path?: string;
  /** 묶을 카테고리 이름. 같은 이름끼리 한 카테고리로 합친다. 안 적으면 낱개 기능이다 */
  cat?: string;
};

type Slot = { cat?: string; item: MenuItem };

const FEATURE_MENU_FILE = /\/features\/([^/]+)\/menu\.[cm]?[jt]sx?$/;

/** import.meta.glob('./features/*\/menu.ts', { eager: true }) 의 결과를 폴더 이름별로 모은다 */
export function collectFeatureMenus(modules: Record<string, { default: FeatureMenu }>): Record<string, FeatureMenu> {
  const collected: Record<string, FeatureMenu> = {};
  for (const [file, mod] of Object.entries(modules)) {
    const folder = FEATURE_MENU_FILE.exec(file)?.[1];
    if (folder) collected[folder] = mod.default;
  }
  return collected;
}

/** 기능 폴더별 메뉴 정의로 메뉴 목록을 만든다.

    손으로 적은 항목(manual)이 먼저 오고, 기능이 그 뒤에 온다. 낱개 기능은 카테고리 앞에 모으고
    같은 이름의 카테고리는 하나로 합친다. 셸이 낱개 기능을 카테고리 사이에 끼우면 경고하기 때문이다. */
export function buildMenu(features: Record<string, FeatureMenu>, manual: MenuEntry[] = []): MenuEntry[] {
  const slots: Slot[] = [];
  for (const entry of manual) {
    if (isCategory(entry)) entry.items.forEach((item) => slots.push({ cat: entry.cat, item }));
    else slots.push({ item: entry });
  }

  // 폴더 이름순. 같은 목록이 늘 같은 순서로 나오게 한다
  const byFolder = ([a]: [string, FeatureMenu], [b]: [string, FeatureMenu]) => (a < b ? -1 : a > b ? 1 : 0);
  for (const [folder, feature] of Object.entries(features).sort(byFolder)) {
    slots.push({
      cat: feature.cat,
      item: { name: feature.name, path: feature.path ?? `/${folder}`, page: feature.page },
    });
  }

  const loose: MenuItem[] = [];
  const categories = new Map<string, MenuItem[]>();
  for (const { cat, item } of slots) {
    if (cat === undefined) loose.push(item);
    else categories.set(cat, [...(categories.get(cat) ?? []), item]);
  }
  const grouped: MenuCategory[] = [...categories].map(([cat, items]) => ({ cat, items }));
  return [...loose, ...grouped];
}
