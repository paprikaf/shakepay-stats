module.exports = {
  mode: 'jit',
  purge: ["./pages/**/*.tsx"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"]
    },
  },
  plugins: [],
};
