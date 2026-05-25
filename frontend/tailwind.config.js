/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: "#2D7A3A", light: "#4CAF50", dark: "#1B5E20" },
        secondary: { DEFAULT: "#F9A825", light: "#FDD835", dark: "#F57F17" },
        earth:     { DEFAULT: "#795548", light: "#A1887F", dark: "#4E342E" },
        sky:       { DEFAULT: "#0288D1", light: "#29B6F6", dark: "#01579B" },
        surface:   "#F1F8E9",
        card:      "#FFFFFF",
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Poppins'", "sans-serif"],
      },
      borderRadius: { xl: "1rem", "2xl": "1.5rem", "3xl": "2rem" },
      boxShadow: {
        card: "0 4px 24px rgba(45,122,58,0.10)",
        hover: "0 8px 32px rgba(45,122,58,0.18)",
      },
    },
  },
  plugins: [],
};
