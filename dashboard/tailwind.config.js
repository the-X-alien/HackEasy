module.exports = {
  content: ['./pages/**/*.js', './components/**/*.js'],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(138, 97, 255)',
        background: 'rgb(15, 23, 42)',
        card: 'rgb(30, 41, 59)',
        border: 'rgb(51, 65, 85)',
        foreground: 'rgb(241, 245, 249)',
        muted: { foreground: 'rgb(148, 163, 184)' },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
