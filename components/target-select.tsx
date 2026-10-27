import type { RecordTarget } from "@/lib/types";

// 공부 기록을 붙일 곳 고르기: 과목 / 자격증 묶음으로 나눠 보여준다 (form 값: "s:<id>" | "c:<id>")
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
    <select name="target" required defaultValue={defaultValue} aria-label="과목 또는 자격증" className={className}>
      <option value="" disabled>
        과목이나 자격증을 골라 주세요
      </option>
      {subjects.length > 0 && (
        <optgroup label="공부 과목">
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
