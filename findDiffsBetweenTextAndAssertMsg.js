const walkDir = require('./walk-dir');
const yaml = require('yaml');
const fs = require('fs');

let count = 0;

walkDir('D:/Coding/fcc/curriculum/challenges/english/02-javascript-algorithms-and-data-structures/regular-expressions/', function (filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const yml = code.match(/```yml\r?\n([\s\S]+?)```/);
  if (yml) {
    const { tests } = yaml.parse(yml[1]);
    for (let { text, testString } of tests) {
      const assertMsgArg = testString.match(/,\s*'([^,]+?)'\);$/);
      if (assertMsgArg) {
        if (assertMsgArg[1] !== text) {
          console.log(filePath);
          console.log('text'); 
          console.log(text);
          console.log();
          console.log('assertMsg');
          console.log(assertMsgArg[1]);
          console.log();
          // console.log(testString);
          // console.log();
          count++;
        }
      }
    }
  }
});

console.log('count = ' + count);