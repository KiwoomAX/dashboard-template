import { describe, expect, it } from 'vitest';
import { basePath, unwrapped, withBase } from './basePath';

const sources = import.meta.glob('../**/*.{ts,tsx}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

describe('basePath', () => {
  it('기본 빌드에서는 주소를 바꾸지 않는다', () => {
    expect(basePath).toBe('');
    expect(withBase('/api/x')).toBe('/api/x');
  });
  it('withBase 를 거치지 않은 /api/·/data/ 문자열을 찾는다', () => {
    expect(unwrapped({ 'a.ts': "fetch('/api/x');\nfetch(withBase(`/data/y`));\nfetch(\"/data/z\")" })).toEqual(['a.ts:1', 'a.ts:3']);
  });
  it('withBase( 와 문자열이 다른 줄에 있어도 거친 것으로 본다', () => {
    expect(unwrapped({ 'a.ts': "fetch(withBase(\n  `/api/x`,\n))" })).toEqual([]);
  });
  it('테스트 파일과 /auth/api/ 는 대상이 아니다', () => {
    expect(unwrapped({ 'a.test.tsx': "fetch('/api/x')", 'b.ts': "fetch('/auth/api/me')" })).toEqual([]);
  });
  it('화면 소스에 거치지 않은 주소가 없다', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(5);
    expect(unwrapped(sources)).toEqual([]);
  });
});
