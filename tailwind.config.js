/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg0: "var(--bg-0)",
        bg1: "var(--bg-1)",
        bg2: "var(--bg-2)",
        t1: "var(--text-1)",
        t2: "var(--text-2)",
        b1: "var(--border-1)",
        brand: "var(--brand)",
        accent: "var(--accent)",
        focus: "var(--focus)",
        ok: "var(--ok)",
        warn: "var(--warn)",
        err: "var(--err)",
      },
      boxShadow: {
        'e1': "0 8px 24px rgba(0,0,0,.35)",
        'e2': "0 12px 32px rgba(0,0,0,.45)",
      }
    }
  },
  plugins: []
}
