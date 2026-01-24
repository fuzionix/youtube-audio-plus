/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        yt: {
          base: 'var(--yt-spec-base-background, #0f0f0f)',
          text: 'var(--yt-spec-text-primary, #fff)',
          red: 'var(--yt-spec-brand-button-background, #c00)',
          panel: 'var(--yt-spec-menu-background, #1f1f1f)',
          border: 'var(--yt-spec-10-percent-layer, rgba(255,255,255,0.1))'
        }
      }
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}