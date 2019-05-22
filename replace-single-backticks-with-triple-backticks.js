const walkDir = require('./walk-dir');
const escapeRegexString = require('escape-regex-string');
const fs = require('fs');

const replaceWithCodeFence = (text, code) => {
  const codeWithBackticksRemoved = code.replace(/`/g, '');
  const codeWithExtraSpaceRemoved = codeWithBackticksRemoved.replace(/^ | $/gm, '');
  const middleRegex = escapeRegexString(codeWithExtraSpaceRemoved)

//   ```\w+?[^`]*?
  const regex = new RegExp(middleRegex);
  console.log('\nregex');
  console.log(regex);
  const match =  text.match(regex);
  if (match) {
    console.log('is match')
    //console.log(match);
  }
};

const directoriesToParse = [
  //'D:/Coding/fcc/guide/arabic/css/properties/background-position-property/'
   './master/'
];

directoriesToParse.forEach(function(directory) {
  walkDir(directory, function (filePath) {
    const fileStr = fs.readFileSync(filePath, 'utf8');
    const matches = fileStr.match(/`[\s\S]+?`/g);
    if (matches) {
      //const guideRepoFilename = filePath.replace('fcc\\guide\\arabic\\', 'src\\pages\\');     
      const guideRepoFilename = filePath.replace('master\\', 'original\\');
      if (fs.existsSync(guideRepoFilename)) {
        console.log('\n**************************\n');
        console.log(filePath);
        let text = fs.readFileSync(guideRepoFilename, 'utf8');
        matches.forEach(code => {
          replaceWithCodeFence(text, code);
        });
        console.log('\n**************************\n');
      }
    }
  });
});