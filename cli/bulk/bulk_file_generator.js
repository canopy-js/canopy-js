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
  function normalizeName(name) {
    return name.replace(/_/g, ' ').toUpperCase();
  }

  function getFileNameWithoutExtension(path) {
    return path.split('/').pop().replace(/\.[^.]+$/, '');
  }

  function getParentDirectories(path) {
    return path.split('/').slice(0, -1).reverse();
  }

  function longestCommonSubstringLength(a, b) {
    const normalizedA = normalizeName(a);
    const normalizedB = normalizeName(b);
    const [shorter, longer] =
      normalizedA.length <= normalizedB.length
        ? [normalizedA, normalizedB]
        : [normalizedB, normalizedA];

    for (let length = shorter.length; length > 0; length--) {
      for (let start = 0; start + length <= shorter.length; start++) {
        const substring = shorter.slice(start, start + length);
        if (longer.includes(substring)) return length;
      }
    }
    return 0;
  }

  const candidates = files
    .filter(file => file.key)
    .map(file => ({
      file,
      fileName: getFileNameWithoutExtension(file.path),
      parentDirectories: getParentDirectories(file.path)
    }));

  if (candidates.length === 0) return null;

  const maxPathDepth = Math.max(...candidates.map(c => c.parentDirectories.length));

  function compareCandidates(a, b) {
    for (let level = 0; level < maxPathDepth; level++) {
      const dirA = a.parentDirectories[level];
      const dirB = b.parentDirectories[level];

      const aExact = dirA && normalizeName(a.fileName) === normalizeName(dirA);
      const bExact = dirB && normalizeName(b.fileName) === normalizeName(dirB);
      if (aExact !== bExact) return bExact - aExact;

      const aOverlap = dirA ? longestCommonSubstringLength(a.fileName, dirA) : 0;
      const bOverlap = dirB ? longestCommonSubstringLength(b.fileName, dirB) : 0;
      if (aOverlap !== bOverlap) return bOverlap - aOverlap;
    }
    return a.file.path.localeCompare(b.file.path);
  }

  return candidates.sort(compareCandidates)[0]?.file || null;
}

module.exports = BulkFileGenerator;
