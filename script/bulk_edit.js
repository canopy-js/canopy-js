let recursiveReadSync = require('recursive-readdir-sync');
let rimraf = require('rimraf');
let fs = require('fs');
let child_process = require('child_process');
let editor = require('editor');
let mkdirp = require('mkdirp-sync');

let argumentArray = process.argv.slice(3);
if (argumentArray.length === 0) { argumentArray = ['/'] }

if (!fs.existsSync('./topics')) {
  throw "Must be in a projects directory with a topics folder"
}

function removeMarkdownTokens(string) {
  return string.
    replace(/([^\\]|^)_/g, '$1').
    replace(/([^\\]|^)\*/g, '$1').
    replace(/([^\\]|^)~/g, '$1');
}

let selectedFilesPerArgument = argumentArray.map(function(argumentString) {
  let pathToArgument = process.cwd() + '/topics' + argumentString;

  if (argumentString.match(/\/$/)) {
    // argument is directory with trailing slash, recursive
    return recursiveReadSync(pathToArgument).filter(function(path){
      return path.endsWith('.dgs');
    });
  } else if (pathToArgument.endsWith('.dgs')) {
    // argument is single file
    return [pathToArgument];
  } else {
    // argument is directory with no trailing slash, just its contents
    return fs.readdirSync(pathToArgument).filter(function(path){
      return path.endsWith('.dgs');
    }).map(function(fileName) { return pathToArgument + '/' + fileName });
  }
});

let filesToErase = {};
[].concat.apply([], selectedFilesPerArgument).map(function(path){
  filesToErase[path.match(/(topics.+)/)[1]] = true;
});

let tempFileData = selectedFilesPerArgument.map(function(filePathArray) {
  return filePathArray.map(function(filePath) {
    let fileContents = fs.readFileSync(filePath, 'utf8');
    let displayPath = filePath.match(/(topics.*\/)\w+\.dgs/)[1];
    return tempFileString = displayPath + "\n\n" + fileContents + "\n\n";
  }).join('');
}).join('');

fs.writeFileSync('.canopy_bulk_tmp', tempFileData);

editor('.canopy_bulk_tmp', function (code, sig) {
  if (code === 0) {
    let tempFileContents = fs.readFileSync('.canopy_bulk_tmp', 'utf8');
    reconstructDgsFilesFromTempFile(tempFileContents);
    fs.unlinkSync('.canopy_bulk_tmp');
  } else {
    throw "Error occured when editing canopy bulk temp file";
  }
});

function reconstructDgsFilesFromTempFile(tempFileContents) {
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

    mkdirp(pathToFile, function() {
      fs.writeFileSync(finalPath, dgsFileContentsWithOutDisplaySpacing);
      console.log('Wrote to file: ' + finalPath);
    })
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

