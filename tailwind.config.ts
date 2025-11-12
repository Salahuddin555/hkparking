import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f7ff",
          100: "#dfe8ff",
          200: "#bcd1ff",
          300: "#8aaeff",
          400: "#5a85ff",
          500: "#3c63f1",
          600: "#274bd4",
          700: "#1d39ab",
          800: "#112274",
          900: "#0b173f"
        }
      },
      boxShadow: {
        card: "0 20px 45px -20px rgba(32, 64, 128, 0.3)"
      }
    }
  },
  plugins: []
};

export default config;
