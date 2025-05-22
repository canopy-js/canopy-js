const chalk = require('chalk');

async function review(options = {}, {
  fs = require('fs'),
  path = require('path'),
  getExplFileObjects = require('./build/components/fs-helpers').getExplFileObjects,
  bulk = require('./bulk/bulk'),
  now = () => Date.now(),
  log = console.log,
  fzfSelect = require('./shared/pickers').fzfSelect
} = {}) {
  let explFileObjects = getExplFileObjects('topics', options);
  if (!fs.existsSync('./topics')) throw new Error('There must be a topics directory present, try running "canopy init"');

  if (options.undo) return handleUndo(fs, log);
  if (options.touch) return await handleTouch({ getExplFileObjects, fs, path, fzfSelect, now, log, options });
  if (options.reset) return await handleReset({ fs, path, fzfSelect, log, now });

  let reviewDataByFilePath = performInitialFileSystemScan({
    explFileObjects,
    reviewDataByFilePath: loadReviewData(fs),
    path, now, log
  });

  persistDotfile(fs, reviewDataByFilePath);

  let allFilesWithMetadata = Object.keys(explFileObjects)
    .map(filePath => computeMetadata(filePath, reviewDataByFilePath[filePath], now))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  if (options.list) return handleList(allFilesWithMetadata, log, options);
  if (options.status) return handleStatus(allFilesWithMetadata, now, log);

  let dueFilesWithMetadata = allFilesWithMetadata.filter(file => file.daysUntilDue <= 0);
  if (dueFilesWithMetadata.length === 0) {
    return log(chalk.green('No reviews due at this time.'));
  }
  const selectedFilesForReview = await selectFilesForReview({
    dueFiles: dueFilesWithMetadata,
    options,
    fzfSelect
  });

  if (!selectedFilesForReview) return;

  try {
    await bulk(selectedFilesForReview);

    const { changes, updatedPaths } = applyPostReviewUpdates({
      selectedFiles: selectedFilesForReview,
      reviewDataByFilePath,
      getExplFileObjects,
      options,
      now,
      path,
      log
    });

    for (let filePath of updatedPaths) {
      const updated = reviewDataByFilePath[filePath] &&
        computeMetadata(filePath, reviewDataByFilePath[filePath], now);
      log(generateLogString(updated, changes, filePath));
    }
  } catch(e) {
    if (options.error) console.error(e);
    log(chalk.red('Review aborted.'));
  }

  fs.copyFileSync('./.canopy_review_data', './.canopy_review_data.backup');
  persistDotfile(fs, reviewDataByFilePath);
}

function loadReviewData(fs) {
  return Object.fromEntries(
    (fs.existsSync('./.canopy_review_data') &&
      fs.readFileSync('./.canopy_review_data')
        .toString()
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          let [filePath, dateStr, iterationStr] = line.split(' ');
          return [filePath, {
            lastReviewed: dateStr, // full ISO timestamp (e.g. 2025-01-31T00:00:00.000Z)
            iterations: parseInt(iterationStr, 10)
          }];
        })
    ) || []
  );
}

function persistDotfile(fs, reviewDataByFilePath) {
  let dotFileContents = Object.entries(reviewDataByFilePath)
    .map(([filePath, { lastReviewed, iterations }]) => `${filePath} ${lastReviewed} ${iterations}`)
    .sort()
    .join('\n') + '\n';

  fs.writeFileSync('./.canopy_review_data', dotFileContents);
}

function handleUndo(fs, log) {
  const backupPath = './.canopy_review_data.backup';
  if (!fs.existsSync(backupPath)) throw new Error(chalk.red('No backup found to undo.'));
  fs.copyFileSync(backupPath, './.canopy_review_data');
  log(chalk.yellow('Undo complete: .canopy_review_data has been restored from backup.'));
}

