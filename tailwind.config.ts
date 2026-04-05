import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        /* V8 Typography — 3 fonts, 3 roles */
        display: ["Bungee", "sans-serif"],           /* HERO: scores, titles, popups, buttons */
        "game-title": ["Rajdhani", "sans-serif"],    /* UI: nav, stats, cards, sub-headings */
        "game-body": ["Outfit", "sans-serif"],       /* BODY: descriptions, chat, tooltips */
        /* V8 aliases */
        "v8-display": ["Bungee", "sans-serif"],
        "v8-ui": ["Rajdhani", "sans-serif"],
        "v8-body": ["Outfit", "sans-serif"],
        /* Legacy compat */
        "v7-ui": ["Rajdhani", "sans-serif"],
        "v7-body": ["Outfit", "sans-serif"],
        body: ["Outfit", "sans-serif"],
        heading: ["Bungee", "sans-serif"],
        score: ["Bungee", "monospace"],
        "game-display": ["Bungee", "sans-serif"],
        "game-display-3d": ["Bungee", "sans-serif"],
        "game-card": ["Rajdhani", "sans-serif"],
        "game-mono": ["Rajdhani", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        /* V8 Neon Colors */
        "neon-green": "hsl(var(--neon-green))",
        "neon-cyan": "hsl(var(--neon-cyan))",
        "neon-pink": "hsl(var(--neon-pink))",
        "neon-gold": "hsl(var(--neon-gold))",
        "neon-orange": "hsl(var(--neon-orange))",
        "neon-purple": "hsl(var(--neon-purple))",
        /* V8 Cricket */
        "cricket-red": "hsl(var(--cricket-red))",
        "cricket-willow": "hsl(var(--cricket-willow))",
        "cricket-grass": "hsl(var(--cricket-grass))",
        /* Game Colors */
        "green-play": "hsl(var(--green-play))",
        "green-play-light": "hsl(var(--green-play-light))",
        "green-play-dark": "hsl(var(--green-play-dark))",
        "blue-info": "hsl(var(--blue-info))",
        "blue-info-light": "hsl(var(--blue-info-light))",
        "red-hot": "hsl(var(--red-hot))",
        "red-hot-light": "hsl(var(--red-hot-light))",
        "gold-accent": "hsl(var(--gold-accent))",
        "gold-light": "hsl(var(--gold-light))",
        /* Team dynamic */
        "team-primary": "hsl(var(--team-primary))",
        "team-secondary": "hsl(var(--team-secondary))",
        "team-accent": "hsl(var(--team-accent))",
        "team-dark": "hsl(var(--team-dark))",
        "team-light": "hsl(var(--team-light))",
        /* Legacy */
        glass: "hsl(var(--glass-border))",
        "score-gold": "hsl(var(--score-gold))",
        "out-red": "hsl(var(--out-red))",
        floodlight: "hsl(var(--floodlight))",
        "game-green": "hsl(var(--game-green))",
        "game-gold": "hsl(var(--game-gold))",
        "game-blue": "hsl(var(--game-blue))",
        "game-red": "hsl(var(--game-red))",
        "game-orange": "hsl(var(--game-orange))",
        "game-purple": "hsl(var(--game-purple))",
        "game-dark": "hsl(var(--game-dark))",
        "game-medium": "hsl(var(--game-medium))",
        "game-teal": "hsl(var(--game-teal))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "game-card": "0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
        "game-button": "0 7px 0 rgba(0,0,0,0.15), 0 10px 20px rgba(0,0,0,0.35)",
        "game-button-pressed": "0 3px 0 rgba(0,0,0,0.15), 0 5px 10px rgba(0,0,0,0.25)",
        "game-glow-green": "0 0 20px rgba(0,255,136,0.4), 0 0 60px rgba(0,255,136,0.2)",
        "game-glow-gold": "0 0 20px rgba(255,215,0,0.4), 0 0 60px rgba(255,215,0,0.2)",
        "stadium-glass": "0 8px 28px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.07)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.4s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "bounce-in": "bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "float": "float 4.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
