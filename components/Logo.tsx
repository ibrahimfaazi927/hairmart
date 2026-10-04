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
      {/* ── Hair Mart Circular Logo Image ── */}
      <img
        src="/images/salon/hairmart-logo.png"
        alt="Hair Mart Studio Logo"
        width={dim}
        height={dim}
        style={{
          flexShrink: 0,
          borderRadius: '50%',
          objectFit: 'cover',
          filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.35))',
        }}
      />

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
