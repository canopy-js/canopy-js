let child_process = require('child_process');
let	canopyLocation = child_process.execSync("echo ${CANOPY_LOCATION:-$(readlink -f $(which canopy) | xargs dirname | xargs dirname)}").toString().trim();
let fs = require('fs-extra');
let editor = require('editor');
let generateDataFile = require('./generate_data_file');
let { reconstructProjectFiles } = require('./reconstruct_project_files');
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
  if (!fs.existsSync('./topics')) throw "Must be in a projects directory with a topics folder";
	let editorMode = !!!(options.start || options.finish);
  options.noBackup && fs.existsSync('.canopy_bulk_backup_log') && fs.unlinkSync('.canopy_bulk_backup_log');

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
    fileList = fileList.concat((await fzf.run(optionList)).flat());
	}

  if (options.git) {
    // `git diff` gets us the changed files and `git ls-files` gets us the new untracked files
    fileList = fileList.concat(
      child_process
      .execSync('{ git diff --name-only head && git ls-files --others --exclude-standard; }')
      .toString()
      .trim()
      .split("\n")
    );
  }

  if (options.search) {
    fileList = fileList.concat(
      child_process
      .execSync(`find topics | { grep -i ${options.search} | grep .expl || true; }`) // suppress error on no results
      .toString()
      .trim()
      .split("\n")
      .filter(Boolean)
    )
  }

  if (fileList.length === 0) {
    if (options.blank || options.search || options.git || options.pick) { // the user asked for blank, or searched and didn't find
      fileList = [];
    } else { // the user didn't specify any paths, but didn't indicate they wanted a blank result either
      fileList = getRecursiveSubdirectoryFiles('topics');
    }
  }

  fileSystemData = collectFileSystemData(fileList);
  fileList = deduplicate(fileList).sort(pathComparator);
  filesByPath = groupByPath(fileList);
	let initialData = generateDataFile(filesByPath, fileSystemData, options);

	if (editorMode) {
		fs.writeFileSync('.canopy_bulk_file', initialData);
		editor('.canopy_bulk_file', (code, sig) => {
			let finishedData = fs.readFileSync('.canopy_bulk_file').toString();
			try {
        reconstructProjectFiles(finishedData, fileList, options);
      } catch (e) {
        console.error(e);
      }
      fs.unlink('.canopy_bulk_file');
		});
	}

  if (options.continue) {
    let finishedData = fs.readFileSync('.canopy_bulk_file').toString();
    reconstructProjectFiles(finishedData, fileList, options);
  }

	if (options.start) { // non-editor mode
    fs.writeFileSync('canopy_bulk_file', initialData);
		fs.writeFileSync('.canopy_bulk_original_file_list', JSON.stringify(fileList));
	}

	if (options.finish) { // non-editor mode
		let finishedData = fs.readFileSync('canopy_bulk_file').toString();
    let fileList = JSON.parse(fs.readFileSync('.canopy_bulk_original_file_list').toString());
		reconstructProjectFiles(finishedData, fileList, options);
    fs.unlink('canopy_bulk_file');
    fs.unlink('.canopy_bulk_original_file_list');
	}
}

function collectFileSystemData(fileList) {
  let fileSystemData = {};

  fileList.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      fileSystemData[filePath] = fs.readFileSync(filePath).toString();
    }
  });

  return fileSystemData;
}

module.exports = bulk;
