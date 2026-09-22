/* 셸이 읽는 설정 — 셸 파일이다. 고치지 않는다.

   App.tsx 가 메뉴 목록(src/routes.tsx)과 대시보드 설정(src/dashboard.config.ts)을 넘기고,
   사이드바와 상태바가 여기서 읽는다. */
import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { checkMenu, type MenuEntry } from './menu';

export type OtherDashboard = { name: string; url: string };

export type DashboardConfig = {
  /** 이 대시보드의 조직 이름. 사이드바 머리와 상태바 경로에 쓴다 */
  org: string;
  /** 사이드바 머리 드롭다운에 뜨는 다른 본부 대시보드. 비어 있으면 드롭다운을 달지 않는다 */
  others: OtherDashboard[];
};

type Shell = { menu: MenuEntry[]; config: DashboardConfig };

const ShellContext = createContext<Shell | null>(null);

/* 같은 목록을 두 번 알리지 않는다. 개발 모드(StrictMode)는 effect 를 두 번 실행한다 */
const checked = new WeakSet<MenuEntry[]>();

export function ShellProvider({ menu, config, children }: Shell & { children: ReactNode }) {
  /* 메뉴 규칙을 어긴 줄이 있으면 콘솔에 알린다. 화면은 적은 그대로 그린다 */
  useEffect(() => {
    if (checked.has(menu)) return;
    checked.add(menu);
    checkMenu(menu).forEach((warning) => console.warn(`[shell] ${warning}`));
  }, [menu]);

  return <ShellContext.Provider value={{ menu, config }}>{children}</ShellContext.Provider>;
}

export function useShell(): Shell {
  const shell = useContext(ShellContext);
  if (!shell) {
    throw new Error('[shell] ShellProvider 밖에서 DashboardLayout 을 썼다. App.tsx 가 앱을 ShellProvider 로 감싸는지 확인한다.');
  }
  return shell;
}
