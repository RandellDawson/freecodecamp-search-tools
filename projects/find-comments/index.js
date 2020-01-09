const walkDir = require('../../utils/walk-dir');
const cheerio = require('cheerio');
const fs = require('fs');


let numChallenges = 0;
let count = 0;
let results = [];

const directories = [
  // '01-responsive-web-design',
  '02-javascript-algorithms-and-data-structures',
  '03-front-end-libraries',
  '04-data-visualization',
  '05-apis-and-microservices',
  '06-information-security-and-quality-assurance',
  '08-coding-interview-prep'
];

const commentsFound = {};

directories.forEach(dir => {
  walkDir('D:/Coding/fcc/curriculum/challenges/english/' + dir + '/', function (filePath) {
    numChallenges++;
    const code = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(code);
    let challengeSeedCode;
    try {
      challengeSeedCode = $('#challengeSeed').html().trim();
    }
    catch (error) {
      console.log('can not find challenge seed code for ' + filePath);
      return;
    }
    // const commentsMatch = challengeSeedCode.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm);
    // const commentsMatch = challengeSeedCode.match(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm);
    
    const commentsMatch = challengeSeedCode.match(/\/\/.*|\/\*[^]*\*\//gm);
    if (commentsMatch) {
      for (comment of commentsMatch) {
        if (!commentsFound[comment]) {
          commentsFound[comment] = [ filePath ];
          count++;
        } else {
          commentsFound[comment].push(filePath);
        }
      }
    }
  });
});
results = Object
  .keys(commentsFound)
  .reduce((str, comment) => str += `${comment}
   Files:
   ${commentsFound[comment]
    .reduce((files, file) => files += `  ${file + '\n'}`)}

  `, '');
// console.log(results);
fs.writeFileSync('./data/js-comments.txt', results, 'utf8');
console.log('unique comment count = ' + count);
console.log('numChallenges = ' + numChallenges);