const walkDir = require('./walk-dir');
const escapeRegexString = require('escape-regex-string');
const fs = require('fs');

const getCodeReplacement = (masterFilename, guideText, masterCodeSection) => {

  const cleanCode = masterCodeSection
    .replace(/`/g, '')
    .replace(/[\t ]+$/gm, '')
    .replace(/^ (\S.*)/gm, '$1')

  console.log('cleanCode');
  console.log(cleanCode)
  console.log()
  const escapedRegex = escapeRegexString(cleanCode);
  const regex = new RegExp('```(\\w*?)(\\r?\\n?)*' + escapedRegex + '\\s*```');
  fs.writeFileSync('./regex.txt', regex.source.replace(/\n/g, 'chr(13)'));
  const guideWithoutEndingSpace = guideText.replace(/[\t ] +$/gm, '');
  fs.writeFileSync('./guide-without-ending-spaces.txt', guideWithoutEndingSpace);
  const match = guideWithoutEndingSpace.match(regex);
  if (match) {   
    console.log("match")
    const language = match[1] || '';
    const afterLanguage = cleanCode.match(/^\r?\n/) ? '' : '\n';
    const replaceWith = '```' + language + afterLanguage + cleanCode + '```';
    console.log('inside replaceWith');
    console.log('replaceWith');
    console.log()
    if (!/```\r?\n```/.test(replaceWith)) {
      tempCount++;
      console.log(masterFilename);
      console.log('match')
      console.log();
      console.log(replaceWith);
      console.log('\n**************************\n');
      replacements++;
      return replaceWith;
    }
  }
};

const lang = 'arabic'

// const directoriesToParse = [
//   'D:/Coding/fcc/guide/' + lang + '/'
// ];

// const directoriesToParse = [
//   'D:/Coding/fcc/guide/' + lang + '/algorithms/binary-search-trees/'
// ];

const directoriesToParse = [
  './guide/'
];

let guideArticleCount = 0;
let replacements = 0;
let tempCount = 0;
directoriesToParse.forEach(function(directory) {
  walkDir(directory, function (masterFilename) {
    const masterText = fs.readFileSync(masterFilename, 'utf8');
    const matches = masterText.match(/^ `[^`]+?\r?\n`/gm);
    if (matches) {
      tempCount = 0;
      const langRegex = new RegExp('fcc\\\\guide\\\\' + lang + '\\\\');
      const guideRepoFilename = masterFilename
        .replace(langRegex, 'guide\\src\\pages\\');
      //const guideRepoFilename = 'D:\\Coding\\guide\\src\\pages\\algorithms\\binary-search-trees\\index.md';
      console.log(guideRepoFilename)
      if (fs.existsSync(guideRepoFilename)) {
        let guideText = fs.readFileSync(guideRepoFilename, 'utf8');
        let tempMasterText = masterText.replace(/^ `/, '`');
        matches.forEach(masterCodeSection => {
          console.log('masterCodeSection')
          console.log(masterCodeSection);
          console.log()
          console.log(guideText)
          const replaceWith = getCodeReplacement(masterFilename, guideText, masterCodeSection);
          console.log('replaceWith');
          console.log(replaceWith);
          console.log()
          if (replaceWith) {
            tempMasterText = tempMasterText.replace(masterCodeSection, replaceWith);
          }
        });
        if (tempMasterText !== masterText) {
          console.log('replaced with new content');
          try {
            fs.writeFileSync(masterFilename, tempMasterText);
          } catch (err) {
            console.error(err);
            process.exit(0);
          }
        } else {
          console.log('no content replaced');
        }
        if (tempCount > 0) {
          guideArticleCount++;
        }
        if (guideArticleCount >= 75) {
          console.log('more than 75 articles fixed');
          process.exit(0);
        }
      } 
    }
  });
});
console.log('guideArticleCount = ' + guideArticleCount);
console.log('replacements = ' + replacements);