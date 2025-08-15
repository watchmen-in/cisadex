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
        
        // Cyberpunk Neon Color Palette
        neon: {
          cyan: '#00FFFF',
          magenta: '#FF0080', 
          green: '#39FF14',
          blue: '#1B03A3',
          orange: '#FF6B35',
          purple: '#9D00FF',
          yellow: '#FFFF00',
          pink: '#FF1493',
          lime: '#32CD32',
        },
        matrix: {
          deep: '#000B1A',
          dark: '#0A0E1A', 
          code: '#111827',
          terminal: '#0D1117',
          void: '#000000',
        },
        cyber: {
          grid: 'rgba(0, 255, 255, 0.1)',
          glow: 'rgba(0, 255, 255, 0.3)',
          pulse: 'rgba(255, 0, 128, 0.4)',
          scan: 'rgba(57, 255, 20, 0.2)',
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
        
        // Cyberpunk Animations
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'neon-glow': 'neonGlow 3s ease-in-out infinite alternate',
        'matrix-rain': 'matrixRain 20s linear infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'cyber-float': 'cyberFloat 6s ease-in-out infinite',
        'data-stream': 'dataStream 15s linear infinite',
        'hologram': 'hologram 4s ease-in-out infinite',
        'energy-wave': 'energyWave 3s ease-in-out infinite',
        'code-scroll': 'codeScroll 25s linear infinite',
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
        
        // Cyberpunk Keyframes
        neonPulse: {
          '0%, 100%': { 
            boxShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
            opacity: '1'
          },
          '50%': { 
            boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
            opacity: '0.8'
          },
        },
        neonGlow: {
          '0%': { 
            textShadow: '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
            filter: 'hue-rotate(0deg)'
          },
          '100%': { 
            textShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor',
            filter: 'hue-rotate(90deg)'
          },
        },
        matrixRain: {
          '0%': { transform: 'translateY(-100vh)', opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        scanLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        glitch: {
          '0%, 14%, 15%, 49%, 50%, 99%, 100%': { 
            transform: 'translate3d(0, 0, 0) skew(0deg)' 
          },
          '1%, 13%': { 
            transform: 'translate3d(-1px, 0, 0) skew(-0.5deg)' 
          },
          '16%, 48%': { 
            transform: 'translate3d(1px, 0, 0) skew(0.5deg)' 
          },
        },
        cyberFloat: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-10px) rotate(1deg)' },
        },
        dataStream: {
          '0%': { transform: 'translateX(-100%) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateX(100vw) rotate(360deg)', opacity: '0' },
        },
        hologram: {
          '0%, 100%': { 
            transform: 'translateZ(0) rotateY(0deg)',
            opacity: '0.9',
            filter: 'hue-rotate(0deg)'
          },
          '50%': { 
            transform: 'translateZ(10px) rotateY(5deg)',
            opacity: '1',
            filter: 'hue-rotate(180deg)'
          },
        },
        energyWave: {
          '0%': { 
            background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.3), transparent)',
            transform: 'translateX(-100%)'
          },
          '100%': { 
            background: 'linear-gradient(90deg, transparent, rgba(255, 0, 128, 0.3), transparent)',
            transform: 'translateX(100%)'
          },
        },
        codeScroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
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
