let FileSet = require('./file_set');
let Paragraph = require('../shared/paragraph.js');
let Topic = require('../shared/topic.js');
let chalk = require('chalk');

class BulkFileParser {
  constructor(bulkFileString) {
    this.bulkFileString = bulkFileString;
  }

  parseSections() {
    return this.bulkFileString.split(/(?=\[.*\])/).filter(Boolean).map((sectionString) => {
      let displayCategoryPath = sectionString.match(/\[\/?(.*?)\/?\]/)[1];
      return {
        displayCategoryPath,
        diskDirectoryPath: 'topics/' + Topic.convertSpacesToUnderscores(displayCategoryPath),
        terminalCategory: new Topic(displayCategoryPath.split('/').slice(-1)[0]).fileName,
        files: sectionString
          .split(/\n/).slice(1).join('\n').trim() // In case only one newline after [category]
          .split(/(?=^\* )/mg)
          .filter(Boolean)
          .map(string => {
            let blockString = string.startsWith('* ') ? string.slice(2) : string;
            let paragraph = new Paragraph(blockString);
            return {
              asterisk: string.startsWith('* ') ? true : false,
              key: paragraph.key,
              text: blockString
            }
          })
      }
    });
  }

  getFileSet() {
    let fileContentsByPath = {};
    // console.dir(this.parseSections(), { depth: 6});

    this.parseSections().forEach(section => {
      if (section.diskDirectoryPath === 'topics/') throw new Error(chalk.red(`Invalid directory path: "[${section.displayCategoryPath}]"`));
      let categoryNotesFilePath = `${section.diskDirectoryPath}/${section.terminalCategory}.expl`;
      let categoryNotesBuffer = '';
      section.files.forEach(file => {
        if (file.asterisk && file.key) {
          // Create topic file
          let topicFilePath = `${section.diskDirectoryPath}/${(new Topic(file.key)).fileName}.expl`;
          fileContentsByPath[topicFilePath] = file.text.trim() + '\n';
        } else {
          // Add to category notes
          categoryNotesBuffer += (!!categoryNotesBuffer ? '\n' : '') + file.text.trim() + '\n';
        }

        if (categoryNotesBuffer) {
          fileContentsByPath[categoryNotesFilePath] = categoryNotesBuffer;
        }
      });
    });

    return new FileSet(fileContentsByPath);
  }
}

module.exports = BulkFileParser;
