/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,css,md,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,css,md,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "dashed-outline-enter": {
          "0%": {
            opacity: "0",
            transform: "scale(0.98)",
            borderColor: "transparent"
          },
          "50%": {
            opacity: "0.7",
            transform: "scale(1.01)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        "theme-link-enter": {
          from: {
            opacity: "0",
            transform: "translateY(10px)"
          },
          to: {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "underline-grow": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" }
        },
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" }
        }
      },
      animation: {
        fadeInUp: "fadeInUp 0.6s ease-out forwards",
        "dashed-outline-enter": "dashed-outline-enter 0.8s ease-out 0.3s forwards",
        "theme-link-enter": "theme-link-enter 0.6s ease-out forwards",
        "underline-grow": "underline-grow 150ms ease forwards",
        gradient: "gradient 3s ease infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      }
    }
  },
  plugins: []
}
