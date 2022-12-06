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
  let directoryPathA = messageA.match(/(topics\/[^ .\x1B]+)(?!\w*\.)(\/\w+\.expl)?/)[1]; // the directory path
  let directoryPathB = messageB.match(/(topics\/[^ .\x1B]+)(?!\w*\.)(\/\w+\.expl)?/)[1]; // (?!\w*\.) = exclude the file name
  let fullPathA = messageA.match(/(topics\/[^ .\x1B]+)(?!\w*\.)(\/\w+\.expl)?/)[0];
  let fullPathB = messageB.match(/(topics\/[^ .\x1B]+)(?!\w*\.)(\/\w+\.expl)?/)[0];

  if (messageA.includes('Deleted') && !messageB.includes('Deleted')) { // Deletions should come before creations
    return -1;
  } else if (!messageA.includes('Deleted') && messageB.includes('Deleted')) {
    return 1;
  }

  if (messageA.includes('Deleted') && messageB.includes('Deleted')) { // in deletes, subsuming paths come first
    if (fullPathA.includes(fullPathB)) return -1;
    if (fullPathB.includes(fullPathA)) return 1;
    if (directoryPathA.includes(directoryPathB) && directoryPathA !== directoryPathB) return -1; // topics/A/B/D/E/Topic3.expl should be before topics/A/B/D/Topic2.expl, not alphabetized
    if (directoryPathB.includes(directoryPathA) && directoryPathA !== directoryPathB) return 1;
  }

  if (!messageA.includes('Deleted') && !messageB.includes('Deleted')) { // in adds subsuming paths come second
    if (fullPathA.includes(fullPathB)) return 1;
    if (fullPathB.includes(fullPathA)) return -1;
    if (directoryPathA.includes(directoryPathB) && directoryPathA !== directoryPathB) return 1; // topics/A/B/D/Topic2.expl should be before topics/A/B/D/E/Topic3.expl, not alphabetized
    if (directoryPathB.includes(directoryPathA) && directoryPathA !== directoryPathB) return -1;
  }

  if (directoryPathA < directoryPathB) return -1; // otherwise alphabetize by path, within the separated deletes and additions
  if (directoryPathA > directoryPathB) return 1;
}

module.exports = FileSystemChange;
