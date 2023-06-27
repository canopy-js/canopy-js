let FileSet = require('./file_set');
let Paragraph = require('../shared/paragraph.js');
let Topic = require('../shared/topic.js');
let chalk = require('chalk');

class BulkFileParser {
  constructor(bulkFileString) {
    this.bulkFileString = bulkFileString;
  }

  parseSections() {
    return this.bulkFileString.split(/(?=^\[[^\[\]]+\]$)/mg) // split only on [XYZ] that is on its own line.
      .map(s => s.trim()).filter(Boolean).map((sectionString) => {
        let displayCategoryPath = sectionString.match(/\[\/?(.*?)\/?\]/)[1];
        return {
          displayCategoryPath,
          diskDirectoryPath: 'topics/' + Topic.convertSpacesToUnderscores(displayCategoryPath),
          terminalCategory: new Topic(displayCategoryPath.split('/').slice(-1)[0]).fileName,
          files: sectionString
            .split(/\n/).slice(1).join('\n').trim() // In case only one newline after [category]
            .split(/(?=^\*\*? )/mg)
            .filter(Boolean)
            .map(string => {
              let blockString = string.match(/^\*?\*? ?(.*)/s)[1];
              let paragraph = new Paragraph(blockString);
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
    let fileCountPerCategory = {};

    this.parseSections().forEach(section => {
      if (section.diskDirectoryPath === 'topics/') throw new Error(chalk.red(`Invalid directory path: "[${section.displayCategoryPath}]"`));
      fileCountPerCategory[section.diskDirectoryPath] ||= 0;

      section.files.forEach((file, index, files) => {
        let paddingSize = String(files.length).length
        let fileNumber = (fileCountPerCategory[section.diskDirectoryPath] || 0) + 1;
        let leadingNumber = files.length > 1 ? (String(fileNumber).padStart(paddingSize, '0') + '-') : '';

        if (file.asterisk && file.key) {
          // Create topic file
          let topicFilePath = `${section.diskDirectoryPath}/${leadingNumber}${Topic.for(file.key).fileName}.expl`;
          if (fileContentsByPath.hasOwnProperty(topicFilePath)) throw new Error(chalk.bgRed(chalk.white(`Error: Topic [${file.key}] is defined twice in bulk file.`)));
          fileContentsByPath[topicFilePath] = file.text.replace(/\n\n+/g, '\n\n').trim() + '\n';

          if (file.doubleAsterisk) {
            if (defaultTopicPath) {
              console.error(chalk.red(`Error: Multiple default topics set: [${file.key}] and [${defaultTopicKey}], using [${defaultTopicKey}]`));
            } else {
              defaultTopicPath = topicFilePath;
              defaultTopicKey = file.key;
            }
          }
        } else {
          let firstFourtyCharacters = file.text.match(/^(([^\n.?!]{0,40}(?![A-Za-z0-9]))|([^\n.?!]{0,40}))/)[0] || section.terminalCategory;
          let noteFileName = `${section.diskDirectoryPath}/${leadingNumber}${Topic.for(firstFourtyCharacters).fileName}.expl`;
          fileContentsByPath[noteFileName] = file.text.replace(/\n\n+/g, '\n\n').trim() + '\n';
        }

        fileCountPerCategory[section.diskDirectoryPath]++;
      });
    });

    return { newFileSet: new FileSet(fileContentsByPath), defaultTopicPath, defaultTopicKey };
  }
}

module.exports = BulkFileParser;
