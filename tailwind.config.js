/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy color system
        bg0: "var(--bg-0)",
        bg1: "var(--bg-1)",
        bg2: "var(--bg-2)",
        t1: "var(--text-1)",
        t2: "var(--text-2)",
        b1: "var(--border-1)",
        brand: "var(--brand)",
        accent: "var(--accent)",
        surface: "var(--surface)",
        text: "var(--text)",
        muted: "var(--muted)",
        border: "var(--border)",
        focus: "var(--focus)",
        ok: "var(--ok)",
        warn: "var(--warn)",
        err: "var(--err)",
        
        // Professional Dystopian Color Palette
        command: {
          blue: '#1e3a8a',      // Deep command blue
          slate: '#334155',     // Professional slate
          steel: '#475569',     // Steel gray
          amber: '#d97706',     // Muted amber for warnings
          red: '#dc2626',       // Critical red
          green: '#16a34a',     // Success green
          orange: '#ea580c',    // Alert orange
        },
        surface: {
          dark: '#0f172a',      // Deep dark background
          darker: '#020617',    // Darker panels
          panel: '#1e293b',     // Panel background
          border: '#334155',    // Border color
          accent: '#475569',    // Accent elements
        },
        text: {
          primary: '#f1f5f9',   // Primary text
          secondary: '#cbd5e1', // Secondary text
          muted: '#94a3b8',     // Muted text
          inverse: '#0f172a',   // Inverse text
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      boxShadow: {
        e1: "0 8px 24px rgba(0,0,0,.35)",
        e2: "0 12px 32px rgba(0,0,0,.45)",
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        
        // Professional Animations
        'status-pulse': 'statusPulse 2s ease-in-out infinite',
        'subtle-glow': 'subtleGlow 3s ease-in-out infinite alternate',
        'data-scan': 'dataScan 4s linear infinite',
        'alert-flash': 'alertFlash 1s ease-in-out infinite',
        'loading-spin': 'loadingSpin 1s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        
        // Professional Keyframes
        statusPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 3px currentColor',
            opacity: '1'
          },
          '50%': { 
            boxShadow: '0 0 6px currentColor',
            opacity: '0.9'
          },
        },
        subtleGlow: {
          '0%': { 
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)'
          },
          '100%': { 
            boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)'
          },
        },
        dataScan: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '0.3' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        alertFlash: {
          '0%, 50%, 100%': { opacity: '1' },
          '25%, 75%': { opacity: '0.7' },
        },
        loadingSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
}
