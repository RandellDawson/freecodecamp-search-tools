require('dotenv').config();
const fs = require('fs');
const matter = require('gray-matter');

const {
  getFileContentVersions,
  getOutputFromCommand,
  getParsedVersions,
  findIssues
} = require('./utils');

// Execute this script from the root folder of the fcc repo master branch
const curriculumSection = process.env.CURRICULUM_SECTION_PATH;
const fromDate = process.env.FROM_DATE;
const baseFilePath = process.env.BASE_FILE_PATH;
const pathToFccRepo = process.env.PATH_TO_FCC_REPO;

const FIND_EARLIEST_COMMIT_CMD = `git -C ${pathToFccRepo} log --pretty=format:"%H" --since "${fromDate}" -- ${curriculumSection} | tail -n 1`;

(async function () {
  const commit = await getOutputFromCommand(FIND_EARLIEST_COMMIT_CMD);
  /*
  Git command to find files between one commit earlier than the earliest
  commit and HEAD
  */
  const command = `git -C ${pathToFccRepo} diff --name-only ${commit}^1 HEAD -- ${curriculumSection}`;
  const listOfFilesBetweenDiffs = await getOutputFromCommand(command);
  const filenames = listOfFilesBetweenDiffs.split('\n');

  let overallContentDiffs = []; // stores differences across all files
  for (let filepath of filenames) {
    if (filepath) {
      const {
        oldContent,
        newContent
      } = await getFileContentVersions(pathToFccRepo, commit, filepath);
      
      const {
        oldParsed,
        newParsed
      } = await getParsedVersions(oldContent, newContent, baseFilePath);

      const issuesFound = findIssues(oldParsed, newParsed);

      const baseGitHubUrl = 'https://github.com/freeCodeCamp/freeCodeCamp/blob/master/';
      if (issuesFound) {
        const { data: { title: challengeTitle } } = matter(newContent);
        const challengeLink = `[${challengeTitle}](${baseGitHubUrl + filepath})`;
        let content = `- [ ] ${challengeLink}\n\n<details><summary>Show/Hide sections with changes/issues</summary>\n\n${issuesFound}\n</details>\n\n`;
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