const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');

const findMatchingGuideArticle = (forumArticleName) => {
  const matchData = guideArticles.filter(
    ({ suggestedForumUrlName }) => forumArticleName === suggestedForumUrlName
  );
  return matchData.length > 0 ? matchData[0] : null;
};

const code = fs.readFileSync('./data/forum-articles.html', 'utf8');

let guideArticles = fs.readFileSync('./data/guide-articles.json', 'utf8');
guideArticles = JSON.parse(guideArticles);

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

$articles.each((i, elem) => {
  const forumArticleUrl = $(elem).attr('href');
  const match = forumArticleUrl.match(/challenge-guide-(?<forumArticleName>[\S]+)\/(?<forumTopicId>\d+)/);
  if (match) {
    const { forumArticleName, forumTopicId } = match.groups;
    const matchingGuideArticle = findMatchingGuideArticle(forumArticleName);
    const fullForumUrl = 'https://www.freecodecamp.org' + forumArticleUrl;
    if (matchingGuideArticle) {
      numMatches++;
      results.matches.push(Object.assign({ ...matchingGuideArticle }, { fullForumUrl, forumTopicId }));
    } else {
      numNonMatches++;
      results.nonMatches.push({ forumArticleName, fullForumUrl, forumTopicId});
    }
  }
});
results.numMatches = numMatches;
results.numNonMatches = numNonMatches;
results.total = numMatches + numNonMatches;
fs.writeFileSync('./data/forum-articles-and-guide-articles-matrix.json', JSON.stringify(results), 'utf8');
console.log('matches: ' + results.matches.length);
console.log('non-matches: ' + results.nonMatches.length);
console.log('total: ' + (results.matches.length + results.nonMatches.length));