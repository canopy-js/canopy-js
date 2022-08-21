let child_process = require('child_process');
let fs = require('fs-extra');
let editor = require('editor');
let generateDataFile = require('./generate_data_file');
let { reconstructProjectFiles } = require('./reconstruct_project_files');
let Fzf = require('@dgoguerra/fzf').Fzf;
let {
  recursiveDirectoryFind,
  deduplicate,
  getRecursiveSubdirectoryFiles,
  getDirectoryFiles,
  pathComparator,
  groupByPath
} = require('./helpers');

const bulk = async function(fileList, options) {
  if (!fs.existsSync('./topics')) throw "Must be in a projects directory with a topics folder";
  let editorMode = !(options.start || options.finish);
  options.noBackup && fs.existsSync('.canopy_bulk_backup_log') && fs.unlinkSync('.canopy_bulk_backup_log');

  if (options.pick && (options.files || (!options.directories && !options.recursive))) { // pick files
    let optionList = getRecursiveSubdirectoryFiles('topics').map(p => p.match(/topics\/(.*)/)[1]); // present paths without 'topics/' prefix
    const fzf = new Fzf().multi().result(p => `topics/${p}`); // put back on topics prefix
    fileList = fileList.concat((await fzf.run(optionList)).flat());
  }

  if (options.pick && options.directories) {
    let optionList = recursiveDirectoryFind('topics').map(p => p.match(/topics\/(.*)/)[1]);
    const fzf = new Fzf().multi().result(p => getDirectoryFiles(`topics/${p}`));
    fileList = fileList.concat((await fzf.run(optionList)).flat());
  }

  if (options.pick && options.recursive) {
    let optionList = recursiveDirectoryFind('topics').map(p => p.match(/topics\/(.*)/)[1] + '/**'); // Add the /**
    let postProcess = p => getRecursiveSubdirectoryFiles(`topics/${p.match(/([^*]+)\/\*\*/)[1]}`); // Remove the /**
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
    );
  }

  if (options.last) {
    if (fs.existsSync('.canopy_bulk_last_session_files')) {
      let lastFiles = JSON.parse(fs.readFileSync('.canopy_bulk_last_session_files').toString());
      fileList = fileList.concat(lastFiles);
    }
  }

  if (fileList.length === 0) {
    if (options.blank || options.search || options.git || options.pick) { // the user asked for blank, or searched and didn't find
      fileList = [];
    } else { // the user didn't specify any paths, but didn't indicate they wanted a blank result either
      fileList = getRecursiveSubdirectoryFiles('topics');
    }
  }

  let fileSystemData = collectFileSystemData(fileList);
  fileList = deduplicate(fileList).sort(pathComparator);
  let filesByPath = groupByPath(fileList);
  let initialData = generateDataFile(filesByPath, fileSystemData, options);

  if (editorMode) {
    fs.writeFileSync('.canopy_bulk_file', initialData);
    editor('.canopy_bulk_file', () => {
      let finishedData = fs.readFileSync('.canopy_bulk_file').toString();
      try {
        reconstructProjectFiles(finishedData, fileList, options);
      } catch (e) {
        console.error(e);
      }
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
    reconstructProjectFiles(finishedData, fileList, options);
    fs.unlink('canopy_bulk_file');
    fs.unlink('.canopy_bulk_original_file_list');
  }
};

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
