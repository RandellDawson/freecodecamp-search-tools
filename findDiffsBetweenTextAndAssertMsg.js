const walkDir = require('./walk-dir');
const yaml = require('yaml');
const cheerio = require('cheerio');
const fs = require('fs');

//const languages = ['arabic', 'chinese', 'english', 'portuguese', 'spanish', 'russian'];
const languages = ['english'];
let count = 0;
languages.forEach(function(language) {
  walkDir('D:/Coding/fcc/curriculum/challenges/' + language + '/02-javascript-algorithms-and-data-structures/', function (filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(code);
    const testSection = $('#test').text();

    console.log(testSection);
    const tests = yaml.parse(testSection);
    //console.log(tests)
    // if (/^```(js|html|css)\s*\/\/\s*solution required\s*```$/.test(solution)) {
    //   console.log(filePath);
    //   count++;
    // }
  });
});
console.log('count = ' + count);