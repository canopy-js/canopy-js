let Topic = require('./topic');

function displaySegment(topic, subtopic) {
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F]/;
  const bothHaveRtl = rtlRegex.test(topic.mixedCase) && rtlRegex.test(subtopic.mixedCase);

  if (Topic.areEqual(topic, subtopic)) {
    return `[${topic.mixedCase}]`;
  } else {
    const ltrMark = bothHaveRtl ? '\u200E' : '';
    return `[${topic.mixedCase}${ltrMark}, ${subtopic.mixedCase}]`;
  }
}

function splitOnPipes(string) { // ignore pipes that are escaped or inside links eg [[a|b]]
  let oneOpenBracket = false;
  let oneCloseBracket = false;
  let openLink = false;
  let escape = false;
  let result = [''];

  for (let i = 0; i < string.length; i++) {
    if (string[i] === '|' && !openLink && !escape) {
      result.push('');
    } else {
      result[result.length - 1] += string[i];
      if (string[i] === '\\' && !escape) { escape = true; } else { escape = false; }
      if (string[i] === '[' && !oneOpenBracket) oneOpenBracket = true;
      if (string[i] === '[' && oneOpenBracket) {openLink = true; oneOpenBracket = false;}
      if (string[i] === ']' && openLink && !oneCloseBracket) oneCloseBracket = true;
      if (string[i] === ']' && openLink && oneCloseBracket) openLink = false;

    }
  }

  return result.slice(1, -1);
}

function wrapText(str, width) {
  var paragraphs = str.split('\n');
  return paragraphs.map(paragraph => {
    let words = paragraph.split(' ');
    var lines = [];
    var line = '';
    for (var i = 0; i < words.length; i++) {
      // Check if the current word will fit on the current line.
      if (line.length + ' '.length + words[i].length <= width) {
        line += (line ? ' ': '') + words[i];
      } else {
        // The current word will not fit on the current line.
        lines.push(line);
        line = '  ' + words[i];
      }
    }
    // Add the last line to the output.
    lines.push(line);
    return lines.join('\n');
  }).join('\n').trim();
}

function detectTextDirection(text) {
  // Regular expression patterns for different character ranges
  const rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC';
  const rtlDirCheck = new RegExp(`^${rtlChars}]+`);

  // Check if the text is RTL
  return rtlDirCheck.test(text) ? 'rtl' : 'ltr';
}

function determineTopicAndSubtopic(linkTarget, linkFragment) {
  let targetTopic, targetSubtopic;
  if (linkFragment) {
    targetTopic = new Topic(linkTarget);
    targetSubtopic = new Topic(linkFragment);
  } else {
    targetTopic = null;
    targetSubtopic = new Topic(linkTarget);
  }

  return {
    targetTopic,
    targetSubtopic
  };
}

module.exports = { displaySegment, splitOnPipes, wrapText, detectTextDirection, determineTopicAndSubtopic };
