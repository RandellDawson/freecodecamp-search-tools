const fs = require('fs');

let data = fs.readFileSync('../../data/non-matches.json', 'utf8');
data  = JSON.parse(data);

let nonMatches = '';

data.forEach(({ forumArticleName, fullForumUrl, forumTopicId, status = "" }) => {
  nonMatches += `${forumArticleName}|${fullForumUrl}|${forumTopicId}|${status}\n`;
});
fs.writeFileSync('../../data/forum-non-matches.txt', nonMatches, 'utf8');
console.log('non-matches: ' + data.length);