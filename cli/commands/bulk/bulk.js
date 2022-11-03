const child_process = require('child_process');
const fs = require('fs-extra');
const editor = require('editor');
const generateDataFile = require('./generate_data_file');
const { reconstructProjectFiles } = require('./reconstruct_project_files');
const Fzf = require('@dgoguerra/fzf').Fzf;
const chokidar = require('chokidar');
const {
  recursiveDirectoryFind,
  deduplicate,
  getRecursiveSubdirectoryFiles,
  getDirectoryFiles,
  pathComparator,
  groupByPath
} = require('./helpers');
const watch = require('../watch');
const serve = require('../serve/serve');
let chalk = require('chalk');

const bulk = async function(fileList, options) {
  if (!fs.existsSync('./topics')) throw new Error('Must be in a projects directory with a topics folder');
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

  if (options.sync) {
    fileList = getRecursiveSubdirectoryFiles('topics');

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

  let normalMode = !options.start && !options.finish && !options.sync;
  if (normalMode) {
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
    options.bulkFileName = options.bulkFileName || 'canopy_bulk_file';
    fs.writeFileSync(options.bulkFileName, initialData);
    fs.writeFileSync('.canopy_bulk_originally_selected_files_list', JSON.stringify(fileList));
    editor(options.bulkFileName);
  }

  if (options.finish) { // non-editor mode
    handleFinish({...options, ...{ deleteBulkFile: true }});
  }

  if (options.sync) {
    options.bulkFileName = options.bulkFileName || 'canopy_bulk_file';
    fs.writeFileSync(options.bulkFileName, initialData);
    fs.writeFileSync('.canopy_bulk_originally_selected_files_list', JSON.stringify(fileList));
    editor(options.bulkFileName, () => {
      handleFinish({...options, ...{ deleteBulkFile: true }});
      process.exit();
    });

    process.on('SIGINT', () => handleFinish({...options, ...{ deleteBulkFile: true }}) || process.exit());

    if (['emacs', 'vim', undefined].includes(process.env.EDITOR)) options.logging = false;
    watch(Object.assign(options, { suppressInitialBuild: true, buildIfUnbuilt: true }));

    let startedServer = false;
    try {
      serve(options);
      startedServer = true;
    } catch(e) {
      console.error(e);
    }

    const watcher = chokidar.watch([options.bulkFileName], { persistent: true });
    watcher.on('change', (e) => {
      if (fs.readFileSync(options.bulkFileName).toString().split('\n').some(line => line.startsWith('//'))) {
        return;
      }

      try {
        if (options.logging) console.log(chalk.magenta(`Canopy bulk sync: Updating topic files from bulk file at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
        handleFinish({...options, ...{ deleteBulkFile: false }});
        fs.writeFileSync('.canopy_bulk_originally_selected_files_list', JSON.stringify(getRecursiveSubdirectoryFiles('topics')));
        if (!startedServer) {
          serve(options);
          startedServer = true;
        }
      } catch(e) {
        console.error(e, e.stack);
        fs.writeFileSync(options.bulkFileName, fs.readFileSync(options.bulkFileName).toString() + `\n// ${[e]}`);
      }
    });

    // on delete?
  }

  function handleFinish(options) {
    let finishedData = fs.readFileSync(options.bulkFileName).toString();
    let fileList = JSON.parse(fs.readFileSync('.canopy_bulk_originally_selected_files_list').toString());
    reconstructProjectFiles(finishedData, fileList, options);
    if (options.deleteBulkFile) {
      fs.unlink(options.bulkFileName);
      fs.unlink('.canopy_bulk_originally_selected_files_list');
    }
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
