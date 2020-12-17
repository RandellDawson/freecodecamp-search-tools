const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const { parseMD: parseNewMarkdown } = require('../../freeCodeCamp/tools/challenge-md-parser/mdx');
const getMd = require('./getMd');
const { parseMarkdown } = require('@freecodecamp/challenge-md-parser');

async function getOutputFromCommand(command) {
  try {
    const { stdout } = await exec(command);
    return stdout;
  }
  catch (err) {
    console.log('we have an error');
    console.log(err);
  };
}

async function getFileContentVersions(pathToFccRepo, commit, filepath) {
  // Get file content for version one commit earlier than than earliest commit
  let command = `git -C ${pathToFccRepo} show ${commit}^1:${filepath.replace('.md','.english.md')}`;
  // let command = `git -C ${pathToFccRepo} show ${commit}^1:${filepath}`;
  const oldContent = await getOutputFromCommand(command);

  // Get file content for current version
  command = `git -C ${pathToFccRepo} show HEAD:${filepath}`;
  const newContent = await getOutputFromCommand(command);

  command = `cat freeCodeCamp/${filepath}`;
  let newMdxContent = await getOutputFromCommand(command);
  newMdxContent = await getMd(newMdxContent);
  // console.log('newMdxContent');
  // console.log(newMdxContent)
  return { oldContent, newContent, newMdxContent };
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

async function getParsedVersions(oldContent, newContent, newMdxContent, baseFilePath) {
  fs.writeFileSync(`${baseFilePath}old-content.md`, oldContent, 'utf8');
  const oldParsed = await parseMarkdown(`${baseFilePath}old-content.md`);
  fs.writeFileSync(`${baseFilePath}new-content.md`, newContent, 'utf8');
  const newParsed = await parseMarkdown(`${baseFilePath}new-content.md`);
  fs.writeFileSync(`${baseFilePath}new-mdx-content.md`, newMdxContent, 'utf8');
  console.log(newMdxContent);
  console.log('\n\n');
  const newMdxParsed = await parseNewMarkdown(`${baseFilePath}new-mdx-content.md`);
  console.log(newMdxParsed);
  console.log('\n\n\n')  
  return { oldParsed, newParsed, newMdxParsed };
}

function findIssues(oldParsed, newParsed, newMdxParsed) {
  const { description: oldDescription, instructions: oldInstructions, tests: oldTests } = oldParsed;
  const { description: newDescription, instructions: newInstructions, tests: newTests } = newParsed;
  const { tests: newMdxTests } = newMdxParsed;
  // console.log(newMdxParsed);
  // console.log('\n\n\n\n');
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
          newText: newMdxTests[idx].text
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