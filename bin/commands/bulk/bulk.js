let child_process = require('child_process');
let	canopyLocation = child_process.execSync("echo ${CANOPY_LOCATION:-$(readlink -f $(which canopy) | xargs dirname | xargs dirname)}").toString().trim();
let fs = require('fs-extra');
let editor = require('editor');
let generateDataFile = require('./generate_data_file');
let reconstructProjectFiles = require('./reconstruct_project_files');
let Fzf = require('@dgoguerra/fzf').Fzf;
let recursiveReadSync = require('recursive-readdir-sync');
let {
  recursiveDirectoryFind,
  validatePathsAreDirectories,
  deduplicate,
  getRecursiveSubdirectoryFiles,
  getDirectoryFiles,
  pathComparator
  } = require('./helpers');

const bulk = async function(directoryList) {
  if (!fs.existsSync('./topics')) throw "Must be in a projects directory with a topics folder";
	let editorMode = !!!(options.start || options.finish);
  options.clear && fs.writeFileSync('.canopy_bulk_backup_log', '');

	if (options.pick) {
    let callback = options.recursive ? (p => p + '/**') : (p => p);
	  const fzf = new Fzf().multi().result(p => p.match(/([^*]+)(\/\*\*)?/)[1]);
	  directoryList = recursiveDirectoryFind('topics');
    directoryList = await fzf.run(directoryList.map(callback));
	}

  if (directoryList.length === 0) {
    if (options.blank) {
      directoryList = [];
    } else {
      directoryList = recursiveDirectoryFind('topics');
    }
  }

	validatePathsAreDirectories(directoryList);
  let fileList = options.recursive ? getRecursiveSubdirectoryFiles(directoryList) : getDirectoryFiles(directoryList);
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
