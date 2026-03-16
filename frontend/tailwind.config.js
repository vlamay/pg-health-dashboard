export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        /* Mission Control */
        'void': '#08090A',
        'card': '#141820',
        'accent-green': '#00FF94',
        'accent-amber': '#FFB800',
        'accent-red': '#FF3B5C',
        'mono': '#7FDBCA',
        /* Legacy */
        'bg-base': '#09090b',
        'bg-surface': '#18181b',
        'bg-elevated': '#1e1e22',
        'bg-overlay': '#26262a',
        'bg-sidebar': '#111113',
        'brand': '#3ECF8E',
        'teal': '#2DD4BF'
      },
      fontFamily: {
        'ibm-mono': '"IBM Plex Mono", monospace',
        'dm-mono': '"DM Mono", monospace',
        mono: '"JetBrains Mono", monospace'
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.08)'
      },
      spacing: {
        sidebar: '240px'
      },
      animation: {
        'ping-slow': 'ping-slow 1.8s cubic-bezier(0, 0, 0.2, 1) infinite',
        'value-flash': 'value-flash 0.25s ease-out',
        'card-reveal': 'card-reveal 0.5s ease-out forwards',
        'cursor-blink': 'cursor-blink 1s steps(1) infinite'
      },
      keyframes: {
        'ping-slow': {
          '75%, 100%': {
            transform: 'scale(2)',
            opacity: '0'
          }
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(16px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'value-flash': {
          '0%': {
            outline: '2px solid #00FF94',
            outlineOffset: '2px'
          },
          '100%': {
            outline: '0px solid #00FF94',
            outlineOffset: '0px'
          }
        },
        'card-reveal': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'cursor-blink': {
          '0%, 49%': {
            opacity: '1'
          },
          '50%, 100%': {
            opacity: '0'
          }
        }
      }
    }
  },
  plugins: []
}
