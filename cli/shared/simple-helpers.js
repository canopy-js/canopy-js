let Topic = require('./topic');

function displaySegment(topic, subtopic) {
  if (topic.mixedCase === subtopic.mixedCase) {
    return `[${topic.mixedCase}]`;
  } else {
    return `[${subtopic.mixedCase} (${topic.mixedCase})]`;
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
      if (string[i] === '[' && oneOpenBracket) (openLink = true) && (oneOpenBracket = false);
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
  }).join('\n').trim()
};

function detectTextDirection(text) {
  // Regular expression patterns for different character ranges
  const rtlChars = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC';
  const ltrChars = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
                   '\u2C00-\uFB1C\uFDFE-\uFE6F\uFEFD-\uFFFF';
  const rtlDirCheck = new RegExp(`^${rtlChars}]+`);//new RegExp(`^[^${ltrChars}]*[${rtlChars}]`); // we now require all letters to be RTL

  // Check if the text is RTL
  return rtlDirCheck.test(text) ? 'rtl' : 'ltr';
}


function parseLink(string, parserContext) {
  let linkMatch = string.match(/^\[\[((?:(?!(?<!(?<!\\)\\)(?:\]\]|\[\[)).)+)\]\]/s);
  if (!linkMatch) return {};
  let linkContents = linkMatch[1];
  let [displayText, targetText, exclusiveDisplayText, exclusiveTargetText] = ['','','',''];
  let linkFullText = linkMatch[0];
  let manualDisplayText = false; // did the user set the display text, or is it inferred from the targetText?
  let exclusiveTargetSyntax = false;
  let exclusiveDisplaySyntax = false;

  if (linkContents.match(/(?<!(?<!\\)\\)\{/)) {
    let segments = Array.from(linkContents.matchAll(/((?<!(?<!\\)\\)\{\{?)((?:(?!(?<!(?<!\\)\\)\}).)+)((?<!(?<!\\)\\)\}\}?)|((?:(?!(?<!(?<!\\)\\)[{}]).)+)/gs));
    segments.forEach(([_, openingBraces, braceContents, closingBraces, plainText]) => {
      if (plainText) { // a section of regular text in a link eg [[ABC...
        displayText += plainText;
        targetText += plainText;
      } else {
        if (openingBraces.length !== closingBraces.length) throw new Error(chalk.red(`Link has unbalanced curly braces: ${linkFullText}\n${parserContext.filePathAndLineNumber}`));
        manualDisplayText = true;

        if (openingBraces.length === 1) { // eg [[{ ... }]]
          let pipeSegments = braceContents.split(/(?<!(?<!\\)\\)\|/);
          if (pipeSegments && pipeSegments.length === 2) { // this is a link text segment such as {A|B}, where A is added to the target text and B is added to the display text
            targetText += pipeSegments[0];
            displayText += pipeSegments[1];
            exclusiveTargetText += pipeSegments[0]; // if we later see an exclusive syntax, retroactively we will have added interpolations to it
            exclusiveDisplayText += pipeSegments[1];
          } else { // this is a link text segment such as {A}, which exclusively selects A as the display text
            exclusiveDisplaySyntax = true;
            exclusiveDisplayText += braceContents;
            targetText += braceContents;
          }
        }

        if (openingBraces.length === 2) { // for a link like {{A}} which exclusively selects A as the target text
          exclusiveTargetSyntax = true;
          exclusiveTargetText += braceContents;
          displayText += braceContents;
        }
      }
    });

    displayText = exclusiveDisplaySyntax ? exclusiveDisplayText : displayText;
    targetText = exclusiveTargetSyntax ? exclusiveTargetText : targetText;
  } else if (linkContents.match(/(?<!(?<!\\)\\)\|/)) { // eg [[A|B]]
    let segments = linkContents.split(/(?<!(?<!\\)\\)\|/);
    targetText = segments[0];
    displayText = segments[1];
    manualDisplayText = true;
  } else { // regular link eg [[London]] or [[England#London]]
    targetText = linkContents;
  }

  let match = targetText.match(/^((?:(?!(?<!(?<!\\)\\)#).)+)(?:#((?:(?!(?<!(?<!\\)\\)#).)+))?$/s); // Match [[a]] or [[a#b]] or [[number\#3#number\#4]]

  return {
    linkTarget: (match && match[1])?.replace(/\n/g, ' ').replace(/<[bB][rR]>/g, ' ') || null, // eg "France"
    linkFragment: (match && match[2])?.replace(/\n/g, ' ').replace(/<[bB][rR]>/g, ' ') || null, // eg "Paris"
    linkText: manualDisplayText ? displayText : (match && (match[2] || match[1] || null)), // The specified link text, defaulting to subtopic
    linkFullText,
    manualDisplayText
  };
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

module.exports = { displaySegment, splitOnPipes, wrapText, detectTextDirection, parseLink, determineTopicAndSubtopic };
