const fs = require('fs');
const walkDir = require('../../utils/walk-dir');

let numChallenges = 0;
let count = 0;

const replacer = (match, p1, p2, p3, p4, p5, offset, string) => {
  return p1 + p2 + p3 + '#' + p5;
};

walkDir('D:/Coding/fcc/guide/english/certifications/', function (filePath) {  

  numChallenges++;
  const content = fs.readFileSync(filePath, 'utf8');

  //const newContent = content.replace(/(---\r?\ntitle: )([^\n]+)(\n---\s+)(##)( \2)/, replacer);
  const match = content.match(/^##\s+Problem(?<expl>\s+[a-z]+)/im);
  if (match) {
    if (match.groups.expl !== ' Explanation') {
    console.log(filePath);
    console.log(match.groups.expl)
    // console.log(content);
    console.log();
    //fs.writeFileSync(filePath, newContent, 'utf8');
    count++;
    }
  }
});

console.log('count = ' + count);
console.log('numChallenges = ' + numChallenges);