async function handleTouch({ getExplFileObjects, fs, fzfSelect, now, log, options }) {
  const explFileObjects = getExplFileObjects('topics', options);
  const filePaths = Object.keys(explFileObjects);

  const selected = await fzfSelect(filePaths, { multi: true });
  if (!selected || selected.length === 0) {
    log(chalk.gray('No files selected.'));
    return;
  }

  const currentDate = new Date(now()).toISOString();
  const reviewData = loadReviewData(fs);

  for (let filePath of selected) {
    reviewData[filePath] = {
      lastReviewed: currentDate,
      iterations: 0
    };
  }

  fs.copyFileSync('./.canopy_review_data', './.canopy_review_data.backup');
  persistDotfile(fs, reviewData);

  for (let filePath of selected) {
    const metadata = computeMetadata(filePath, reviewData[filePath], now);
    log(generateLogString(metadata, { modified: [filePath] }, filePath));
  }
}

async function handleReset({ fs, fzfSelect, log, now }) {
  const dotfilePath = './.canopy_review_data';
  const backupPath = './.canopy_review_data.backup';

  if (!fs.existsSync(dotfilePath) || !fs.existsSync(backupPath)) {
    throw new Error(chalk.red('Both current and backup dotfiles must exist to perform reset.'));
  }

  const currentLines = fs.readFileSync(dotfilePath, 'utf-8')
    .split('\n')
    .filter(Boolean);

  const currentMap = Object.fromEntries(
    currentLines.map(line => {
      const [filePath, dateStr, iterationStr] = line.split(' ');
      return [filePath, { lastReviewed: dateStr, iterations: parseInt(iterationStr, 10) }];
    })
  );

  const backupMap = Object.fromEntries(
    fs.readFileSync(backupPath, 'utf-8')
      .split('\n')
      .filter(Boolean)
      .map(line => {
        const [filePath, dateStr, iterationStr] = line.split(' ');
        return [filePath, { lastReviewed: dateStr, iterations: parseInt(iterationStr, 10) }];
      })
  );

  const allPaths = Object.keys(currentMap);
  const selected = await fzfSelect(allPaths, { multi: true });

  if (!selected || selected.length === 0) {
    log(chalk.gray('No files selected for reset.'));
    return;
  }

  for (let filePath of selected) {
    const restored = backupMap[filePath];
    if (restored) {
      currentMap[filePath] = restored;
    }
  }

  const newLines = Object.entries(currentMap)
    .map(([filePath, { lastReviewed, iterations }]) =>
      `${filePath} ${lastReviewed} ${iterations}`)
    .sort();

  fs.writeFileSync(dotfilePath, newLines.join('\n') + '\n');

  for (let filePath of selected) {
    const restored = currentMap[filePath];
    const metadata = computeMetadata(filePath, restored, now);
    log(generateLogString(metadata, { modified: [filePath] }, filePath));
  }
}

function handleList(allFilesWithMetadata, log, options) {
  const limit = typeof options.list === 'number' ? options.list : Infinity;
  for (let fileData of allFilesWithMetadata.slice(0, limit)) {
    log(generateLogString(fileData));
  }
}

function handleStatus(allFilesWithMetadata, now, log) {
  let due = 0, overdue = 0, upNext = 0, other = 0;

  for (let file of allFilesWithMetadata) {
    const interval = file.iterations === 0 ? 1 : Math.pow(2, file.iterations);
    const grace = Math.max(7, Math.floor(0.25 * interval));
    const daysLate = -file.daysUntilDue;

    if (file.daysUntilDue <= 0 && daysLate <= grace) {
      due++;
    } else if (file.daysUntilDue < 0) {
      overdue++;
    } else if (file.daysUntilDue <= 7) {
      upNext++;
    } else {
      other++;
    }
  }

  log(
    [
      chalk.red(`[overdue: ${overdue}]`),
      chalk.hex('#4A90E2')(`[due now: ${due}]`),
      chalk.yellow(`[up next: ${upNext}]`),
      chalk.green(`[later: ${other}]`)
    ].join(' ')
  );
}

