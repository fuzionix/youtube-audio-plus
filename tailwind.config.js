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
          base: 'var(--yt-sys-color-baseline--base-background, #0f0f0f)',
          raised: 'var(--yt-sys-color-baseline--raised-background, #212121)',
          menu: 'var(--yt-sys-color-baseline--menu-background, #282828)',
          inverted: 'var(--yt-sys-color-baseline--inverted-background, #0f0f0f)',

          text: 'var(--yt-sys-color-baseline--text-primary-inverse, #fff)',
          textSecondary: 'var(--yt-sys-color-baseline--overlay-text-secondary, rgba(255,255,255,0.7))',
          textDisabled: 'var(--yt-sys-color-baseline--overlay-text-disabled, rgba(255,255,255,0.3))',

          red: 'var(--yt-sys-color-baseline--static-brand-red, #f03)',

          panel: 'var(--yt-sys-color-baseline--raised-background, #282828)',

          border: 'var(--yt-sys-color-baseline--additive-background-inverse, rgba(255,255,255,0.1))',
          borderLight: 'var(--yt-sys-color-baseline--outline-inverse, rgba(255,255,255,0.2))',

          hover: 'var(--yt-sys-color-baseline--additive-background-inverse, rgba(255,255,255,0.1))',
          hoverIntense: 'var(--yt-sys-color-baseline--mono-tonal-hover-inverse, rgba(255,255,255,0.2))',
          touchResponse: 'var(--yt-sys-color-baseline--overlay-touch-response, #fff)',

          sliderTrack: 'var(--yt-sys-color-baseline--outline-inverse, rgba(255,255,255,0.2))',
          sliderThumb: 'var(--yt-sys-color-baseline--static-brand-white, #fff)',

          shadow: 'rgba(0,0,0,0.6)',
          background: 'rgba(0,0,0,0.6)',

          overlayBackground: 'var(--yt-sys-color-baseline--overlay-background-medium-light, rgba(0,0,0,0.3))',
          overlayButtonSecondary: 'var(--yt-sys-color-baseline--overlay-button-secondary, rgba(255,255,255,0.1))',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'xs': '11px',
        'sm': '13px',
      },
    },
  },
  corePlugins: {
    preflight: false, // Essential for Shadow DOM injection to avoid breaking page styles
  },
  plugins: [],
}