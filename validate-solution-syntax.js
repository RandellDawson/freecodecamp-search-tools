const walkDir = require('./walk-dir');
const cheerio = require('cheerio');
const fs = require('fs');
const esprima = require('esprima');

const isValidJs = testString => {
  let isValid = true;
  try {
    esprima.parse(testString);
  }
  catch (e) {
    isValid = false;
  }
  return isValid;
};

//const languages = ['arabic', 'chinese', 'english', 'portuguese', 'spanish', 'russian'];
const languages = ['english'];
let numChallenges = 0;
let count = 0;

languages.forEach(function (language) {
  walkDir('D:/Coding/fcc/curriculum/challenges/english/', function (filePath) {
  //walkDir('./data/challenges/', function (filePath) {
    numChallenges++;
    const code = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(code);
    let solution;
    try {
      solution = $('#solution').html().trim();
    }
    catch (error) {
      console.log('problem with ' + filePath);
      return;
    }
    if (!/^```(js|html|css)\s*\/\/\s*solution required\s*```$/.test(solution) && !filePath.includes('-projects') && !filePath.includes('certificates')) {
      const testStringRegex = /testString:\s*(?<js>.*)/g;
      let testStrings;
      while ((testStrings = testStringRegex.exec(code)) !== null) {
        const { js } = testStrings.groups;
        const cleanJs = js
          .replace(/^('|")/, '')
          .replace(/('|")$/, '')
          .replace(/("")([^"]+?)("")/g, '"$2')
          .replace(/('')([^']+?)('')/g, "'$2'");
          
        if (!isValidJs(cleanJs)) {
          const file = filePath
            .replace('D:\\Coding\\fcc\\', '')
            .replace(/\\/g, '/') + '\n';
          console.log(file);
          console.log('js');
          console.log(js);
          console.log();
          count++;
        }
      }
    }
  });
});
//fs.writeFileSync('./data/challenges-with-solutions-and-invalid-teststrings.txt', results, 'utf8');
console.log('count = ' + count);
console.log('numChallenges = ' + numChallenges);