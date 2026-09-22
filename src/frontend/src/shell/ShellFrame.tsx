/* 셸 틀 — 셸 파일이다. 고치지 않는다.

   사이드바와 알림 서랍은 페이지마다 새로 그리지 않고 여기서 한 번만 그린다. 그래서 페이지를
   옮겨도 사이드바 스크롤 위치와 알림 서랍 여닫힘이 그대로 남고, 알림 내용도 다시 받지 않는다.
   가운데 칸(<Outlet />)에는 지금 주소의 페이지가 들어가고, 페이지는 DashboardLayout 으로
   상태바와 내용 구획을 그린다. */
import type { ComponentType } from 'react';
import { Outlet } from 'react-router-dom';
import { DrawerPanel, DrawerProvider, useDrawer } from './Drawer/Drawer';
import Rail from './Rail/Rail';

function Frame({ alerts: Alerts }: { alerts: ComponentType }) {
  const { open } = useDrawer();
  return (
    <div className="shell" data-side={open ? 'open' : undefined}>
      <Rail />
      <Outlet />
      <DrawerPanel>
        <Alerts />
      </DrawerPanel>
    </div>
  );
}

export default function ShellFrame({ alerts }: { alerts: ComponentType }) {
  return (
    <DrawerProvider>
      <Frame alerts={alerts} />
    </DrawerProvider>
  );
}
