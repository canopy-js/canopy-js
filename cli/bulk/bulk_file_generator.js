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
  function getFileNameWithoutExtension(path) {
    return path.split('/').pop().replace(/\.[^.]+$/, '');
  }

  function getParentDirectories(path) {
    return path.split('/').slice(0, -1).reverse();
  }

  function normalizeName(name) {
    return name.replace(/_/g, ' ').toUpperCase();
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
    const aNameCaps = a.file.key ? Topic.for(a.file.key).caps : Topic.fromFileName(a.fileName).caps;
    const bNameCaps = b.file.key ? Topic.for(b.file.key).caps : Topic.fromFileName(b.fileName).caps;

    for (let level = 0; level < maxPathDepth; level++) {
      const dirA = a.parentDirectories[level];
      const dirB = b.parentDirectories[level];
      const dirACaps = dirA ? Topic.fromFileName(dirA).caps : null;
      const dirBCaps = dirB ? Topic.fromFileName(dirB).caps : null;

      const aExact = dirACaps && aNameCaps === dirACaps;
      const bExact = dirBCaps && bNameCaps === dirBCaps;
      if (aExact !== bExact) return bExact - aExact;

      const aOverlap = dirACaps ? longestCommonSubstringLength(aNameCaps, dirACaps) : 0;
      const bOverlap = dirBCaps ? longestCommonSubstringLength(bNameCaps, dirBCaps) : 0;
      if (dirA && dirB && dirA === dirB) {
        const aFull = aOverlap === dirACaps.length;
        const bFull = bOverlap === dirBCaps.length;
        if (aFull !== bFull) return bFull - aFull;
        continue;
      }
      if (aOverlap !== bOverlap) return bOverlap - aOverlap;
    }

    const nameCompare = aNameCaps.localeCompare(bNameCaps);
    if (nameCompare !== 0) return nameCompare;
    return a.file.path.localeCompare(b.file.path);
  }

  return candidates.sort(compareCandidates)[0]?.file || null;
}

module.exports = BulkFileGenerator;
