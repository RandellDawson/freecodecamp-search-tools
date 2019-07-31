const fs = require('fs');

const findMatchingGuideArticle = (forumArticleName) => {
  const matchData = challengeFiles.filter(
    ({ forumName }) => {
      // remove non-alphanumeric characters remove consecutive dashes
      forumName = forumName
        .replace(/[^a-z0-9-]/gi, '')
        .replace(/-+/g,'-');
      return forumArticleName === forumName;
    });
  return matchData.length > 0 ? matchData[0] : null;
};

const articles = JSON.parse(fs.readFileSync('../../data/forum-article-urls.json', 'utf8'));

let challengeFiles = fs.readFileSync('../../data/challenge-files.json', 'utf8');
challengeFiles = JSON.parse(challengeFiles).articles;

const results = {
  numMatches: 0,
  numNonMatches: 0,
  total: 0,
  matches: [],
  nonMatches: []
};

let numMatches = 0;
let numNonMatches = 0;

articles.forEach(forumArticleUrl => {
  const match = forumArticleUrl.match(/challenge-guide-(?<forumArticleName>[\S]+)\/(?<forumTopicId>\d+)/);
  if (match) {
    const { forumArticleName, forumTopicId } = match.groups;
    const matchingChallengeFile = findMatchingGuideArticle(forumArticleName);
    if (matchingChallengeFile) {
      numMatches++;
      results.matches.push(Object.assign({ ...matchingChallengeFile }, { forumArticleUrl, forumTopicId }));
    } else {
      numNonMatches++;
      results.nonMatches.push({ forumArticleName, forumArticleUrl, forumTopicId});
    }
  } else {
    //console.log('no match: ' + 'https://www.freecodecamp.com' + forumArticleUrl);
  }
});

results.numMatches = numMatches;
results.numNonMatches = numNonMatches;
results.total = numMatches + numNonMatches;
fs.writeFileSync('../../data/forum-topics-and-challenge-files-matrix.json', JSON.stringify(results, null, '  '), 'utf8');
console.log('matches: ' + results.matches.length);
console.log('non-matches: ' + results.nonMatches.length);
console.log('total: ' + (results.matches.length + results.nonMatches.length));