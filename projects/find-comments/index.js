const walkDir = require('../../utils/walk-dir');
const fs = require('fs');
const { COMMENT_TRANSLATIONS } = require('./comment-dictionary');

let numChallenges = 0;
let count = 0;
let results = [];

const language = 'chinese';
const commentType = 'js';
// const jsCommentsMatch = challengeSeedCode.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm);
// const jsCommentsMatch = challengeSeedCode.match(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm);
const commentTypeRegex = {
  js: /\/\/ .+|\/\*[^]*\*\//g,
  html: /<!--([\s\S]*?)-->/g,
  css: /\/\*[\s\S]+?\*\//g
};

const directories = [
  //'01-responsive-web-design',
  '02-javascript-algorithms-and-data-structures'
  //'03-front-end-libraries',
  //'04-data-visualization',
  //'08-coding-interview-prep'
];

const commentsFound = {};

directories.forEach(dir => {
  walkDir('D:/Coding/fcc/curriculum/challenges/english/' + dir + '/', function (filePath) {
    numChallenges++;
    const code = fs.readFileSync(filePath, 'utf8');
    const challengeSeedDivMatch = code.match(/<div id='js-seed'>(?<challengeSeedDiv>[\s\S]+?)<\/div>/);
    if (challengeSeedDivMatch) {

      let { challengeSeedDiv } = challengeSeedDivMatch.groups;
      challengeSeedDiv = challengeSeedDiv.trim();
      const challengeSeedCodeMatch = challengeSeedDiv.match(/^```js(?<challengeSeedCode>[\s\S]*?)```$/m);
      const { challengeSeedCode } = challengeSeedCodeMatch.groups;
      const shortFilePath = filePath
        .replace(/D:\\Coding\\fcc\\/, '')
        .split('\\')
        .join('/');

      if (challengeSeedCode && !filePath.includes('-projects')) {
        const commentsMatch = challengeSeedCode.match(commentTypeRegex[commentType]);

        if (commentsMatch) {
          for (comment of commentsMatch) {
            if (!COMMENT_TRANSLATIONS[comment] || !COMMENT_TRANSLATIONS[comment][language]) {
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
    }
  });
});

const comments = Object
  .keys(commentsFound)
  .reduce((arr, comment) => {
    arr.push({ comment, files: commentsFound[comment] });
    return arr;
  }, []);
comments.sort((a, b) => a.comment < b.comment ? -1 : a.comment > b.comment ? 1 : 0);

results = comments.reduce((str, { comment, files }) => str += `\`\`\`
${comment}
\`\`\`
${files.reduce((files, file) => {
  const fileName = file.split('/').slice(-1)[0];
  files += `- [${fileName}](https://github.com/freeCodeCamp/freeCodeCamp/tree/master/${file})\n`;
  return files;
}, '\n')}

`, '');
fs.writeFileSync(`./data/${commentType}-comments.txt`, results, 'utf8');
console.log('unique comment count = ' + count);
console.log('numChallenges = ' + numChallenges);