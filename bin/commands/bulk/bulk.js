let child_process = require('child_process');
let	canopyLocation = child_process.execSync("echo ${CANOPY_LOCATION:-$(readlink -f $(which canopy) | xargs dirname | xargs dirname)}").toString().trim();
let fs = require('fs-extra');
let editor = require('editor');
let generateDataFile = require('./generate_data_file');
let reconstructProjectFiles = require('./reconstruct_project_files');
let Fzf = require('@dgoguerra/fzf').Fzf;
let {
  recursiveDirectoryFind,
  validatePathsAreDirectories,
  deduplicate,
  getRecursiveSubdirectoryFiles,
  getDirectoryFiles,
  pathComparator
} = require('./helpers');

const bulk = async function(fileList, options) {
  if (!fs.existsSync('./topics')) console.error("Must be in a projects directory with a topics folder") || process.exit();
	let editorMode = !!!(options.start || options.finish);
  options.clear && fs.writeFileSync('.canopy_bulk_backup_log', '');

	if (options.pick) {
    let callback, optionList, postProcess;
    if (options.directories) {
      optionList = recursiveDirectoryFind('topics');
      postProcess = p => getDirectoryFiles(p);
    } else if (options.recursive) {
      optionList = recursiveDirectoryFind('topics').map(p => p + '/**');
      postProcess = p => getRecursiveSubdirectoryFiles(p.match(/([^*]+)(\/\*\*)?/)[1]);
    } else {
      optionList = getRecursiveSubdirectoryFiles('Topics');
      postProcess = p => p;
    }
	  const fzf = new Fzf().multi().result(postProcess);
    fileList = (await fzf.run(optionList)).flat();
	}

  if (fileList.length === 0) {
    if (options.blank) {
      fileList = [];
    } else {
      fileList = getRecursiveSubdirectoryFiles('Topics');
    }
  }

  fileList = deduplicate(fileList).sort(pathComparator);
	let initialData = generateDataFile(fileList, options.blank);

	if (editorMode) {
		fs.writeFileSync('.canopy_bulk_file', initialData);
		editor('.canopy_bulk_file', (code, sig) => {
			let finishedData = fs.readFileSync('.canopy_bulk_file').toString();
			reconstructProjectFiles(finishedData, fileList);
      fs.unlink('.canopy_bulk_file');
		});
	}

	if (options.start) { // non-editor mode
    fs.writeFileSync('canopy_bulk_file', initialData);
		fs.writeFileSync('.canopy_bulk_original_file_list', JSON.stringify(fileList));
	}

	if (options.finish) { // non-editor mode
		let finishedData = fs.readFileSync('canopy_bulk_file').toString();
    let fileList = JSON.parse(fs.readFileSync('.canopy_bulk_original_file_list').toString());
		reconstructProjectFiles(finishedData, fileList);
    fs.unlink('canopy_bulk_file');
    fs.unlink('.canopy_bulk_original_file_list');
	}
}

module.exports = bulk;
