const prettier = require("prettier");

const options = {
  "endOfLine": "lf",
  "semi": true,
  "jsxSingleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "singleQuote": true
};

module.exports = code => prettier.format(code, options); 
