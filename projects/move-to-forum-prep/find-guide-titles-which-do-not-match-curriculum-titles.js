const walkDir = require('../../utils/walk-dir');
const fs = require('fs');

const stripSurroundingQuotes = str => str
  .replace(/^("|')/, '')
  .replace(/("|')$/, '');

let numChallenges = 0;
let count = 0;

// const startingDir = './data/challenges/';
const startingDir = 'D:/Coding/fcc/curriculum/challenges/english/08-coding-interview-prep/project-euler/';

walkDir(startingDir, function (challengeFilePath) {

  if (!challengeFilePath.includes('09-certificates')) {
    numChallenges++;
    const guideFilePath = challengeFilePath.replace(/curriculum\\challenges\\english\\/, 'guide\\english\\certifications\\')
      .replace(/\.english\.md$/, '\\index.md')
      .replace(/(certifications\\)\d{2}-/, '$1')
      .replace(/\\/g, '/');
    try {
      if (fs.existsSync(guideFilePath)) {
        //file exists
        const regex = /---[\s\S]*?\r?\ntitle: (('|")?)(?<title>(?<problem>Problem \d+: )?[^']+?)\2\r?\n[\s\S]*?---/;
        const challengeContent = fs.readFileSync(challengeFilePath, 'utf8');
        const challengeTitleMatch = challengeContent.match(regex);
        
        if (challengeTitleMatch) {
          let { title: challengeTitle, problem } = challengeTitleMatch.groups;
          challengeTitle = challengeTitle.toLocaleLowerCase();
          problem = problem ? problem.toLowerCase() : problem;
          const guideContent = fs.readFileSync(guideFilePath, 'utf8');
          const guideContentMatch = guideContent.match(regex);
          let guideTitle;
          if (guideContentMatch) {
            guideTitle = stripSurroundingQuotes(guideContentMatch.groups.title).toLowerCase();
          }
          if (challengeTitle !== guideTitle && challengeTitle !== (problem + guideTitle)) {
            count++;
            console.log(challengeFilePath);
            console.log(challengeTitle);
            console.log(guideTitle);
            console.log();
          }
        }
      } else {
        console.log('PROBLEM: ' + guideFilePath + ' does not exist');
      }
    } catch (err) {
      console.log(err)
    }
  }

});
console.log('count = ' + count);
console.log('numChallenges = ' + numChallenges);