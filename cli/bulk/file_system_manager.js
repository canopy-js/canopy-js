let fs = require('fs-extra');
let path = require('path');
let FileSet = require('./file_set');
let chalk = require('chalk');
let { DefaultTopic } = require('../shared/fs-helpers');

const BULK_BACKUP_DIRECTORY = '.canopy_bulk_backups';
const BULK_BACKUP_RETENTION_MS = 60 * 24 * 60 * 60 * 1000;

class FileSystemManager {
  execute(fileSystemChange, logging, options = {}) {
    fileSystemChange.directoryCreations.forEach(directoryPath => {
      fs.ensureDirSync(directoryPath);
    });

    fileSystemChange.fileCreations.forEach(([filePath, fileContents]) => {
      fs.writeFileSync(filePath, fileContents);
    });

    fileSystemChange.fileAppendings.forEach(([filePath, fileContents]) => {
      fs.writeFileSync(filePath, fileContents);
    });

    fileSystemChange.fileDeletions.forEach(filePath => {
      if (filePath === 'canopy_default_topic') return; // rewrite don't delete in case sigint
      fs.unlinkSync(filePath);
    });

    fileSystemChange.directoryDeletions.forEach(directoryPath => {
      if (fs.existsSync(directoryPath)) { // parent directory might have already been recursively deleted
        fs.rmSync(directoryPath, { recursive: true });
      }
    });

    if (options.defaultTopicPath) {
      if (!fs.existsSync(options.defaultTopicPath)) {
        throw new Error(chalk.red(`Error: Cannot write canopy_default_topic because default topic file does not exist yet: ${options.defaultTopicPath}`));
      }
      this.persistDefaultTopicPath(options.defaultTopicPath, options.defaultTopicKey);
    }

    if (logging) {
      fileSystemChange.messages.forEach(message => {
        console.log(message);
      });
    }
  }

  getFileSet(filePathList) {
    let fileContentsByPath = {};

    filePathList.forEach(filePath => {
      try {
        let fileContents = fs.readFileSync(filePath).toString();
        fileContentsByPath[filePath] = fileContents;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    });

    return new FileSet(fileContentsByPath);
  }

  createBulkFile(fileName, fileContents) {
    fs.writeFileSync(fileName, fileContents);
  }

  backupBulkFile(fileName, fileContents) {
    if (!fs.existsSync(BULK_BACKUP_DIRECTORY)) { fs.ensureDirSync(BULK_BACKUP_DIRECTORY); }
    this.deleteExpiredBulkBackups();
    let date = new Date();
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth()+1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2);
    let hours = ('0' + date.getHours()).slice(-2);
    let minutes = ('0' + date.getMinutes()).slice(-2);
    let seconds = ('0' + date.getSeconds()).slice(-2);
    let timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    fs.writeFileSync(this.availableBulkBackupPath(`${fileName}-${timestamp}`), fileContents);
  }

  deleteExpiredBulkBackups() {
    let expirationTime = Date.now() - BULK_BACKUP_RETENTION_MS;
    fs.readdirSync(BULK_BACKUP_DIRECTORY, { withFileTypes: true }).forEach(entry => {
      if (!entry.isFile()) return;
      let backupPath = path.join(BULK_BACKUP_DIRECTORY, entry.name);
      if (fs.statSync(backupPath).mtimeMs < expirationTime) fs.unlinkSync(backupPath);
    });
  }

  availableBulkBackupPath(fileName) {
    let candidatePath = path.join(BULK_BACKUP_DIRECTORY, fileName);
    let suffix = 2;
    while (fs.existsSync(candidatePath)) {
      candidatePath = path.join(BULK_BACKUP_DIRECTORY, `${fileName}-${suffix}`);
      suffix++;
    }
    return candidatePath;
  }

  storeOriginalSelectionFileSet(fileSet) {
    fs.writeFileSync('.canopy_bulk_original_selection', fileSet.json);
  }

  storeOriginalSelectionFileList(fileList) {
    fs.writeFileSync('.canopy_bulk_original_selection', JSON.stringify(fileList));
  }

  loadOriginalSelectionFileSet(options, fallbackFileList = []) {
    if (!fs.existsSync('.canopy_bulk_original_selection')) {
      if (!options.blank) return this.getFileSet(fallbackFileList);
      return new FileSet({});
    }
    let json = fs.readFileSync('.canopy_bulk_original_selection').toString();
    try {
      let selectedFilesList = JSON.parse(json);
      return this.getFileSet(selectedFilesList);
    } catch {
      return this.getFileSet([]);
    }
  }

  deleteOriginalSelectionFile() { // this has to be separate from loadOriginalSelectionFileSet in the case where a parsing error prevents processing
    if (fs.existsSync('.canopy_bulk_original_selection')) {
      fs.unlinkSync('.canopy_bulk_original_selection');
    }
  }

  getOriginalSelectionFileList() {
    let json = fs.readFileSync('.canopy_bulk_original_selection').toString();
    let fileList = JSON.parse(json);
    return fileList;
  }

  getBulkFile(fileName) {
    if (!fs.existsSync(fileName)) {
      return null;
    }
    let newBulkFileString = fs.readFileSync(fileName).toString();
    if (typeof newBulkFileString !== 'string') console.error(chalk.red(`Expected bulk file at ./${fileName} but did not find one`)) || process.exit();

    return newBulkFileString;
  }

  deleteBulkFile(fileName) {
    fs.unlinkSync(fileName);
  }

  persistDefaultTopicPath(newDefaultTopicPath, newDefaultTopicName) {
    try {
      let defaultTopic = new DefaultTopic();
      if (defaultTopic.filePath === newDefaultTopicPath) return;
      if (defaultTopic.name !== newDefaultTopicName) console.log(chalk.yellow(`Changing default topic from [${defaultTopic.name}] to [${newDefaultTopicName}]`));
    } catch(_){  // if the file system has gotten in a bad state and the old default topic isn't available, just persist the new one.
      console.error(chalk.red(`Couldn't find old default topic file, persisting new`));
    }

    fs.writeFileSync('canopy_default_topic', newDefaultTopicPath + '\n');
  }
}

module.exports = FileSystemManager;
