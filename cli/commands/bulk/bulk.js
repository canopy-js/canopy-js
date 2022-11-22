const child_process = require('child_process');
const fs = require('fs-extra');
const editor = require('editor');
const Fzf = require('@dgoguerra/fzf').Fzf;
const chokidar = require('chokidar');
const {
  recursiveDirectoryFind,
  getRecursiveSubdirectoryFiles,
  getDirectoryFiles,
} = require('./helpers');
const watch = require('../watch');
const serve = require('../serve/serve');
let chalk = require('chalk');
let FileSystemManager = require('./file_system_manager');
let BulkFileGenerator = require('./bulk_file_generator');
let BulkFileParser = require('./bulk_file_parser');
let FileSystemChangeCalculator = require('./file_system_change_calculator');
let { getDefaultTopicAndPath } = require('../shared/helpers');

const bulk = async function(selectedFileList, options) {
  function log(message) { if (options.logging) console.log(message) }

  if (!fs.existsSync('./topics')) throw new Error(chalk.red('Must be in a projects directory with a topics folder'));

  if (options.pick && (options.files || (!options.directories && !options.recursive))) { // pick files
    let optionList = getRecursiveSubdirectoryFiles('topics').map(p => p.match(/topics\/(.*)/)[1]); // present paths without 'topics/' prefix
    const fzf = new Fzf().multi().result(p => `topics/${p}`); // put back on topics prefix
    selectedFileList = selectedFileList.concat((await fzf.run(optionList)).flat());
  }

  if (options.pick && options.directories) {
    let optionList = recursiveDirectoryFind('topics').map(p => p.match(/topics\/(.*)/)[1]);
    const fzf = new Fzf().multi().result(p => getDirectoryFiles(`topics/${p}`));
    selectedFileList = selectedFileList.concat((await fzf.run(optionList)).flat());
  }

  if (options.pick && options.recursive) {
    let optionList = recursiveDirectoryFind('topics').map(p => p.match(/topics\/(.*)/)[1] + '/**'); // Add the /**
    let postProcess = p => getRecursiveSubdirectoryFiles(`topics/${p.match(/([^*]+)\/\*\*/)[1]}`); // Remove the /**
    const fzf = new Fzf().multi().result(postProcess);
    selectedFileList = selectedFileList.concat((await fzf.run(optionList)).flat());
  }

  if (options.git) {
    // `git diff` gets us the changed files and `git ls-files` gets us the new untracked files
    selectedFileList = selectedFileList.concat(
      child_process
        .execSync('{ git diff --name-only head && git ls-files --others --exclude-standard; }')
        .toString()
        .trim()
        .split("\n")
    );
  }

  if (options.search) {
    selectedFileList = selectedFileList.concat(
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
      selectedFileList = selectedFileList.concat(lastFiles);
    }
  }

  if (selectedFileList.length === 0) {
    if (options.blank || options.search || options.git || options.pick) { // the user asked for blank, or searched and didn't find
      selectedFileList = [];
    } else { // the user didn't specify any paths, but didn't indicate they wanted a blank result either
      selectedFileList = getRecursiveSubdirectoryFiles('topics');
    }
  }

  let fileSystemManager = new FileSystemManager();

  function setUpBulkFile({ selectedFileList, storeOriginalSelection }) {
    let allDiskFileSet = fileSystemManager.getFileSet(getRecursiveSubdirectoryFiles('topics'));
    var originalSelectionFileSet = fileSystemManager.getFileSet(selectedFileList);
    let defaultTopicDisplayCategoryPath, defaultTopicFilePath;
    try {({ defaultTopicDisplayCategoryPath, defaultTopicFilePath } = getDefaultTopicAndPath());} catch(e) {} // validate default topic
    var bulkFileGenerator = new BulkFileGenerator(originalSelectionFileSet, defaultTopicDisplayCategoryPath, defaultTopicFilePath);
    var bulkFileString = bulkFileGenerator.generateBulkFile();
    options.bulkFileName = options.bulkFileName || 'canopy_bulk_file';
    fileSystemManager.createBulkFile(options.bulkFileName, bulkFileString);
    if (!options.noBackup) fileSystemManager.backupBulkFile(options.bulkFileName, bulkFileString);
    if (storeOriginalSelection) fileSystemManager.storeOriginalSelectionFileList(selectedFileList);
  }

  function handleFinish({deleteBulkFile, deleteOriginalSelection, originalSelectedFilesList}, options) {
    options.bulkFileName = options.bulkFileName || 'canopy_bulk_file';
    let originalSelectionFileSet = originalSelectedFilesList ?
      fileSystemManager.getFileSet(originalSelectedFilesList) : fileSystemManager.loadOriginalSelectionFileSet();
    let newBulkFileString = fileSystemManager.getBulkFile(options.bulkFileName);
    if (deleteBulkFile) fileSystemManager.deleteBulkFile(options.bulkFileName);
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let newFileSet = bulkFileParser.getFileSet();
    let allDiskFileSet = fileSystemManager.getFileSet(getRecursiveSubdirectoryFiles('topics'));
    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();
    let storeNewSelection = options.sync && !deleteBulkFile; // if we're not deleting bulk file, we are continuing the session
    if (storeNewSelection) fileSystemManager.storeOriginalSelectionFileSet(newFileSet);
    if (!options.noBackup) fileSystemManager.backupBulkFile(options.bulkFileName, newBulkFileString);
    fileSystemManager.execute(fileSystemChange, options.logging);
    getDefaultTopicAndPath() // Error in case the person changed the default topic file name
  }

  let normalMode = !options.start && !options.finish && !options.sync;
  if (normalMode) {
    setUpBulkFile({storeOriginalSelection: false, selectedFileList});
    editor('canopy_bulk_file', () => {
      try {
        handleFinish({ originalSelectedFilesList: selectedFileList, deleteBulkFile: true }, options)
      } catch(e) { console.error(e.message); }
    })
  }

  if (options.start) { // non-editor mode
    setUpBulkFile({ storeOriginalSelection: true, selectedFileList });
  }

  if (options.finish) { // non-editor mode
    try { handleFinish({ deleteBulkFile: true }, options); } catch(e) { console.error(e); }
  }

  if (options.sync) {
    setUpBulkFile({ storeOriginalSelection: true, selectedFileList });

    if (!options.noEditor) {
      editor(options.bulkFileName, () => {
        try { handleFinish({deleteBulkFile: false}, options); } catch(e) { console.error(e) }
        log(chalk.magenta(`Canopy bulk sync: Session ending from editor close at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
        process.exit();
      });
    }

    if (['emacs', 'vim', undefined].includes(process.env.EDITOR)) { // CLI editor is incompatible with sync mode logging
      options.logging = false;
    }

    // We don't want to build before the user has typed anything, but we will do so if there is no build to start the server with
    watch(Object.assign({ ...options, ...{ suppressInitialBuild: true, buildIfUnbuilt: true }}));

    let startedServer = false; // server may fail to start because of an invalid build, but a later fix may enable starting
    try {
      serve(options);
      startedServer = true;
    } catch(e) {
      console.error(e);
    }

    process.on('SIGINT', () => {
      try { handleFinish({deleteBulkFile: true}, options); } catch(e) { console.error(e) }
      log(chalk.magenta(`\nCanopy bulk sync: Session ending from SIGINT at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
      process.exit();
    });

    const bulkFileWatcher = chokidar.watch([options.bulkFileName], { persistent: true });
    bulkFileWatcher.on('change', debounce((e) => {
      try {
        log(chalk.magenta(`Canopy bulk sync: Updating topic files from bulk file at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
        handleFinish({deleteBulkFile: false}, options);

        if (!startedServer) {
          serve(options);
          startedServer = true;
        }
      } catch(e) {
        console.error(e, e.stack);
      }
    }));

    bulkFileWatcher.on('unlink', (e) => {
      try { handleFinish({deleteBulkFile: false}, options); } catch(e) { console.error(e) }
      log(chalk.magenta(`Canopy bulk sync: Bulk file deleted at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
    });

    const topicsWatcher = chokidar.watch(['topics'], { persistent: true, ignoreInitial: true });
    let handler = (e) => debounce(() => topicsChangeHandler(e))(e);
    topicsWatcher
      .on('add', handler)
      .on('addDir', handler)
      .on('change', handler)
      .on('unlink', handler)
      .on('unlinkDir', handler);

    function topicsChangeHandler(e) {
      let selectedFileList = fileSystemManager.getOriginalSelectionFileList();
      setUpBulkFile({ storeOriginalSelection: true, selectedFileList });
      log(chalk.magenta(`Canopy bulk sync: New bulk file from topics change at ${(new Date()).toLocaleTimeString()} (pid ${process.pid}) – triggered by: ${e}`));
    }
  }
};

let debounce = debounceGenerator();
function debounceGenerator() {
  let hasBeenCalledRecently = false;
  return (callback) => {
    return () => {
      if (hasBeenCalledRecently) return;
      hasBeenCalledRecently = true;
      setTimeout(() => (hasBeenCalledRecently = false), 500);
      callback();
    }
  }
}


module.exports = bulk;