function performInitialFileSystemScan({ explFileObjects, reviewDataByFilePath, path, now, log }) {
  scanFileSystem({
    explFileObjects,
    reviewDataByFilePath,
    path,
    onAddition: (filePath) => {
      let modTime = new Date(explFileObjects[filePath].modTime).toISOString();
      log(chalk.gray(`Tracking new file: ${filePath} with review date ${modTime}.`));
      reviewDataByFilePath[filePath] = { lastReviewed: modTime, iterations: 0 };
    },
    onDeletion: (filePath) => {
      log(chalk.gray(`File ${filePath} no longer exists. Removing from dotfile.`));
      delete reviewDataByFilePath[filePath];
    },
    onChange: (filePath) => {
      const currentDate = new Date(now()).toISOString();
      log(chalk.gray(`File ${filePath} was edited. Updating dotfile date to ${currentDate} and resetting iterations.`));
      reviewDataByFilePath[filePath] = { lastReviewed: currentDate, iterations: 0 };
    },
    onNoChange: (_) => {} // No action on initial scan.
  });

  return reviewDataByFilePath;
}

function computeMetadata(filePath, fileReviewDataObject, now) {
  let { iterations } = fileReviewDataObject;

  let lastUTC = new Date(fileReviewDataObject.lastReviewed);
  let lastLocal = new Date(
    lastUTC.getUTCFullYear(),
    lastUTC.getUTCMonth(),
    lastUTC.getUTCDate()
  );

  let nowUTC = new Date(now());
  let nowLocal = new Date(
    nowUTC.getUTCFullYear(),
    nowUTC.getUTCMonth(),
    nowUTC.getUTCDate()
  );

  let lastInMilliseconds = nowLocal - lastLocal;
  let lastInDays = Math.floor(lastInMilliseconds / (1000 * 60 * 60 * 24));

  let reviewThresholdInDays = iterations === 0 ? 1 : Math.pow(2, iterations);
  let daysUntilDue = reviewThresholdInDays - lastInDays;

  let dueLocal = new Date(lastLocal);
  dueLocal.setDate(dueLocal.getDate() + reviewThresholdInDays);

  return {
    filePath,
    iterations,
    lastInDays,
    daysUntilDue,
    dueDate: dueLocal
  };
}

function scanFileSystem({
  reviewDataByFilePath, explFileObjects,
  onAddition, onDeletion, onChange, onNoChange, path,
}) {
  const explanationFilePaths = Object.keys(explFileObjects).map(p => path.relative('.', p));
  for (let filePath in reviewDataByFilePath) {
    if (!explanationFilePaths.includes(filePath)) {
      onDeletion(filePath);
    }
  }
  for (let resolvedPath in explFileObjects) {
    const filePath = path.relative('.', resolvedPath);
    const fileMeta = explFileObjects[resolvedPath];
    const modTime = new Date(fileMeta.modTime);
    const reviewEntry = reviewDataByFilePath[filePath];
    const lastReviewed = reviewEntry ? new Date(reviewEntry.lastReviewed) : null;
    if (!reviewEntry && onAddition) {
      onAddition(filePath);
      continue;
    } else if (modTime > lastReviewed && onChange) {
      onChange(filePath);
      continue;
    } else if (onNoChange) {
      onNoChange(filePath);
      continue;
    }
  }
}

function applyPostReviewUpdates({
  selectedFiles,
  reviewDataByFilePath,
  getExplFileObjects,
  options,
  now,
  path,
  log
}) {
  const changes = { added: [], deleted: [], modified: [] };

  const explFileObjects = getExplFileObjects(path.resolve('topics'), options);

  scanFileSystem({
    reviewDataByFilePath,
    explFileObjects,
    path,
    now,
    onAddition: (filePath) => {
      const currentDate = new Date(now()).toISOString();
      changes.added.push(filePath);
      reviewDataByFilePath[filePath] = { lastReviewed: currentDate, iterations: 0 };
    },
    onDeletion: (filePath) => {
      changes.deleted.push(filePath);
      delete reviewDataByFilePath[filePath];
    },
    onChange: (filePath) => {
      const currentDate = new Date(now()).toISOString();
      changes.modified.push(filePath);
      reviewDataByFilePath[filePath] = { lastReviewed: currentDate, iterations: 0 };
    },
    onNoChange: (filePath) => {
      if (selectedFiles.includes(filePath)) {
        let review = reviewDataByFilePath[filePath];
        let lastReview = new Date(review.lastReviewed);
        let today = new Date(now());
        let n = review.iterations;
        let interval = Math.pow(2, n);
        let daysSinceLastReview = Math.floor((today - lastReview) / (1000 * 60 * 60 * 24));
        let grace = Math.max(7, Math.floor(0.25 * interval));

        if (daysSinceLastReview <= interval + grace) {
          review.iterations++;
        } else {
          let overdue = daysSinceLastReview - grace;
          let penalty = Math.floor(overdue / interval);
          let newIterations = Math.max(0, n - penalty);
          log(chalk.gray(
            `Review late by ${daysSinceLastReview} days (interval ${interval}, grace ${grace}). ` +
            `Iterations decreased from ${n} to ${newIterations}.`
          ));
          review.iterations = newIterations;
        }

        review.lastReviewed = today.toISOString();
      }
    }
  });

  const updatedPaths = Array.from(new Set([
    ...selectedFiles,
    ...changes.added,
    ...changes.modified,
    ...changes.deleted
  ]));

  return { changes, updatedPaths };
}

