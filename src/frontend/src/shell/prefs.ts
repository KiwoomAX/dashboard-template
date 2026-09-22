/* 사람마다 기억하는 화면 설정 — 낮/밤과 사이드바 접힘. 셸 파일이다. 고치지 않는다.

   첫 페인트 전에는 index.html 의 인라인 스크립트가 같은 키로 <html> 속성을 먼저 건다.
   늦게 걸면 밝은 화면이 한 번 그려졌다 어두워진다. 키 이름을 바꾸면 index.html 도
   함께 바꾼다 — prefs.test.ts 가 두 파일의 키를 대조한다. */
import { useEffect, useState } from 'react';

export const THEME_KEY = 'kw-division-dashboard-theme';
export const RAIL_KEY = 'kw-division-dashboard-rail';

export type Theme = 'light' | 'dark';

/* 저장소가 막힌 브라우저(시크릿 창 등)에서는 읽기가 null 이고 쓰기는 무시된다.
   설정은 그 방문 동안만 적용된다. */
export function readPref(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writePref(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 위 주석과 같다 */
  }
}

function currentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/* 사이드바 접힘. <html data-rail> 이 기준이고, 바꿀 때마다 저장한다. */
export function useRailCollapsed(): [boolean, () => void] {
  const root = document.documentElement;
  const [collapsed, setCollapsed] = useState(() => root.getAttribute('data-rail') === 'collapsed');

  const toggle = () => {
    const next = root.getAttribute('data-rail') !== 'collapsed';
    if (next) root.setAttribute('data-rail', 'collapsed');
    else root.removeAttribute('data-rail');
    writePref(RAIL_KEY, next ? 'collapsed' : 'open');
    setCollapsed(next);
  };

  return [collapsed, toggle];
}

/* 낮/밤. 고르면 저장하고, 고른 적이 없으면 OS 설정이 바뀔 때 따라간다. */
export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(currentTheme);

  const apply = (next: Theme) => {
    document.documentElement.setAttribute('data-theme', next);
    setThemeState(next);
  };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      if (readPref(THEME_KEY)) return;
      apply(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setTheme = (next: Theme) => {
    apply(next);
    writePref(THEME_KEY, next);
  };

  return [theme, setTheme];
}
