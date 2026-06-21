/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',
        'border-color': 'var(--border)', 
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        'sidebar-bg': 'var(--sidebar-bg)',
        'sidebar-border': 'var(--sidebar-border)',
        'topbar-bg': 'var(--topbar-bg)',
        'topbar-border': 'var(--topbar-border)',
        'card-bg': 'var(--card-bg)',
        'card-hover-bg': 'var(--card-hover-bg)',
        'card-border': 'var(--card-border)',
        'accent': 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-purple': 'var(--accent-purple)',
        'accent-muted': 'var(--accent-soft)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'success-color': 'var(--success)',
        'warning-color': 'var(--warning)',
        'danger-color': 'var(--danger)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
