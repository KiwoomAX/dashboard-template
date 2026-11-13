/* 사이드바 기능 목록 — 「본부 기능」 무리 하나에 메뉴 목록을 그린다.
   지금 보는 항목은 현재 주소와 path 를 맞춰 스스로 켠다. 손으로 적지 않는다. */
import { ChevronDown, Lock } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { firstOpen, isActive, isCategory, isOpenItem, isParent, type MenuCategory, type MenuItem, type MenuNode } from '../menu';
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
        <Lock size={12} className="ic lock" />
      </button>
    );
  }

  const on = isActive(item, pathname);
  return (
    <Link to={item.path} className={`nav-item${on ? ' is-on' : ''}`} title={item.name} aria-current={on ? 'page' : undefined}>
      <span className="nm">{item.name}</span>
      {item.marker && <span className="mk">{item.marker}</span>}
    </Link>
  );
}

/* 기능 하나 — 낱개 기능이면 NavItem 하나, 하위 기능을 가진 기능이면 머리 줄과 그 아래 한 칸 들여쓴 하위 기능이다.
   머리 줄은 눌리면 처음 열리는 하위 기능으로 가고, 하위 기능이 모두 잠겼으면 눌리지 않는 이름만 둔다 */
function NavNode({ node }: { node: MenuNode }) {
  const { pathname } = useLocation();
  if (!isParent(node)) return <NavItem item={node} />;

  const first = firstOpen(node);
  const inside = node.items.some((item) => isOpenItem(item) && isActive(item, pathname));
  return (
    <div className="nav-parent">
      {first ? (
        <Link to={first.path} className={`nav-item is-parent${inside ? ' is-inside' : ''}`} title={`${node.name} — ${first.name} 열기`}>
          <span className="nm">{node.name}</span>
        </Link>
      ) : (
        <div className="nav-item is-parent is-locked">
          <span className="nm">{node.name}</span>
        </div>
      )}
      <div className="nav-children">
        {node.items.map((item, k) => (
          <NavItem item={item} key={k} />
        ))}
      </div>
    </div>
  );
}

/* 카테고리 이름 — 눌리면 그 안에서 처음 열리는 기능으로 간다. 열리는 기능이 없으면 라벨로만 둔다 */
function CategoryLabel({ category }: { category: MenuCategory }) {
  const first = firstOpen(category);
  return first ? (
    <Link to={first.path} className="nav-cat is-link" title={`${category.cat} — ${first.name} 열기`}>
      {category.cat}
    </Link>
  ) : (
    <div className="nav-cat">{category.cat}</div>
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
          <ChevronDown size={11} className="ic cv" />
        </button>
        {menu.map((entry, i) =>
          isCategory(entry) ? (
            <div className="nav-sub-wrap" key={`cat-${i}`}>
              <CategoryLabel category={entry} />
              <div className="nav-sub">
                {entry.items.map((item, j) => (
                  <NavNode node={item} key={`${i}-${j}`} />
                ))}
              </div>
            </div>
          ) : (
            <NavNode node={entry} key={`item-${i}`} />
          ),
        )}
      </div>
    </nav>
  );
}
