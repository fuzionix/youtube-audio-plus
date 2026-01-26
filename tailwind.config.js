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
          raised: 'var(--yt-spec-raised-background, #282828)',
          menu: 'var(--yt-spec-menu-background, #282828)',
          inverted: 'var(--yt-spec-inverted-background, #0f0f0f)',
          
          text: 'var(--yt-spec-text-primary-inverse, #fff)',
          textSecondary: 'var(--yt-spec-overlay-text-secondary, rgba(255,255,255,0.7))',
          textDisabled: 'var(--yt-spec-overlay-text-disabled, rgba(255,255,255,0.3))',
          
          red: 'var(--yt-spec-static-brand-red, #f03)',
          
          panel: 'var(--yt-spec-black-1, #282828)',
          
          border: 'var(--yt-spec-white-1-alpha-10, rgba(255,255,255,0.1))',
          borderLight: 'var(--yt-spec-white-1-alpha-20, rgba(255,255,255,0.2))',
          
          hover: 'var(--yt-spec-white-1-alpha-10, rgba(255,255,255,0.1))',
          hoverIntense: 'var(--yt-spec-white-1-alpha-20, rgba(255,255,255,0.2))',
          touchResponse: 'var(--yt-spec-overlay-touch-response, #fff)',
          
          sliderTrack: 'var(--yt-spec-white-1-alpha-20, rgba(255,255,255,0.2))',
          sliderThumb: 'var(--yt-spec-static-brand-white, #fff)',
          
          shadow: 'rgba(0,0,0,0.6)',
          background: 'rgba(0,0,0,0.6)',
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