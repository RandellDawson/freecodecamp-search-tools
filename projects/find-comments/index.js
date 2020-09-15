const walkDir = require('../../utils/walk-dir');
const fs = require('fs');
const {
  COMMENTS_NEEDING_TRANSLATION,
  COMMENTS_TO_NOT_TRANSLATE
} = require('./../../data/comment-dictionary');

const COMMENT_TRANSLATIONS = [ ...COMMENTS_NEEDING_TRANSLATION, ...COMMENTS_TO_NOT_TRANSLATE ]
  .reduce((obj, comment) => ({ ...obj, [comment.text]: { chinese: true } }), {});

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
  js: /(?<!https?:)\/\/(?<slComment>.+)|\/\*(?<comment>[\s\S]*?)\*\//g,
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
    // const movingForward = 'moving-forward-from-here';

    const challengeSeedCodeMatch = code.match(challengeSeedCodeRegex);

    let challengeSeedCode;
    if (challengeSeedCodeMatch) {
      challengeSeedCode = challengeSeedCodeMatch.groups.challengeSeedCode;
    }
    const shortFilePath = filePath.replace(/^.*\/(curriculum\/challenges.+)/, '$1');

    if (challengeSeedCode && !filePath.includes('-projects')) {
      while (commentsMatch = commentTypeRegex[commentType].exec(challengeSeedCode)) {
        
        if (commentsMatch) {
          // if (filePath.includes(movingForward)) {
          //   console.log('moving-forward-from-here challenge');
          //   // console.log(challengeSeedCodeRegex.source);
          //   // console.log(commentsMatch);
          // }
          const theComment = (commentsMatch.groups.slComment || commentsMatch.groups.comment).trim();

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

fs.writeFileSync(`./data/${commentType}-comments.txt`, results, 'utf8');
console.log('unique comment count = ' + count);
console.log('numChallenges = ' + numChallenges);