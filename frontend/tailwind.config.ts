import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#12151A",
        surface: "#1B1F27",
        surface2: "#232833",
        border: "#2E3440",
        ink: "#E8EAED",
        muted: "#9AA3B2",
        accent: "#E8A33D",
        accent2: "#4FB0A5",
        danger: "#E2666B",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        card: "10px",
      },
      keyframes: {
        pulseDot: {
          "0%, 80%, 100%": { opacity: "0.25" },
          "40%": { opacity: "1" },
        },
        fadeSlideUp: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        pulseDot: "pulseDot 1.2s infinite ease-in-out",
        fadeSlideUp: "fadeSlideUp 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
