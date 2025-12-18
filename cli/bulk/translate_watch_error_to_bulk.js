function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function translateWatchErrorToBulk(error, options = {}) {
  if (!options.sync || !options.bulkFileName || !error?.message) return error;

  const fs = require('fs');
  if (!fs.existsSync(options.bulkFileName)) return error;

  const Block = require('../shared/block');

  let bulkContents;
  try {
    bulkContents = fs.readFileSync(options.bulkFileName, 'utf8');
  } catch {
    return error;
  }

  const refRegex = /(topics\/[\w./-]+\.expl):(\d+)(?::(\d+))?/g;
  const topicInfoCache = new Map(); // topicPath -> { bulkStartLine, bulkStartCol }

  const computeBulkRef = (topicPath, topicLine, topicCol) => {
    if (!fs.existsSync(topicPath)) return null;

    let info = topicInfoCache.get(topicPath);
    if (!info) {
      let topicContents;
      try {
        topicContents = fs.readFileSync(topicPath, 'utf8');
      } catch {
        return null;
      }

      const firstParagraph = topicContents.split(/\n\n/)[0]?.trim() || '';
      const key = Block.for(firstParagraph).key;
      if (!key) return null;

      const keyLineRegex = new RegExp(`^(\\*\\*|\\*)\\s+${escapeRegExp(key)}\\b`, 'm');
      const keyMatch = bulkContents.match(keyLineRegex);
      if (!keyMatch) return null;

      const bulkUpToKey = bulkContents.slice(0, keyMatch.index);
      const bulkStartLine = bulkUpToKey.split('\n').length; // 1-based
      const lastNewlineIdx = bulkUpToKey.lastIndexOf('\n');
      const bulkStartCol = keyMatch.index - lastNewlineIdx; // 1-based

      info = { bulkStartLine, bulkStartCol };
      topicInfoCache.set(topicPath, info);
    }

    const bulkLine = info.bulkStartLine + topicLine - 1;
    if (!topicCol) return `${options.bulkFileName}:${bulkLine}`;

    const bulkCol = topicLine === 1 ? info.bulkStartCol + topicCol - 1 : topicCol;
    return `${options.bulkFileName}:${bulkLine}:${bulkCol}`;
  };

  const original = String(error.message);
  const rewritten = original.replace(refRegex, (full, topicPath, lineString, colString) => {
    const topicLine = Number(lineString);
    const topicCol = colString ? Number(colString) : null;
    const bulkRef = computeBulkRef(topicPath, topicLine, topicCol);
    if (!bulkRef) return full;
    return `${full}\n${bulkRef}`;
  });

  if (rewritten === original) return error;

  const err = new Error(rewritten);
  err.stack = error.stack;
  return err;
}

module.exports = translateWatchErrorToBulk;

