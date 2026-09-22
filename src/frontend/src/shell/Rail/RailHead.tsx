/* 사이드바 머리 칸 — K 심볼 · 회사와 조직 이름 · 여닫기 단추.
   다른 본부 대시보드가 설정에 있으면 조직 이름을 눌러 바꿀 수 있다. */
import { ChevronDown, ClipboardCheck, LayoutDashboard, PanelLeft } from 'lucide-react';
import { useEffect, useState, type KeyboardEvent } from 'react';
import logo from '../assets/kiwoom-ci-symbol.png';
import { useShell } from '../ShellContext';
import { usePopover } from '../usePopover';

type Props = { collapsed: boolean; onToggle: () => void };

export default function RailHead({ collapsed, onToggle }: Props) {
  const { config } = useShell();
  const pop = usePopover<HTMLDivElement, HTMLDivElement>();
  const [top, setTop] = useState(0);

  /* 고를 것이 없으면 꺾쇠도 달지 않는다. 눌러도 아무 일이 없는 장치는 고장으로 읽힌다 */
  const switchable = config.others.length > 0;
  const toggleLabel = collapsed ? '사이드바 펼치기' : '사이드바 접기';

  /* 접으면 누를 글자가 없다. 열려 있던 드롭다운도 닫는다 */
  useEffect(() => {
    if (collapsed) pop.setOpen(false);
  }, [collapsed]);

  const togglePop = () => {
    const who = pop.triggerRef.current;
    const rail = who?.closest('.rail');
    /* 누른 줄 바로 아래에 연다. 머리 칸은 overflow:hidden 이라 그 안에 두면 잘리므로
       사이드바를 기준으로 두고 위치만 계산한다 */
    if (who && rail) setTop(who.getBoundingClientRect().bottom - rail.getBoundingClientRect().top + 8);
    pop.setOpen((open) => !open);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePop();
    }
  };

  return (
    <>
      <div className={`rail-head${switchable ? ' has-switch' : ''}`}>
        <span className="symwrap">
          <img className="ci-sym" src={logo} alt="키움투자자산운용" />
        </span>
        <div
          className="who"
          ref={pop.triggerRef}
          {...(switchable && {
            role: 'button',
            tabIndex: 0,
            'aria-haspopup': true,
            'aria-expanded': pop.open,
            onClick: togglePop,
            onKeyDown: onKey,
          })}
        >
          <div className="co">키움투자자산운용</div>
          <div className="div">
            {config.org}
            {switchable && (
              <span className="org-cv">
                <ChevronDown size={13} className="ic" />
              </span>
            )}
          </div>
        </div>
        <button
          className="rail-toggle"
          type="button"
          aria-label={toggleLabel}
          title={toggleLabel}
          aria-expanded={!collapsed}
          onClick={onToggle}
        >
          <PanelLeft size={17} className="ic" />
        </button>
      </div>

      {switchable && (
        <div className={`org-pop${pop.open ? ' is-open' : ''}`} ref={pop.panelRef} style={{ top }}>
          <div className="lb">접근 가능한 대시보드</div>
          <a href="/" className="is-cur" aria-current="page">
            <LayoutDashboard size={16} className="ic" />
            {config.org}
            <ClipboardCheck size={14} className="ic chk" />
          </a>
          {config.others.map((other) => (
            <a key={other.url} href={other.url}>
              <LayoutDashboard size={16} className="ic" />
              {other.name}
            </a>
          ))}
        </div>
      )}
    </>
  );
}
