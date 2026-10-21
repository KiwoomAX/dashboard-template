"""목업 HTML 한 파일 만들기. dist-mockup 의 빌드 결과를 dashboard-mockup.html 하나로 합친다.

`npm run mockup` 이 vite 빌드 뒤에 실행한다. 스크립트는 body 끝에 둔다. head 에 두면 #root 와
<template> 이 아직 없어 앱이 시작하지 못한다. 결과 파일은 kw-design 스킬이 복사해 배포한다."""
import base64
import pathlib
import re

d = pathlib.Path('dist-mockup')
html = (d / 'index.html').read_text(encoding='utf-8')
css = (d / 'app.css').read_text(encoding='utf-8')
js = (d / 'app.js').read_text(encoding='utf-8')
ico = base64.b64encode((d / 'favicon.png').read_bytes()).decode()

html = re.sub(r'\s*<link[^>]+rel="stylesheet"[^>]*>', '', html)
html = re.sub(r'\s*<script[^>]*src="[^"]*app\.js"[^>]*></script>', '', html)
html = re.sub(r'href="[^"]*favicon\.png"', lambda m: f'href="data:image/png;base64,{ico}"', html)
# 셸 CSS 는 목업 스타일보다 앞에 둔다. 같은 세기의 규칙이면 목업 스타일이 이긴다
html = html.replace('<style id="mockup-style">', '<style>\n' + css + '\n</style>\n    <style id="mockup-style">', 1)
html = html.replace('</body>', '    <!-- 셸 코드(생성물). 고치지 않는다 -->\n    <script>\n' + js + '\n    </script>\n  </body>')

assert 'createRoot' in html and 'mockup-config' in html, '합치기 실패'
left = [u for u in re.findall(r'(?:src|href)="([^"]+)"', html) if not u.startswith(('data:', '#'))]
assert not left, f'바깥 파일을 아직 가리킨다: {left}'

out = d / 'dashboard-mockup.html'
out.write_text(html, encoding='utf-8')
print(f'만든 파일: {out} ({out.stat().st_size / 1024:.0f}KB)')
