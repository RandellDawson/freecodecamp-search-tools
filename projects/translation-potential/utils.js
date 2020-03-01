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
    return '';
  }
  finally {
    process.platform = 'win32'; // return to using Windows
  };
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

async function getParsedVersion(content, version, outputPath) {
  fs.writeFileSync(`${outputPath}${version}-content.md`, content, 'utf8');
  const parsedContent = await parseMarkdown(`${outputPath}${version}-content.md`);
  return parsedContent;
}

async function findIssues(oldParsed, newParsed, nonEnglishLanguage, nonEnglishFilePath) {

  const { description: newDescription, instructions: newInstructions, tests: newTests } = newParsed;
  let issuesFound = '';
  if (oldParsed) {
    if (oldParsed.description !== newDescription) {
      issuesFound += '- **`Description` section has changed**\n';
    }
    if (oldParsed.instructions !== newInstructions) {
      issuesFound += '- **`Instructions` section has changed**\n';
    }
  }
  
  let nonEnglishParsed;
  if (fs.existsSync(nonEnglishFilePath)) {
    nonEnglishParsed = await parseMarkdown(nonEnglishFilePath);
  }
  /*
  Check if current number of English tests for challenge match the current
  number of non-English version tests.
  */
 
  if (nonEnglishParsed && nonEnglishParsed.tests.length !== newTests.length) {
    issuesFound += `- **Number of tests do not match (English: ${newTests.length}, ${nonEnglishLanguage}: ${nonEnglishParsed.tests.length})**\n`;
  } else if (oldParsed) {
    const nonMatchingTexts = oldParsed.tests.reduce((results, oldTest, idx) => {
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
  createTextDiffTable,
  getParsedVersion,
  findIssues
}

module.exports = utils;