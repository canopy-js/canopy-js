const child_process = require('child_process');
const fs = require('fs-extra');
const { fzfSelect } = require('../shared/pickers');
const chokidar = require('chokidar');
const {
  recursiveDirectoryFind,
  getRecursiveSubdirectoryFiles,
  CyclePreventer,
  logOrWriteError
} = require('./helpers');
const watch = require('../watch');
const serve = require('../serve/serve');
let chalk = require('chalk');
let FileSystemManager = require('./file_system_manager');
let BulkFileGenerator = require('./bulk_file_generator');
let BulkFileParser = require('./bulk_file_parser');
let FileSystemChangeCalculator = require('./file_system_change_calculator');
let { DefaultTopic, defaultTopic } = require('../shared/fs-helpers');
const readline = require('readline');
const { spawn } = require('child_process');
const { getExplFileObjects } = require('../build/components/fs-helpers');

const bulk = async function(selectedFileList, options = {}) {
  function log(message) { if (options.logging) console.log(message); }

  if (!fs.existsSync('./topics')) throw new Error(chalk.red('Must be in a projects directory with a topics folder'));

  if (options.pick) {
    const explFiles = Object.keys(getExplFileObjects('topics'));
    const dirs = recursiveDirectoryFind('topics');
    const optionList = [
      ...explFiles.map(f => f.replace(/^topics\//, '')),
      ...dirs.map(d => d.replace(/^topics\//, '') + '/**')
    ].sort();

    const selected = await fzfSelect(optionList, { multi: true });
    if (String(selected) == '') return;

    selectedFileList = selectedFileList.concat(
      selected.flatMap(p => {
        if (p.endsWith('.expl')) {
          return [`topics/${p}`];
        } else if (p.endsWith('/**')) {
          const dir = p.replace(/\/\*\*$/, '');
          return explFiles.filter(f => f.startsWith(`topics/${dir}/`));
        } else {
          return [];
        }
      })
    );
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
    const searchPattern = options.search
      .replace(/[-_\s]+/g, '[-_\\s]*') // turn spacey chunks into a regex class
      .replace(/(["$`\\])/g, '\\$1'); // escape shell-sensitive characters

    const cmd = `find topics | grep -i -E "${searchPattern}" | grep .expl || true`;
    selectedFileList = selectedFileList.concat(
      child_process
        .execSync(cmd)
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
    var originalSelectionFileSet = fileSystemManager.getFileSet(selectedFileList);
    let defaultTopic = {};
    logOrWriteError(() => { defaultTopic = new DefaultTopic(); }, options); // validate existence of default topic
    var bulkFileGenerator = new BulkFileGenerator(originalSelectionFileSet, defaultTopic.filePath);
    var bulkFileString = bulkFileGenerator.generateBulkFile();
    options.bulkFileName = options.bulkFileName || `${defaultTopic.topicFileName}.bulk` || 'canopy_bulk_file.bulk';
    checkGitIgnoreForBulkFile(options);

    fileSystemManager.createBulkFile(options.bulkFileName, bulkFileString);
    oldBulkFileString = bulkFileString;
    if (!options.noBackup) fileSystemManager.backupBulkFile(options.bulkFileName, bulkFileString);
    if (storeOriginalSelection) fileSystemManager.storeOriginalSelectionFileList(selectedFileList);
  }

  function handleFinish({ deleteBulkFile, originalSelectedFilesList }) {
    options.bulkFileName = options.bulkFileName || 'canopy_bulk_file';

    let originalSelectionFileSet = originalSelectedFilesList
      ? fileSystemManager.getFileSet(originalSelectedFilesList)
      : fileSystemManager.loadOriginalSelectionFileSet(options);

    let newBulkFileString = fileSystemManager.getBulkFile(options.bulkFileName);

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

    if (deleteBulkFile) fileSystemManager.deleteBulkFile(options.bulkFileName); // put this last to preserve in case of error
  }

  selectedFileList = selectedFileList.map(p => p.match(/(topics\/.*)/)[1]); // if the user passed absolute paths, convert to relative

  let normalMode = !options.resume && !options.start && !options.finish && !options.sync;
  if (normalMode) {
    setUpBulkFile({ storeOriginalSelection: false, selectedFileList });
    const editorCmd = process.env['VISUAL'] || process.env['EDITOR'] || 'vi';
    return openEditorAndWait(options.bulkFileName, editorCmd)
      .then(() => handleFinish({ originalSelectedFilesList: selectedFileList, deleteBulkFile: true }))
      .catch((e) => {
        let message = chalk.bold.red('Error:') + ' ' + e.message + '\n' +
          chalk.dim('Tip:') + ' Run ' + chalk.green('canopy bulk --resume') + ' to continue editing.\n';
        throw new Error(message);
      });
  }

  if (options.resume) { // resume editing file whose parsing ended in error
    const editorCmd = process.env['VISUAL'] || process.env['EDITOR'] || 'vi';
    return openEditorAndWait(options.bulkFileName, editorCmd)
      .then(() => handleFinish({ originalSelectedFilesList: [], deleteBulkFile: true }));
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
      logOrWriteError(() => handleFinish({ deleteBulkFile: false }));
    } else {
      setUpBulkFile({ storeOriginalSelection: true, selectedFileList });
    }

    if (!process.env['CANOPY_EDITOR']) console.log(chalk.bgYellow(chalk.black('Try setting your CANOPY_EDITOR environment variable so that Canopy knows which editor to use for bulk sync')));

    if (['emacs', 'vim', 'nano', undefined].includes(process.env.CANOPY_EDITOR || process.env.VISUAL || process.env.EDITOR)) { // CLI editor is incompatible with sync mode logging
      options.logging = false;
    }

    // Watch topics and rebuild JSON on change
    // We don't want to build before the user has typed anything, but we will do so if there is no build to start the server with
    watch({...options, onBuildError: (e) => handleWatchError(e, options)});

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
    bulkFileWatcher.on('unlink', () => {
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
      if (options.all) {
        selectedFileList = getRecursiveSubdirectoryFiles('topics').filter(path => path.endsWith('.expl'));
        if (options.all) fileSystemManager.storeOriginalSelectionFileList(selectedFileList);
      }
      cyclePreventer.ignoreNextBulkFileChange();
      setUpBulkFile({ storeOriginalSelection: true, selectedFileList });
      log(chalk.magenta(`Canopy bulk sync: Updating bulk file from topics change at ${(new Date()).toLocaleTimeString()} (pid ${process.pid}) – triggered by: ${e}`));
    }
  }

  function checkGitIgnoreForBulkFile(options = {}) {
    if (selectedFileList.length === 0) return; // this is clearly a temp bulk file
    if (fs.existsSync('.gitignore') && !fs.readFileSync('.gitignore').toString().match(new RegExp(`(^|\n)/${options.bulkFileName||defaultTopic().topicFileName}($|\n)`, 's'))) {
      console.log(chalk.bgYellow(chalk.black(`Add custom bulk file name to your .gitignore: /${options.bulkFileName||defaultTopic().topicFileName}`)));
    }
  }
};

let debounce = debounceGenerator();
function debounceGenerator() {
  let hasBeenCalledRecently = false;
  return (callback) => {
    return (...argumentsArray) => {
      if (hasBeenCalledRecently) return;
      hasBeenCalledRecently = true;
      setTimeout(() => (hasBeenCalledRecently = false), 500);
      return callback(...argumentsArray);
    };
  };
}

function openEditorAndWait(filePath, editorCmd = 'vi') {
  return new Promise((resolve, reject) => {
    const child = spawn(editorCmd, [filePath], {
      stdio: 'inherit'
    });

    child.on('exit', (code) => {
      // If exit code is 0, assume user did ZZ (accept) even if file was unchanged
      if (code === 0) {
        resolve();
      } else {
        // Any non-zero exit code is treated as ZQ (abort)
        reject(new Error(chalk.red('Bulk edit aborted')));
      }
    });
  });
}

module.exports = bulk;

function handleWatchError(error, options = {}) {
  const { tryAndWriteHtmlError } = require('../shared/fs-helpers');
  const translated = translateWatchErrorToBulk(error, options);
  console.error(chalk.red(translated.message || translated));
  try {
    tryAndWriteHtmlError(() => { throw translated; }, options);
  } catch (_) {
    // tryAndWriteHtmlError rethrows; swallow here so the watcher stays alive
  }
}

function translateWatchErrorToBulk(error, options = {}) {
  if (!options.sync || !options.bulkFileName || !error?.message) return error;

  const match = String(error.message).match(/(topics\/[\w./-]+\.expl):(\d+):(\d+)/);
  if (!match) return error;

  const [, topicPath, lineString, colString] = match;
  const fs = require('fs');
  const Block = require('../shared/block');

  if (!fs.existsSync(topicPath) || !fs.existsSync(options.bulkFileName)) return error;

  let topicContents, bulkContents;
  try {
    topicContents = fs.readFileSync(topicPath, 'utf8');
    bulkContents = fs.readFileSync(options.bulkFileName, 'utf8');
  } catch {
    return error;
  }

  const firstParagraph = topicContents.split(/\n\n/)[0]?.trim() || '';
  const key = Block.for(firstParagraph).key;
  if (!key) return error;

  const keyLineRegex = new RegExp(`^(\\*\\*|\\*)\\s+${key}\\b`, 'm');
  const keyMatch = bulkContents.match(keyLineRegex);
  if (!keyMatch) return error;

  const bulkUpToKey = bulkContents.slice(0, keyMatch.index);
  const bulkStartLine = bulkUpToKey.split('\n').length; // 1-based
  const lastNewlineIdx = bulkUpToKey.lastIndexOf('\n');
  const bulkStartCol = keyMatch.index - lastNewlineIdx; // 1-based

  const topicLine = Number(lineString);
  const topicCol = Number(colString);
  const bulkLine = bulkStartLine + topicLine - 1;
  const bulkCol = topicLine === 1 ? bulkStartCol + topicCol - 1 : topicCol;

  const rewritten = `${error.message}\n${options.bulkFileName}:${bulkLine}:${bulkCol}`;

  const err = new Error(rewritten);
  err.stack = error.stack;
  return err;
}
