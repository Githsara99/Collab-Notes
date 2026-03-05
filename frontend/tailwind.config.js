module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: { DEFAULT: '#0d0d14', 100: '#13131e', 200: '#1a1a28', 300: '#22223a' },
        surface: { DEFAULT: '#1e1e2e', 100: '#252535', 200: '#2d2d45' },
        border: { DEFAULT: '#2a2a40', light: '#3a3a58' },
        accent: { DEFAULT: '#7c3aed', light: '#a78bfa', dark: '#5b21b6' },
        text: { DEFAULT: '#e8e8f0', muted: '#8888a8', dim: '#4a4a65' },
      },
      fontFamily: { sans: ['Space Grotesk', 'sans-serif'], mono: ['JetBrains Mono', 'monospace'] },
    }
  },
  plugins: [],
};
