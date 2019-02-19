let recursiveReadSync = require('recursive-readdir-sync');
let rimraf = require('rimraf');
let fs = require('fs');
let child_process = require('child_process');
let editor = require('editor');
let mkdirp = require('mkdirp');

let argumentArray = process.argv.slice(3);
if (argumentArray.length === 0) { argumentArray = ['/'] }

if (!fs.existsSync('./topics')) {
  throw "Must be in a projects directory with a topics folder"
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
    });
  }
});

let tempFileData = selectedFilesPerArgument.map(function(filePathArray) {
  return filePathArray.map(function(filePath) {
    let fileContents = fs.readFileSync(filePath, 'utf8');
    let displayPath = filePath.match(/(topics.*\/)\w+\.dgs/)[1];
    return tempFileString = displayPath + "\n\n" + fileContents + "\n\n";
  }).join('');
}).join('');

fs.writeFileSync('.canopy_bulk_tmp', tempFileData);

selectedFilesPerArgument.forEach(function(filePathArray) {
  filePathArray.forEach(function(filePath) {
    fs.unlinkSync(filePath);
  });
})

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
    let pathToFile = textForFile.match(/(topics(\/[^\n\/]+)*)\/?/)[1] + '/';
    let dgsFileContentsWithExtraSpacing = textForFile.split("\n\n").slice(1).join("\n\n");
    let dgsFileContentsWithOutExtraSpacing =
      dgsFileContentsWithExtraSpacing.split("\n").slice(0, -2).join("\n");
    let fileTopicKey = dgsFileContentsWithOutExtraSpacing.match(/^([^:.,;]+):\s+/)[1];
    let filenameString = fileTopicKey.replace(/ /g, '_').toLowerCase().trim();
    let finalPath = pathToFile + filenameString + '.dgs';
    mkdirp(pathToFile, function() {
      fs.writeFileSync(finalPath, dgsFileContentsWithOutExtraSpacing);
      console.log('Wrote to file: ' + finalPath);
    })
  });
}
