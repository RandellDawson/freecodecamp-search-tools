const fs = require('fs');
const puppeteer = require('puppeteer');

function extractItems() {
  const extractedElements = document.querySelectorAll('.fps-result > .fps-topic > .topic > .search-link');
  const items = [];
  for (let element of extractedElements) {
    items.push(element.href);
  }
  return items;
}

async function scrapeInfiniteScrollItems(
  page,
  extractItems,
  itemTargetCount,
  scrollDelay = 2000,
) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemTargetCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitFor(scrollDelay);
    }
  } catch(e) { }
  return items;
}

(async () => {
  console.log('Retrieving data...');
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 926 });
  const url = 'https://www.freecodecamp.org/forum/search?expanded=true&q=freeCodeCamp%20Challenge%20Guide%3A%20%40camperbot'
  await page.goto(url);
  const items = await scrapeInfiniteScrollItems(page, extractItems, 300);
  fs.writeFileSync('../../data/forum-article-urls.json', JSON.stringify(items, null, '  '));
  await browser.close();
  console.log('Finishing retrieving data.')
  console.log('Retrieved ' + items.length + ' forum topic urls.');
})();