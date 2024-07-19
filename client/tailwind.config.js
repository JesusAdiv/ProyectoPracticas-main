/** @type {import('tailwindcss').Config} */
const {nextui} = require("@nextui-org/react");

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors:{
        primary:{
          100:"#003b5c",
          200:"#00b5e2"},
        secondary:{
          100:"#1E1F25",
          900:"#131517"
        },
        comp:{
          100:"#003b5c",
          200:"#00b5e2",
        }

      }
    },
  },
  darkMode: "class",
  plugins: [nextui({
    addCommonColors: true
  })],
}

