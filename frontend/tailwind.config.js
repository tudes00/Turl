/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        red: {
          501: "#ef4435",
        },
        gray: {
          950: "#171717",
          951: "#212121",
          952: "#202020",
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
