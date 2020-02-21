const walkDir = require('../../utils/walk-dir');
const cheerio = require('cheerio');
const fs = require('fs');
const commentsLookup = require('./comments-lookup');


let numChallenges = 0;
let count = 0;
let results = [];

const directories = [
  // '01-responsive-web-design',
  '02-javascript-algorithms-and-data-structures',
 // '03-front-end-libraries',
  '04-data-visualization',
  '08-coding-interview-prep'
];

const commentsFound = {};

directories.forEach(dir => {
  walkDir('D:/Coding/fcc/curriculum/challenges/english/' + dir + '/', function (filePath) {
    numChallenges++;
    const code = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(code);
    let challengeSeedCode;
    const shortFilePath = filePath.split('\\').slice(-1);
    if (!filePath.includes('-projects')) {
      try {
        challengeSeedCode = $('#js-seed, #jsx-seed, #html-seed').html().trim();
      }
      catch (error) {
        console.log('can not find challenge seed code for ' + shortFilePath);
        return;
      }

    // const commentsMatch = challengeSeedCode.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm);
    // const commentsMatch = challengeSeedCode.match(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm);
    const commentsMatch = challengeSeedCode.match(/\/\/.*|\/\*[^]*\*\//gm);
    if (commentsMatch) {
      for (comment of commentsMatch) {
        if (!commentsLookup[comment]) {
          if (!commentsFound[comment]) {
            commentsFound[comment] = [shortFilePath];
            count++;
          } else {
            commentsFound[comment].push(shortFilePath);
          }
        }
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