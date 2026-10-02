interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'icon-only';
  textColor?: 'light' | 'dark';
}

const sizes = {
  sm: 42,
  md: 56,
  lg: 76,
  xl: 110,
};

export default function Logo({
  size = 'md',
  showText = true,
  className = '',
  variant = 'horizontal',
  textColor = 'light',
}: LogoProps) {
  const dim = sizes[size];
  const isDarkText = textColor === 'dark';

  return (
    <div
      className={`logo-wrapper ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexDirection: variant === 'vertical' ? 'column' : 'row',
        gap: size === 'sm' ? '10px' : size === 'md' ? '14px' : '18px',
        textDecoration: 'none',
      }}
    >
      {/* ── Circular Emblem directly matching the real physical Hair Mart sign ── */}
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.35))' }}
        aria-label="Hair Mart Studio Logo"
      >
        {/* Outer White Circular Rim */}
        <circle cx="80" cy="80" r="76" fill="#1C2433" stroke="#FFFFFF" strokeWidth="5.5" />
        {/* Inner subtle decorative ring */}
        <circle cx="80" cy="80" r="71" stroke="rgba(246, 201, 38, 0.25)" strokeWidth="1.2" />

        {/* ── Couple Back-to-Back Silhouettes in signature warm salon gold ── */}
        <g fill="#F6C926">
          {/* WOMAN PROFILE (Left side facing Left) */}
          {/* Main head & face contour */}
          <path
            d="
              M 77 34
              C 62 34 50 42 45 54
              C 43 59 42 62 39 65
              C 36 67 33 68 33 70
              C 33 71.5 36 72 38 73
              C 36 74.5 35 76 35 77.5
              C 35 79 38 79.5 40 80.5
              C 37 83 40 86 44 87
              C 48 88 52 87 55 93
              C 58 99 57 108 55 118
              C 60 114 65 106 67 98
              C 68 94 67 88 65 83
              C 62 77 62 71 65 65
              C 69 57 74 50 78 45
              Z
            "
          />
          {/* Woman's flowing wavy hair locks (left & back waves) */}
          <path
            d="
              M 76 34
              C 66 33 54 39 48 48
              C 43 56 42 67 45 76
              C 42 74 38 72 36 67
              C 34 62 36 53 43 45
              C 50 37 62 31 76 31
              Z
            "
          />
          {/* Flowing hair lock front wave */}
          <path
            d="
              M 48 52
              C 44 58 43 67 46 76
              C 49 84 48 93 43 101
              C 41 104 38 108 36 112
              C 40 110 44 105 47 99
              C 51 91 52 82 50 74
              C 48 66 49 58 52 53
              Z
            "
          />
          {/* Flowing hair lock back bottom wave */}
          <path
            d="
              M 58 42
              C 53 52 52 64 56 76
              C 60 88 58 100 52 110
              C 50 113 47 117 44 121
              C 49 119 54 114 58 106
              C 63 96 64 84 61 73
              C 58 63 59 51 63 43
              Z
            "
          />
          {/* Woman back wave tendril */}
          <path
            d="
              M 70 38
              C 64 48 64 61 68 73
              C 71 83 70 94 65 104
              C 63 108 61 113 58 117
              C 62 115 67 109 70 101
              C 74 91 75 79 73 68
              C 71 58 72 47 75 40
              Z
            "
          />

          {/* MAN PROFILE (Right side facing Right) */}
          {/* Stylish pompadour / quiff hair */}
          <path
            d="
              M 84 34
              C 95 30 108 34 117 43
              C 123 49 125 56 122 62
              C 119 66 113 67 108 65
              C 103 63 100 57 97 53
              C 93 48 89 39 84 34
              Z
            "
          />
          {/* Man face profile (forehead, sharp nose, lips, chin, neck) */}
          <path
            d="
              M 98 52
              C 104 54 110 57 114 62
              C 117 65 120 67 125 69
              C 122 71 119 72 118 73
              C 121 74.5 123 76 122 78
              C 120 79.5 117 80 115 81
              C 117 83 115 86 112 87
              C 108 88 104 88 102 94
              C 100 100 101 108 103 118
              C 98 114 94 106 93 98
              C 92 92 93 85 96 79
              C 99 73 99 65 97 58
              Z
            "
          />
          {/* Man neck & collar */}
          <path
            d="
              M 94 88
              L 100 104
              L 112 114
              L 118 104
              L 106 94
              L 99 87
              Z
            "
          />
          {/* Man hair crown wave & quiff volume */}
          <path
            d="
              M 88 38
              C 98 34 112 39 119 49
              C 123 55 122 61 117 62
              C 112 63 107 59 104 53
              C 99 45 94 40 88 38
              Z
            "
          />
        </g>

        {/* Central delicate separation */}
        <line x1="80" y1="36" x2="80" y2="114" stroke="#F6C926" strokeWidth="1" strokeDasharray="2 3" opacity="0.4" />
      </svg>

      {/* ── Brand Typography matching the actual Hair Mart Studio sign ── */}
      {showText && (
        <div
          className="logo-text"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: variant === 'vertical' ? 'center' : 'flex-start',
            textAlign: variant === 'vertical' ? 'center' : 'left',
          }}
        >
          {/* "Hair Mart" title case in bold geometric modern style */}
          <div
            style={{
              fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: size === 'sm' ? '18px' : size === 'md' ? '22px' : size === 'lg' ? '26px' : '32px',
              lineHeight: 1.05,
              color: isDarkText ? '#111827' : '#FFFFFF',
              letterSpacing: '-0.01em',
              display: 'flex',
              alignItems: 'baseline',
              gap: '5px',
            }}
          >
            <span>Hair</span>
            <span style={{ color: '#F6C926' }}>Mart</span>
          </div>

          {/* "Studio" in flowing elegant script */}
          <div
            style={{
              fontFamily: "'Playfair Display', 'Georgia', 'Dancing Script', cursive",
              fontStyle: 'italic',
              fontWeight: 600,
              fontSize: size === 'sm' ? '12px' : size === 'md' ? '14px' : size === 'lg' ? '17px' : '20px',
              lineHeight: 1,
              color: '#F6C926',
              marginTop: '1px',
              marginBottom: '2px',
              letterSpacing: '0.04em',
            }}
          >
            Studio
          </div>

          {/* "UNISEX FAMILY SALON" matching the bottom sign */}
          <div
            style={{
              fontFamily: "system-ui, -apple-system, 'Inter', sans-serif",
              fontSize: size === 'sm' ? '7.5px' : size === 'md' ? '8.5px' : size === 'lg' ? '10px' : '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: isDarkText ? '#4B5563' : '#E5E7EB',
              lineHeight: 1,
            }}
          >
            UNISEX FAMILY SALON
          </div>
        </div>
      )}
    </div>
  );
}
