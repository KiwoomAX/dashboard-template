/* 알림 서랍 내용 — 대시보드에 하나다.

   모든 페이지의 상태바 종을 누르면 오른쪽에 이 내용이 열린다. 무엇을 알릴지는 이 대시보드가
   정한다(확인이 필요한 일, 이번 주 일정, 최근 실행 기록 등). 종의 건수 배지 숫자는
   useAlertCount 로 알린다. 0 이면 배지를 달지 않는다.

   알림 서랍은 닫혀 있어도 이 컴포넌트를 그려 둔다. 그래야 닫힌 채로도 건수가 종에 뜬다. */
import { useAlertCount } from './shell/Drawer/Drawer';

export default function Alerts() {
  useAlertCount(0);
  return <p className="px-4 text-on-surface-tertiary">알림이 없습니다.</p>;
}
