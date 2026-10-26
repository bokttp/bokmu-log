# CLAUDE.md — 복무로그

현역 장병이 복무 기간 동안 자격증·독서·운동·공부 목표와 활동을 기록하고, 전역 D-day와 복무율을 확인하는 모바일 우선 웹 서비스다.

- 명세서(무엇을 만드는지): https://claude.ai/artifact/BnXYz6PWcnirw7bgXEHkwo
- 진행 상황(어디까지 했는지): `PLAN.md`
- Next.js 16 규칙: @AGENTS.md (코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 문서를 확인한다)

## 작업 방식

- 작업을 시작하기 전에 `PLAN.md`의 "현재 단계"와 체크리스트를 읽고, 체크되지 않은 첫 항목부터 진행한다.
- 한 항목을 끝내면 `PLAN.md`에서 체크하고 "마지막 업데이트" 날짜를 고친다.
- 명세서와 다르게 구현해야 할 이유가 생기면 먼저 사용자에게 묻고, 합의되면 `PLAN.md` 결정 기록에 한 줄 남긴다.
- 명세에 없는 기능은 임의로 추가하지 않는다.
- 새 개념(서버 액션, RLS 등)이 처음 나오면 한두 문장으로 설명한다.

## 기술 스택

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase: Auth(이메일 매직링크, Google), Postgres, RLS
- `@supabase/supabase-js`, `@supabase/ssr` — 쿠키 기반 세션
- date-fns (날짜 계산), Vitest (단위 테스트), Recharts (2차, 그래프)
- GitHub → Vercel 자동 배포 (main = 운영, PR = 미리보기)

## 폴더 구조

```
app/
  page.tsx, login/, auth/callback/route.ts, onboarding/
  (app)/          # 로그인 + 온보딩 필수 영역, 하단 탭 레이아웃
    dashboard/, goals/, goals/[id]/, records/new/, settings/, savings/(2차)
components/       # 공통 UI
lib/
  supabase/client.ts   # 브라우저용
  supabase/server.ts   # 서버용
  supabase/proxy.ts    # 세션 갱신·로그인 리다이렉트 (proxy.ts에서 호출)
  service.ts           # 전역일·복무율·진급일 계산 (순수 함수)
  savings.ts           # 적금 계산 (2차, 순수 함수)
proxy.ts               # Next.js 16의 미들웨어. 세션 갱신, 미로그인 → /login
supabase/migrations/   # SQL 마이그레이션 (번호 순)
types/database.ts      # supabase gen types 결과
```

## 명령어

```bash
npm run dev          # 로컬 개발 서버 (http://localhost:3000)
npm test             # Vitest
npm run build        # 배포 전 빌드 확인
npx supabase db push # 마이그레이션 적용
npx supabase gen types typescript --project-id <id> > types/database.ts
```

## 코딩 규칙

- 데이터 조회는 서버 컴포넌트, 저장·수정·삭제는 서버 액션으로 한다.
- 서버에서 사용자 확인은 `supabase.auth.getUser()`로 한다. 쿠키 값만 믿지 않는다.
- 날짜는 한국 시간(KST) 기준 `YYYY-MM-DD` 문자열로 다룬다. 오늘 날짜는 `todayKST()`를 쓴다.
- 계산 로직은 `lib/`의 순수 함수로 두고, 바꿀 때마다 Vitest 테스트를 추가·실행한다.
- 정책 수치(복무 개월, 적금 한도·금리·매칭 비율)는 코드에 고정하지 않고 DB(`service_periods`, `app_settings`)에서 읽는다. 진급 간격만 `RANK_MONTHS` 상수로 둔다.
- 스키마 변경은 반드시 `supabase/migrations/`에 새 번호의 SQL 파일로 추가한다. 기존 마이그레이션 파일은 고치지 않는다.
- UI는 360px 폭 기준 모바일 우선, 터치 영역 44px 이상, 본문 16px 이상, 다크 모드 지원. 빈 상태·로딩·오류 화면을 항상 만든다.
- 화면 문구는 한국어, 해요체로 쓴다.
- 브랜치는 `feat/기능명`, `fix/내용`. 커밋 메시지는 `feat: 목표 추가 폼`처럼 쓴다.

## 보안 (반드시 지킬 것)

- 새 테이블을 만들면 같은 마이그레이션에서 RLS를 켜고 "본인 행만" 정책을 만든다. RLS 없는 사용자 데이터 테이블은 만들지 않는다.
- 브라우저 코드에는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`만 쓴다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 액션에서만, 꼭 필요할 때(회원 탈퇴)만 쓴다. `NEXT_PUBLIC_`을 붙이지 않는다.
- `.env.local`은 커밋하지 않는다. 키를 커밋하려는 변경이 보이면 멈추고 알린다.
- 부대명·부대 위치·훈련 일정·실명·군번·생년월일을 받는 입력란을 만들지 않는다.
- MVP에서는 사진 업로드(Supabase Storage)를 쓰지 않는다.

## 완료 기준

- `npm run build`와 `npm test`가 통과한다.
- 360px 화면에서 가로 스크롤이 없다.
- 테이블·정책을 바꿨다면 계정 2개로 RLS를 확인했다 (명세 6.2).
