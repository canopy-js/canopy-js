let Paragraph = require('../shared/paragraph');

class BulkFileGenerator {
  constructor(fileSet, defaultTopicDisplayCategoryPath, defaultTopicFilePath) {
    this.fileSet = fileSet;
    this.directoryComparator = generateDirectoryComparator(defaultTopicDisplayCategoryPath);
    this.fileComparator = generateFileComparator(defaultTopicFilePath);
  }

  generateBulkFile() {
    return this.fileSet.directories.sort(this.directoryComparator).filter(d => d.files.length > 0).map(directory => {
      return `[${directory.displayPath}]\n\n`
        + directory
            .files
            .sort(this.fileComparator)
            .filter(f => f.path.endsWith('.expl'))
            .map(file =>
              (displayAsterisk(file) ? '* ' : '')
              + file.contents.trim() // trim trailing newlines to ensure spacing is consistent
            ).join('\n\n\n'); // three newlines between files

    }).join('\n\n\n') + '\n\n\n'; // three newlines between the last file and the next category, and three at the end for space when adding
  }
}

function displayAsterisk(file) {
  return (file.categoryNotes && file.key === file.terminalCategory) ||
    (!file.categoryNotes && file.key)
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

    if (file1.path > file2.path) return 1;
    if (file1.path < file2.path) return -1;
  }
}

module.exports = BulkFileGenerator;
