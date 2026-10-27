// 상단 메뉴의 로고와 메뉴 사이를 왕복하며 달리는 병사 (옆모습, 오른쪽을 본다).
// 베레모·디지털 위장 전투복·배낭·전투화. 팔다리 움직임과 왕복은 globals.css의 .runner-* 애니메이션
export default function RunningSoldier() {
  return (
    <div className="runner-track" aria-hidden>
      <div className="runner">
        <svg viewBox="0 0 60 80" className="h-full w-full overflow-visible">
          <defs>
            <pattern id="runner-camo" width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="6" height="6" fill="#7a7656" />
              <rect width="2" height="2" fill="#4a4a30" />
              <rect x="3" y="1" width="2" height="1" fill="#9a8a62" />
              <rect x="1" y="3" width="3" height="2" fill="#3e4428" />
              <rect x="4" y="4" width="2" height="2" fill="#2e2e22" />
              <rect y="5" width="1" height="1" fill="#9a8a62" />
            </pattern>
          </defs>

          <g className="runner-body">
            {/* 뒤쪽 팔다리 (어둡게) */}
            <g className="runner-back">
              <Leg />
              <Arm />
            </g>

            {/* 배낭 */}
            <rect x="16" y="24" width="12" height="20" rx="3" fill="#3a4124" />
            <rect x="16" y="22" width="12" height="6" rx="3" fill="#2a3016" />

            {/* 몸통 */}
            <rect x="32.5" y="19" width="5" height="6" fill="#e9bf98" />
            <rect x="27" y="23" width="14" height="25" rx="4" fill="url(#runner-camo)" />
            <path d="M30 24q5 7 2 19" stroke="#262b14" strokeWidth="2.2" fill="none" />
            <rect x="35" y="31" width="5" height="1.6" fill="#1c1c14" />
            <rect x="27" y="44.5" width="14" height="3" fill="#1c1c14" />

            {/* 머리 */}
            <circle cx="36" cy="13" r="6.5" fill="#f1c9a5" />
            <circle cx="33.6" cy="14" r="1.4" fill="#e2b088" />
            <path d="M29.6 12.5q0 4 2.4 6l1-5z" fill="#1a1a1a" />
            <path d="M39.6 10.8h2.4" stroke="#1a1a1a" strokeWidth="0.9" strokeLinecap="round" />
            <circle cx="40.6" cy="12.6" r="0.9" fill="#1a1a1a" />
            <path d="M42.2 12.2l1.6 2.2-1.6.4z" fill="#f1c9a5" />
            <path d="M39.4 16.3q1.6 1.4 3.2 0z" fill="#8a3a2a" />

            {/* 베레모 + 모표 */}
            <path d="M28.6 10.6q.6-7.4 9-7q5.4.4 6.4 4.4q-1 2-4.4 2.4z" fill="#1f2812" />
            <path d="M29.4 11l11.6-.8" stroke="#0d0f08" strokeWidth="1.3" />
            <circle cx="39.6" cy="7.6" r="1.4" fill="#d4a63a" />

            {/* 앞쪽 팔다리 */}
            <Leg />
            <Arm flag />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Leg() {
  return (
    <g className="runner-thigh">
      <rect x="29" y="45" width="8" height="15" rx="3.5" fill="url(#runner-camo)" />
      <g className="runner-shin">
        <rect x="29.5" y="56" width="7" height="13" rx="3" fill="url(#runner-camo)" />
        <path d="M28.5 66h9v3.5h4q2.5 0 2.5 2.5v1.5h-15.5z" fill="#141414" />
      </g>
    </g>
  );
}

function Arm({ flag = false }: { flag?: boolean }) {
  return (
    <g className="runner-arm">
      <rect x="31" y="24.5" width="6" height="13" rx="3" fill="url(#runner-camo)" />
      {flag && (
        <>
          <rect x="32" y="27" width="4" height="3" fill="#fff" />
          <circle cx="34" cy="28.5" r="0.9" fill="#c8102e" />
        </>
      )}
      <g className="runner-forearm">
        <rect x="31.5" y="35" width="5" height="10" rx="2.5" fill="url(#runner-camo)" />
        <circle cx="34" cy="45.5" r="2.8" fill="#f1c9a5" />
      </g>
    </g>
  );
}
