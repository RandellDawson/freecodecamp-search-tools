const fs = require('fs');
const matter = require('gray-matter');

const {
  getFileContentVersions,
  getOutputFromCommand,
  getParsedVersions,
  findIssues
} = require('./utils');

// Only modify the following 3 variables
const curriculumSection = 'curriculum/challenges/english/01-responsive-web-design';
const fromDate = "DEC 1 2019";
// Specify where to store output file(s)
const baseFilePath = 'D:/Coding/fcc-misc/search-tools/data/';
// Only modify the above 3 variables

const FIND_EARLIEST_COMMIT_CMD = `git log --pretty=format:"%H" --since "${fromDate}" -- ${curriculumSection} | tail -n 1`;

(async function () {
  const commit = await getOutputFromCommand(FIND_EARLIEST_COMMIT_CMD);
  /*
  Git command to find files between one commit earlier than the earliest
  commit and HEAD
  */
  const command = `git diff --name-only ${commit}^1 HEAD -- ${curriculumSection}`;
  const listOfFilesBetweenDiffs = await getOutputFromCommand(command);
  const filenames = listOfFilesBetweenDiffs.split('\n');

  let overallContentDiffs = []; // stores differences across all files
  for (let filepath of filenames) {
    if (filepath) {
      const {
        oldContent,
        newContent
      } = await getFileContentVersions(commit, filepath);
      
      const {
        oldParsed,
        newParsed
      } = await getParsedVersions(oldContent, newContent, baseFilePath);

      const issuesFound = findIssues(oldParsed, newParsed);

      const baseGitHubUrl = 'https://github.com/freeCodeCamp/freeCodeCamp/blob/master/';
      if (issuesFound) {
        const { data: { title: challengeTitle } } = matter(newContent);
        const challengeLink = `[${challengeTitle}](${baseGitHubUrl + filepath})`;
        let content = `- [ ] ${challengeLink}\n${issuesFound}`;
        overallContentDiffs.push(content);
      }
    }
  }
  fs.writeFileSync(
    `${baseFilePath}potential-changes.md`,
    overallContentDiffs.join('---\n'),
    'utf8'
  );
})();