/* 셸이 읽는 설정 — 셸 파일이다. 고치지 않는다.

   App.tsx 가 메뉴 목록(src/routes.tsx)과 대시보드 설정(src/dashboard.config.ts)을 넘기고,
   사이드바와 상태바가 여기서 읽는다. */
import { createContext, useContext, type ReactNode } from 'react';
import type { MenuEntry } from './menu';

export type OtherDashboard = { name: string; url: string };

export type DashboardConfig = {
  /** 이 대시보드의 조직 이름. 사이드바 머리와 상태바 경로에 쓴다 */
  org: string;
  /** 사이드바 머리 드롭다운에 뜨는 다른 본부 대시보드. 비어 있으면 드롭다운을 달지 않는다 */
  others: OtherDashboard[];
};

type Shell = { menu: MenuEntry[]; config: DashboardConfig };

const ShellContext = createContext<Shell | null>(null);

export function ShellProvider({ menu, config, children }: Shell & { children: ReactNode }) {
  return <ShellContext.Provider value={{ menu, config }}>{children}</ShellContext.Provider>;
}

export function useShell(): Shell {
  const shell = useContext(ShellContext);
  if (!shell) {
    throw new Error('[shell] ShellProvider 밖에서 DashboardLayout 을 썼다. App.tsx 가 앱을 ShellProvider 로 감싸는지 확인한다.');
  }
  return shell;
}
