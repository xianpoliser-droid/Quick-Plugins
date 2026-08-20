import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0f",
        surface: "#121218",
        surface2: "#181820",
        border: "#232330",
        cyan: {
          DEFAULT: "#22d3ee",
          glow: "#67e8f9",
        },
        purple: {
          DEFAULT: "#a855f7",
          glow: "#c084fc",
        },
      },
      boxShadow: {
        neon: "0 0 20px rgba(34,211,238,0.25), 0 0 40px rgba(168,85,247,0.15)",
      },
      backgroundImage: {
        "grid-glow":
          "radial-gradient(circle at 20% 20%, rgba(34,211,238,0.08), transparent 40%), radial-gradient(circle at 80% 60%, rgba(168,85,247,0.08), transparent 40%)",
      },
    },
  },
  plugins: [],
};
export default config;
