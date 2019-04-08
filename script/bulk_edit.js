let recursiveReadSync = require('recursive-readdir-sync');
let rimraf = require('rimraf');
let fs = require('fs');
let child_process = require('child_process');
let editor = require('editor');
let mkdirp = require('mkdirp-sync');
let startArgument;
let finishArgument;
let argumentArray = process.argv.slice(3);

if (argumentArray.includes('--start') || argumentArray.includes('-s')) {
  let index = Math.max(argumentArray.indexOf('--start'), argumentArray.indexOf('-s')) ;
  argumentArray.splice(index, 1);
  generateBulkFile(false);
  storeFilesToErase();
  logEditInstructions();
} else if (argumentArray.includes('--finish') || argumentArray.includes('-f')) {
  let index = Math.max(argumentArray.indexOf('--finish'), argumentArray.indexOf('-f')) ;
  argumentArray.splice(index, 1);
  readTempfileAndUpdateDgs()
} else {
  let filesToErase = generateBulkFile(true);
  openEditorAndWriteOnSave(filesToErase);
}

function generateBulkFile(useDotfile) {
  if (!fs.existsSync('./topics')) {
    throw "Must be in a projects directory with a topics folder"
  }

  if (argumentArray.length === 0) {
    argumentArray = ['/'];
  }

  let selectedFilesPerArgument = argumentArray.map(function(argumentString) {
    let pathToArgument = process.cwd() + '/topics' + argumentString;

    if (argumentString.match(/\/$/)) {
      if (argumentString === './') {
        pathToArgument = process.cwd() + '/topics';
      }

      // argument is directory with trailing slash, recursive
      return recursiveReadSync(pathToArgument).filter(function(path){
        return path.endsWith('.dgs');
      });
    } else if (pathToArgument.endsWith('.dgs')) {
      // argument is single file
      return [pathToArgument];
    } else {
      // Dot, is root directory non-recursive
      if (argumentString === '.') pathToArgument = process.cwd() + '/topics';

      // argument is directory with no trailing slash, just its contents
      return fs.readdirSync(pathToArgument).filter(function(path){
        return path.endsWith('.dgs');
      }).map(function(fileName) { return pathToArgument + '/' + fileName });
    }
  });

  filesToErase = {};
  [].concat.apply([], selectedFilesPerArgument).map(function(path){
    filesToErase[path.match(/(topics.+)/)[1]] = true;
  });

  let tempFileData = selectedFilesPerArgument.map(function(filePathArray) {
    return filePathArray.sort(pathComparator).map(function(filePath) {
      let fileContents = fs.readFileSync(filePath, 'utf8');
      let displayPath = filePath.match(/(topics.*\/)\w+\.dgs/)[1];
      return tempFileString = displayPath + "\n\n" + fileContents + "\n\n";
    }).join('');
  }).join('');

  if (!tempFileData) {
    tempFileData =
      `topics/

      Here is a topic name: Here is a paragraph for that topic.

      Here is a subtopic name: Here is a paragraph for that subtopic.


      topics/subdirectory

      Here is another topic name: Here is a paragraph for that topic.

      Here is another subtopic name: Here is a paragraph for that subtopic.
      `.replace(/\n[ ]+/g, "\n");
  }

  fs.writeFileSync((useDotfile ? '.' : '') + 'canopy_bulk_temp', tempFileData);

  return filesToErase;
}

function storeFilesToErase() {
  fs.writeFileSync('.files_to_erase', JSON.stringify(filesToErase));
}

function openEditorAndWriteOnSave(filesToErase) {
  editor('.canopy_bulk_temp', function (code, sig) {
    if (code === 0) {
      let tempFileContents = fs.readFileSync('.canopy_bulk_temp', 'utf8');
      reconstructDgsFilesFromTempFile(tempFileContents, filesToErase);
      fs.unlinkSync('.canopy_bulk_temp');
    } else {
      throw "Error occured when editing canopy bulk temp file";
    }
  });
}

function logEditInstructions() {
  console.log();
  console.log('  Now edit `canopy_bulk_temp`, and when finished run `canopy bulk --finish`');
  console.log();
}

function readTempfileAndUpdateDgs() {
  let tempFileContents = fs.readFileSync('canopy_bulk_temp', 'utf8');
  let filesToErase = JSON.parse(fs.readFileSync('.files_to_erase', 'utf8'));
  reconstructDgsFilesFromTempFile(tempFileContents, filesToErase);
  fs.unlinkSync('canopy_bulk_temp');
  fs.unlinkSync('.files_to_erase');
}

function reconstructDgsFilesFromTempFile(tempFileContents, filesToErase) {
  tempFileContents.split(/(?=topics\/)/).forEach(function(textForFile) {
    if (!textForFile) { return; }
    let pathToFile = textForFile.match(/(topics(\/[^\n\/]+)*)\/?/)[1] + '/';
    let dgsFileContentsWithDisplaySpacing = textForFile.split("\n\n").slice(1).join("\n\n");
    if (dgsFileContentsWithDisplaySpacing.slice(-2) !== "\n\n") {
      dgsFileContentsWithDisplaySpacing = dgsFileContentsWithDisplaySpacing + "\n";
    }
    let dgsFileContentsWithOutDisplaySpacing = dgsFileContentsWithDisplaySpacing.split("\n").slice(0, -2).join("\n");
    let fileTopicKey = dgsFileContentsWithOutDisplaySpacing.match(/^([^:.,;]+):\s+/)[1];
    let filenameString = removeMarkdownTokens(fileTopicKey).replace(/ /g, '_').toLowerCase().trim();
    let finalPath = pathToFile + filenameString + '.dgs';
    filesToErase[finalPath] = false;

    mkdirp(pathToFile);

    let previousValue;
    if (fs.existsSync(finalPath)) {
      previousValue = fs.readFileSync(finalPath, 'utf8');
    }

    if (previousValue === dgsFileContentsWithOutDisplaySpacing) {
      console.log('No changes to file: ' + finalPath);
    } else {
      fs.writeFileSync(finalPath, dgsFileContentsWithOutDisplaySpacing);
      console.log('Wrote to file: ' + finalPath);
    }
  });

  for (let path in filesToErase) {
    if (filesToErase[path]) {
      console.log('Deleting file: ' + path);
      fs.unlinkSync(path);

      let pathSegments = path.split('/');
      for (let i = pathSegments.length; i > 2; i--) {
        pathSegments = pathSegments.slice(0, -1);
        let path = pathSegments.join('/');
        if (fs.readdirSync(path).length === 0) {
          console.log('Deleting directory: ' + path);
          fs.rmdirSync(path);
        }
      }
    }
  }
}

function removeMarkdownTokens(string) {
  return string.
    replace(/([^\\]|^)_/g, '$1').
    replace(/([^\\]|^)\*/g, '$1').
    replace(/([^\\]|^)~/g, '$1');
}

function pathComparator(item1, item2) {
  let path1WithoutFilename = item1.match(/(.+)\/.+\.dgs/)[1];
  let path2WithoutFilename = item2.match(/(.+)\/.+\.dgs/)[1];

  if (path1WithoutFilename > path2WithoutFilename) {
    return 1;
  } else if (path1WithoutFilename < path2WithoutFilename) {
    return -1;
  } else {
    return 0;
  }
}
