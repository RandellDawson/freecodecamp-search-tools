const markdownLinkCheck = require('markdown-link-check');
const walkDir = require('./walk-dir');
const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

//const languages = ['arabic', 'chinese', 'english', 'portuguese', 'spanish', 'russian'];
const languages = ['english'];
let count = 0;
languages.forEach(function (language) {
  walkDir('D:/Coding/fcc/curriculum/challenges/' + language + '/02-javascript-algorithms-and-data-structures/', function (filePath) {
    console.log(filePath);
    markdownLinkCheck(filePath, function (err, results) {
      if (err) {
        console.error('Error', err);
        return;
      }
      results.forEach(function (result) {
        console.log('%s is %s', result.link, result.status);
      });
    });
    console.log('\n');
  });
});
