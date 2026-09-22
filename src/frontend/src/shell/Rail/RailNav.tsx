/* 사이드바 기능 목록 — 「본부 기능」 무리 하나에 메뉴 목록을 그린다.
   지금 보는 항목은 현재 주소와 path 를 맞춰 스스로 켠다. 손으로 적지 않는다. */
import { ChevronDown, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isActive, isCategory, isOpenItem, type MenuItem } from '../menu';
import { useShell } from '../ShellContext';

/* 대시보드 주인이 본부일 수도 팀일 수도 있다. 조직 이름 끝에서 단위를 읽는다 */
export function unitOf(org: string): string {
  const m = org.match(/(본부|팀|실|부|센터|그룹)$/);
  return m ? m[1] : '본부';
}

const LOCKED_NOTE = '접근 권한이 없습니다. 본부 관리자에게 요청하세요.';

function NavItem({ item }: { item: MenuItem }) {
  const { pathname } = useLocation();

  /* 권한 없는 기능은 감추지 않고 잠금으로 보여 준다. 지우면 그런 기능이 있다는 것조차
     알 수 없다. 잠긴 이유를 툴팁에 붙인다 — 흐린 글자만으로는 고장으로 읽힌다 */
  if (!isOpenItem(item)) {
    return (
      <button className="nav-item is-locked" type="button" aria-disabled="true" title={`${item.name}. ${LOCKED_NOTE}`}>
        <span className="nm">{item.name}</span>
        <Lock size={13} className="ic lock" />
      </button>
    );
  }

  const on = isActive(item, pathname);
  return (
    <Link to={item.path} className={`nav-item${on ? ' is-on' : ''}`} title={item.name} aria-current={on ? 'page' : undefined}>
      <span className="nm">{item.name}</span>
    </Link>
  );
}

export default function RailNav() {
  const { menu, config } = useShell();
  /* 무리 접힘은 저장하지 않는다. 저장하면 한 번 접은 사람에게는 영영 접혀 있고,
     지금 보는 화면이 이 안에 있어 접힌 채로 열면 어디에 있는지가 안 보인다 */
  const [closed, setClosed] = useState(false);

  return (
    <nav className="rail-nav" aria-label={`${unitOf(config.org)} 기능`}>
      <div className={`nav-group${closed ? ' is-closed' : ''}`}>
        <button className="nav-label is-toggle" type="button" aria-expanded={!closed} onClick={() => setClosed((c) => !c)}>
          <span className="txt">{unitOf(config.org)} 기능</span>
          <ChevronDown size={12} className="ic cv" />
        </button>
        {menu.map((entry, i) =>
          isCategory(entry) ? (
            <div className="nav-sub-wrap" key={`cat-${i}`}>
              <div className="nav-cat">{entry.cat}</div>
              <div className="nav-sub">
                {entry.items.map((item, j) => (
                  <NavItem item={item} key={`${i}-${j}`} />
                ))}
              </div>
            </div>
          ) : (
            <NavItem item={entry} key={`item-${i}`} />
          ),
        )}
      </div>
    </nav>
  );
}
