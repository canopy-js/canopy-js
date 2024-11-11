let fs = require('fs-extra');
let FileSet = require('./file_set');
let chalk = require('chalk');
let { DefaultTopic } = require('../shared/fs-helpers');

class FileSystemManager {
  execute(fileSystemChange, logging) {
    fileSystemChange.fileDeletions.forEach(filePath => {
      if (filePath === 'canopy_default_topic') return; // rewrite don't delete in case sigint
      fs.unlinkSync(filePath);
    });

    fileSystemChange.directoryDeletions.forEach(directoryPath => {
      if (fs.existsSync(directoryPath)) { // parent directory might have already been recursively deleted
        fs.rmSync(directoryPath, { recursive: true });
      }
    });

    fileSystemChange.directoryCreations.forEach(directoryPath => {
      fs.ensureDirSync(directoryPath);
    });

    fileSystemChange.fileCreations.forEach(([filePath, fileContents]) => {
      fs.writeFileSync(filePath, fileContents);
    });

    fileSystemChange.fileAppendings.forEach(([filePath, fileContents]) => {
      fs.writeFileSync(filePath, fileContents);
    });

    if (logging) {
      fileSystemChange.messages.forEach(message => {
        console.log(message);
      });
    }
  }

  getFileSet(filePathList) {
    let fileContentsByPath = {};

    filePathList.filter(fp => fs.existsSync(fp)).forEach(filePath => {
      let fileContents = fs.readFileSync(filePath).toString();
      fileContentsByPath[filePath] = fileContents;
    });

    return new FileSet(fileContentsByPath);
  }

  createBulkFile(fileName, fileContents) {
    fs.writeFileSync(fileName, fileContents);
  }

  backupBulkFile(fileName, fileContents) {
    if (!fs.existsSync('.canopy_bulk_backups')) { fs.ensureDirSync('.canopy_bulk_backups'); }
    let date = new Date();
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth()+1)).slice(-2)
    let day = ('0' + date.getDate()).slice(-2)
    let hours = ('0' + date.getHours()).slice(-2)
    let minutes = ('0' + date.getMinutes()).slice(-2)
    let seconds = ('0' + date.getSeconds()).slice(-2)
    let timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    fs.writeFileSync(`.canopy_bulk_backups/${fileName}-${timestamp}`, fileContents);
  }

  storeOriginalSelectionFileSet(fileSet) {
    fs.writeFileSync('.canopy_bulk_original_selection', fileSet.json);
  }

  storeOriginalSelectionFileList(fileList) {
    fs.writeFileSync('.canopy_bulk_original_selection', JSON.stringify(fileList));
  }

  loadOriginalSelectionFileSet() {
    if (!fs.existsSync('.canopy_bulk_original_selection')) {
      console.error(chalk.red('Expected .canopy_bulk_original_selection file but did not find one'));
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
    let newBulkFileString = fs.readFileSync(fileName).toString()
    if (typeof newBulkFileString !== 'string') console.error(chalk.red(`Expected bulk file at ./${options.bulkFileName} but did not find one`)) || process.exit();

    return newBulkFileString;
  }

  deleteBulkFile(fileName) {
    fs.unlinkSync(fileName);
  }

  persistDefaultTopicPath(newDefaultTopicPath, newDefaultTopicName) {
    try {
      let defaultTopic = new DefaultTopic();
      if (defaultTopic.name !== newDefaultTopicName) console.log(chalk.yellow(`Changing default topic from [${existingKey}] to [${newDefaultTopicName}]`));
    } catch(e){} // if the file system has gotten in a bad state and the old default topic isn't available, just persist the new one.

    fs.writeFileSync('canopy_default_topic', newDefaultTopicPath + '\n');
  }
}

module.exports = FileSystemManager;
