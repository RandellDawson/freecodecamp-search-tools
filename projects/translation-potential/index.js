require('dotenv').config();
const fs = require('fs');
const matter = require('gray-matter');
const exclude = require('./exclude');

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
  let filenames = await getOutputFromCommand(`cd /home/rdawson/Coding/fcc && find ${curriculumSection} -type f`)
  filenames = filenames.split('\n');
  let overallContentDiffs = []; // stores differences across all files
  console.log(commit);
  for (let filepath of filenames) {
    const fileToCheck = filepath.replace('curriculum/challenges/english/', '');
    if (!filepath.match(/part-\d\d\d\.md$/) && !exclude.includes(fileToCheck)) {
      if (filepath) {
        const {
          oldContent,
          newContent,
          newMdxContent,
          newChineseMdxContent
        } = await getFileContentVersions(pathToFccRepo, commit, filepath);

        const {
          oldParsed,
          newParsed,
          newMdxParsed,
          newChineseMdxParsed
        } = await getParsedVersions(oldContent, newContent, newMdxContent, newChineseMdxContent, baseFilePath);

        const issuesFound = await findIssues(oldParsed, newParsed, newMdxParsed, newChineseMdxParsed);

        const baseEnglishRawUrl = 'https://raw.githubusercontent.com/freeCodeCamp/freeCodeCamp/master/';
        const baseEditUrl = 'https://github.com/freeCodeCamp/freeCodeCamp/edit/master/';
        if (issuesFound) {
          const { data: { title: challengeTitle } } = matter(newContent);
          const englishLink = `[View English](${baseEnglishRawUrl + filepath})`;
          const chineseLink = `[Edit Chinese](${baseEditUrl}${filepath.replace('english', 'chinese')})`;
          let content = `- [ ] **${challengeTitle}** ${chineseLink} | ${englishLink}\n\n<details><summary>Show/Hide sections with changes/issues</summary>\n\n${issuesFound}\n</details>\n\n`;
          overallContentDiffs.push(content);
        }
      }
    }
  }
  console.log('# of summary details = ' + overallContentDiffs.length);
  fs.writeFileSync(
    `${baseFilePath}potential-changes.md`,
    overallContentDiffs.join('---\n'),
    'utf8'
  );
})();