let dedent = require('dedent');
let fs = require('fs-extra');
let fsPath = require('path');
let { keyFromFile, takeDirectoryPath } = require('./helpers');

function generateDataFile(filesByPath, blank) {
	if (filesByPath.length === 0) return blank ? '' : defaultText();
	return Object.keys(filesByPath).map((directoryPath) => {
    let filePaths = filesByPath[directoryPath];
    let displayPath = directoryPath.match(/topics\/([^.]+)$/)[1].replace(/_/g, ' ');
    let dataText = `[${displayPath}]\n\n`;

    let filesOfPath = filePaths.map(filePath => {
      let fileContents = '* ' + fs.readFileSync(filePath).toString().trim();
      return fileContents;
    }).join("\n\n");

    dataText += filesOfPath;

    return dataText;
	}).join("\n\n\n") + "\n\n";
}

function defaultText() {
	return dedent`Topic A:

      Topic A: Here is a paragraph for Topic A.

      Subtopic of A: Here is a paragraph for a subtopic of A.


      Topic A/Topic B:

      Topic B: Here is a paragraph for Topic B.

      Subtopic of B: Here is a paragraph for a subtopic of A.

      ` + "\n\n";
}

module.exports = generateDataFile;
