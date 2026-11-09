import '@testing-library/jest-dom/vitest';

/* Node 22 이후 버전은 전역에 자체 localStorage 를 두는데, 저장 파일 설정이 없으면 비어 있어
   jsdom 의 저장소를 가린다. 비어 있으면 jsdom 의 저장소를 다시 넣는다. */
const dom = (globalThis as unknown as { jsdom?: { window: Window } }).jsdom;
if (!globalThis.localStorage && dom) {
  for (const key of ['localStorage', 'sessionStorage'] as const) {
    Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true });
  }
}

/* jsdom 에는 matchMedia 가 없다. 낮/밤 훅(useTheme)이 OS 설정을 듣느라 부르므로
   기본값(낮, 변화 없음)을 둔다. 변화를 시험하는 테스트는 자기 스텁으로 덮어쓴다. */
window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  addEventListener: () => {},
  removeEventListener: () => {},
})) as unknown as typeof window.matchMedia;
