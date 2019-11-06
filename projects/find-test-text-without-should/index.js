const fs = require('fs');
const walkDir = require('../../utils/walk-dir');

let numChallenges = 0;
let count = 0;
let results = '';

walkDir('D:/Coding/fcc/curriculum/challenges/english/', function (filePath) {
  numChallenges++;
  const code = fs.readFileSync(filePath, 'utf8');
  const testsMatch = code.match(/<section id='tests'>(?<tests>[\s\S]+?)<\/section>/);
  if (testsMatch) {
    let { tests } = testsMatch.groups;
    tests = tests.match(/^  - text: ((?!should).)*$/gm);

    if (tests && !filePath.includes('-projects') && !filePath.includes('certificates')) {
        results += filePath + '\n';
        console.log(filePath);
        count++;
    }
  }
});
fs.writeFileSync('./data/js-seed-code-which-fails-onload.txt', results, 'utf8');
console.log('count = ' + count);
console.log('numChallenges = ' + numChallenges);