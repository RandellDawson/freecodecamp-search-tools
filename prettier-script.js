const prettier = require("prettier");

const options = {
  "endOfLine": "lf",
  "semi": true,
  "singleQuote": true,
  "jsxSingleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none"
};

module.exports = code => prettier.format(code, options); 
