/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#006400",
        secondary: "#E1B80D",
        background: "#F5F5F5",
        foreground: "#1A1A1A",
        accent: "#007BFF"
      },
      fontFamily: {
        header: ["Montserrat", "ui-sans-serif", "system-ui"],
        body: ["Inter", "ui-sans-serif", "system-ui"]
      },
      borderRadius: {
        '2xl': '1rem'
      },
      boxShadow: {
        soft: "0 10px 25px rgba(0,0,0,0.05)"
      }
    },
  },
  plugins: [],
}
