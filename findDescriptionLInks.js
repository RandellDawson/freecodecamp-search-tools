const walkDir = require('./walk-dir');

const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const languages = ['arabic', 'chinese', 'english', 'portuguese', 'spanish', 'russian'];

languages.forEach(function (language) {
  walkDir('D:/Coding/fcc/curriculum/challenges/' + language, function (filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(code);
    const links = [];
    $('#description').find('a').each(function () {
      const link = $(this).attr('href');
      if (/^(?!http|\/\/)/i.test(link) && link) {
        links.push(link);
      }
    });
    if (links.length) {
      let file = filePath.replace('D:\\Coding\\fcc\\', '');
      file = file.replace(/\\/g, '/');
      console.log(file);
    }
  });
});