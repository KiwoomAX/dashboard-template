/* 메뉴 스키마 — 셸 파일이다. 고치지 않는다.

   기능 하나를 붙이는 방법은 src/routes.tsx 의 메뉴 목록에 줄 하나를 추가하는 것이다.
   줄 하나가 메뉴 이름과 주소와 페이지를 함께 정한다. 이 파일의 타입이 줄의 모양을 정하므로
   주소나 페이지가 빠지면 저장할 때 TypeScript 오류가 난다. */
import type { ComponentType } from 'react';
import { matchPath } from 'react-router-dom';

/** 여는 기능 — 이름 · 주소 · 페이지를 모두 적는다 */
export type OpenItem = { name: string; path: string; page: ComponentType; locked?: never; marker?: string };

/** 권한이 없어 잠긴 기능 — 목록에서 지우지 않고 자물쇠로 보여 준다 */
export type LockedItem = { name: string; locked: true; path?: never; page?: never };

export type MenuItem = OpenItem | LockedItem;

/** 하위 기능을 가진 기능 — 자기 화면은 없고, 누르면 그 안에서 처음 열리는 하위 기능으로 간다.
    하위 기능이 필요 없으면 쓰지 않는다. 하위 기능은 한 단만 둔다 */
export type ParentItem = { name: string; items: MenuItem[]; locked?: never; path?: never; page?: never };

/** 기능 하나 — 낱개 기능이거나 하위 기능을 가진 기능 */
export type MenuNode = MenuItem | ParentItem;

/** 기능 몇 개를 묶는 소제목. 안에는 기능이 온다 — 카테고리는 한 단만 묶는다 */
export type MenuCategory = { cat: string; items: MenuNode[] };

export type MenuEntry = MenuNode | MenuCategory;

export function isCategory(entry: MenuEntry): entry is MenuCategory {
  return 'cat' in entry;
}

export function isParent(entry: MenuEntry): entry is ParentItem {
  return !('cat' in entry) && 'items' in entry;
}

/* 기능 하나를 화면이 있는 기능들로 편다. 하위 기능을 가진 기능은 하위 기능만 남는다 */
function leaves(node: MenuNode): MenuItem[] {
  return isParent(node) ? node.items : [node];
}

export function isOpenItem(item: MenuItem): item is OpenItem {
  return !item.locked;
}

/** 지금 주소가 이 기능의 주소인지. 사이드바의 켜진 항목과 상태바의 경로 표시가 함께 쓴다 */
export function isActive(item: OpenItem, pathname: string): boolean {
  return matchPath({ path: item.path, end: true }, pathname) !== null;
}

/** 카테고리나 하위 기능을 가진 기능 안에서 처음 열리는 기능. 그 이름을 누르면 여기로 간다. 열리는 기능이 없으면 undefined */
export function firstOpen(target: MenuCategory | ParentItem): OpenItem | undefined {
  const nodes: MenuNode[] = target.items;
  return nodes.flatMap(leaves).find(isOpenItem);
}

/** 지금 주소가 속한 기능과 그 위의 기능 · 카테고리. 상태바의 「본부 › 카테고리 › 기능 › 하위 기능」 경로가 쓴다 */
export type Trail = { item: OpenItem; parent?: ParentItem; category?: MenuCategory };

export function findTrail(menu: MenuEntry[], pathname: string): Trail | undefined {
  const inNodes = (nodes: MenuNode[], category?: MenuCategory): Trail | undefined => {
    for (const node of nodes) {
      if (isParent(node)) {
        const item = node.items.find((it): it is OpenItem => isOpenItem(it) && isActive(it, pathname));
        if (item) return { item, parent: node, ...(category && { category }) };
      } else if (isOpenItem(node) && isActive(node, pathname)) {
        return { item: node, ...(category && { category }) };
      }
    }
    return undefined;
  };
  for (const entry of menu) {
    const found = isCategory(entry) ? inNodes(entry.items, entry) : inNodes([entry]);
    if (found) return found;
  }
  return undefined;
}

/** 카테고리와 하위 기능을 벗겨 화면이 있는 기능만 한 줄로 편다 */
export function flatten(menu: MenuEntry[]): MenuItem[] {
  return menu.flatMap((entry) => (isCategory(entry) ? entry.items.flatMap(leaves) : leaves(entry)));
}

/* 타입이 막지 못하는 규칙 둘을 검사해 경고 문장을 돌려준다. 낱개 기능은 카테고리 앞이나 뒤에
   모아 두고 카테고리 사이에 끼우지 않는다. 주소는 기능마다 달라야 한다. 고쳐서 그리지는 않는다 —
   셸이 순서를 몰래 바꾸면 적은 목록과 화면이 달라 보여 더 찾기 어렵다.
   이름은 값으로 들어오므로 조사를 붙이지 않고 문장 끝에 둔다. */
export function checkMenu(menu: MenuEntry[]): string[] {
  const warnings: string[] = [];

  let categorySeen = false;
  let strayName: string | null = null;
  for (const entry of menu) {
    if (!isCategory(entry)) {
      if (categorySeen && strayName === null) strayName = entry.name;
      continue;
    }
    categorySeen = true;
    if (strayName !== null) {
      warnings.push(`낱개 기능은 카테고리 사이에 끼우지 않는다 — ${strayName}`);
      strayName = null;
    }
  }

  const nodes = menu.flatMap((entry) => (isCategory(entry) ? entry.items : [entry]));
  for (const node of nodes) {
    if (isParent(node) && node.items.length === 0) {
      warnings.push(`하위 기능이 없는 기능은 낱개 기능으로 적는다 — ${node.name}`);
    }
  }

  const seen = new Map<string, string>();
  for (const item of flatten(menu).filter(isOpenItem)) {
    const first = seen.get(item.path);
    if (first) warnings.push(`주소는 기능마다 달라야 한다 — ${item.path} : ${first} · ${item.name}`);
    else seen.set(item.path, item.name);
  }

  return warnings;
}
