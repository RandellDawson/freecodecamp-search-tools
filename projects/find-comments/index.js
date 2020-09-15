const walkDir = require('../../utils/walk-dir');
const fs = require('fs');
const { COMMENT_TRANSLATIONS } = require('./comment-dictionary');

let numChallenges = 0;
let count = 0;
let results = [];

require('dotenv').config();
const language = process.env.LANGUAGE_TO_CHECK;
const challengeSeedType = process.env.CHALLENGE_SEED_TYPE;
const commentType = process.env.COMMENT_TYPE_TO_FIND;
// const jsCommentsMatch = challengeSeedCode.match(/\/\*[\s\S]*?\*\/|\/\/.*$/gm);
// const jsCommentsMatch = challengeSeedCode.match(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm);
const commentTypeRegex = {
  js: /\/\/(?<slComment>.+)|\/\*(?<comment>[^])*\*\//g,
  jsx: /\{\s*\/\*(?<comment>[\s\S]+?)\*\/\s*\}/g,
  html: /<!--(?<comment>[\s\S]*?)-->/g,
  css: /\/\*(?<comment>[\s\S]+?)\*\//g
};

const directories = [process.env.CURRICULUM_DIR_TO_FIND_COMMENTS];
const commentsFound = {};

directories.forEach(dir => {
  walkDir(process.env.FCC_ENGLISH_CHALLENGES_FILE_PATH + dir + '/', function (filePath) {
    numChallenges++;
    const code = fs.readFileSync(filePath, 'utf8');
    const challengeSeedCodeRegex = new RegExp(
      `<div id='${challengeSeedType}-seed'>\\s*\`\`\`${challengeSeedType}\\s*(?<challengeSeedCode>[\\s\\S]*?)\`\`\`\\s*<\\/div>`,
      'm'
    );
    const challengeSeedCodeMatch = code.match(challengeSeedCodeRegex);
    let challengeSeedCode;
    if (challengeSeedCodeMatch) {
      challengeSeedCode = challengeSeedCodeMatch.groups.challengeSeedCode;
    }
    const shortFilePath = filePath.replace(/^.*\/(curriculum\/challenges.+)/, '$1');

    if (challengeSeedCode && !filePath.includes('-projects')) {
      while (commentsMatch = commentTypeRegex[commentType].exec(challengeSeedCode)) {
        if (commentsMatch) {
          const theComment = (commentsMatch.groups.comment || commentsMatch.groups.slComment).trim();
          if (!COMMENT_TRANSLATIONS[theComment] || !COMMENT_TRANSLATIONS[theComment][language]) {
            if (!commentsFound[theComment]) {
              commentsFound[theComment] = [shortFilePath];
              count++;
            } else {
              commentsFound[theComment].push(shortFilePath);
            }
            console.log(theComment);
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
// console.log('results');
// console.log(results);
fs.writeFileSync(`./data/${commentType}-comments.txt`, results, 'utf8');
console.log('unique comment count = ' + count);
console.log('numChallenges = ' + numChallenges);