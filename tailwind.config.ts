import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          600: "#008000",
          700: "#006400",
        },
        blue: {
          500: "#0000FF",
          600: "#293F8C",
          700: "#293F8C",
        },
        purple: {
          500: "#A020F0",
          600: "#800080",
          700: "#660066",
        },
      },
    },
  },
  plugins: [],
};
export default config;
