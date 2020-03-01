const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const { parseMarkdown } = require('@freecodecamp/challenge-md-parser');

async function getOutputFromCommand(command) {
  // necessary to allow to work on Windows
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
  process.platform = 'win32'; // return to using Windows
}

async function getFileContentVersions(commit, filepath) {
  // Get file content for version one commit earlier than than earliest commit
  let command = `git show ${commit}^1:${filepath}`;
  const oldContent = await getOutputFromCommand(command);

  // Get file content for current version
  command = `git show HEAD:${filepath}`;
  const newContent = await getOutputFromCommand(command);
  return { oldContent, newContent };
}

function createTextDiffTable(oldText, newText) {
  return `  <table>
  <tr>
  <th>
  Version
  </th>
  <th align="left">
  Text
  </th>
  </tr>
  <tr>
  <td align>Old</td>
  <td align>

  \`\`\`
  ${oldText}
  \`\`\`
  </td>
  </tr>
  <td>New</td>
  <td>

  \`\`\`
  ${newText}
  \`\`\`
  </td>
  </tr>
  </table>
`;
}

async function getParsedVersions(oldContent, newContent, outputPath) {
  fs.writeFileSync(`${outputPath}old-content.md`, oldContent, 'utf8');
  const oldParsed = await parseMarkdown(`${outputPath}old-content.md`);
  fs.writeFileSync(`${outputPath}new-content.md`, newContent, 'utf8');
  const newParsed = await parseMarkdown(`${outputPath}new-content.md`);
  return { oldParsed, newParsed };
}

function findIssues(oldParsed, newParsed) {
  const { description: oldDescription, instructions: oldInstructions, tests: oldTests } = oldParsed;
  const { description: newDescription, instructions: newInstructions, tests: newTests } = newParsed;
  let issuesFound = '';
  if (oldDescription !== newDescription) {
    issuesFound += '- **`Description` section has changed**\n';
  }
  if (oldInstructions !== newInstructions) {
    issuesFound += '- **`Instructions` section has changed**\n';
  }
  if (oldTests.length === newTests.length) {
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
      issuesFound += '- **The following test \`text\`(s) do not match:**\n';
      nonMatchingTexts.forEach(({ testNum, oldText, newText }) => {
        issuesFound += `  **Test ${testNum}**\n`;
        issuesFound += createTextDiffTable(oldText, newText) + '\n';
      });
    }
  }
  return issuesFound;
}

const utils = {
  getOutputFromCommand,
  getFileContentVersions,
  createTextDiffTable,
  getParsedVersions,
  findIssues
}

module.exports = utils;