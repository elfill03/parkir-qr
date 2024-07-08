/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "red-maron": "#9F1521",
        "grey-maron": "#AEAEAE",
        "grey-light": "#DDDDDD",
        "white-light": "#FFFFFF",
        "white-maron": "#F9F9FF",
        "green-light": "#22c55e",
      },
    },
  },
  plugins: [],
};
