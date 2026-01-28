function escapeRegExp(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function translateWatchErrorToBulk(error, options = {}) {
  if (!options.sync || !options.bulkFileName || !error?.message) return error;

  const stripAnsi = require('strip-ansi');
  const fs = require('fs');
  if (!fs.existsSync(options.bulkFileName)) return error;

  const Block = require('../shared/block');

  let bulkContents;
  try {
    bulkContents = fs.readFileSync(options.bulkFileName, 'utf8');
  } catch {
    return error;
  }

  const refRegex = /(topics\/[^:\n]+?\.expl):(\d+)(?::(\d+))?/g;
  const topicInfoCache = new Map(); // topicPath -> { bulkStartLine, bulkStartCol, topicKey, subtopicHeaders, topicHeaderIndex }

  // derive the bulk section header from a topic file path
  const toDisplayCategoryPath = (topicPath) =>
    topicPath.split('/').slice(1, -1).map(p => p.replace(/_/g, ' ')).join('/');

  // find where a category block starts in the bulk file
  const findCategoryStart = (displayCategoryPath) => {
    const categoryRegex = new RegExp(`^\\[${escapeRegExp(displayCategoryPath)}\\]$`, 'm');
    const match = bulkContents.match(categoryRegex);
    return match ? match.index : 0;
  };

  // locate the topic header within a category block
  const findTopicHeaderInBulk = (startIndex, topicKey) => {
    const topicRegex = new RegExp(`^(\\*\\*|\\*)\\s+${escapeRegExp(topicKey)}(?:\\s|:|$)`, 'm');
    const match = bulkContents.slice(startIndex).match(topicRegex);
    return match ? startIndex + match.index : null;
  };

  // map subtopic headers to their line numbers in the topic file
  const parseSubtopicHeaders = (topicContents) => {
    const headers = [];
    topicContents.split('\n').forEach((lineText, index) => {
      const key = Block.for(lineText).key;
      if (key) headers.push({ key, line: index + 1 });
    });
    return headers;
  };

  // build bulk lookup info for a topic (header position, line offsets, subtopics)
  const computeTopicInfo = (topicPath) => {
    let topicContents;
    try {
      topicContents = fs.readFileSync(topicPath, 'utf8');
    } catch {
      return null;
    }

    const firstParagraph = topicContents.split(/\n\n/)[0]?.trim() || '';
    const topicKey = Block.for(firstParagraph).key;
    if (!topicKey) return null;

    const displayCategoryPath = toDisplayCategoryPath(topicPath);
    const categoryStart = findCategoryStart(displayCategoryPath);
    const topicHeaderIndex = findTopicHeaderInBulk(categoryStart, topicKey);
    if (topicHeaderIndex === null) return null;

    const bulkUpToKey = bulkContents.slice(0, topicHeaderIndex);
    const bulkStartLine = bulkUpToKey.split('\n').length; // 1-based
    const lastNewlineIdx = bulkUpToKey.lastIndexOf('\n');
    const bulkStartCol = topicHeaderIndex - lastNewlineIdx; // 1-based

    return {
      bulkStartLine,
      bulkStartCol,
      topicKey,
      subtopicHeaders: parseSubtopicHeaders(topicContents),
      topicHeaderIndex
    };
  };

  // locate a subtopic header in bulk after the topic header
  const findSubtopicLineInBulk = (topicInfo, subtopicKey) => {
    const afterTopicIndex = topicInfo.topicHeaderIndex;
    const afterTopicText = bulkContents.slice(afterTopicIndex);
    const subtopicRegex = new RegExp(`^${escapeRegExp(subtopicKey)}(?:\\?|:)(?:\\s|$)`, 'm');
    const subtopicMatch = afterTopicText.match(subtopicRegex);
    if (!subtopicMatch) return null;
    const bulkUpToSubtopic = bulkContents.slice(0, afterTopicIndex + subtopicMatch.index);
    return bulkUpToSubtopic.split('\n').length; // 1-based
  };

  const computeBulkReference = (topicPath, topicLine, topicCol) => {
    // skip if the topic file no longer exists
    if (!fs.existsSync(topicPath)) return null;

    // hydrate and cache bulk metadata for this topic
    let info = topicInfoCache.get(topicPath);
    if (!info) {
      info = computeTopicInfo(topicPath);
      if (!info) return null;
      topicInfoCache.set(topicPath, info);
    }

    // find the active subtopic at the error line
    const currentSubtopic = info.subtopicHeaders
      .filter(({ line }) => line <= topicLine)
      .slice(-1)[0];

    // default to topic-header-aligned line number
    let bulkLine = info.bulkStartLine + topicLine - 1;
    if (currentSubtopic && currentSubtopic.key !== info.topicKey) {
      // refine to the subtopic header in bulk, if present
      const bulkSubtopicLine = findSubtopicLineInBulk(info, currentSubtopic.key);
      if (bulkSubtopicLine) bulkLine = bulkSubtopicLine + (topicLine - currentSubtopic.line);
    }
    // format bulk reference with or without column
    if (!topicCol) return `${options.bulkFileName}:${bulkLine}`;

    const bulkCol = topicLine === 1 ? info.bulkStartCol + topicCol - 1 : topicCol;
    return `${options.bulkFileName}:${bulkLine}:${bulkCol}`;
  };

  const original = String(error.message);
  const sanitized = stripAnsi(original);
  const insertBulkRefs = (text) => text.replace(refRegex, (full, topicPath, lineString, colString, offset, source) => {
    const topicLine = Number(lineString);
    const topicCol = colString ? Number(colString) : null;
    const bulkRef = computeBulkReference(topicPath, topicLine, topicCol);
    if (!bulkRef) return full;
    const afterMatch = source.slice(offset + full.length);
    if (afterMatch.startsWith(`\n${bulkRef}`)) return full; // already translated
    return `${full}\n${bulkRef}`;
  });

  const rewritten = insertBulkRefs(sanitized);

  if (rewritten === sanitized) return error;

  const err = new Error(rewritten);
  if (error?.stack) { // surgically inject bulk refs into stack without duplicating message/context
    const stackText = String(error.stack);
    err.stack = insertBulkRefs(stackText);
  } else {
    err.stack = error?.stack;
  }
  return err;
}

module.exports = translateWatchErrorToBulk;
