// 병 계급장 (이병 1줄 · 일병 2줄 · 상병 3줄 · 병장 4줄)
const BARS: Record<string, number> = { 이병: 1, 일병: 2, 상병: 3, 병장: 4 };

export default function RankBadge({ rank, className = "" }: { rank: string; className?: string }) {
  const bars = BARS[rank] ?? 0;
  if (!bars) return null;
  const h = 6, gap = 4, pad = 6;
  const height = pad * 2 + bars * h + (bars - 1) * gap;

  return (
    <svg
      viewBox={`0 0 36 ${height}`}
      width={36}
      height={height}
      role="img"
      aria-label={`${rank} 계급장`}
      className={className}
    >
      <rect x="0.5" y="0.5" width="35" height={height - 1} rx="4" fill="#2f3417" stroke="#c3b091" strokeOpacity="0.6" />
      {Array.from({ length: bars }, (_, i) => (
        <rect key={i} x="7" y={pad + i * (h + gap)} width="22" height={h} rx="1" fill="#c3b091" />
      ))}
    </svg>
  );
}
