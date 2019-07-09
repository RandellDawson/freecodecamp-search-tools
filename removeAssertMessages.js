const walkDir = require('./walk-dir');
const yaml = require('yaml');
const escapeRegexString = require('escape-regex-string');
const fs = require('fs');

let challengeCount = 0;
let removedCount = 0;
let testCount = 0;
walkDir('D:/Coding/fcc/curriculum/challenges/english/02-javascript-algorithms-and-data-structures/regular-expressions/', function (filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const yml = code.match(/```yml\r?\n([\s\S]+?)```/);
  if (yml) {
    let newCode = code;
    const { tests } = yaml.parse(yml[1]);
    for (let { text, testString } of tests) {
      testCount++;
      const assertMsgArg = testString.match(/,\s*'([\s\S]+?)'\);$/);
      if (assertMsgArg) {
        if (assertMsgArg[1] === text) {
          removedCount++;
          const escapedRegex = new RegExp("(testString:.+?)(,\\s*'" + escapeRegexString(text) + "')(\\);)");
          newCode = newCode.replace(escapedRegex, '$1$3');
          console.log(filePath);
          console.log('removed assert message');
          console.log();
        }
      }
    }
    fs.writeFileSync(filePath, newCode, 'utf8');
  }
  challengeCount++;
});

console.log('Removed = ' + removedCount + ' assert msgs from ' + testCount + ' tests out of ' + challengeCount + ' challenges.');