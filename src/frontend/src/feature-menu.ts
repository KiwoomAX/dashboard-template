/* 기능 폴더의 menu.ts 로 메뉴 목록을 만든다.

   기능은 src/features/<기능 이름>/ 폴더 하나이고, 그 안의 menu.ts 가 메뉴 한 줄을 내보낸다.
   routes.tsx 가 이 폴더들을 모아 buildMenu 로 메뉴 목록을 만든다. 그래서 기능을 붙일 때
   routes.tsx 를 고치지 않는다. 셸 파일이 아니므로 대시보드에서 고쳐도 된다. */
import type { ComponentType } from 'react';
import type { MenuCategory, MenuEntry, MenuItem, MenuNode, ParentItem } from './shell/menu';
import { isCategory, isParent } from './shell/menu';

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
  /** 하위 기능을 가진 기능의 이름. 같은 카테고리(또는 같은 낱개 기능 목록) 안에서 이 이름이 같은 기능끼리 한 기능 아래 하위 기능으로 묶인다. 안 적으면 낱개 기능이다. 첫 화면 기능(path: '/')은 적어도 낱개로 둔다 */
  parent?: string;
  /** 사이드바 이름 오른쪽에 붙일 짧은 표시(숫자 · 글자). 알림 건수가 아니어도 된다. 안 적으면 없다 */
  marker?: string;
};

const FEATURE_MENU_FILE = /\/features\/([^/]+)\/menu\.ts$/;

/** import.meta.glob('./features/*\/menu.ts', { eager: true }) 의 결과를 폴더 이름별로 모은다 */
export function collectFeatureMenus(modules: Record<string, { default: FeatureMenu }>): Record<string, FeatureMenu> {
  const collected: Record<string, FeatureMenu> = {};
  for (const [file, mod] of Object.entries(modules)) {
    const folder = FEATURE_MENU_FILE.exec(file)?.[1];
    if (folder) collected[folder] = mod.default;
  }
  return collected;
}

/* 이름이 같은 하위 기능 묶음(ParentItem)을 하나로 합친다. 직접 적은 목록(manual)에 「펀드 현황」 묶음이 있고
   기능 폴더의 menu.ts 에도 parent: '펀드 현황' 이 있으면 사이드바에 같은 이름의 묶음이 둘 생기기 때문이다.
   직접 적은 목록의 객체는 고치지 않고 합친 새 객체를 만든다 */
function mergeParents<T extends MenuEntry>(list: T[]): T[] {
  const result: T[] = [];
  for (const entry of list) {
    const at = isParent(entry) ? result.findIndex((e) => isParent(e) && e.name === entry.name) : -1;
    const same = result[at];
    if (same && isParent(same) && isParent(entry)) result[at] = { ...same, items: [...same.items, ...entry.items] };
    else result.push(entry);
  }
  return result;
}

/** 기능 폴더별 메뉴 정의로 메뉴 목록을 만든다.

    손으로 적은 항목(manual)은 적은 순서를 그대로 지킨다. 기능은 폴더 이름순으로 끼워 넣는다.
    낱개 기능은 손으로 적은 낱개 항목 바로 뒤, 첫 카테고리 앞에 모은다. 같은 이름의 카테고리는
    하나로 합치고, 새 카테고리는 맨 뒤에 놓는다. 셸이 낱개 기능을 카테고리 사이에 끼우면
    경고하기 때문이다. 손으로 적은 순서가 셸 규칙을 어기면 고치지 않고 셸의 경고에 맡긴다. */
export function buildMenu(features: Record<string, FeatureMenu>, manual: MenuEntry[] = []): MenuEntry[] {
  // 폴더 이름순. 같은 목록이 늘 같은 순서로 나오게 한다
  const byFolder = ([a]: [string, FeatureMenu], [b]: [string, FeatureMenu]) => (a < b ? -1 : a > b ? 1 : 0);
  // 기능 하나를 목록에 놓는다. parent 가 있으면 같은 이름의 기능 아래 하위 기능으로 넣는다
  const place = (list: MenuNode[], item: MenuItem, parent?: string) => {
    if (parent === undefined) {
      list.push(item);
      return;
    }
    const existing = list.find((node): node is ParentItem => isParent(node) && node.name === parent);
    if (existing) existing.items.push(item);
    else list.push({ name: parent, items: [item] });
  };
  const loose: MenuNode[] = [];
  const byCat = new Map<string, MenuNode[]>();
  for (const [folder, feature] of Object.entries(features).sort(byFolder)) {
    const item: MenuItem = { name: feature.name, path: feature.path ?? `/${folder}`, page: feature.page, ...(feature.marker && { marker: feature.marker }) };
    if (feature.cat === undefined) {
      // 첫 화면 기능은 폴더 이름과 상관없이 낱개 기능 중 맨 앞에 둔다
      if (item.path === '/') loose.unshift(item);
      else place(loose, item, feature.parent);
    } else {
      const list = byCat.get(feature.cat) ?? [];
      place(list, item, feature.parent);
      byCat.set(feature.cat, list);
    }
  }

  const out: MenuEntry[] = [];
  let looseInserted = false;
  const insertLoose = () => {
    if (!looseInserted) out.push(...loose);
    looseInserted = true;
  };
  for (const entry of manual) {
    if (isCategory(entry)) {
      insertLoose();
      const extra = byCat.get(entry.cat) ?? [];
      byCat.delete(entry.cat);
      out.push(extra.length ? { cat: entry.cat, items: mergeParents([...entry.items, ...extra]) } : entry);
    } else {
      out.push(entry);
    }
  }
  insertLoose();
  for (const [cat, items] of byCat) out.push({ cat, items } satisfies MenuCategory);
  return mergeParents(out);
}
