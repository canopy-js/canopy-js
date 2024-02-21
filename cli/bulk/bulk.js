const child_process = require('child_process');
const fs = require('fs-extra');
const editor = require('editor');
const Fzf = require('@dgoguerra/fzf').Fzf;
const chokidar = require('chokidar');
const {
  recursiveDirectoryFind,
  getRecursiveSubdirectoryFiles,
  getDirectoryFiles,
  CyclePreventer,
  logOrWriteError
} = require('./helpers');
const watch = require('../watch');
const build = require('../build');
const serve = require('../serve/serve');
let chalk = require('chalk');
let FileSystemManager = require('./file_system_manager');
let BulkFileGenerator = require('./bulk_file_generator');
let BulkFileParser = require('./bulk_file_parser');
let FileSystemChangeCalculator = require('./file_system_change_calculator');
let { DefaultTopic, defaultTopic } = require('../shared/fs-helpers');
const readline = require('readline');

const bulk = async function(selectedFileList, options = {}) {
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

  if (selectedFileList.length === 0) {
    if (options.blank || options.search || options.git || options.pick) { // the user asked for blank, or searched and didn't find
      selectedFileList = [];
    } else { // the user didn't specify any paths, but didn't indicate they wanted a blank result either
      selectedFileList = getRecursiveSubdirectoryFiles('topics');
    }
  }

  let fileSystemManager = new FileSystemManager();
  let cyclePreventer = new CyclePreventer();
  let oldBulkFileString;

  function setUpBulkFile({ selectedFileList, storeOriginalSelection }) {
    let allDiskFileSet = fileSystemManager.getFileSet(getRecursiveSubdirectoryFiles('topics'));
    var originalSelectionFileSet = fileSystemManager.getFileSet(selectedFileList);
    let defaultTopic = {};
    logOrWriteError(() => { defaultTopic = new DefaultTopic() }, options); // validate existence of default topic
    checkGitIgnoreForBulkFile(options);
    var bulkFileGenerator = new BulkFileGenerator(originalSelectionFileSet, defaultTopic.categoryPath, defaultTopic.filePath);
    var bulkFileString = bulkFileGenerator.generateBulkFile();
    options.bulkFileName = options.bulkFileName || defaultTopic.fileName || 'canopy_bulk_file';

    fileSystemManager.createBulkFile(options.bulkFileName, bulkFileString);
    oldBulkFileString = bulkFileString;
    if (!options.noBackup) fileSystemManager.backupBulkFile(options.bulkFileName, bulkFileString);
    if (storeOriginalSelection) fileSystemManager.storeOriginalSelectionFileList(selectedFileList);
  }

  function handleFinish({deleteBulkFile, deleteOriginalSelection, originalSelectedFilesList}) {
    options.bulkFileName = options.bulkFileName || 'canopy_bulk_file';
    let originalSelectionFileSet = originalSelectedFilesList ?
      fileSystemManager.getFileSet(originalSelectedFilesList) : fileSystemManager.loadOriginalSelectionFileSet();
    let newBulkFileString = fileSystemManager.getBulkFile(options.bulkFileName);
    if (deleteBulkFile) fileSystemManager.deleteBulkFile(options.bulkFileName);

    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet, defaultTopicPath, defaultTopicKey } = bulkFileParser.generateFileSet();
    if (defaultTopicPath) fileSystemManager.persistDefaultTopicPath(defaultTopicPath, defaultTopicKey);

    let allDiskFileSet = fileSystemManager.getFileSet(getRecursiveSubdirectoryFiles('topics'));
    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    fileSystemManager.deleteOriginalSelectionFile();
    let storeNewSelection = options.sync && !deleteBulkFile; // if we're not deleting bulk file, we are continuing the session
    if (storeNewSelection) fileSystemManager.storeOriginalSelectionFileSet(newFileSet);
    if (!options.noBackup) fileSystemManager.backupBulkFile(options.bulkFileName, newBulkFileString);

    fileSystemManager.execute(fileSystemChange, options.logging);
    if (!fileSystemChange.noop) cyclePreventer.ignoreNextTopicsChange();
    new DefaultTopic(); // Error in case the person changed the default topic file name
  }

  let normalMode = !options.start && !options.finish && !options.sync;
  if (normalMode) {
    setUpBulkFile({storeOriginalSelection: false, selectedFileList});
    editor(options.bulkFileName, { editor: process.env['VISUAL'] || process.env['EDITOR'] || 'vi' }, () => {
      handleFinish({ originalSelectedFilesList: selectedFileList, deleteBulkFile: true })
    })
  }

  if (options.start) { // non-editor mode
    setUpBulkFile({ storeOriginalSelection: true, selectedFileList });
  }

  if (options.finish) { // non-editor mode
    handleFinish({ deleteBulkFile: true });
  }

  if (options.sync) {
    if (fs.existsSync(options.bulkFileName) && options.useExisting) { // if the user has a bulk file from a previous session
      log(chalk.magenta(`Canopy bulk sync: Reconstructing topic files from prior bulk file ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
      handleFinish({ deleteBulkFile: false });
    } else {
      setUpBulkFile({ storeOriginalSelection: true, selectedFileList });
    }

    if (!process.env['CANOPY_EDITOR']) console.log(chalk.bgYellow(chalk.black('Try setting your CANOPY_EDITOR environment variable so that Canopy knows which editor to use for bulk sync')));

    // Open bulk file in editor and process when closed
    if (options.editor) {
      editor(options.bulkFileName, { editor: process.env['CANOPY_EDITOR'] || process.env['VISUAL'] || process.env['EDITOR'] || 'vi' }, (code, sig) => {
        logOrWriteError(() => {
          handleFinish({deleteBulkFile: false});
          log(chalk.magenta(`Canopy bulk sync: Session ending from editor close at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
          process.exit();
        }, options);
      });
    }

    if (['emacs', 'vim', 'nano', undefined].includes(process.env.CANOPY_EDITOR || process.env.VISUAL || process.env.EDITOR)) { // CLI editor is incompatible with sync mode logging
      options.logging = false;
    }

    // Watch topics and rebuild JSON on change
    // We don't want to build before the user has typed anything, but we will do so if there is no build to start the server with
    watch(options);

    // Start server
    serve( {...options, ...{ ignoreBuildErrors: true } }); // We want to start the server even if the build is bad, because the user can fix it

    function handleSigInt() {
      logOrWriteError(() => handleFinish({deleteBulkFile: true}), options);
      log(chalk.magenta(`Canopy bulk sync: Session ending from SIGINT at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
      process.exit();
    }

    process.on('SIGINT', () => {
      handleSigInt();
    });

    // Allow user to manually regenerate bulk file with control-R
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
      if (key.ctrl && key.name === 'r') {
        let selectedFileList = fileSystemManager.getOriginalSelectionFileList();
        cyclePreventer.ignoreNextBulkFileChange();
        setUpBulkFile({ storeOriginalSelection: true, selectedFileList });
        log(chalk.magenta(`Canopy bulk sync: New bulk file from manual reload at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
      } else if (key.ctrl && (key.name === 'c' || key.name === 'd')) {
        handleSigInt();
      }
    });

    // Watch bulk file and update topics on change
    const bulkFileWatcher = chokidar.watch([options.bulkFileName], { persistent: true });
    bulkFileWatcher.on('change', () => {
      if (cyclePreventer.ignoreBulkFileChange()) return cyclePreventer.respondToNextBulkFileChange();

      let newBulkFileString = fileSystemManager.getBulkFile(options.bulkFileName);

      if (oldBulkFileString && oldBulkFileString !== newBulkFileString) {
        log(chalk.magenta(`Canopy bulk sync: Updating topic files from bulk file change at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
      }

      oldBulkFileString = newBulkFileString;

      logOrWriteError(() => handleFinish({deleteBulkFile: false}), options);
    });

    // Watch bulk file and end session on delete
    bulkFileWatcher.on('unlink', (e) => {
      logOrWriteError(() => handleFinish({deleteBulkFile: false}), options);
      log(chalk.magenta(`Canopy bulk sync: Bulk file deleted at ${(new Date()).toLocaleTimeString()} (pid ${process.pid})`));
    });
    cyclePreventer.watchingBulkFile();

    // Watch topics and update bulk file on change
    const topicsWatcher = chokidar.watch(['topics'], { persistent: true, ignoreInitial: true });
    cyclePreventer.watchingTopics();

    let handler = debounce((e) => topicsChangeHandler(e));

    topicsWatcher
      .on('add', handler)
      .on('addDir', handler)
      .on('change', handler)
      .on('unlink', handler)
      .on('unlinkDir', handler);

    function topicsChangeHandler(e) {
      if (cyclePreventer.ignoreTopicsChange()) return cyclePreventer.respondToNextTopicsChange();
      let selectedFileList = fileSystemManager.getOriginalSelectionFileList();
      cyclePreventer.ignoreNextBulkFileChange();
      setUpBulkFile({ storeOriginalSelection: true, selectedFileList });
      log(chalk.magenta(`Canopy bulk sync: Updating bulk file from topics change at ${(new Date()).toLocaleTimeString()} (pid ${process.pid}) – triggered by: ${e}`));
    }
  }
};

let debounce = debounceGenerator();
function debounceGenerator() {
  let hasBeenCalledRecently = false;
  return (callback) => {
    return (...arguments) => {
      if (hasBeenCalledRecently) return;
      hasBeenCalledRecently = true;
      setTimeout(() => (hasBeenCalledRecently = false), 500);
      return callback(...arguments);
    }
  }
}

function checkGitIgnoreForBulkFile(options = {}) {
  if (fs.existsSync('.gitignore') && !fs.readFileSync('.gitignore').toString().match(new RegExp(`(^|\n)\/${options.bulkFileName||defaultTopic().fileName}($|\n)`, 's'))) {
    console.log(chalk.bgYellow(chalk.black(`Add custom bulk file name to your .gitignore: \/${options.bulkFileName||defaultTopic().fileName}`)));
  }
}

module.exports = bulk;
