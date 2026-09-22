/* 대시보드 레이아웃 — 셸 파일이다. 고치지 않는다.

   페이지는 자기 내용을 이 컴포넌트 안에 넣는다. 상태바는 이 컴포넌트가 그리고, 사이드바와
   알림 서랍은 셸 틀(ShellFrame)이 한 번만 그려 둔다. 페이지가 넘길 수 있는 것은 아래 props 뿐이다. */
import type { ReactNode } from 'react';
import StatusBar, { type StatusBarProps } from './StatusBar/StatusBar';

export type DashboardLayoutProps = StatusBarProps & {
  /** 내용 구획에 들어갈 것 */
  children?: ReactNode;
};

export default function DashboardLayout({ children, ...statusBar }: DashboardLayoutProps) {
  return (
    <div className="main">
      <StatusBar {...statusBar} />
      <main className="content" aria-label="내용">
        {children}
      </main>
    </div>
  );
}
