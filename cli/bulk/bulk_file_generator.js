let Paragraph = require('../shared/paragraph');
let Topic = require('../shared/topic');

class BulkFileGenerator {
  constructor(fileSet, defaultTopicDisplayCategoryPath, defaultTopicFilePath) {
    this.fileSet = fileSet;
    this.directoryComparator = generateDirectoryComparator(defaultTopicDisplayCategoryPath);
    this.fileComparator = generateFileComparator(defaultTopicFilePath);
    this.defaultTopicFilePath = defaultTopicFilePath;
  }

  generateBulkFile() {
    return this.fileSet.directories.sort(this.directoryComparator)
      .filter(d => d.files.find(f => f.path.endsWith('.expl'))) // a directory must have at least one expl file to be rendered
      .map(directory => {
        return `[${directory.displayPath}]\n\n` // two newlines after the category path header
          + directory
              .files
              .sort(this.fileComparator)
              .filter(f => f.path.endsWith('.expl'))
              .map(file =>
                (this.generateInitialAsterisks(file))
                + file.contents.replace(/\n\n+/g, '\n\n').trim() // trim trailing newlines to ensure spacing is consistent
              ).join('\n\n\n'); // three newlines between files

      }).join('\n\n\n') // three newlines between the last file and the next category
      + '\n\n'; // two newlines at the end for space when adding
  }

  generateInitialAsterisks(file) {
    if ((file.categoryNotes && file.key && Topic.for(file.key).mixedCase === file.terminalCategory) || // if the initial key of a category notes file matches the category, it is a category topic
      (!file.categoryNotes && file.key)) { // if the file is not a category notes file and it has a key, it is a regular topic file

      if (file.path === this.defaultTopicFilePath) {
        return '** '; // default topic
      } else {
        return '* '; // regular topic file
      }

    } else {
      return ''; // notes file
    }
  }
}

function generateDirectoryComparator(defaultTopicDisplayCategoryPath) {
  return function directoryComparator(directory1, directory2) {
    if (directory1.displayPath === 'Inbox') return 1;
    if (directory2.displayPath === 'Inbox') return -1;

    if (directory1.displayPath === defaultTopicDisplayCategoryPath) return -1;
    if (directory2.displayPath === defaultTopicDisplayCategoryPath) return 1;

    if (directory1.displayPath > directory2.displayPath) return 1;
    if (directory1.displayPath < directory2.displayPath) return -1;
  }
}

function generateFileComparator(defaultTopicFilePath) {
  return function fileComparator(file1, file2) {
    if (file1.path === defaultTopicFilePath) return -1;
    if (file2.path === defaultTopicFilePath) return 1;

    if (file1.key === file1.terminalCategory) return -1;
    if (file2.key === file2.terminalCategory) return 1;

    if (file1.key.replace(/\([^)]*\)/g, '').trim() === file1.terminalCategory) return -1;
    if (file2.key.replace(/\([^)]*\)/g, '').trim() === file2.terminalCategory) return -1;

    if (file1.path > file2.path) return 1;
    if (file1.path < file2.path) return -1;
  }
}

module.exports = BulkFileGenerator;
