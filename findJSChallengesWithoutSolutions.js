const walkDir = require('./walk-dir');

const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
//const languages = ['arabic', 'chinese', 'english', 'portuguese', 'spanish', 'russian'];
const languages = ['english'];
let count = 0;
languages.forEach(function(language) {
  walkDir('D:/Coding/fcc/curriculum/challenges/' + language + '/01-responsive-web-design/responsive-web-design-principles', function (filePath) {
  //walkDir('D:/Coding/fcc/curriculum/challenges/' + language + '/02-javascript-algorithms-and-data-structures/', function (filePath) {
  //walkDir('D:/Coding/fcc/curriculum/challenges/' + language + '/03-front-end-libraries/', function (filePath) {  
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
    if (/^```(js|html|css)\s*\/\/\s*solution required\s*```$/.test(solution)) {
      console.log(filePath);
      count++;
    }
  });
});
console.log('count = ' + count);