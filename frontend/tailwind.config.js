/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        base:           'var(--bg-base)',
        surface:        'var(--bg-surface)',
        elevated:       'var(--bg-elevated)',
        overlay:        'var(--bg-overlay)',
        // Borders
        border:         'var(--border)',
        'border-subtle':'var(--border-subtle)',
        // Text
        'text-primary':   'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted':     'var(--text-muted)',
        // Accents
        primary:  'var(--accent-primary)',
        blue:     'var(--accent-blue)',
        emerald:  'var(--accent-emerald)',
        danger:   'var(--accent-red)',
        warning:  'var(--accent-amber)',
        'btn-primary': 'var(--btn-primary-bg)',
        'btn-primary-text': 'var(--btn-primary-text)',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':     'fadeIn 0.25s ease-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'ping-slow':   'ping 2s cubic-bezier(0,0,0.2,1) infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'float':       'float 3s ease-in-out infinite',
        'shimmer':     'shimmer 1.5s infinite',
        'rotate-slow': 'rotateSlow 20s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 12px var(--shadow-glow-primary)' },
          '50%':      { boxShadow: '0 0 28px var(--shadow-glow-primary)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        rotateSlow: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 20px var(--shadow-glow-primary)',
        'glow-blue':    '0 0 20px var(--shadow-glow-blue)',
        'card':         '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'card-hover':   '0 4px 20px rgba(0,0,0,0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        250: '250ms',
      },
    },
  },
  plugins: [],
}
