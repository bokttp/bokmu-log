-- RLS 검증 스크립트 (명세 6.2). Supabase SQL Editor에서 실행한다.
-- 가상 사용자 A·B를 만들어 서로의 데이터에 접근해 보고, 결과를 오류 메시지로 출력한다.
-- 마지막에 일부러 오류를 내서 트랜잭션 전체를 되돌리므로 DB에는 아무것도 남지 않는다.
do $$
declare
  a uuid := gen_random_uuid();
  b uuid := gen_random_uuid();
  a_goal uuid;
  a_record uuid;
  a_cert uuid;
  a_subject uuid;
  n int;
  out text := '';
  fails int := 0;
begin
  -- 준비 (postgres 권한): 가상 사용자 A·B와 A의 목표·기록
  insert into auth.users (id, instance_id, aud, role, email)
  values (a, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-a@example.test'),
         (b, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'rls-b@example.test');
  insert into goals (user_id, category, title) values (a, 'etc', 'A의 목표') returning id into a_goal;
  insert into records (user_id, goal_id, content) values (a, a_goal, 'A의 기록') returning id into a_record;
  insert into books (user_id, title) values (a, 'A의 책');
  insert into fitness_tests (user_id, pushups) values (a, 50);
  insert into certificates (user_id, name) values (a, 'A의 자격증') returning id into a_cert;
  insert into cert_exams (user_id, certificate_id) values (a, a_cert);
  insert into subjects (user_id, name) values (a, 'A의 과목') returning id into a_subject;

  -- 사용자 B로 전환
  perform set_config('request.jwt.claims', json_build_object('sub', b, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';

  select count(*) into n from goals;            out := out || format(E'\n[B] A 목표 보임: %s (기대 0)', n);  if n <> 0 then fails := fails + 1; end if;
  select count(*) into n from records;          out := out || format(E'\n[B] A 기록 보임: %s (기대 0)', n);  if n <> 0 then fails := fails + 1; end if;
  select count(*) into n from profiles;         out := out || format(E'\n[B] 보이는 프로필: %s (기대 1, 본인)', n); if n <> 1 then fails := fails + 1; end if;
  select count(*) into n from service_periods;  out := out || format(E'\n[B] 복무기간 표: %s (기대 5)', n);  if n <> 5 then fails := fails + 1; end if;

  select count(*) into n from books;            out := out || format(E'\n[B] A 책 보임: %s (기대 0)', n);  if n <> 0 then fails := fails + 1; end if;
  select count(*) into n from fitness_tests;    out := out || format(E'\n[B] A 체력검정 보임: %s (기대 0)', n);  if n <> 0 then fails := fails + 1; end if;
  select count(*) into n from app_settings;     out := out || format(E'\n[B] 정책 수치 표: %s (기대 1)', n);  if n <> 1 then fails := fails + 1; end if;

  select count(*) into n from certificates;     out := out || format(E'\n[B] A 자격증 보임: %s (기대 0)', n);  if n <> 0 then fails := fails + 1; end if;
  select count(*) into n from cert_exams;       out := out || format(E'\n[B] A 시험 보임: %s (기대 0)', n);  if n <> 0 then fails := fails + 1; end if;
  select count(*) into n from subjects;         out := out || format(E'\n[B] A 과목 보임: %s (기대 0)', n);  if n <> 0 then fails := fails + 1; end if;

  begin
    insert into cert_exams (certificate_id) values (a_cert);
    out := out || E'\n[B] A 자격증에 시험 추가: 허용됨 (기대 차단)'; fails := fails + 1;
  exception when insufficient_privilege then
    out := out || E'\n[B] A 자격증에 시험 추가: 차단 (기대 차단)';
  end;

  begin
    insert into records (content, subject_id) values ('A 과목에 연결', a_subject);
    out := out || E'\n[B] 내 기록을 A 과목에 연결: 허용됨 (기대 차단)'; fails := fails + 1;
  exception when insufficient_privilege then
    out := out || E'\n[B] 내 기록을 A 과목에 연결: 차단 (기대 차단)';
  end;

  begin
    insert into records (content, certificate_id) values ('A 자격증에 연결', a_cert);
    out := out || E'\n[B] 내 기록을 A 자격증에 연결: 허용됨 (기대 차단)'; fails := fails + 1;
  exception when insufficient_privilege then
    out := out || E'\n[B] 내 기록을 A 자격증에 연결: 차단 (기대 차단)';
  end;

  update app_settings set value = '{}' where key = 'savings';  get diagnostics n = row_count;
  out := out || format(E'\n[B] 정책 수치 수정: %s건 (기대 0)', n); if n <> 0 then fails := fails + 1; end if;

  begin
    insert into books (user_id, title) values (a, 'A 이름으로 책');
    out := out || E'\n[B] A 이름으로 책 추가: 허용됨 (기대 차단)'; fails := fails + 1;
  exception when insufficient_privilege then
    out := out || E'\n[B] A 이름으로 책 추가: 차단 (기대 차단)';
  end;

  update profiles set nickname = 'hack' where id = a;  get diagnostics n = row_count;
  out := out || format(E'\n[B] A 프로필 수정: %s건 (기대 0)', n); if n <> 0 then fails := fails + 1; end if;
  update goals set title = 'hack' where id = a_goal;   get diagnostics n = row_count;
  out := out || format(E'\n[B] A 목표 수정: %s건 (기대 0)', n); if n <> 0 then fails := fails + 1; end if;
  delete from records where id = a_record;              get diagnostics n = row_count;
  out := out || format(E'\n[B] A 기록 삭제: %s건 (기대 0)', n); if n <> 0 then fails := fails + 1; end if;

  begin
    insert into records (user_id, content) values (a, 'A 이름으로 쓰기');
    out := out || E'\n[B] A 이름으로 기록 추가: 허용됨 (기대 차단)'; fails := fails + 1;
  exception when insufficient_privilege then
    out := out || E'\n[B] A 이름으로 기록 추가: 차단 (기대 차단)';
  end;

  begin
    insert into records (content, goal_id) values ('A 목표에 연결', a_goal);
    out := out || E'\n[B] 내 기록을 A 목표에 연결: 허용됨 (기대 차단)'; fails := fails + 1;
  exception when insufficient_privilege then
    out := out || E'\n[B] 내 기록을 A 목표에 연결: 차단 (기대 차단)';
  end;

  insert into goals (category, title) values ('etc', 'B의 목표');
  select count(*) into n from goals;
  out := out || format(E'\n[B] 내 목표 추가 후 보임: %s (기대 1)', n); if n <> 1 then fails := fails + 1; end if;

  -- 로그인하지 않은 방문자(anon)로 전환
  execute 'reset role';
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  execute 'set local role anon';
  select count(*) into n from profiles;         out := out || format(E'\n[anon] 프로필 보임: %s (기대 0)', n); if n <> 0 then fails := fails + 1; end if;
  select count(*) into n from goals;            out := out || format(E'\n[anon] 목표 보임: %s (기대 0)', n);  if n <> 0 then fails := fails + 1; end if;
  select count(*) into n from service_periods;  out := out || format(E'\n[anon] 복무기간 표: %s (기대 5)', n); if n <> 5 then fails := fails + 1; end if;
  select count(*) into n from books;            out := out || format(E'\n[anon] 책 보임: %s (기대 0)', n); if n <> 0 then fails := fails + 1; end if;

  -- 사용자 A로 전환: 본인 데이터는 보여야 한다
  execute 'reset role';
  perform set_config('request.jwt.claims', json_build_object('sub', a, 'role', 'authenticated')::text, true);
  execute 'set local role authenticated';
  select count(*) into n from goals;            out := out || format(E'\n[A] 내 목표 보임: %s (기대 1)', n);  if n <> 1 then fails := fails + 1; end if;
  select count(*) into n from records;          out := out || format(E'\n[A] 내 기록 보임: %s (기대 1)', n);  if n <> 1 then fails := fails + 1; end if;
  select count(*) into n from books;            out := out || format(E'\n[A] 내 책 보임: %s (기대 1)', n);  if n <> 1 then fails := fails + 1; end if;
  select count(*) into n from fitness_tests;    out := out || format(E'\n[A] 내 체력검정 보임: %s (기대 1)', n);  if n <> 1 then fails := fails + 1; end if;
  select count(*) into n from certificates;     out := out || format(E'\n[A] 내 자격증 보임: %s (기대 1)', n);  if n <> 1 then fails := fails + 1; end if;
  select count(*) into n from cert_exams;       out := out || format(E'\n[A] 내 시험 보임: %s (기대 1)', n);  if n <> 1 then fails := fails + 1; end if;
  select count(*) into n from subjects;         out := out || format(E'\n[A] 내 과목 보임: %s (기대 1)', n);  if n <> 1 then fails := fails + 1; end if;

  execute 'reset role';
  -- 결과 출력 + 전체 되돌리기
  raise exception 'RLS 검증 결과: 실패 %건%', fails, out;
end $$;
