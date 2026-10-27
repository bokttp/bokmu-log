import type { RecordTarget } from "@/lib/types";

// 공부 기록을 붙일 자격증 고르기 (form 값: "c:<id>"). 예전 과목 기록을 고칠 때는 과목 묶음도 보인다.
export default function TargetSelect({
  targets,
  defaultValue = "",
  className,
}: {
  targets: RecordTarget[];
  defaultValue?: string;
  className: string;
}) {
  const subjects = targets.filter((t) => t.type === "subject");
  const certificates = targets.filter((t) => t.type === "certificate");

  return (
    <select name="target" required defaultValue={defaultValue} aria-label="자격증" className={className}>
      <option value="" disabled>
        자격증을 골라 주세요
      </option>
      {subjects.length > 0 && (
        <optgroup label="예전 과목">
          {subjects.map((t) => (
            <option key={t.key} value={t.key}>
              {t.name}
            </option>
          ))}
        </optgroup>
      )}
      {certificates.length > 0 && (
        <optgroup label="자격증">
          {certificates.map((t) => (
            <option key={t.key} value={t.key}>
              {t.name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
