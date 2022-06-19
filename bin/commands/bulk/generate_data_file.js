let dedent = require('dedent');
let fs = require('fs-extra');
let fsPath = require('path');
let { keyFromFile, takeDirectoryPath, fileWithoutFirstKey } = require('./helpers');

function generateDataFile(fileList, blank) {
	if (fileList.length === 0) return blank ? '' : defaultText();
	return fileList.map((filePath) => {
    dataText = generateDisplayFilePath(filePath);
		dataText += ":\n\n";
    dataText += fileWithoutFirstKey(fs.readFileSync(filePath).toString().trim());
		return dataText;
	}).join("\n\n\n\n") + "\n\n\n";
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

function generateDisplayFilePath(filePath) {
  filePath = takeDirectoryPath(filePath);
  let result = [];

  let pathSegmentArray = filePath.split('/');
  for (let i = pathSegmentArray.length; i > 0; i--) {
    let currentPath = pathSegmentArray.slice(0, i).join('/');
    let currentSegment = pathSegmentArray[i - 1].replace(/_/g, ' ');
    let filePath = `topics/${currentPath}/${currentSegment}.expl`.replace(/ /g, '_');
    let fileContents = fs.existsSync(filePath) && fs.readFileSync(filePath).toString();
    let topicKey = fileContents && keyFromFile(fileContents);
    result.unshift(topicKey || currentSegment);
  }
  return result.join('/');
}

module.exports = generateDataFile;
