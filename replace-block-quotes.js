const walkDir = require('./walk-dir');

const cheerio = require('cheerio');

const path = require('path');
const fs = require('fs');

const convertHTMLEntities = (code) => {
  const conversions = {
    '&#x201C;': '"',
    '&#x201D;': '"',
    '&#xA0;': ' ',
    '&nbsp;': ' ',
    '&quot;': '"',
    '&apos;': '\'',
    '&gt;': '>',
    '&lt;': '<',
    '&amp;&amp;': '&&'
    // '<em>': '',
    // '</em>': '',
  };
 
  code = Object.keys(conversions)
    .reduce((newStr, find) => newStr
      .replace(new RegExp(find, 'g'), conversions[find]), code);
   return code
     .replace(/\n/g, '')
     .replace(/<\s*br\s*\/?\s*>/g, '\n');
};

const replaceBlockQuote = (filename, bq) => {
  let data = fs.readFileSync(filename, 'utf8')
  // console.log(data.match(/<blockquote>[\s\S]+<\/blockquote>/));
  result = data.replace(/<blockquote>[\s\S]+?<\/blockquote>/, bq);
  fs.writeFileSync(filename, result, 'utf8');
};

const directoriesToParse = [
  'D:/Coding/fcc/curriculum/challenges/english/02-javascript-algorithms-and-data-structures/basic-javascript/'
];

let challengeCount = 0;
let blockquoteCount = 0;
directoriesToParse.forEach(function(directory) {
  walkDir(directory, function (filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(code);
    const blockquotes = $('#description, #instructions').find('blockquote');
    const short = filePath.replace(/\\/g, '\/').replace(directory, '');
    
    let bqs = [];
    if (blockquotes.length) {
      challengeCount++;
      blockquotes.each(function (index, blockquote) {
        blockquoteCount++;
        console.log(filePath);
        bqs.push('\n```js\n' + convertHTMLEntities($(this).html().trim()) + '\n```\n');
      });
      bqs.forEach(bq => replaceBlockQuote(filePath, bq));
    }   
  });
  console.log('challengeCount = ' + challengeCount);
  console.log('blockquoteCount = ' + blockquoteCount)
});