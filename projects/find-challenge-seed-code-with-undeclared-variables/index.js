const fs = require('fs');
const walkDir = require('../../utils/walk-dir');

let numChallenges = 0;
let count = 0;
let results = '';

walkDir('D:/Coding/fcc/curriculum/challenges/english/', function (filePath) {
  numChallenges++;
  const code = fs.readFileSync(filePath, 'utf8');
  const challengeSeedMatch = code.match(/<div id='js-seed'>(?<challengeSeed>[\s\S]+?)<\/div>/);
  if (challengeSeedMatch) {

    let { challengeSeed } = challengeSeedMatch.groups;
    challengeSeed = challengeSeed.trim();
    challengeSeed = challengeSeed.match(/^```js(?<js>[^`]*?)```$/m);

    if (challengeSeed && !filePath.includes('-projects') && !filePath.includes('certificates')) {
      let { js } = challengeSeed.groups;
      js = '"use strict";\n' + js;
      const file = filePath
        .replace('D:\\Coding\\fcc\\', '')
        .replace(/\\/g, '/') + '\n';
      // console.log(file);
      // console.log(js);

      try {
        eval(js);
      }
      catch (error) {
        console.log('problem with ' + file);
        //console.log(error)
        //console.log(js);
        console.log();
        results += file + '\n';
        count++;
      }

    }
  }
});
fs.writeFileSync('./data/js-seed-code-which-fails-onload.txt', results, 'utf8');
console.log('count = ' + count);
console.log('numChallenges = ' + numChallenges);