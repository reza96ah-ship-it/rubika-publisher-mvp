import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "Tahoma", "Arial", "sans-serif"]
      },
      colors: {
        app: {
          background: "rgb(var(--n-color-canvas) / <alpha-value>)",
          canvas: "rgb(var(--n-color-canvas-soft) / <alpha-value>)",
          surface: "rgb(var(--n-color-surface) / <alpha-value>)",
          surfaceMuted: "rgb(var(--n-color-surface-muted) / <alpha-value>)",
          border: "rgb(var(--n-color-border) / <alpha-value>)",
          borderStrong: "rgb(var(--n-color-border-strong) / <alpha-value>)",
          focus: "rgb(var(--n-color-focus) / <alpha-value>)",
          primary: "rgb(var(--n-color-primary) / <alpha-value>)",
          primaryHover: "rgb(var(--n-color-primary-strong) / <alpha-value>)",
          graphite: "rgb(var(--n-color-graphite) / <alpha-value>)",
          secondary: "rgb(var(--n-color-secondary) / <alpha-value>)",
          secondarySoft: "rgb(var(--n-color-secondary-soft) / <alpha-value>)",
          text: "rgb(var(--n-color-ink) / <alpha-value>)",
          textStrong: "rgb(var(--n-color-ink-strong) / <alpha-value>)",
          muted: "rgb(var(--n-color-muted) / <alpha-value>)",
          soft: "rgb(var(--n-color-primary-soft) / <alpha-value>)",
          success: "rgb(var(--n-color-success) / <alpha-value>)",
          warning: "rgb(var(--n-color-warning) / <alpha-value>)",
          alert: "rgb(var(--n-color-alert) / <alpha-value>)",
          danger: "rgb(var(--n-color-danger) / <alpha-value>)",
          teal: "rgb(var(--n-color-primary) / <alpha-value>)",
          tealSoft: "rgb(var(--n-color-primary-soft) / <alpha-value>)",
          coral: "rgb(var(--n-color-coral) / <alpha-value>)",
          coralSoft: "rgb(var(--n-color-coral-soft) / <alpha-value>)",
          plum: "rgb(var(--n-color-plum) / <alpha-value>)",
          plumSoft: "rgb(var(--n-color-plum-soft) / <alpha-value>)",
          frost: "rgb(var(--n-color-frost) / <alpha-value>)",
          studio: "rgb(var(--n-color-studio-bg) / <alpha-value>)",
          studioSurface: "rgb(var(--n-color-studio-surface) / <alpha-value>)",
          studioRaised: "rgb(var(--n-color-studio-raised) / <alpha-value>)",
          studioText: "rgb(var(--n-color-studio-text) / <alpha-value>)",
          studioMuted: "rgb(var(--n-color-studio-muted) / <alpha-value>)",
          studioPrimary: "rgb(var(--n-color-studio-primary) / <alpha-value>)"
        }
      },
      boxShadow: {
        hairline: "var(--n-shadow-hairline)",
        soft: "var(--n-shadow-soft)",
        lift: "var(--n-shadow-lift)",
        accent: "0 10px 22px rgb(var(--n-color-primary) / 0.18)",
        overlay: "var(--n-shadow-lift)",
        studio: "var(--n-shadow-studio)"
      },
      borderRadius: {
        nxs: "var(--n-radius-xs)",
        nsm: "var(--n-radius-sm)",
        nmd: "var(--n-radius-md)",
        nlg: "var(--n-radius-lg)",
        nxl: "var(--n-radius-xl)",
        n2xl: "var(--n-radius-2xl)"
      },
      minHeight: {
        compact: "var(--n-density-compact)",
        standard: "var(--n-density-standard)",
        comfortable: "var(--n-density-comfortable)",
        rowCompact: "var(--n-row-compact)",
        rowStandard: "var(--n-row-standard)",
        rowComfortable: "var(--n-row-comfortable)"
      }
    }
  },
  plugins: []
};

export default config;

