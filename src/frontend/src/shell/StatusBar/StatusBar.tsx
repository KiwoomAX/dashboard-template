/* 상태바 — 셸 파일이다. 고치지 않는다.
   왼쪽에 「조직 이름 › 제목」과 기준 시각을 한 줄로 두고, 오른쪽에 화면 고유 단추를 둔다. */
import { Bell as BellIcon, ChevronDown, Clock, RefreshCw, type LucideIcon } from 'lucide-react';
import { useEffect, type RefObject } from 'react';
import { useLocation } from 'react-router-dom';
import { flatten, isActive, isOpenItem } from '../menu';
import { useShell } from '../ShellContext';

export type StatusBarAction = {
  name: string;
  icon?: LucideIcon;
  onClick: () => void;
};

export type StatusBarProps = {
  /** 상태바 제목 */
  title: string;
  /** 기준 시각 문구. 데이터를 받은 뒤 넘긴다. 요소마다 시각이 달라 한 시각으로 말할 수 없으면 "-" */
  asof?: string;
  /** 기준 시각 앞 시계에 뜨는 갱신 주기(예: "매일 자정 자동 갱신") */
  cycle?: string;
  /** 새로고침 단추를 누르면 실행할 함수. 주면 단추를 둔다 */
  refresh?: () => void;
  /** 상태바 오른쪽에 붙는 화면 고유 단추. 이름과 아이콘만 받는다 — 모양은 셸이 정한다 */
  actions?: StatusBarAction[];
};

/* 알림 종 — DashboardLayout 이 서랍 상태와 함께 넘긴다. 페이지가 직접 넘기는 값이 아니다 */
type Bell = {
  count?: number;
  open: boolean;
  onToggle: () => void;
  ref: RefObject<HTMLButtonElement>;
};

const REFRESH_LABEL = '새로고침';
const REFRESH_TIP = '지금 다시 불러오기';

export default function StatusBar({ title, asof, cycle, refresh, actions, bell }: StatusBarProps & { bell?: Bell }) {
  const { menu, config } = useShell();
  const { pathname } = useLocation();

  /* 경로 표시는 지금 주소가 메뉴에 있을 때만 붙인다. 없는 길을 지어내지 않는다 */
  const inMenu = flatten(menu).some((item) => isOpenItem(item) && isActive(item, pathname));

  useEffect(() => {
    document.title = `${title} · ${config.org}`;
  }, [title, config.org]);

  return (
    <header className="topbar">
      <div className="lead">
        <div className="ttl">
          {inMenu && (
            <span className="crumb">
              {config.org}
              <ChevronDown size={13} className="ic cv" />
            </span>
          )}
          <h1>{title}</h1>
        </div>
        {asof && (
          <div className="asof">
            {/* 갱신 주기는 매일 읽을 값이 아니라 한 번 알면 되는 값이라 시계 툴팁에 둔다.
                주기가 없으면 빈 툴팁을 달지 않는다 */}
            <span className="cyc" {...(cycle && { title: cycle, 'aria-label': cycle, tabIndex: 0 })}>
              <Clock size={12} className="ic bold" />
            </span>
            <span>{asof}</span>
            {/* 새로고침은 기준 시각 줄에 붙는다. 다시 받는 대상이 그 줄이 말하는 시각이다 */}
            {refresh && (
              <button className="asof-refresh" type="button" aria-label={REFRESH_LABEL} title={REFRESH_TIP} onClick={refresh}>
                <RefreshCw size={13} className="ic" />
              </button>
            )}
          </div>
        )}
      </div>
      <span className="spacer" />
      {actions?.map(({ name, icon: Icon, onClick }) => (
        <button className="btn-ghost" type="button" key={name} onClick={onClick}>
          {Icon && <Icon size={15} className="ic" />}
          {name}
        </button>
      ))}
      {/* 기준 시각 줄이 없으면 새로고침은 오른쪽 아이콘 줄로 간다 */}
      {refresh && !asof && (
        <button className="icon-btn" type="button" aria-label={REFRESH_LABEL} title={REFRESH_TIP} onClick={refresh}>
          <RefreshCw size={16} className="ic" />
        </button>
      )}
      {/* 건수 배지는 「안 본 것이 남았다」는 뜻이라 의미색(--bad)을 쓴다 */}
      {bell && (
        <button
          className="icon-btn side-toggle"
          type="button"
          ref={bell.ref}
          aria-controls="side"
          aria-expanded={bell.open}
          aria-label="알림"
          title="알림"
          onClick={bell.onToggle}
        >
          <BellIcon size={16} className="ic" />
          {bell.count ? <span className="cnt">{bell.count}</span> : null}
        </button>
      )}
    </header>
  );
}
