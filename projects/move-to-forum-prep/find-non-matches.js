const fs = require('fs');

let data = fs.readFileSync('../../data/forum-topics-and-challenge-files-matrix.json', 'utf8');
const { nonMatches: nonMatchesData }  = JSON.parse(data);

let nonMatches = '';

nonMatchesData.forEach(({ forumArticleName, forumArticleUrl, forumTopicId, status = "" }) => {
  nonMatches += `${forumArticleName}|${forumArticleUrl}|${forumTopicId}|${status}\n`;
});
fs.writeFileSync('../../data/forum-non-matches.txt', nonMatches, 'utf8');
console.log('non-matches: ' + nonMatchesData.length);