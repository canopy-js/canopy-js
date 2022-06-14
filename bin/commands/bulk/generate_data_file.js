let dedent = require('dedent');
let fs = require('fs-extra');
let fsPath = require('path');
let { keyFromFile, takeDirectoryPath } = require('./helpers');

function generateDataFile(fileList, blank) {
	if (fileList.length === 0) return blank ? '' : defaultText();
	return fileList.map((filePath) => {
    let file = fs.readFileSync(filePath);
    dataText = filePath.match(/[tT]opics\/([^.]+)\/[^.]+\.expl$/)[1].replace(/_/g, ' ');
		dataText += ":\n\n";
    dataText += file.toString().trim();
		return dataText;
	}).join("\n\n\n\n") + "\n\n\n";
}

function defaultText() {
	return dedent`[Topic A]

      * Topic A: Here is a paragraph for Topic A.

      * Subtopic of A: Here is a paragraph for a subtopic of A.


      [Topic A/Topic B]

      * Topic B: Here is a paragraph for Topic B.

      * Subtopic of B: Here is a paragraph for a subtopic of A.

      ` + "\n\n";
}

module.exports = generateDataFile;
