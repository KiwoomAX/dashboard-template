import { act, renderHook } from '@testing-library/react';
import indexHtml from '../../index.html?raw';
import { RAIL_KEY, THEME_KEY, useTheme } from './prefs';

type Listener = (e: { matches: boolean }) => void;

function stubMatchMedia() {
  const listeners: Listener[] = [];
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: (_: string, fn: Listener) => listeners.push(fn),
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
  return (matches: boolean) => listeners.forEach((fn) => fn({ matches }));
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

test('index.html 의 첫 페인트 스크립트가 prefs.ts 와 같은 키를 쓴다', () => {
  expect(indexHtml).toContain(`'${THEME_KEY}'`);
  expect(indexHtml).toContain(`'${RAIL_KEY}'`);
});

test('고른 테마를 <html> 속성에 걸고 저장한다', () => {
  stubMatchMedia();
  const { result } = renderHook(() => useTheme());
  act(() => result.current[1]('dark'));
  expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  expect(localStorage.getItem(THEME_KEY)).toBe('dark');
  expect(result.current[0]).toBe('dark');
});

test('고른 적이 없으면 OS 설정 변화를 따라간다', () => {
  const osChanges = stubMatchMedia();
  const { result } = renderHook(() => useTheme());
  act(() => osChanges(true));
  expect(result.current[0]).toBe('dark');
  expect(localStorage.getItem(THEME_KEY)).toBeNull();
});

test('직접 고른 뒤에는 OS 설정 변화를 따라가지 않는다', () => {
  const osChanges = stubMatchMedia();
  const { result } = renderHook(() => useTheme());
  act(() => result.current[1]('light'));
  act(() => osChanges(true));
  expect(result.current[0]).toBe('light');
});
