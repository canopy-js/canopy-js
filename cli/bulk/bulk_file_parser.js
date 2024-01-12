let FileSet = require('./file_set');
let Block = require('../shared/block.js');
let Topic = require('../shared/topic.js');
let chalk = require('chalk');

class BulkFileParser {
  constructor(bulkFileString) {
    this.bulkFileString = bulkFileString;
  }

  parseSections() {
    return this.bulkFileString.split(/(?=^\[[^\[\]]+\]$)/mg) // split only on [XYZ] that is on its own line.
      .map(s => s.trim()).filter(Boolean).map((sectionString) => {
        let displayCategoryPath = sectionString.match(/\[\/?(.*?)\/?\]/)?.[1];
        if (!displayCategoryPath) throw new Error('Malformed Canopy bulk file: ' + sectionString);

        return {
          displayCategoryPath,
          diskDirectoryPath: 'topics/' + Topic.convertSpacesToUnderscores(displayCategoryPath),
          terminalCategory: displayCategoryPath.split('/').slice(-1)[0],
          files: sectionString
            .split(/\n/).slice(1).join('\n').trim() // In case only one newline after [category]
            .split(/(?=^\*\*?(?: |\n))/mg)
            .filter(Boolean)
            .map(string => {
              let blockString = string.match(/^\*?\*? ?(.*)/s)[1];
              let paragraph = new Block(blockString);
              return {
                asterisk: string.match(/^\*\*? /) ? true : false,
                doubleAsterisk: string.startsWith('** ') ? true : false,
                key: paragraph.key,
                text: blockString
              }
            })
      }
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

      section.files.forEach((file, index, files) => {
        if (file.asterisk && file.key) { // Create topic file
          let topicFilePath = `${section.diskDirectoryPath}/${Topic.for(file.key).fileName}.expl`;

          if (fileContentsByPath.hasOwnProperty(topicFilePath)) {
            throw new Error(chalk.bgRed(chalk.white(`Error: Topic [${file.key}] is defined twice in bulk file.`)));
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
        } else { // make note file
          let firstFourtyCharacters = file.text.match(/^(([^\n.?!]{0,40}(?![A-Za-z0-9]))|([^\n.?!]{0,40}))/)[0] || section.terminalCategory;
          let fileName = Topic.for(firstFourtyCharacters).fileName;
          let idSuffix = section.orderedCategory ? '' : generateIdSuffix(`${section.diskDirectoryPath}/${fileName}`, `.expl`, fileContentsByPath);
          let noteFileName = `${section.diskDirectoryPath}/${Topic.for(firstFourtyCharacters).fileName}${idSuffix}.expl`;
          fileContentsByPath[noteFileName] = file.text.replace(/\n\n+/g, '\n\n').trim() + '\n';
        }
      });
    });

    return { newFileSet: new FileSet(fileContentsByPath), defaultTopicPath, defaultTopicKey };
  }
}

function generateIdSuffix(prefix, suffix, hash) {
  if (hash.hasOwnProperty(prefix + suffix)) {
    let i = 1;
    while (hash.hasOwnProperty(`${prefix}-${String(i).padStart(2, '0')}${suffix}`)) { i++; }
    return `-${String(i).padStart(2, '0')}`;
  } else {
    return '';
  }
}

module.exports = BulkFileParser;
