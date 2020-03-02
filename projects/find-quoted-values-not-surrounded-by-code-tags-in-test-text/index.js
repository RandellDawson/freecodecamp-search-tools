const fs = require('fs');
const { parseMarkdown } = require('@freecodecamp/challenge-md-parser');
const walkDir = require('../../utils/walk-dir');

// Only modify the variables below this line
const curriculumSection = '01-responsive-web-design';
const outputPath = 'D:/Coding/fcc-misc/search-tools/data/';
// Only modify the variables above this line

const baseCurriculumPath = 'curriculum/challenges/';

async function getParsedVersion(content, version, outputPath) {
  fs.writeFileSync(`${outputPath}${version}-content.md`, content, 'utf8');
  const parsedContent = await parseMarkdown(`${outputPath}${version}-content.md`);
  return parsedContent;
}

const challengesWithProblems = [];
let count = 0;
walkDir(`D:/Coding/fcc/${baseCurriculumPath}english/${curriculumSection}`, async function (filePath) {
  const repoFilePath = filePath.replace(/\\/g, '/');
  const parsedContent = await parseMarkdown(repoFilePath);
  const { title: challengeTitle, tests } = parsedContent;

  const textsWithNonEnglishChars = tests.reduce((results, { text }, idx) => {
    const matches = text.match(/("|')(.+)\1/g);
    if (matches) {
      count++;
      console.log(count);
      console.log(challengeTitle);
      console.log(repoFilePath.replace(/english/g, 'chinese'));
      console.log(matches);
    }
    return results;
  }, []);

  const baseGitHubUrl = 'https://github.com/freeCodeCamp/freeCodeCamp/blob/master/';
  const challengeLink = `[${challengeTitle}](${baseGitHubUrl + repoFilePath})`;
  if (textsWithNonEnglishChars.length) {
    challengesWithProblems.push({ challengeTitle, textsWithNonEnglishChars });
  }

  fs.writeFileSync(
    `${outputPath}chinese-challenges-with-non-english-characters-in-text-code-tags.txt`,
    JSON.stringify(challengesWithProblems, null, 2),
    'utf8'
  );
});