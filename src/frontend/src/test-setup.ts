import '@testing-library/jest-dom/vitest';

/* jsdom 에는 matchMedia 가 없다. 낮/밤 훅(useTheme)이 OS 설정을 듣느라 부르므로
   기본값(낮, 변화 없음)을 둔다. 변화를 시험하는 테스트는 자기 스텁으로 덮어쓴다. */
window.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  addEventListener: () => {},
  removeEventListener: () => {},
})) as unknown as typeof window.matchMedia;
