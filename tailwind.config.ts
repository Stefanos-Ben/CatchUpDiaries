import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        cloud: "var(--cloud)",
        blush: "var(--blush)",
        rose: "var(--rose)",
        gold: "var(--gold)",
        lagoon: "var(--lagoon)",
        plum: "var(--plum)",
        mist: "var(--mist)",
        panel: "var(--panel)",
        line: "var(--line)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        floaty: "0 24px 80px rgba(63, 39, 70, 0.16)",
        card: "0 18px 48px rgba(25, 32, 50, 0.12)",
      },
      backgroundImage: {
        paper: "radial-gradient(circle at top, rgba(255,255,255,0.5), transparent 48%)",
      },
      borderRadius: {
        xl2: "1.75rem",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drift: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out",
        drift: "drift 7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
