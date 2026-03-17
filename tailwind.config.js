/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        secondary: "#FFFFFF",
        background: "#FFFFFF",
        foreground: "#000000",
        accent: "#000000",
        gray: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#E5E5E5",
          300: "#D4D4D4",
          400: "#A3A3A3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
        }
      },
      fontFamily: {
        header: ["Montserrat", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"]
      },
      borderRadius: {
        '2xl': '1rem'
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0,0,0,0.1)",
        medium: "0 4px 12px rgba(0,0,0,0.15)"
      }
    },
  },
  plugins: [],
}
