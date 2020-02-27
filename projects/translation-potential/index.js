const { parseMarkdown } = require('@freecodecamp/challenge-md-parser');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

const FIND_RELEVANT_COMMITS_CMD = 'git log --pretty=format:"%H" --since "DEC 1 2019" -- curriculum/challenges/english/01-responsive-web-design';

async function getOutputFromCommand(command) {
  delete process.platform;
  process.platform = 'linux';
  try {
    const { stdout } = await exec(command, {
      env: { PATH: '/C/Program Files/Git' },
      shell: 'C:\\Program Files\\Git\\bin\\bash.exe'
    });
    return stdout;
  }
  catch (err) {
    console.log(err);
  };
  process.platform = 'win32';
}

async function getFileContentVersions(commit, filepath) {
  // get previous version of file content
  let command = `git show ${commit}^1:${filepath}`;
  const oldContent = await getOutputFromCommand(command);

  // get committed version of file content
  command = `git show HEAD:${filepath}`;
  const newContent = await getOutputFromCommand(command);
  return { oldContent, newContent };
}

(async function () {
  const commitsStr = await getOutputFromCommand(FIND_RELEVANT_COMMITS_CMD);
  const commits = commitsStr.split('\n');
  // for (let commit of commits) {
  const commit = commits.slice(-1);
  const commitTitle = 'COMMIT: ' + commit;
  console.log('-'.repeat(commitTitle.length) + `\n${commitTitle}`);

  // Build command for getting list of files between commits
  const command = `git diff --name-only ${commit}^1 HEAD -- curriculum/challenges/english/01-responsive-web-design`;
  const listOfFilesBetweenDiffs = await getOutputFromCommand(command);
  const filenames = listOfFilesBetweenDiffs.split('\n');
  for (let filepath of filenames) {
    if (filepath) {
      const { oldContent, newContent } = await getFileContentVersions(commit, filepath);
      const baseFilePath = 'D:/Coding/fcc-misc/search-tools/data/';
      fs.writeFileSync(`${baseFilePath}old-content.md`, oldContent, 'utf8');
      const {
        description: oldDescription,
        instructions: oldInstructions,
        tests: oldTests
      } = await parseMarkdown(`${baseFilePath}old-content.md`);

      fs.writeFileSync(`${baseFilePath}new-content.md`, newContent, 'utf8');
      const {
        description: newDescription,
        instructions: newInstructions,
        tests: newTests
      } = await parseMarkdown(`${baseFilePath}new-content.md`);

      let issuesFound = '';
      if (oldDescription !== newDescription) {
        issuesFound += 'Descriptions do not match\n';
      }
      if (oldInstructions !== newInstructions) {
        issuesFound += 'Instructions do not match\n';
      }
      if (oldTests.length !== newTests.length) {
        issuesFound += `Different number of tests found (old: ${oldTests.length}, new: ${newTests.length})\n`;
      } else {
        const nonMatchingTexts = oldTests.reduce((results, oldTest, idx) => {
          if (oldTest.text !== newTests[idx].text) {
            results.push({
              testNum: idx + 1,
              oldText: oldTest.text,
              newText: newTests[idx].text
            });
          }
          return results;
        }, []);
        if (nonMatchingTexts.length) {
          issuesFound += 'The following texts do not match:\n';
          nonMatchingTexts.forEach(({ testNum, oldText, newText }) => {
            issuesFound += `Test #${testNum}\n`;
            issuesFound += `  Old text: ${oldText}\n`;
            issuesFound += `  New text: ${newText}\n`;
          });
        }
      }
      if (issuesFound) {
        console.log(filepath);
        console.log(issuesFound);
      }
    }
  }
  console.log('-'.repeat(commitTitle.length) + '\n');
  // }
})()