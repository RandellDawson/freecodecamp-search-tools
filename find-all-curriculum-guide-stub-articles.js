const fs = require('fs');
const walkDir = require('./walk-dir');

let numArticles = 0;
let count = 0;

const uniqueForumNames = {

};
const list = [];

// const section = 'responsive-web-design';
// const section = 'javascript-algorithms-and-data-structures';
// const section = 'front-end-libraries';
// const section = 'data-visualization';
// const section = 'apis-and-microservices';
// const section = 'information-security-and-quality-assurance';
const section = 'coding-interview-prep';

walkDir('D:/Coding/fcc/guide/english/certifications/' + section + '/', function (filePath) {
  numArticles++;
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (/This is a stub/.test(content)) {
    const {title} = content.match(/---\s*title:\s*(?<title>[\s\S]+?)\s*---/).groups;
    const strippedPath = filePath.slice(filePath.indexOf(section))
      .replace('\\index.md', '')
      .split('\\');
    const forumName = strippedPath[strippedPath.length -1];
    if (strippedPath.length > 2) {
      const suggestedForumNameUrl = strippedPath[2];
      const guidePath = filePath
        .replace(/\\/g,'/')
        .replace('D:/Coding/fcc/', '');
      if (!uniqueForumNames[forumName]) {
        console.log(content);
        console.log('\n\n')
        list.push({
          section,
          guidePath, 
          title,
          suggestedForumNameUrl
        });
        count++;
      } else {
        console.log('*******\nduplicate found: ' + suggestedForumNameUrl + '\n*******');
      }
    }
  }
});

console.log('count = ' + count);
console.log('numArticles = ' + numArticles);
console.log(JSON.stringify(list));

