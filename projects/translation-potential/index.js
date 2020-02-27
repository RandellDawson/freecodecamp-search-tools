const util = require('util');
const exec = util.promisify(require('child_process').exec);
const FIND_RELEVANT_COMMITS_CMD = 'git log --pretty=format:"%H" --since "DEC 1 2019" -- curriculum/challenges/english/01-responsive-web-design';

async function getOutputFromCommand(command) {
  try {
    const { stdout } = await exec(command);
    return stdout;
  } catch (err) {
    console.error(err);
  };
};

async function getFileContentVersions(commit, filepath) {
  let command = `git show ${commit}^1:${filepath}`;
  const oldContent = await getOutputFromCommand(command);
  command = `git show ${commit}:${filepath}`;
  const newContent = await getOutputFromCommand(command);
  return { oldContent, newContent };
}

(async function() {
  const commitsStr = await getOutputFromCommand(FIND_RELEVANT_COMMITS_CMD);
  const commits = commitsStr.split('\n');
  console.log(commits);
  for (let commit of commits) {
    console.log('**********\nCOMMIT: ' + commit + '\n');

    // Build command for getting list of files between commits
    const command = `git diff --name-only ${commit}^1 ${commit}`;
    const listOfFilesBetweenDiffs = await getOutputFromCommand(command);
    const filenames = listOfFilesBetweenDiffs.split('\n');
    
    for (let filepath of filenames) {
      const { oldContent, newContent } = await getFileContentVersions(commit, filepath);
      console.log(oldContent);
      console.log('\n' + newContent + '\n');
    }
    console.log('*********\n\n')
  }
})()
