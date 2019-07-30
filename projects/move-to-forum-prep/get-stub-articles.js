const fs = require('fs');
const walkDir = require('../../utils/walk-dir');

let numberOfCertificationArticles = 0;
const uniqueForumNames = {};
const list = [];

const sections = [
  // { name: 'Responsive Web Design', path: 'responsive-web-design' },
  // { name: 'JavaScript Algorithms and Data Structures', path: 'javascript-algorithms-and-data-structures' },
  // { name: 'Front End Libraries', path: 'front-end-libraries' },
  // { name: 'Data Visualization', path: 'data-visualization' },
  // { name: 'Apis and Microservices', path: 'apis-and-microservices' },
  // { name: 'Information Security and Quality Assurance', path: 'information-security-and-quality-assurance' },
  { name: 'Coding Interview Prep', path: 'coding-interview-prep' }
  // { name: 'Coding Interview Prep/Project Euler', path: 'coding-interview-prep/project-euler' }
];

sections.forEach(({ name: sectionName, path }) => {
  walkDir('D:/Coding/fcc/guide/english/certifications/' + path + '/', function (filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const { title } = content.match(/---\s*title:\s*(?<title>[\s\S]+?)\s*---/).groups;
    const strippedPath = filePath.slice(filePath.indexOf(path))
      .replace('\\index.md', '')
      .split('\\');
    const forumName = strippedPath[strippedPath.length - 1];
    if (strippedPath.length > 2) {
      const suggestedForumUrlName = strippedPath[2];
      const guidePath = filePath
        .replace(/\\/g, '/')
        .replace('D:/Coding/fcc/', '');
      if (!uniqueForumNames[forumName]) {
        const isStub = /This is a stub/.test(content);
        if (!isStub && /project-euler/.test(guidePath)) {
          console.log(guidePath);
          console.log(content);
          console.log();
          console.log('******************');
          console.log()
          list.push({
            sectionName,
            guidePath,
            title,
            suggestedForumUrlName,
            isStub
          });
          numberOfCertificationArticles++;
        }
      } else {
        console.log('*******\nduplicate found: ' + suggestedForumUrlName + '\n*******');
      }
    }
  });
})

const dataObj = {
  numberOfCertificationArticles,
  numberOfStubs: list.filter(({ isStub }) => isStub).length,
  numberOfNonStubs: list.filter(({ isStub }) => !isStub).length,
  articles: list
};
fs.writeFileSync('../../data/certification-stub-guide-articles.json', JSON.stringify(dataObj), 'utf8');