const ScoreGauge = ({ score = 75 }: { score?: number }) => {
  const normalizedScore = Number.isFinite(score)
    ? Math.min(100, Math.max(0, score))
    : 0;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-40 h-20"
        role="img"
        aria-label={`Resume score: ${normalizedScore} out of 100`}
      >
        <svg viewBox="0 0 100 50" className="w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient
              id="gaugeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#fca5a5" />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d="M10,45 A40,40 0 0,1 90,45"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Foreground arc with rounded ends */}
          <path
            d="M10,45 A40,40 0 0,1 90,45"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - normalizedScore}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div className="text-xl font-semibold pt-4">{normalizedScore}/100</div>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;