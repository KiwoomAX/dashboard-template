/* 목업 HTML 한 파일 만들기. dist-mockup 의 빌드 결과를 dashboard-mockup.html 하나로 합친다.

   `npm run mockup` 이 vite 빌드 뒤에 실행한다. npm 을 쓰는 PC 에는 Node 가 있으므로 다른 프로그램이
   필요 없다. 스크립트는 body 끝에 둔다. head 에 두면 #root 와 <template> 이 아직 없어 앱이 시작하지
   못한다. 결과 파일은 kw-design 스킬이 복사해 배포한다. */
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const d = 'dist-mockup';
let html = readFileSync(join(d, 'index.html'), 'utf8');
const css = readFileSync(join(d, 'app.css'), 'utf8');
const js = readFileSync(join(d, 'app.js'), 'utf8');
const ico = readFileSync(join(d, 'favicon.png')).toString('base64');
// 셸 토큰 파일의 확인값. kw-design 은 이 HTML 과 별도로 tokens.css 복사본을 배포하므로, 둘이 같은 토큰에서
// 만들어졌는지 검사가 이 값으로 대조한다. 줄바꿈 차이는 빼고 계산한다
const tokens = readFileSync('src/shell/tokens.css', 'utf8').replace(/\r\n/g, '\n');
const tokensSha = createHash('sha256').update(tokens, 'utf8').digest('hex');

html = html.replace(/\s*<link[^>]+rel="stylesheet"[^>]*>/g, '');
html = html.replace(/\s*<script[^>]*src="[^"]*app\.js"[^>]*><\/script>/g, '');
html = html.replace(/href="[^"]*favicon\.png"/g, () => `href="data:image/png;base64,${ico}"`);
// 셸 CSS 는 「목업 스타일」 구간 밖, 그 앞에 둔다. 고쳐도 되는 구간에 섞이지 않게 하고, 같은 세기의
// 규칙이면 뒤에 오는 목업 스타일이 이기게 하기 위해서다
const slot = '<!-- 셸 CSS 가 들어갈 곳. npm run mockup 이 이 줄을 셸 CSS 로 바꾼다 -->';
if (!html.includes(slot)) throw new Error('셸 CSS 자리 표시가 없다');
html = html.replace(slot, () => `<!-- ════ 셸 CSS(생성물). 고치지 않는다 ════ -->\n    <style>\n${css}\n    </style>`);
html = html.replace('<title>', () => `<meta name="kw-tokens-sha256" content="${tokensSha}" />\n    <title>`);
html = html.replace('</body>', () => `    <!-- 셸 코드(생성물). 고치지 않는다 -->\n    <script>\n${js}\n    </script>\n  </body>`);

if (!html.includes('createRoot') || !html.includes('mockup-config')) throw new Error('합치기 실패');
const left = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]).filter((u) => !/^(data:|#)/.test(u));
if (left.length) throw new Error(`바깥 파일을 아직 가리킨다: ${left.join(', ')}`);

const out = join(d, 'dashboard-mockup.html');
writeFileSync(out, html, 'utf8');
console.log(`만든 파일: ${out} (${Math.round(statSync(out).size / 1024)}KB)`);
