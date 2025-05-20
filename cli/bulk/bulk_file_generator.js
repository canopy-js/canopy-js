let Topic = require('../shared/topic');

class BulkFileGenerator {
  constructor(fileSet, defaultTopicFilePath) {
    this.fileSet = fileSet;
    const defaultTopicDisplayCategoryPath = defaultTopicFilePath.split('/').slice(1, -1).join('/');
    this.directoryComparator = generateDirectoryComparator(defaultTopicDisplayCategoryPath);
    this.defaultTopicFilePath = defaultTopicFilePath;
  }

  generateBulkFile() {
    return this.fileSet.directories.sort(this.directoryComparator)
      .filter(d => d.files.find(f => f.path.endsWith('.expl'))) // a directory must have at least one expl file to be rendered
      .map(directory => {
        let shortestCategoryMatchFile = findShortestCategoryMatchFile(directory.files);

        return `[${directory.displayPath}]\n\n` // two newlines after the category path header
          + directory
            .files
            .sort(generateFileComparator(this.defaultTopicFilePath, shortestCategoryMatchFile))
            .filter(f => f.path.endsWith('.expl'))
            .map(file =>
              (this.generateInitialAsterisks(file))
                + (file.contents.replace(/\n\n+/g, '\n\n').trim()) // trim trailing newlines to ensure spacing is consistent
            ).join('\n\n');

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
  };
}

function generateFileComparator(defaultTopicFilePath, shortestCategoryMatchFile) {
  return function fileComparator(file1, file2) {
    if (file1.path === defaultTopicFilePath) return -1;
    if (file2.path === defaultTopicFilePath) return 1;

    if (file1.path === shortestCategoryMatchFile?.path) return -1;
    if (file2.path === shortestCategoryMatchFile?.path) return 1;

    if (file1.path > file2.path) return 1;
    if (file1.path < file2.path) return -1;
  };
}

function findShortestCategoryMatchFile(files) {
  return files
    .filter(f => {
      let immediateDir = f.path.split('/').slice(-2, -1)[0];
      let filename = f.path.split('/').slice(-1)[0].toUpperCase();
      return filename.includes(immediateDir.toUpperCase());
    })
    .filter(f => f.key) // only topic files are eligible for pinning, and category notes file is hoisted separately
    .map(f => {
      let parts = f.path.split('/');
      let intermediates = parts.slice(1, -2); // skip "topics" and file itself
      let filename = parts.slice(-1)[0].replace(/\.expl$/, '');

      // Remove intermediary substrings from filename
      let cleaned = intermediates.reduce((name, dir) =>
        name.replace(new RegExp(dir.replace(/_/g, ' ').replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'ig'), ''), filename
      );

      return { file: f, cleanedLength: cleaned.length };
    })
    .sort((a, b) => a.cleanedLength - b.cleanedLength || a.file.path.localeCompare(b.file.path))[0]?.file || null;
}

module.exports = BulkFileGenerator;
