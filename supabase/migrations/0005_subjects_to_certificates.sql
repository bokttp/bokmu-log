-- 공부 화면을 없애면서 남은 과목을 어학 자격증으로 옮긴다 (2026-10-27 사용자 요청, PLAN.md 결정 기록)
-- 대상: 보관하지 않은 과목. 목표일은 시험일이 아닐 수 있어 메모에 남긴다.
-- 과목에 붙은 공부 기록은 새 자격증으로 옮기고, 과목 행은 지우지 않고 보관 처리한다.

-- 옮긴 과목을 잠시 기억해 둘 연결 열 (이 마이그레이션 끝에서 지운다)
alter table certificates add column from_subject_id uuid;

insert into certificates (user_id, name, kind, status, memo, legacy_goal_id, from_subject_id, created_at)
select user_id,
       left(coalesce(target, name), 60),
       'language',
       'preparing',
       case when target_date is not null then '목표일 ' || to_char(target_date, 'YYYY.MM.DD') || ' (공부 과목에서 옮김)' else '공부 과목에서 옮김' end,
       legacy_goal_id,
       id,
       created_at
from subjects
where not archived;

update records r
set certificate_id = c.id, subject_id = null
from certificates c
where c.from_subject_id = r.subject_id;

update subjects s
set archived = true
where exists (select 1 from certificates c where c.from_subject_id = s.id);

alter table certificates drop column from_subject_id;
