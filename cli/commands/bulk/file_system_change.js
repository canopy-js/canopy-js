let chalk = require('chalk');

class FileSystemChange {
  constructor() {
    this.fileDeletions = [];
    this.directoryDeletions = [];
    this.fileCreations = [];
    this.fileAppendings = [];
    this.directoryCreations = [];
    this.messages = [];
  }

  deleteFile(filePath) {
    this.fileDeletions.push(filePath);
    this.addMessage(chalk.red(`Deleted file: ${filePath}`));
  }

  deleteDirectory(directoryPath) {
    this.directoryDeletions.push(directoryPath);
    this.addMessage(chalk.red(`Deleted directory: ${directoryPath}`));
  }

  createFile(filePath, fileContents) {
    this.fileCreations.push([filePath, fileContents]);
    this.addMessage(chalk.green(`Created file: ${filePath}`));
  }

  updateFile(filePath, fileContents) {
    this.fileCreations.push([filePath, fileContents]);
    this.addMessage(chalk.green(`Updated file: ${filePath}`));
  }

  appendToFile(filePath, fileContents) {
    this.fileAppendings.push([filePath, fileContents]);
    this.addMessage(chalk.yellow(`Appended to file: ${filePath}`));
  }

  createDirectory(directoryPath) {
    this.directoryCreations.push(directoryPath);
    this.addMessage(chalk.green(`Created directory: ${directoryPath}`));
  }

  addMessage(string) {
    this.messages.push(string);
    this.sortMessages();
  }

  sortMessages() {
    this.messages.sort(messageComparator);
  }
}

function messageComparator(messageA, messageB) {
  let pathA = messageA.match(/(topics\/[^ .\x1B]+)(?!\w*\.)(\/\w+\.expl)?/)[1]; // the directory path
  let pathB = messageB.match(/(topics\/[^ .\x1B]+)(?!\w*\.)(\/\w+\.expl)?/)[1]; // (?!\w*\.) = exclude the file name

  if (messageA.includes('Deleted') && !messageB.includes('Deleted')) { // Deletions should come before creations
    return -1;
  } else if (!messageA.includes('Deleted') && messageB.includes('Deleted')) {
    return 1;
  }

  if (messageA.includes('Deleted') && messageB.includes('Deleted')) {
    if (pathA < pathB) return 1; // for deletions, longer paths are deleted before their enclosing paths
    if (pathA > pathB) return -1;
  } else {
    if (pathA < pathB) return -1; // for additions, enclosing paths are created before their longer child paths
    if (pathA > pathB) return 1;
  }
}

module.exports = FileSystemChange;
