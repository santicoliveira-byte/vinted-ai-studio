import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        vinted: {
          50: "#e6f8f9",
          100: "#ccf1f3",
          200: "#99e3e7",
          300: "#66d4dc",
          400: "#33c6d0",
          500: "#007782", // Signature Vinted Teal
          600: "#006872",
          700: "#00535b",
          800: "#003e44",
          900: "#002a2e",
          accent: "#00a8b5",
        },
        dark: {
          bg: "#090d0f",
          surface: "#101619",
          card: "#162024",
          cardHover: "#1d2b31",
          border: "#23343b",
          muted: "#869ea6",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      boxShadow: {
        "teal-glow": "0 0 20px -3px rgba(0, 119, 130, 0.45)",
        "card-glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
    },
  },
  plugins: [],
};

export default config;
