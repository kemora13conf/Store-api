/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'dark': {
          primary: {
          100: "#d4d4d9",
          200: "#a9a8b4",
          300: "#7d7d8e",
          400: "#525169",
          500: "#272643",
          600: "#1f1e36",
          700: "#171728",
          800: "#100f1b",
          900: "#08080d"
          },
          secondary: {
          100: "#d5e1e8",
          200: "#abc3d1",
          300: "#80a5bb",
          400: "#5687a4",
          500: "#2c698d",
          600: "#235471",
          700: "#1a3f55",
          800: "#122a38",
          900: "#09151c"
          },
          tertiary: {
          100: "#f1fafa",
          200: "#e3f6f6",
          300: "#d6f1f1",
          400: "#c8eded",
          500: "#bae8e8",
          600: "#95baba",
          700: "#708b8b",
          800: "#4a5d5d",
          900: "#252e2e"
          },
          quarternary: {
          100: "#ffffff",
          200: "#ffffff",
          300: "#ffffff",
          400: "#ffffff",
          500: "#ffffff",
          600: "#cccccc",
          700: "#999999",
          800: "#666666",
          900: "#333333"
          },
        },
        'light': {
          primary: {
            100: "#ffffff",
            200: "#ffffff",
            300: "#ffffff",
            400: "#ffffff",
            500: "#ffffff",
            600: "#cccccc",
            700: "#999999",
            800: "#666666",
            900: "#333333"
          },
          secondary: {
            100: "#f1fafa",
            200: "#e3f6f6",
            300: "#d6f1f1",
            400: "#c8eded",
            500: "#bae8e8",
            600: "#95baba",
            700: "#708b8b",
            800: "#4a5d5d",
            900: "#252e2e"
          },
          tertiary: {
            100: "#d5e1e8",
            200: "#abc3d1",
            300: "#80a5bb",
            400: "#5687a4",
            500: "#2c698d",
            600: "#235471",
            700: "#1a3f55",
            800: "#122a38",
            900: "#09151c"
          },
          quarternary: {
            100: "#d4d4d9",
            200: "#a9a8b4",
            300: "#7d7d8e",
            400: "#525169",
            500: "#272643",
            600: "#1f1e36",
            700: "#171728",
            800: "#100f1b",
            900: "#08080d"
          },
        },
        error: '#FF5252',
        success: '#4CAF50',
        warning: '#FFC107',
        info: '#2196F3',

      },
      fontFamily: {
        'main': 'main'
      },
      boxShadow: {
        'border': '0px 0px 0px 3px #ffffff, 0px 0px 0px 5px #2c1b06',
      },
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

