/* 메뉴 스키마 — 셸 파일이다. 고치지 않는다.

   기능 하나를 붙이는 방법은 src/routes.tsx 의 메뉴 목록에 줄 하나를 추가하는 것이다.
   줄 하나가 메뉴 이름과 주소와 페이지를 함께 정한다. 이 파일의 타입이 줄의 모양을 정하므로
   주소나 페이지가 빠지면 저장할 때 TypeScript 오류가 난다. */
import type { ComponentType } from 'react';
import { matchPath } from 'react-router-dom';

/** 여는 기능 — 이름 · 주소 · 페이지를 모두 적는다 */
export type OpenItem = { name: string; path: string; page: ComponentType; locked?: never };

/** 권한이 없어 잠긴 기능 — 목록에서 지우지 않고 자물쇠로 보여 준다 */
export type LockedItem = { name: string; locked: true; path?: never; page?: never };

export type MenuItem = OpenItem | LockedItem;

/** 기능 몇 개를 묶는 소제목. 안에는 기능만 온다 — 카테고리는 한 단만 묶는다 */
export type MenuCategory = { cat: string; items: MenuItem[] };

export type MenuEntry = MenuItem | MenuCategory;

export function isCategory(entry: MenuEntry): entry is MenuCategory {
  return 'cat' in entry;
}

export function isOpenItem(item: MenuItem): item is OpenItem {
  return !item.locked;
}

/** 지금 주소가 이 기능의 주소인지. 사이드바의 켜진 항목과 상태바의 경로 표시가 함께 쓴다 */
export function isActive(item: OpenItem, pathname: string): boolean {
  return matchPath({ path: item.path, end: true }, pathname) !== null;
}

/** 카테고리를 벗겨 기능만 한 줄로 편다 */
export function flatten(menu: MenuEntry[]): MenuItem[] {
  return menu.flatMap((entry) => (isCategory(entry) ? entry.items : [entry]));
}

/* 타입이 막지 못하는 규칙 셋을 검사해 경고 문장을 돌려준다. 고쳐서 그리지는 않는다 —
   셸이 순서를 몰래 바꾸면 적은 목록과 화면이 달라 보여 더 찾기 어렵다.
   이름은 값으로 들어오므로 조사를 붙이지 않고 문장 끝에 둔다. */
export function checkMenu(menu: MenuEntry[]): string[] {
  const warnings: string[] = [];

  let singleSeen = false;
  for (const entry of menu) {
    if (!isCategory(entry)) {
      singleSeen = true;
      continue;
    }
    if (singleSeen) warnings.push(`카테고리는 낱개 기능보다 먼저 적는다 — ${entry.cat}`);
    if (entry.items.length < 2) {
      warnings.push(`카테고리 안 기능이 둘 미만이면 묶지 말고 낱개로 둔다 — ${entry.cat} ${entry.items.length}개`);
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
