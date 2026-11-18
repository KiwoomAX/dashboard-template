/* 기준 경로 — 화면이 게이트웨이의 /<접두어>/ 아래에서 열리면 화면 자신의 주소 앞에 그 접두어를 붙인다.
   /api/… 와 /data/… 를 만드는 코드는 모두 withBase() 를 거친다. /auth/api/… 는 게이트웨이 주소라 거치지 않는다.
   접두어는 빌드 인자 BASE_PATH(Dockerfile)로 정하고, 주지 않으면 빈 문자열이라 주소가 바뀌지 않는다.
   이 파일도 아래 검출 대상이므로 주석의 경로는 따옴표·백틱 없이 적는다. */
export const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export const withBase = (path: string): string => basePath + path;

/** withBase( 를 거치지 않은 /api/·/data/ 문자열의 `파일:줄` 목록 — basePath.test.ts 가 화면 소스 전체에 쓴다.
    따옴표 바로 뒤의 경로만 본다. 상수에 경로를 이어 붙이는 형태는 검출하지 못한다. */
export function unwrapped(sources: Record<string, string>): string[] {
  return Object.entries(sources)
    .filter(([file]) => !/\.test\.tsx?$/.test(file))
    .flatMap(([file, text]) =>
      [...text.matchAll(/(?<!withBase\(\s*)['"`]\/(api|data)\//g)].map(
        (m) => `${file}:${text.slice(0, m.index).split('\n').length}`,
      ),
    );
}
