/* 알림 서랍 — 셸 파일이다. 고치지 않는다.

   알림은 대시보드 전체 기능이다. 모든 대시보드의 모든 페이지에 같은 종과 같은 알림 서랍이 있다.
   알림 서랍 안에 무엇을 넣을지는 대시보드가 src/alerts.tsx 한 곳에서 정하고, 종의 건수 배지는
   그 파일이 useAlertCount 로 알린다.

   기본은 닫힌 상태다. 열고 닫은 상태는 사이드바 접힘과 같이 저장해서, 페이지를 옮기거나
   새로고침해도 마지막 상태로 그린다. 쓰지 않는 사람은 한 번도 열지 않으니 닫힌 채로 남는다. */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { readPref, SIDE_KEY, writePref } from '../prefs';

type Drawer = {
  open: boolean;
  toggle: () => void;
  /** 상태바 종의 건수 배지 숫자 */
  count: number;
  setCount: (count: number) => void;
  /** Esc 로 닫은 뒤 초점을 돌려줄 종 단추 */
  bellRef: RefObject<HTMLButtonElement>;
};

const DrawerContext = createContext<Drawer | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(() => readPref(SIDE_KEY) === 'open');
  const [count, setCount] = useState(0);
  const bellRef = useRef<HTMLButtonElement>(null);

  const set = (next: boolean) => {
    setOpen(next);
    writePref(SIDE_KEY, next ? 'open' : 'closed');
  };

  /* 닫는 길은 종을 다시 누르거나 Esc 다. 알림 서랍 안에 닫기 단추를 따로 두지 않는다 —
     같은 일을 하는 단추가 둘이면 어느 쪽이 진짜인지 흐려진다 */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      set(false);
      bellRef.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <DrawerContext.Provider value={{ open, toggle: () => set(!open), count, setCount, bellRef }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer(): Drawer {
  const drawer = useContext(DrawerContext);
  if (!drawer) {
    throw new Error('[shell] 알림 서랍 밖에서 DashboardLayout 을 썼다. 페이지는 ShellRoutes 가 그리는 셸 안에서만 쓴다.');
  }
  return drawer;
}

/** 알림 내용(src/alerts.tsx)이 종의 건수 배지 숫자를 알린다. 0 이면 배지를 달지 않는다 */
export function useAlertCount(count: number): void {
  const { setCount } = useDrawer();
  useEffect(() => setCount(count), [count, setCount]);
}

/** 셸의 세 번째 칸. 닫히면 폭이 0 이고, 열리면 340px 로 내용 구획을 덮지 않고 민다 */
export function DrawerPanel({ children }: { children: ReactNode }) {
  const { open } = useDrawer();
  const sideRef = useRef<HTMLElement>(null);

  /* 닫힌 알림 서랍은 폭이 0 이라 보이지 않을 뿐 DOM 에 남는다. 그 안의 단추로 탭이 들어가지 않게 막는다 */
  useEffect(() => {
    const side = sideRef.current;
    if (!side) return;
    if (open) side.removeAttribute('inert');
    else side.setAttribute('inert', '');
  }, [open]);

  return (
    <aside className="side" id="side" aria-label="알림" ref={sideRef}>
      <div className="side-in">{children}</div>
    </aside>
  );
}
