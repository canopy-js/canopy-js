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
  pathComparator,
  groupByPath
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
      optionPrep = p => p.match(/([^.]+)\.expl/)[1];
      optionList = getRecursiveSubdirectoryFiles('topics').map(optionPrep);
      postProcess = p => `${p}.expl`;
    }
	  const fzf = new Fzf().multi().result(postProcess);
    fileList = (await fzf.run(optionList)).flat();
	}

  if (options.git) {
    // `git diff` gets us the changed files and `git ls-files` gets us the new untracked files
    fileList = child_process
      .execSync('{ git diff --name-only head && git ls-files --others --exclude-standard; }')
      .toString()
      .trim()
      .split("\n");
  }

  if (options.search) {
    fileList = child_process
      .execSync(`find topics | grep -i ${options.search} | grep .expl`)
      .toString()
      .trim()
      .split("\n")
  }

  if (fileList.length === 0) {
    if (options.blank) {
      fileList = [];
    } else {
      fileList = getRecursiveSubdirectoryFiles('topics');
    }
  }

  fileList = deduplicate(fileList).sort(pathComparator);
  filesByPath = groupByPath(fileList);
	let initialData = generateDataFile(filesByPath, options.blank);

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
