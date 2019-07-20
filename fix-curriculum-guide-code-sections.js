const fs = require('fs');
const walkDir = require('./walk-dir');
const makePretty = require('./prettier-script');

let numChallenges = 0;
let count = 0;

const replacer = (match, p1, p2, p3, offset, string) => {
  return p1 + makePretty(p2) + p3;
};

// walkDir('D:/Coding/fcc/mock-guide/english/certifications/apis-and-microservices/', function (filePath) {
// walkDir('D:/Coding/fcc/guide/english/certifications/javascript-algorithms-and-data-structures/', function (filePath) {
walkDir('D:/Coding/fcc/guide/english/certifications/responsive-web-design/', function (filePath) {  

  numChallenges++;
  const content = fs.readFileSync(filePath, 'utf8');

  console.log(filePath);
  const newContent = content.replace(/(```(?:html|css)\n)([^`]+?)(```)/g, replacer);

  if (content !== newContent) {
    
    console.log(newContent);
    console.log();
    fs.writeFileSync(filePath, newContent, 'utf8');
    count++;
  }
});

console.log('count = ' + count);
console.log('numChallenges = ' + numChallenges);