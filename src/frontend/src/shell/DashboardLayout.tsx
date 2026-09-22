/* 대시보드 레이아웃 — 셸 파일이다. 고치지 않는다.

   페이지는 자기 내용을 이 컴포넌트 안에 넣는다. 사이드바 · 상태바 · 알림 서랍은
   이 컴포넌트가 그리고, 페이지가 넘길 수 있는 것은 아래 props 뿐이다. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Rail from './Rail/Rail';
import StatusBar, { type StatusBarProps } from './StatusBar/StatusBar';

export type DashboardDrawer = {
  /** 상태바 종에 붙는 건수. 무엇을 셀지는 페이지가 정한다. 0 이거나 없으면 배지를 달지 않는다 */
  count?: number;
  /** 서랍 안에 넣을 내용 */
  children: ReactNode;
};

export type DashboardLayoutProps = StatusBarProps & {
  /** 알림 서랍. 주면 상태바에 종 단추를 달고, 누르면 오른쪽에 서랍이 열린다 */
  drawer?: DashboardDrawer;
  /** 내용 구획에 들어갈 것 */
  children?: ReactNode;
};

export default function DashboardLayout({ drawer, children, ...statusBar }: DashboardLayoutProps) {
  /* 서랍은 닫힌 상태로 시작하고 저장하지 않는다. 한 번 열어 둔 사람에게 영영 열려 있으면
     기본값을 바꿔도 그 사람 화면만 옛 상태로 남는다 */
  const [open, setOpen] = useState(false);
  const sideRef = useRef<HTMLElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();

  /* 다른 기능으로 옮겨 가면 닫는다. 같은 페이지 컴포넌트를 쓰는 두 주소 사이에서도 닫힌다 */
  useEffect(() => setOpen(false), [pathname]);

  /* 닫힌 서랍은 폭이 0 이라 보이지 않을 뿐 DOM 에 남는다. 그 안의 단추로 탭이 들어가지 않게 막는다 */
  useEffect(() => {
    const side = sideRef.current;
    if (!side) return;
    if (open) side.removeAttribute('inert');
    else side.setAttribute('inert', '');
  }, [open, drawer]);

  /* 닫는 길은 종을 다시 누르거나 Esc 다. 서랍 안에 닫기 단추를 따로 두지 않는다 —
     같은 일을 하는 단추가 둘이면 어느 쪽이 진짜인지 흐려진다 */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      bellRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className="shell" data-side={drawer && open ? 'open' : undefined}>
      <Rail />
      <div className="main">
        <StatusBar
          {...statusBar}
          bell={drawer && { count: drawer.count, open, onToggle: () => setOpen((o) => !o), ref: bellRef }}
        />
        <main className="content" aria-label="내용">
          {children}
        </main>
      </div>
      {drawer && (
        <aside className="side" id="side" aria-label="알림" ref={sideRef}>
          <div className="side-in">{drawer.children}</div>
        </aside>
      )}
    </div>
  );
}
