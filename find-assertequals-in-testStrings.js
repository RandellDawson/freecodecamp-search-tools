const walkDir = require('./utils/walk-dir');
const cheerio = require('cheerio');
const fs = require('fs');


let numChallenges = 0;
let count = 0;
let results = '';

const directories = [
  '01-responsive-web-design',
  '02-javascript-algorithms-and-data-structures',
  '03-front-end-libraries',
  '04-data-visualization',
  '08-coding-interview-prep'
];

directories.forEach(dir => {
  walkDir('D:/Coding/fcc/curriculum/challenges/english/' + dir + '/', function (filePath) {
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
    if (!/^```(js|html|css)\s*\/\/\s*solution required\s*```$/.test(solution) && !filePath.includes('-projects')) {
      const tests = code.match(/```yml\r?\ntests:(?<testSection>[\s\S]*?)```/);
      if (tests) {
        const testsCode = tests.groups.testSection;
        const testStringsWithAssertEquals = testsCode.match(/testString: .*?assert\.(not|strict|notstrict|deep|notdeep)?equal.+\n/gi);
        if (testStringsWithAssertEquals) {
          results += filePath
            .replace('D:\\Coding\\fcc\\', '')
            .replace(/\\/g, '/') + '\n';  
          results += testStringsWithAssertEquals.reduce((str, assert) => str += assert, '') + '\n';
          count++;
        }
      }


    }
  });
});
fs.writeFileSync('./data/assertequals.txt', results, 'utf8');
console.log('count = ' + count);
console.log('numChallenges = ' + numChallenges);