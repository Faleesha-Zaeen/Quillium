import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          primary: '#00ff9d',
          secondary: '#00b8ff',
          accent: '#ff00ff',
          dark: '#0a0a0f',
          gray: '#1a1a24',
          'gray-light': '#2a2a34',
        },
        holo: {
          blue: '#00f3ff',
          pink: '#ff00ff',
          green: '#00ff9d',
          purple: '#9d00ff',
        },
        matrix: {
          green: '#00ff41',
          dark: '#0d0208',
        },
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.5)',
        }
      },
      animation: {
        'cyber-glow': 'cyberGlow 2s ease-in-out infinite alternate',
        'neon-flicker': 'neonFlicker 1.5s infinite',
        'hologram': 'hologram 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'matrix-rain': 'matrixRain 20s linear infinite',
        'scan-line': 'scanLine 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'shimmer': 'shimmer 2s infinite linear',
        'orbit': 'orbit 20s linear infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'gradient-shift': 'gradientShift 3s ease infinite alternate',
      },
      keyframes: {
        cyberGlow: {
          '0%': { 
            'text-shadow': '0 0 5px #00ff9d, 0 0 10px #00ff9d, 0 0 15px #00ff9d',
            'box-shadow': '0 0 20px rgba(0, 255, 157, 0.3)'
          },
          '100%': { 
            'text-shadow': '0 0 10px #00ff9d, 0 0 20px #00ff9d, 0 0 30px #00ff9d',
            'box-shadow': '0 0 40px rgba(0, 255, 157, 0.6), 0 0 60px rgba(0, 184, 255, 0.3)'
          },
        },
        neonFlicker: {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
            opacity: '1',
            filter: 'drop-shadow(0 0 10px currentColor)'
          },
          '20%, 24%, 55%': {
            opacity: '0.8',
            filter: 'drop-shadow(0 0 5px currentColor)'
          },
        },
        hologram: {
          '0%, 100%': { 
            opacity: '0.8',
            filter: 'hue-rotate(0deg) drop-shadow(0 0 20px currentColor)'
          },
          '50%': { 
            opacity: '1',
            filter: 'hue-rotate(90deg) drop-shadow(0 0 30px currentColor)'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)' },
        },
        matrixRain: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '0% 100%' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(100px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(100px) rotate(-360deg)' },
        },
        wave: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(0, 255, 157, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 157, 0.1) 1px, transparent 1px)',
        'matrix-rain': 'linear-gradient(transparent, rgba(0, 255, 65, 0.1) 2px, transparent 3px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'holographic': 'linear-gradient(45deg, rgba(0, 243, 255, 0.3), rgba(255, 0, 255, 0.3), rgba(157, 0, 255, 0.3))',
        'cyber-gradient': 'linear-gradient(135deg, #00ff9d 0%, #00b8ff 50%, #ff00ff 100%)',
      },
      backdropBlur: {
        'cyber': 'blur(16px)',
      },
      boxShadow: {
        'cyber': '0 0 30px rgba(0, 255, 157, 0.5)',
        'cyber-inner': 'inset 0 0 20px rgba(0, 255, 157, 0.3)',
        'hologram': '0 0 50px rgba(0, 243, 255, 0.5)',
        'neon': '0 0 20px currentColor',
      },
      clipPath: {
        'hexagon': 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        'diamond': 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      }
    },
  },
  plugins: [],
}
export default config