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
          primary: "var(--sidebar-primary)",
          secondary: "var(--sidebar-secondary)",
          selected: "var(--sidebar-item-selected)",
        },
        /* sidebar item */
        "sidebar-item": {
          hover: "var(--sidebar-item-hover)",
          active: "var(--sidebar-item-active)",
        },
        /* sidebar text */
        "sidebar-text": {
          hover: "var(--sidebar-text-hover)", 
          active: "var(--sidebar-text-active)",
        },
        /* dialog */
        dialog: {
          background: "var(--dialog-background)",
          header: "var(--dialog-header)",
        },
        /* card */
        card: {
          background: "var(--card-background)",
          header: "var(--card-header)",
        },
        /* button */
        button: {
          primary: "var(--button-primary)",
          primaryHover: "var(--button-primary-hover)",
          primaryActive: "var(--button-primary-active)",
        },
        /* input */
        input: {
          background: "var(--input-background)",
        },
        /* search */
        search: {
          background: "var(--search-background)",
          hover: "var(--search-hover)",
          active: "var(--search-active)",
          placeholder: "var(--search-placeholder)",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
