/* 목업 HTML 의 앱 — 실제 셸(사이드바 · 상태바 · 알림 서랍)을 그리고, 내용 구획에는
   HTML 파일 안의 <template> 을 그대로 넣는다.

   목업 HTML 을 쓰는 사람은 이 파일을 고치지 않는다. HTML 파일의 설정 JSON 과 <template> 만
   고친다. 파일 하나를 더블클릭으로 여는 것이 목적이라 주소는 # 뒤에 둔다(HashRouter). */
import { StrictMode, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import '../src/index.css';
import DashboardLayout from '../src/shell/DashboardLayout';
import { useAlertCount } from '../src/shell/Drawer/Drawer';
import { ShellProvider, type DashboardConfig } from '../src/shell/ShellContext';
import ShellRoutes from '../src/shell/ShellRoutes';
import type { MenuEntry, MenuItem } from '../src/shell/menu';

type ItemJson = { name: string; path?: string; locked?: boolean };
type EntryJson = ItemJson | { cat: string; items: ItemJson[] };
type MockupJson = DashboardConfig & { menu: EntryJson[] };

function template(selector: string): HTMLTemplateElement | null {
  return document.querySelector<HTMLTemplateElement>(selector);
}

/* <template data-path="…"> 하나가 페이지 하나다. 제목은 data-title, 없으면 메뉴 이름이다 */
function htmlPage(path: string, name: string): ComponentType {
  const tpl = template(`template[data-path="${path}"]`);
  const html = tpl ? tpl.innerHTML : `<p>이 주소의 &lt;template data-path="${path}"&gt; 가 없습니다.</p>`;
  return function Page() {
    return (
      <DashboardLayout title={tpl?.dataset.title ?? name} asof={tpl?.dataset.asof} cycle={tpl?.dataset.cycle}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </DashboardLayout>
    );
  };
}

function toItem(item: ItemJson): MenuItem {
  if (item.locked || !item.path) return { name: item.name, locked: true };
  return { name: item.name, path: item.path, page: htmlPage(item.path, item.name) };
}

function Alerts() {
  const tpl = template('template#alerts');
  useAlertCount(Number(tpl?.dataset.count ?? 0));
  return <div dangerouslySetInnerHTML={{ __html: tpl ? tpl.innerHTML : '' }} />;
}

const json = JSON.parse(document.getElementById('mockup-config')!.textContent!) as MockupJson;
const menu: MenuEntry[] = json.menu.map((entry) =>
  'cat' in entry ? { cat: entry.cat, items: entry.items.map(toItem) } : toItem(entry),
);
const config: DashboardConfig = { org: json.org, others: json.others ?? [] };

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ShellProvider menu={menu} config={config}>
        <ShellRoutes home={htmlPage('/', '첫 화면')} alerts={Alerts} />
      </ShellProvider>
    </HashRouter>
  </StrictMode>,
);