async function selectFilesForReview({ dueFiles, options, fzfSelect }) {
  let files = [];

  if (options.all === true) options.all = Infinity;
  files = options.all
    ? dueFiles.slice(0, options.all).map(f => f.filePath)
    : [dueFiles[0].filePath];

  if (options.select) {
    const selectors = Array.isArray(options.select) ? options.select : [options.select];
    files = files.filter(f =>
      selectors.some(sel => f.includes(sel)));
  }

  if (options.exclude) {
    files = files.filter(f =>
      !options.exclude.some(excluded => f.includes(excluded)));
  }

  if (options.pick) {
    const selected = await fzfSelect(files, { multi: true });
    files = files.filter(f => selected.includes(f));
  }

  return files;
}

function getDueStatus(daysUntilDue, dueDate) {
  const now = new Date();
  const localNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.floor((dueDate - localNow) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) {
    const overdueBy = Math.abs(daysUntilDue);
    let text = `[overdue by: ${overdueBy} days, due ${overdueBy < 7 ? getLocalWeekday(dueDate) : formatMMDDYY(dueDate)}]`;
    return chalk.red(text);
  }
  if (daysUntilDue === 0) {
    return chalk.hex('#4A90E2')('[due today]');
  }
  if (daysUntilDue === 1) {
    const weekday = getLocalWeekday(dueDate);
    const nowDayOfWeek = now.getDay();
    const dueDayOfWeek = dueDate.getDay();
    let text = (nowDayOfWeek <= dueDayOfWeek && nowDayOfWeek !== 0)
      ? `[due tomorrow, ${weekday}]`
      : (diffDays < 7 ? `[due tomorrow, next ${weekday}]` : `[due tomorrow, ${formatMMDDYY(dueDate)}]`);
    return chalk.green(text);
  }
  let text = daysUntilDue <= 7
    ? `[due in: ${daysUntilDue} days, ${getLocalWeekday(dueDate)}]`
    : `[due in: ${daysUntilDue} days, ${formatMMDDYY(dueDate)}]`;
  return chalk.green(text);

  function getLocalWeekday(date) {
    const localMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return localMidnight.toLocaleDateString("en-US", { weekday: "long" });
  }
}

function formatMMDDYY(date) {
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const yy = String(date.getUTCFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function generateLogString(fileData, changes = {}, filePath = "") {
  if (!fileData) {
    return `${chalk.bgRed.white("DELETED:")} ${chalk.white.bold(filePath)}`;
  }

  const bracketText = getDueStatus(fileData.daysUntilDue, fileData.dueDate);
  let prefix = "";
  if (changes.added && changes.added.includes(filePath)) {
    prefix = chalk.bgGreen.black("NEW:") + " ";
  } else if (changes.deleted && changes.deleted.includes(filePath)) {
    prefix = chalk.bgRed.white("DELETED:") + " ";
  } else if (changes.modified && changes.modified.includes(filePath)) {
    prefix = chalk.bgYellow.black("EDITED:") + " ";
  }
  return (
    `${prefix}${chalk.white.bold(fileData.filePath)} ` +
    `${chalk.yellow(`[last: ${fileData.lastInDays} days]`)} ` +
    `${chalk.cyanBright(`[iterations: ${fileData.iterations}]`)} ` +
    bracketText
  );
}

module.exports = review;
