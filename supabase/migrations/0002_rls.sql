-- 복무로그 RLS 정책 (명세 6.1): 본인 행만 읽고 쓴다

alter table profiles enable row level security;
alter table goals enable row level security;
alter table records enable row level security;
alter table service_periods enable row level security;

-- profiles: 본인만 조회·수정 (생성은 트리거, 삭제는 탈퇴 시 cascade)
create policy "profiles_select_own" on profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "profiles_update_own" on profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- goals: 본인 행 전체 권한
create policy "goals_all_own" on goals
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- records: 본인 행 전체 권한 + 연결 목표도 본인 것이어야 함
create policy "records_all_own" on records
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (goal_id is null or exists (
      select 1 from goals g where g.id = goal_id and g.user_id = (select auth.uid())
    ))
  );

-- service_periods: 누구나 읽기만
create policy "service_periods_read" on service_periods
  for select to anon, authenticated using (true);
