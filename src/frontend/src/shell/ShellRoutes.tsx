/* 주소와 페이지 — 셸 파일이다. 고치지 않는다.

   라우터는 메뉴 목록에서 만든다. 여는 기능 하나가 주소 하나다. 메뉴에 '/' 가 없으면
   첫 화면(home)이 '/' 를 맡는다. 목록에 없는 주소는 「없는 주소」 페이지를 보여 준다. */
import type { ComponentType } from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import { flatten, isOpenItem } from './menu';
import { useShell } from './ShellContext';

function NotFound() {
  return (
    <DashboardLayout title="없는 주소">
      <p className="text-on-surface-variant">이 주소에 연결된 기능이 없습니다. 사이드바에서 기능을 고릅니다.</p>
    </DashboardLayout>
  );
}

export default function ShellRoutes({ home: Home }: { home: ComponentType }) {
  const { menu } = useShell();
  const items = flatten(menu).filter(isOpenItem);

  return (
    <Routes>
      {!items.some((item) => item.path === '/') && <Route path="/" element={<Home />} />}
      {items.map(({ path, page: Page }) => (
        <Route key={path} path={path} element={<Page />} />
      ))}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
