const fs = require('fs');
const matter = require('gray-matter');
const walkDir = require('../../utils/walk-dir');

const {
  getOutputFromCommand,
  getParsedVersion,
  findIssues
} = require('./utils');

// Only modify the variables below this line
const curriculumSection = '02-javascript-algorithms-and-data-structures';
const fromDate = "DEC 1 2019";
const nonEnglishLanguage = 'Chinese';
const outputPath = 'D:/Coding/fcc-misc/search-tools/data/';
// Only modify the variables above this line

const baseCurriculumPath = 'curriculum/challenges/';

(async function () {
  const FIND_EARLIEST_COMMIT_CMD = `git log --pretty=format:"%H" --since "${fromDate}" -- ${baseCurriculumPath}english/${curriculumSection} | tail -n 1`;
  const commit = await getOutputFromCommand(FIND_EARLIEST_COMMIT_CMD);

  const overallContentDiffs = []; // stores differences across all files

  walkDir(`D:/Coding/fcc/${baseCurriculumPath}english/${curriculumSection}`, async function (filePath) {
    // if (filePath.includes('use-recursion-to-create-a-countdown.english.md')) {
      // Get file content for version one commit earlier than than earliest commit
      const repoFilePath = filePath
        .replace(/\\/g, '/')
        .replace(/^(.+)\/(curriculum\/.+$)/, '$2');
      const newContent = fs.readFileSync(filePath, 'utf8');
      const newParsed = await getParsedVersion(newContent, 'new', outputPath);
      let finalOldParsed;

      const command = `git show ${commit}^1:${repoFilePath}`;
      const oldContent = await getOutputFromCommand(command);
      if (oldContent !== '') {
        const { oldParsed } = await getParsedVersion(oldContent, 'old', outputPath);
        finalOldParsed = oldParsed;
      } else {
        finalOldParsed = null;
      }
      const nonEnglishFilePath = filePath.replace(/english/g, nonEnglishLanguage.toLocaleLowerCase());
      const issuesFound = await findIssues(finalOldParsed, newParsed, nonEnglishLanguage, nonEnglishFilePath);

      const baseGitHubUrl = 'https://github.com/freeCodeCamp/freeCodeCamp/blob/master/';
      if (issuesFound) {
        const { data: { title: challengeTitle } } = matter(newContent);
        const challengeLink = `[${challengeTitle}](${baseGitHubUrl + repoFilePath})`;
        let content = `- [ ] ${challengeLink}\n\n<details><summary>Show/Hide sections with changes/issues</summary>\n\n${issuesFound}\n</details>\n\n`;
        overallContentDiffs.push(content);
      }

      fs.writeFileSync(
        `${outputPath}potential-changes.md`,
        overallContentDiffs.join('---\n'),
        'utf8'
      );
    // }
  });

})();