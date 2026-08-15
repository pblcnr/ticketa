import type { Config } from 'tailwindcss'

export default {
  theme: {
    extend: {
      colors: {
        kraft: '#E4D4AE',
        paper: '#F2E9D3',
        ink: '#201A14',
        'stub-red': '#D64545',
        'stage-violet': '#4B3A82',
        'gate-green': '#2F6F5E',
        'perf-grey': '#B8AA88',
      },
      fontFamily: {
        display: ['Anton', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        'ticket-mono': ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
} satisfies Config
