let fs = require('fs-extra');
let FileSet = require('./file_set');

class FileSystemManager {
  execute(fileSystemChange, logging) {
    fileSystemChange.fileDeletions.forEach(filePath => {
      fs.unlinkSync(filePath);
    });

    fileSystemChange.directoryDeletions.forEach(directoryPath => {
      fs.rmSync(directoryPath, { recursive: true });
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

    filePathList.forEach(filePath => {
      let fileContents = fs.readFileSync(filePath).toString();
      fileContentsByPath[filePath] = fileContents;
    });

    return new FileSet(fileContentsByPath);
  }

  createBulkFile(fileName, fileContents) {
    fs.writeFileSync(fileName, fileContents);
  }

  storeOriginalSelectionFileSet(fileSet) {
    fs.writeFileSync('.canopy_bulk_originally_selected_files_list', fileSet.json);
  }

  storeOriginalSelectionFileList(fileList) {
    fs.writeFileSync('.canopy_bulk_originally_selected_files_list', JSON.stringify(fileList));
  }

  loadOriginalSelectionFileSet() {
    let json = fs.readFileSync('.canopy_bulk_originally_selected_files_list').toString();
    fs.unlinkSync('.canopy_bulk_originally_selected_files_list');
    let selectedFilesList = JSON.parse(json);
    return this.getFileSet(selectedFilesList);
  }

  getOriginalSelectionFileList() {
    let json = fs.readFileSync('.canopy_bulk_originally_selected_files_list').toString();
    let fileList = JSON.parse(json);
    return fileList;
  }

  getBulkFile(fileName) {
    return fs.readFileSync(fileName).toString();
  }

  deleteBulkFile(fileName) {
    fs.unlinkSync(fileName);
  }
}

module.exports = FileSystemManager;
