/**
 * Original hero illustration (no license needed): savings stacks growing into
 * a rising path toward a family home. Swap for a licensed photo any time.
 */
export function HeroIllustration({ className }: { className?: string }) {
  const stacks = [
    { x: 50, coins: 4 },
    { x: 104, coins: 8 },
    { x: 158, coins: 13 },
  ];
  const ground = 420;
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMax slice"
      role="img"
      aria-label="Illustration: stacks of savings growing along a rising path toward a family home"
      className={className}
    >
      <defs>
        <linearGradient id="hi-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#17324F" />
          <stop offset="1" stopColor="#10243A" />
        </linearGradient>
        <linearGradient id="hi-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#167D68" stopOpacity="0.45" />
          <stop offset="1" stopColor="#167D68" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hi-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#C9A45C" stopOpacity="0.35" />
          <stop offset="1" stopColor="#C9A45C" stopOpacity="0" />
        </radialGradient>
        <clipPath id="hi-clip">
          <rect width="400" height="500" />
        </clipPath>
      </defs>

      <g clipPath="url(#hi-clip)">
        <rect width="400" height="500" fill="url(#hi-sky)" />
        {/* faint grid like graph paper */}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`v${i}`} x1={i * 50} x2={i * 50} y1="0" y2="500" stroke="#FAF8F2" strokeOpacity="0.05" />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`h${i}`} y1={i * 50} y2={i * 50} x1="0" x2="400" stroke="#FAF8F2" strokeOpacity="0.05" />
        ))}
        <circle cx="318" cy="118" r="120" fill="url(#hi-glow)" />
        <circle cx="318" cy="118" r="26" fill="#C9A45C" fillOpacity="0.9" />

        {/* rising growth path */}
        <path d="M30 372 C 90 360, 120 330, 170 312 S 240 250, 280 214 S 340 150, 372 104 L 400 64 L 400 500 L 30 500 Z" fill="url(#hi-area)" />
        <path d="M30 372 C 90 360, 120 330, 170 312 S 240 250, 280 214 S 340 150, 372 104" fill="none" stroke="#2FA88C" strokeWidth="6" strokeLinecap="round" />
        <path d="M352 104 L374 100 L370 122" fill="none" stroke="#2FA88C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        {[[170, 312], [280, 214]].map(([cx, cy]) => (
          <circle key={cx} cx={cx} cy={cy} r="7" fill="#10243A" stroke="#2FA88C" strokeWidth="4" />
        ))}

        {/* ground */}
        <rect x="0" y={ground} width="400" height="80" fill="#0B1A2B" />
        <line x1="0" x2="400" y1={ground} y2={ground} stroke="#C9A45C" strokeOpacity="0.5" strokeWidth="2" />

        {/* savings stacks */}
        {stacks.map((s) =>
          Array.from({ length: s.coins }, (_, i) => {
            const y = ground - 8 - i * 11;
            return (
              <g key={`${s.x}-${i}`}>
                <path d={`M${s.x - 22} ${y} v8 a22 7 0 0 0 44 0 v-8`} fill="#9A7A36" />
                <ellipse cx={s.x} cy={y} rx="22" ry="7" fill="#C9A45C" />
                <ellipse cx={s.x} cy={y} rx="13" ry="3.6" fill="none" stroke="#9A7A36" strokeOpacity="0.7" />
              </g>
            );
          }),
        )}

        {/* sprout on the tallest stack */}
        <g transform={`translate(158 ${ground - 8 - 12 * 11 - 4})`}>
          <path d="M0 0 C 0 -14, 2 -26, 0 -40" stroke="#2FA88C" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M0 -22 C -18 -24, -26 -38, -24 -46 C -10 -44, -2 -34, 0 -22 Z" fill="#2FA88C" />
          <path d="M0 -30 C 16 -34, 26 -48, 24 -56 C 10 -54, 2 -44, 0 -30 Z" fill="#167D68" />
        </g>

        {/* family home */}
        <g>
          <rect x="250" y="338" width="104" height="82" rx="3" fill="#FAF8F2" />
          <path d="M238 344 L302 288 L366 344 Z" fill="#167D68" />
          <rect x="332" y="296" width="14" height="30" fill="#FAF8F2" />
          <rect x="290" y="372" width="26" height="48" rx="3" fill="#10243A" />
          <circle cx="310" cy="397" r="2.4" fill="#C9A45C" />
          <rect x="262" y="356" width="20" height="18" rx="2" fill="#C9A45C" />
          <rect x="324" y="356" width="20" height="18" rx="2" fill="#C9A45C" />
          <line x1="272" x2="272" y1="356" y2="374" stroke="#FAF8F2" strokeWidth="2" />
          <line x1="334" x2="334" y1="356" y2="374" stroke="#FAF8F2" strokeWidth="2" />
        </g>

        {/* family of three, walking toward home */}
        <g fill="#FAF8F2">
          <circle cx="200" cy="372" r="7" fillOpacity="0.85" />
          <rect x="193" y="382" width="14" height="38" rx="7" fillOpacity="0.85" />
          <circle cx="217" cy="370" r="7" />
          <rect x="210" y="380" width="14" height="40" rx="7" />
          <circle cx="235" cy="384" r="5.5" />
          <rect x="229.5" y="392" width="11" height="28" rx="5.5" />
        </g>
      </g>
    </svg>
  );
}
