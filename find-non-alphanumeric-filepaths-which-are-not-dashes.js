const walkDir = require('./walk-dir');
const fs = require('fs');

let numChallenges = 0;
let count = 0;
let results = '';

walkDir('D:/Coding/fcc/curriculum/challenges/english/', function (filePath) {
  numChallenges++;
  filePath = filePath.replace('D:\\Coding\\fcc\\', '');
  const tempFilePath = filePath
    .replace(/\\|-/g, '')
    .replace(/\.english\.md$/, '');
  if (/[^a-z0-9]/i.test(tempFilePath) && !tempFilePath.includes('-projects')) {
    const url = filePath
      .replace(/D\\Coding\\fcc\\/, '')
      .replace(/\.english\.md$/, '')
      .replace(/\\/g, '/')
      .split('/');
    results += url[url.length - 1].replace(/\.english\.md$/, '') + '\n';
    count++;
  }
});
fs.writeFileSync('./data/non-alphanumeric-filepaths-which-are-not-dashes.txt', results, 'utf8');
console.log('count = ' + count);
console.log('numChallenges = ' + numChallenges);