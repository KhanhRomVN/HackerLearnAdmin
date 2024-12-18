/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        /* color */
        color: {
          primary: "var(--primary)",
        },
        /* background */
        background: {
          primary: "var(--background-primary)",
          secondary: "var(--background-secondary)",
        },
        /* text */
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
        },  
        /* sidebar */
        sidebar: {
          hover: "var(--sidebar-hover)",
          select: "var(--sidebar-select)",
        },
        /* card */
        card: {
          background: "var(--card-background)",
          header: "var(--card-header)",
          body: "var(--card-body)",
          footer: "var(--card-footer)",
        },
        /* button */
        button: {
          background: "var(--button-primary)",
          hover: "var(--button-primary-hover)",
          active: "var(--button-primary-active)",
        },
        /* input */
        input: {
          background: "var(--input-background)",
          border: "var(--input-border)",
          text: "var(--input-text)",
          placeholder: "var(--input-placeholder)",
        },
        /* flashcard */
        flashcard: {
          background: "var(--flashcard-background)",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
