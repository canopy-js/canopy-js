const {
  recursiveDirectoryFind,
  deduplicate,
  getRecursiveSubdirectoryFiles,
  getDirectoryFiles,
  pathComparator,
  groupByPath
} = require('./helpers');

let FileSystemChange = require('./file_system_change');
let FileSet = require('./file_set');

class FileSystemChangeCalculator {
  constructor(newFileSet, originalSelectionFileSet, diskFileSet) {
    if (!(newFileSet instanceof FileSet)) throw new Error('Argument must be of type FileSet');
    if (!(originalSelectionFileSet instanceof FileSet)) throw new Error('Argument must be of type FileSet');
    if (!(diskFileSet instanceof FileSet)) throw new Error('Argument must be of type FileSet');

    this.newFileSet = newFileSet;
    this.originalSelectionFileSet = originalSelectionFileSet;
    this.diskFileSet = diskFileSet;
  }

  calculateFileSystemChange() {
    let fileSystemChange = new FileSystemChange();

    // Identify new directories

    this.newFileSet.directories.forEach(bulkSessionDirectory => {
      if (!this.diskFileSet.hasDirectory(bulkSessionDirectory.path)) {
        fileSystemChange.createDirectory(bulkSessionDirectory.path);
      }
    });

    // Identify new files / appendages

    this.newFileSet.files.forEach(newFile => {
      if (!this.diskFileSet.hasFile(newFile.path)) { // the user created a new file
        fileSystemChange.createFile(newFile.path, newFile.contents);
      } else { // the file does exist on disk already
        if (this.originalSelectionFileSet.hasFile(newFile.path)) { // file was loaded so this would be an overwrite
          if (newFile.contents !== this.diskFileSet.getFileContents(newFile.path)) { // file was changed, so overwrite
            fileSystemChange.updateFile(newFile.path, newFile.contents);
          }
        } else { // the file was never loaded so this is an append
          let originalFileContents = this.diskFileSet.getFileContents(newFile.path)
          fileSystemChange.appendToFile(newFile.path, originalFileContents + '\n' + newFile.contents);
        }
      }
    });

    // Identify files to delete

    this.originalSelectionFileSet.files.forEach(originallySelectedFile => {
      if (!this.newFileSet.hasFile(originallySelectedFile.path)) { // a file that was loaded was deleted
        if (originallySelectedFile.path.endsWith('.expl')) { // other files are not loaded, so their absence is not deletion
          fileSystemChange.deleteFile(originallySelectedFile.path);
        }
      }
    });

    // Identify directories to delete

    this.originalSelectionFileSet.directories.forEach(originallySelectedDirectory => {
      if (!this.newFileSet.hasDirectory(originallySelectedDirectory.path)) { // a directory was selected that got deleted
        if (!this.diskFileSet.files.find(f => f.path.startsWith(originallySelectedDirectory.path) && !f.path.endsWith('.expl'))) { // non-expl files in directory prevent directory deletion
          fileSystemChange.deleteDirectory(originallySelectedDirectory.path);
        }
      }
    });

    return fileSystemChange;
  }
}

module.exports = FileSystemChangeCalculator;
