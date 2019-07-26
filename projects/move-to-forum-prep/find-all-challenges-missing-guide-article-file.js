const walkDir = require('../walk-dir');
const fs = require('fs');

let numChallenges = 0;
let count = 0;

walkDir('D:/Coding/fcc/curriculum/challenges/english/', function (filePath) {
  
  if (!filePath.includes('09-certificates')) {
    numChallenges++;
    const guideFilePath = filePath.replace(/curriculum\\challenges\\english\\/, 'guide\\english\\certifications\\')
      .replace(/\.english\.md$/, '\\index.md')
      .replace(/(certifications\\)\d{2}-/, '$1')
      .replace(/\\/g, '/');
    try {
      if (fs.existsSync(guideFilePath)) {
        //file exists
      } else {
        count++;
        console.log(guideFilePath)
      }
    } catch (err) {
      console.log(err)
    }
  }

});
console.log('count = ' + count);
console.log('numChallenges = ' + numChallenges);