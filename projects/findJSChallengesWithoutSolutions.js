const walkDir = require('./walk-dir');
const cheerio = require('cheerio');
const fs = require('fs');

//const languages = ['arabic', 'chinese', 'english', 'portuguese', 'spanish', 'russian'];
const languages = ['english'];
let numChallenges = 0;
let count = 0;
let results = '';

languages.forEach(function(language) {
    walkDir('D:/Coding/fcc/curriculum/challenges/english/', function (filePath) {
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
    if (/^```(js|html|css)\s*\/\/\s*solution required\s*```$/.test(solution) && !filePath.includes('-projects')) {

      results += filePath
        .replace('D:\\Coding\\fcc\\','')
        .replace(/\\/g, '/') + '\n';
      count++;
    }
  });
});
fs.writeFileSync('./data/no-solutions.txt', results, 'utf8');
console.log('count = ' + count);
console.log('numChallenges = ' + numChallenges);