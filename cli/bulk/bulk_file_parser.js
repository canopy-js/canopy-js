let FileSet = require('./file_set');
let Block = require('../shared/block.js');
let Topic = require('../shared/topic.js');
let chalk = require('chalk');
let { formatErrorWithFrames, renderContextFrame } = require('../shared/error_context');

class BulkFileParser {
  constructor(bulkFileString, bulkFileName) {
    this.bulkFileString = bulkFileString;
    this.bulkFileName = bulkFileName;
  }

  parseSections() {
    return this.bulkFileString.split(/(?:^|\n\s*\n)(?=\[[^[\]\r\n]+\](?:\r?\n|$))/g) // split only on [XYZ] on its own line and after a blank line or start
      .map(s => s.trim()).filter(Boolean).map((sectionString) => {
        let displayCategoryPath = sectionString.match(/\[\/?(.*?)\/?\]/)?.[1];
        if (!displayCategoryPath) throw new Error('Malformed Canopy bulk file: ' + sectionString);

        return {
          displayCategoryPath,
          diskDirectoryPath: 'topics/' + Topic.convertSpacesToUnderscores(displayCategoryPath),
          terminalCategory: Topic.convertSpacesToUnderscores(displayCategoryPath.split('/').slice(-1)[0]),
          files: [...sectionString
            .split(/\n/).slice(1).join('\n').trim() // In case only one newline after [category]
            .matchAll(/(?:^\n|^|\n\s*\n)((?:\*\*? )?(?:(?!\n\s*\n\*\*?\s).)+)/gs)].map(match => match[1])
            .map(string => {
              // console.error(string, string.match(/^\*?\*? ?(.*)/s)[1])
              let blockString = string.match(/^\*?\*? ?(.*)/s)[1];
              let block = new Block(blockString);
              return {
                asterisk: string.match(/^\*\*? /) ? true : false,
                doubleAsterisk: string.startsWith('** ') ? true : false,
                key: block.key,
                text: blockString
              };
            })
        };
      });
  }

  generateFileSet() {
    let fileContentsByPath = {};
    let defaultTopicPath;
    let defaultTopicKey;

    this.parseSections().forEach(section => {
      if (section.diskDirectoryPath === 'topics/') {
        throw new Error(chalk.red(`Invalid directory path: "[${section.displayCategoryPath}]"`));
      }

      let categoryNotesFilePath = `${section.diskDirectoryPath}/${section.terminalCategory}.expl`;
      let categoryNotesBuffer = '';

      section.files.forEach((file) => {

        if (file.asterisk && file.key) { // Create topic file
          let topicFilePath = `${section.diskDirectoryPath}/${Topic.for(file.key).topicFileName}.expl`;

          if (fileContentsByPath.hasOwnProperty(topicFilePath)) {
            throw duplicateTopicErrorForBulk(this.bulkFileString, this.bulkFileName, file.key);
          }

          fileContentsByPath[topicFilePath] = file.text.replace(/\n\n+/g, '\n\n').trim() + '\n';

          if (file.doubleAsterisk) {
            if (defaultTopicPath) {
              console.error(chalk.red(`Error: Multiple default topics set: [${file.key}] and [${defaultTopicKey}], using [${defaultTopicKey}]`));
            } else {
              defaultTopicPath = topicFilePath;
              defaultTopicKey = file.key;
            }
          }
        } else { // Add to category notes
          categoryNotesBuffer += (categoryNotesBuffer ? '\n' : '') + file.text.trim() + '\n';
        }
      });

      if (categoryNotesBuffer) {
        let existingContents = fileContentsByPath[categoryNotesFilePath];
        fileContentsByPath[categoryNotesFilePath] = (existingContents ? existingContents + '\n' : '') + categoryNotesBuffer;

        fileContentsByPath[categoryNotesFilePath] = fileContentsByPath[categoryNotesFilePath].replace(
          /(^[^-][^:;.,?!]*[^\\])(?=[:?](?=\s|$))/, // escape characters that will make notes look like topics later
          '$1\\'
        );
      }
    });

    return { newFileSet: new FileSet(fileContentsByPath), defaultTopicPath, defaultTopicKey };
  }
}

function duplicateTopicErrorForBulk(bulkFileString, bulkFileName, key) {
  const escapedKey = String(key).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex-sensitive characters
  const keyRegex = new RegExp(`^(\\*\\*|\\*)\\s+${escapedKey}(?:\\s|:|$)`, 'gm');
  const matches = [...bulkFileString.matchAll(keyRegex)];
  const lineAt = (index) => bulkFileString.slice(0, index).split('\n').length;
  const lineStartAt = (index) => bulkFileString.lastIndexOf('\n', index - 1) + 1;
  const frames = matches
    .slice(0, 2)
    .map(match => {
      const line = lineAt(match.index);
      const col = match.index - lineStartAt(match.index) + 1;
      const label = `${bulkFileName}:${line}${col ? `:${col}` : ''}`;
      return renderContextFrame({
        sourceText: bulkFileString,
        line,
        col,
        label,
        radius: 1,
        includeLabel: true
      });
    })
    .filter(Boolean);
  const message = `Error: Topic [${key}] is defined twice in bulk file.`;
  if (frames.length) {
    return new Error(chalk.bgRed(chalk.white(formatErrorWithFrames(message, frames))));
  }
  const lineRefs = matches
    .slice(0, 2)
    .map(match => `- ${bulkFileName}:${lineAt(match.index)}`)
    .join('\n');
  const locationNote = lineRefs ? `\n${lineRefs}` : '';
  return new Error(chalk.bgRed(chalk.white(`${message}${locationNote}`)));
}

module.exports = BulkFileParser;
