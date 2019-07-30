const fs = require('fs');
const walkDir = require('../../utils/walk-dir');

const isStub = challengeFilePath => {
  const guideFilePath = 'D:/coding/fcc/' + challengeFilePath
    .replace('.english.md', '/index.md')
    .replace(/curriculum\/challenges\/english\/\d+-/, 'guide/english/certifications/');
  const content = fs.readFileSync(guideFilePath, 'utf8');
  return /This is a stub/i.test(content);
};

let numberOfCertificationArticles = 0;
const uniqueForumNames = {};
const list = [];

const sections = [
  { name: 'Responsive Web Design', path: '01-responsive-web-design' },
  { name: 'JavaScript Algorithms and Data Structures', path: '02-javascript-algorithms-and-data-structures' },
  { name: 'Front End Libraries', path: '03-front-end-libraries' },
  { name: 'Data Visualization', path: '04-data-visualization' },
  { name: 'Apis and Microservices', path: '05-apis-and-microservices' },
  { name: 'Information Security and Quality Assurance', path: '06-information-security-and-quality-assurance' },
  { name: 'Coding Interview Prep', path: '08-coding-interview-prep' }
];

sections.forEach(({ name: sectionName, path }) => {
  walkDir('D:/Coding/fcc/curriculum/challenges/english/' + path + '/', function (filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /---[\s\S]*?\r?\ntitle: (('|")?)(?<title>.+?)\1\r?\n[\s\S]*?---/;
    const { title } = content.match(regex).groups;
    const strippedPath = filePath
      .slice(filePath.indexOf(path))
      .split('\\');
    const forumName = strippedPath[strippedPath.length - 1].replace('.english.md', '');
    const guideFilePath = filePath
      .replace(/\\/g, '/')
      .replace('.english.md', '/index.md')
      .replace(/curriculum\/challenges\/english\/\d+-/, 'guide/english/certifications/');
    const challengeFilePath = filePath
      .replace(/\\/g, '/')
      .replace('D:/Coding/fcc/', '');
    if (!uniqueForumNames[forumName]) {
      list.push({
        sectionName,
        challengeFilePath,
        guideFilePath,
        title,
        forumName,
        isStub: isStub(challengeFilePath)
      });
      numberOfCertificationArticles++;
    } else {
      console.log('*******\nduplicate found: ' + forum + '\n*******');
    }
  });
})

const dataObj = {
  numberOfCertificationArticles,
  numberOfStubs: list.filter(({ isStub }) => isStub).length,
  numberOfNonStubs: list.filter(({ isStub }) => !isStub).length,
  articles: list
};
fs.writeFileSync('../../data/challenge-files.json', JSON.stringify(dataObj, null, '  '), 'utf8');