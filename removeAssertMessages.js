const walkDir = require('./walk-dir');
const yaml = require('yaml');
const escapeRegexString = require('escape-regex-string');
const fs = require('fs');

let numFilesChanged = 0;
walkDir('D:/Coding/fcc/curriculum/challenges/english/08-coding-interview-prep/project-euler/', function (filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const yml = code.match(/```yml\r?\n([\s\S]+?)```/);
  if (yml) {
    let newCode = code;
    const { tests } = yaml.parse(yml[1]);
    let changes = 0;
    for (let { text, testString } of tests) {
      const assertMsgArg = testString.match(/,\s*'([^,]+?)'\);$/);
      if (assertMsgArg) {
        if (assertMsgArg[1] === text) {
          changes++;
          const escapedRegex = new RegExp("(testString:.+?)(,\\s*'" + escapeRegexString(text) + "')(\\);)");
          newCode = newCode.replace(escapedRegex, '$1$3');
          console.log(filePath);
          console.log('removed assert message');
          console.log();
        }
      }
    }
    if (changes > 0) {
      numFilesChanged++;
    };
    fs.writeFileSync(filePath, newCode, 'utf8');
  }
  if (numFilesChanged >= 75) {
    console.log('Changed ' + numFilesChanged + ' files.');
    process.exit();
  }
});
