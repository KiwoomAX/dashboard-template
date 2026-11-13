/* 대시보드 레이아웃 — 셸 파일이다.

   페이지는 자기 내용을 이 컴포넌트 안에 넣는다. 상태바는 이 컴포넌트가 그리고, 사이드바와
   알림 서랍은 셸 틀(ShellFrame)이 한 번만 그려 둔다. 페이지가 넘길 수 있는 것은 아래 props 뿐이다. */
import type { ReactNode } from 'react';
import StatusBar, { type StatusBarProps } from './StatusBar/StatusBar';

export type DashboardLayoutProps = StatusBarProps & {
  /** 내용 구획에 들어갈 것 */
  children?: ReactNode;
  /** 내용 구획의 정렬은 페이지가 자유롭게 정한다. 넘기지 않으면 제안값인 중앙에 둔다 */
  contentAlign?: 'left' | 'right';
  /** 상태바를 직접 꾸릴 때 넘긴다. header.topbar 틀과 h1 제목과 AlertBell 을 남긴다. 넘기면 기본 상태바 대신 쓴다 */
  statusBar?: ReactNode;
};

export default function DashboardLayout({ children, contentAlign, statusBar: custom, ...statusBar }: DashboardLayoutProps) {
  return (
    <div className="main">
      {custom ?? <StatusBar {...statusBar} />}
      <main className="content" aria-label="내용" data-align={contentAlign}>
        {children}
      </main>
    </div>
  );
}
