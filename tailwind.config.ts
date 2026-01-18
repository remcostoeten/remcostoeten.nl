export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent: 'hsl(var(--accent))',
        border: 'hsl(var(--border))',
        primary: 'hsl(var(--primary))',
        'primary-foreground': 'hsl(var(--primary-foreground))',
        destructive: 'hsl(var(--destructive))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        brand: {
          400: 'hsl(var(--brand-400))',
          500: 'hsl(var(--brand-500))',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'JetBrains Mono', 'Consolas', 'monospace'],
      },

      keyframes: {
        enter: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'music-bar': {
          '0%, 100%': { height: '20%' },
          '50%': { height: '100%' },
        },
        'blob-float': {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            opacity: "0.15"
          },
          "25%": {
            transform: "translate(20px, -30px) scale(1.1)",
            borderRadius: "40% 60% 70% 30% / 50% 60% 30% 60%",
            opacity: "0.25"
          },
          "50%": {
            transform: "translate(-20px, 20px) scale(0.9)",
            borderRadius: "70% 30% 50% 50% / 30% 30% 70% 70%",
            opacity: "0.15"
          },
          "75%": {
            transform: "translate(10px, -10px) scale(1.05)",
            borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
            opacity: "0.25"
          }
        },
        'blob-sway': {
          "0%, 100%": {
            transform: "translate(0, 0) rotate(0deg) scale(1)",
            borderRadius: "70% 30% 30% 70% / 60% 40% 60% 40%",
            opacity: "0.1"
          },
          "33%": {
            transform: "translate(-30px, 10px) rotate(10deg) scale(1.1)",
            borderRadius: "40% 60% 60% 40% / 50% 50% 50% 50%",
            opacity: "0.2"
          },
          "66%": {
            transform: "translate(20px, -20px) rotate(-5deg) scale(0.95)",
            borderRadius: "60% 40% 50% 50% / 40% 60% 40% 60%",
            opacity: "0.15"
          }
        },
        'blob-pulse': {
          "0%, 100%": { transform: "scale(1)", opacity: "0.1" },
          "50%": { transform: "scale(1.2)", opacity: "0.2" }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-12deg)' },
          '50%': { transform: 'rotate(12deg)' },
        },
        'subtle-rotate': {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'enter': 'enter 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        'blob-float': 'blob-float 20s infinite ease-in-out',
        'blob-sway': 'blob-sway 15s infinite ease-in-out reverse',
        'blob-pulse': 'blob-pulse 12s infinite ease-in-out',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'subtle-rotate': 'subtle-rotate 4s ease-in-out infinite',
        'music-bar': 'music-bar 1s ease-in-out infinite',
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
