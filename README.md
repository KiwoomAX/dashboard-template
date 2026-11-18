# dashboard-template

본부·팀 대시보드를 만드는 템플릿이다. 이 코드 저장소를 복제해 대시보드를 만든다. 만드는 순서와 화면 규칙은 클로드 코드의 `kw-dashboard:building-kiwoom-dashboard` 스킬에 있다.

## 화면 안의 주소는 `withBase()` 로 감싼다

운영에서 대시보드는 게이트웨이 80번의 `/<접두어>/` 아래에서 열린다(예: 임원실 `http://192.7.9.45/exec/`). 화면이 자기 서버에 보내는 요청에도 그 접두어가 붙어야 하므로, `/api/…`·`/data/…` 로 시작하는 주소는 셸의 `withBase()` 로 감싼다.

```ts
import { withBase } from '../shell/basePath';

const res = await fetch(withBase('/api/kpi/summary'));
```

- 로컬 실행(`npm run dev`)과 기본 빌드는 접두어가 `/` 라 감싸도 주소가 그대로다. 감싸지 않으면 로컬에서는 동작하고 운영에서만 `404` 가 난다.
- `/auth/api/me`·`/auth/api/logout` 은 게이트웨이의 주소라 감싸지 않는다.
- 화면 안 이동은 react-router 의 `<Link>`·`useNavigate` 를 쓴다. 라우터가 접두어를 붙인다. `<a href="/…">` 나 `location.href = '/…'` 로 주소를 직접 적지 않는다.
- 감싸지 않은 `/api/`·`/data/` 문자열이 있으면 `src/frontend` 의 `npm test`(`src/shell/basePath.test.ts`)가 실패하고 그 파일과 줄을 알려 준다. 배포는 테스트를 실행하지 않으므로 푸시하기 전에 `npm test` 를 실행한다. `'/api'` 를 상수로 두고 뒤에 이어 붙이는 형태는 이 테스트가 찾지 못하므로 쓰지 않는다.
- 접두어는 배포 compose 의 `services.<화면 서비스>.build.args.BASE_PATH`(예: `/exec/`)로 정한다. 값이 없으면 `/` 로 빌드된다. 게이트웨이의 화면 등록과 접근 권한은 AX 팀이 한다.
