const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

const findMatchingGuideArticle = (forumArticleName) => {
  const matchData = challengeFiles.filter(
    ({ forumName }) => forumArticleName === forumName
  );
  return matchData.length > 0 ? matchData[0] : null;
};

const code = fs.readFileSync('../../data/forum-articles.html', 'utf8');

let challengeFiles = fs.readFileSync('../../data/challenge-files.json', 'utf8');
challengeFiles = JSON.parse(challengeFiles).articles;

const $ = cheerio.load(code);
const $articles = $('.fps-result > .fps-topic > .topic > .search-link');

const results = {
  numMatches: 0,
  numNonMatches: 0,
  total: 0,
  matches: [],
  nonMatches: []
};

let numMatches = 0;
let numNonMatches = 0;

let me = 0;
$articles.each((i, elem) => {
  const forumArticleUrl = $(elem).attr('href');
  const match = forumArticleUrl.match(/challenge-guide-(?<forumArticleName>[\S]+)\/(?<forumTopicId>\d+)/);
  if (match) {
    const { forumArticleName, forumTopicId } = match.groups;
    const matchingChallengeFile = findMatchingGuideArticle(forumArticleName);
    const fullForumUrl = 'https://www.freecodecamp.org' + forumArticleUrl;
    if (matchingChallengeFile) {
      numMatches++;
      results.matches.push(Object.assign({ ...matchingChallengeFile }, { fullForumUrl, forumTopicId }));
    } else {
      numNonMatches++;
      results.nonMatches.push({ forumArticleName, fullForumUrl, forumTopicId});
    }
  } else {
    console.log('no match: ' + 'https://www.freecodecamp.com' + forumArticleUrl);
  }
});
results.numMatches = numMatches;
results.numNonMatches = numNonMatches;
results.total = numMatches + numNonMatches;
fs.writeFileSync('../../data/forum-topics-and-challenge-files-matrix.json', JSON.stringify(results), 'utf8');
console.log('matches: ' + results.matches.length);
console.log('non-matches: ' + results.nonMatches.length);
console.log('total: ' + (results.matches.length + results.nonMatches.length));
console.log('me='+me);