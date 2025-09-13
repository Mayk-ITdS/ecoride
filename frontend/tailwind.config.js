/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ecoGreen: "#34d399",
        ecoPurple: "#7c3aed",
        ecoYellow: "#facc15",
        ecoGray: "#111827",
        ecoWhite: "#f9fafb",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },

    screens: {
      xss: { max: "398px" },
      xs: { max: "443px" },
      sm: "640px",
      md: "768px",
      custom: "846",
      lg: "1024px",
      xl: "1280px",
    },
  },
  plugins: [],
};
