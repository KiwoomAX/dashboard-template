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
