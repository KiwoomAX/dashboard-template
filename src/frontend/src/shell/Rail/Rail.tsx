/* 사이드바 — 셸 파일이다. 고치지 않는다. */
import { useRailCollapsed } from '../prefs';
import RailFoot from './RailFoot';
import RailHead from './RailHead';
import RailNav from './RailNav';

export default function Rail() {
  const [collapsed, toggle] = useRailCollapsed();

  return (
    <aside className="rail" aria-label="사이드바">
      <RailHead collapsed={collapsed} onToggle={toggle} />
      <RailNav />
      <RailFoot collapsed={collapsed} />
    </aside>
  );
}
