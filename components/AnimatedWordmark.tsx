type AnimatedWordmarkProps = {
  className?: string;
};

export function AnimatedWordmark({ className = "" }: AnimatedWordmarkProps) {
  return (
    <div
      className={`animated-wordmark ${className}`.trim()}
      role="img"
      aria-label="Riple"
    >
      <div className="animated-wordmark-lockup">
        <div className="animated-wordmark-logo">
          <svg viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="aw-gBlue" x1="120" y1="120" x2="480" y2="480" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#3b82f6" />
                <stop offset="1" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="aw-gBranch" x1="300" y1="300" x2="540" y2="300" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#4f6ef7" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
              <radialGradient id="aw-gCore" cx="0.35" cy="0.35" r="0.9">
                <stop offset="0" stopColor="#7dd3fc" />
                <stop offset="1" stopColor="#38bdf8" />
              </radialGradient>
            </defs>

            <circle className="aw-ghost" cx="300" cy="300" r="210" stroke="#6366f1" strokeWidth="4" />

            <g stroke="url(#aw-gBlue)" strokeWidth="22" strokeLinecap="round">
              <path className="aw-arc aw-arc-1" d="M 345 222 A 90 90 0 1 0 345 378" />
              <path className="aw-arc aw-arc-2" d="M 372 168 A 150 150 0 1 0 372 432" />
              <path className="aw-arc aw-arc-3" d="M 398 116 A 210 210 0 1 0 398 484" />
            </g>

            <g stroke="url(#aw-gBranch)" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 300 300 L 480 128" />
              <path d="M 300 300 L 388 258 L 500 232" />
              <path d="M 300 300 L 420 300 L 452 336 L 512 336" />
              <path d="M 300 300 L 372 366 L 428 428" />
            </g>

            <g stroke="#c7d2fe" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
              <path className="aw-branch aw-branch-a" d="M 300 300 L 480 128" />
              <path className="aw-branch aw-branch-b" d="M 300 300 L 388 258 L 500 232" />
              <path className="aw-branch aw-branch-c" d="M 300 300 L 420 300 L 452 336 L 512 336" />
              <path className="aw-branch aw-branch-d" d="M 300 300 L 372 366 L 428 428" />
            </g>

            <circle className="aw-node aw-node-a" cx="492" cy="116" r="28" fill="#5b8cf7" />
            <circle className="aw-node aw-node-b" cx="516" cy="228" r="28" fill="#7c6cf2" />
            <circle className="aw-node aw-node-c" cx="528" cy="336" r="28" fill="#8b5cf6" />
            <circle className="aw-node aw-node-d" cx="440" cy="440" r="28" fill="#9061f0" />

            <circle className="aw-core" cx="300" cy="300" r="36" fill="url(#aw-gCore)" />
          </svg>
        </div>

        <div className="animated-wordmark-text" aria-hidden="true">
          <span>R</span>
          <span className="animated-wordmark-i">
            <span className="animated-wordmark-idot" />
            ı
          </span>
          <span>ple</span>
        </div>
      </div>
    </div>
  );
}
