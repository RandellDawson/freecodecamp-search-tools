const stringify = require('remark-stringify');
const rehype = require('rehype');
const rehype2Remark = require('rehype-remark');

const stringifyMd = rehype()
  .use(rehype2Remark)
  .use(stringify, { fences: true, emphasis: '*' });

// `test` \*not bold\* -> <code>test</code> <em>stuff</em>
// parseMD(filename) -> html; stringify(html) -> md

exports.getMd = async text =>
  stringifyMd.process(text).then(file => file.contents);
