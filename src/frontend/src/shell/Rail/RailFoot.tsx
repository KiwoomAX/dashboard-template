/* 사이드바 하단 — 프로필 · 설정 판 · 로그아웃.
   생김새는 챗봇 레일 하단(Kiwoom-Rag RailUserBlock)과 같다. 남색 동그라미에 성 한 글자,
   이름과 아이디를 한 줄에, 오른쪽 끝에 로그아웃. 챗봇에는 없는 설정 판(낮/밤)은
   아바타와 이름을 눌러 연다. */
import { LogOut, Moon, Sun } from 'lucide-react';
import { useEffect } from 'react';
import { useTheme } from '../prefs';
import { usePopover } from '../usePopover';
import { currentUser } from '../user';

export default function RailFoot({ collapsed }: { collapsed: boolean }) {
  const [theme, setTheme] = useTheme();
  const pop = usePopover<HTMLButtonElement, HTMLDivElement>();

  /* 접힌 사이드바에서는 설정 판을 쓰지 않는다. 열려 있던 판도 닫는다 */
  useEffect(() => {
    if (collapsed) pop.setOpen(false);
  }, [collapsed]);

  return (
    <div className="rail-foot">
      <div className={`rail-pop${pop.open ? ' is-open' : ''}`} ref={pop.panelRef}>
        <div className="row">
          <span className="nm">화면 모드</span>
          <div className="mode" role="group" aria-label="화면 모드">
            <button
              type="button"
              className={theme === 'light' ? 'is-on' : ''}
              aria-pressed={theme === 'light'}
              aria-label="낮"
              title="낮"
              onClick={() => setTheme('light')}
            >
              <Sun size={15} className="ic" />
            </button>
            <button
              type="button"
              className={theme === 'dark' ? 'is-on' : ''}
              aria-pressed={theme === 'dark'}
              aria-label="밤"
              title="밤"
              onClick={() => setTheme('dark')}
            >
              <Moon size={15} className="ic" />
            </button>
          </div>
        </div>
      </div>

      <div className="rail-row">
        <button
          className="rail-me"
          type="button"
          ref={pop.triggerRef}
          aria-label="내 계정 · 설정"
          aria-haspopup="true"
          aria-expanded={pop.open}
          onClick={() => {
            /* 접힌 사이드바에서는 판이 보이지 않으므로 열지 않는다. 열면 눌린 표시만 바뀌어
               고장으로 읽힌다 */
            if (!collapsed) pop.setOpen((open) => !open);
          }}
        >
          <span className="av" title={currentUser.name}>
            {currentUser.name.slice(0, 1)}
          </span>
          <span className="bd">
            <b className="nm">{currentUser.name}</b>
            {currentUser.emailId && <span className="id">{currentUser.emailId}</span>}
          </span>
        </button>
        {/* 로그인을 연결하기 전이라 눌러도 나가지 않는다 */}
        <button className="rail-out" type="button" aria-label="로그아웃" title="로그아웃">
          <LogOut size={17} className="ic" />
        </button>
      </div>
    </div>
  );
}
