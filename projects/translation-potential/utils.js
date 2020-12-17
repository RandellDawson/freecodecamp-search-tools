const stringify = require('remark-stringify');
const rehype = require('rehype');
const rehype2Remark = require('rehype-remark');

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const { parseMD: parseNewMarkdown } = require('../../freeCodeCamp/tools/challenge-md-parser/mdx');
const { parseMarkdown } = require('@freecodecamp/challenge-md-parser');

async function getOutputFromCommand(command) {
  try {
    const { stdout } = await exec(command);
    return stdout;
  }
  catch (err) {
    console.log('we have an error');
    console.log('command');
    console.log(command + '\n');
    return undefined
  };
}

async function getFileContentVersions(pathToFccRepo, commit, filepath) {
  // Get file content for version one commit earlier than than earliest commit
  // files before ~ mid september had .english still
  let command1 = `git -C ${pathToFccRepo} show ${commit}^1:${filepath.replace('.md','.english.md')}`;
  let command2 = `git -C ${pathToFccRepo} show ${commit}^1:${filepath}`;

  let oldContent;
  oldContent = await getOutputFromCommand(command1);

  if (oldContent === undefined) {
    oldContent = await getOutputFromCommand(command2);
  }
  // Get file content for current version
  command = `git -C ${pathToFccRepo} show HEAD:${filepath}`;
  const newContent = await getOutputFromCommand(command);
  command = `cat freeCodeCamp/${filepath}`;
  let newMdxContent = await getOutputFromCommand(command);

  command = `cat freeCodeCamp/${filepath.replace('/english/','/chinese/')}`
  let newChineseMdxContent = await getOutputFromCommand(command);
  return { oldContent, newContent, newMdxContent, newChineseMdxContent };
}

function createTextDiffTable(oldText, newText) {
  return `    <table>
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

function showDiff(theDiff) {
  return `\`\`\`diff\n${theDiff}\n\`\`\``;
}

async function getParsedVersions(oldContent, newContent, newMdxContent, newChineseMdxContent, baseFilePath) {
  fs.writeFileSync(`${baseFilePath}old-content.md`, oldContent, 'utf8');
  const oldParsed = await parseMarkdown(`${baseFilePath}old-content.md`);
  fs.writeFileSync(`${baseFilePath}new-content.md`, newContent, 'utf8');
  const newParsed = await parseMarkdown(`${baseFilePath}new-content.md`);
  fs.writeFileSync(`${baseFilePath}new-mdx-content.md`, newMdxContent, 'utf8');
  const newMdxParsed = await parseNewMarkdown(`${baseFilePath}new-mdx-content.md`);
  fs.writeFileSync(`${baseFilePath}new-chinese-mdx-content.md`, newChineseMdxContent, 'utf8');
  const newChineseMdxParsed = await parseNewMarkdown(`${baseFilePath}new-chinese-mdx-content.md`);  
  return { oldParsed, newParsed, newMdxParsed, newChineseMdxParsed };
}

async function findIssues(oldParsed, newParsed, newMdxParsed, newChineseMdxParsed, fileDiff) {
  const { description: oldDescription, instructions: oldInstructions, tests: oldTests } = oldParsed;
  const { description: newDescription, instructions: newInstructions, tests: newTests } = newParsed;
  const { tests: newMdxTests } = newMdxParsed;
  const { tests: newChineseMdxTests } = newChineseMdxParsed;

  let issuesFound = '';
  if (oldDescription !== newDescription) {
    issuesFound += `- **\`Description\` section has changed**\n`;
  }
  if (oldInstructions !== newInstructions) {
    issuesFound += `- **\`Instructions\` section has changed**\n`;
  }
  if (oldTests.length === newTests.length) {
    const nonMatchingTexts = [];
    for (let idx = 0; idx < oldTests.length; idx++) {
      const mdxFormat = await getMd(newMdxTests[idx].text);
      if (oldTests[idx].text !== newTests[idx].text) {
        nonMatchingTexts.push({
          testNum: idx + 1,
          oldText: oldTests[idx].text,
          newText: mdxFormat
        });
      }
    }
    if (nonMatchingTexts.length) {
      issuesFound += '- **The following test(s) \`text\` do not match:**\n**Instructions:** Make sure to also check that the English tests have not been reorderd.\n';
      nonMatchingTexts.forEach(({ testNum, oldText, newText }) => {
        issuesFound += `**Test ${testNum}**\n`;
        issuesFound += createTextDiffTable(oldText, newText) + '\n';
      });
    }
  }
  if (newTests.length !== newChineseMdxTests.length) {
    const testsInfo = `English: ${newTests.length} | Chinese: ${newChineseMdxTests.length}`;
    issuesFound += `- **Number of tests do not match - ${testsInfo}**\n**Instructions:** Add or delete the applicable tests.  It is possible some tests have been rearranged, so make sure each English test has a corresponding Chinese test in the same order\n`;
  }
  return issuesFound;
}

const stringifyMd = rehype()
  .use(rehype2Remark)
  .use(stringify, { fences: true, emphasis: '*' });

async function getMd(text) {
  const result = await stringifyMd.process(text).then(file => file.contents);
  return result;
}

const utils = {
  getOutputFromCommand,
  getFileContentVersions,
  createTextDiffTable,
  getParsedVersions,
  findIssues
}

module.exports = utils;