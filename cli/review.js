const chalk = require('chalk');

async function review(options = {}, {
  fs = require('fs'),
  path = require('path'),
  getExplFileObjects = require('./build/components/fs-helpers').getExplFileObjects,
  bulk = require('./bulk/bulk'),
  now = () => Date.now(),
  log = console.log
} = {}) {
  let explFileObjects = getExplFileObjects('topics', options);
  if (!fs.existsSync('./topics')) throw new Error('There must be a topics directory present, try running "canopy init"');

  // Read dotfile with full ISO timestamps.
  let reviewDataByFilePath = Object.fromEntries(
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

  // First scan: update reviewData based on current file modTimes.
  scanFileSystem({
    explFileObjects,
    reviewDataByFilePath,
    path,
    now,
    onAddition: (filePath) => {
      const currentDate = new Date(now()).toISOString();
      log(chalk.gray(`Tracking new file: ${filePath} with review date ${currentDate}.`));
      reviewDataByFilePath[filePath] = { lastReviewed: currentDate, iterations: 0 };
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

  let allFilesWithMetadata = Object.keys(explFileObjects)
    .map(filePath => computeMetadata(filePath, reviewDataByFilePath[filePath], now))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  let dueFilesWithMetadata = allFilesWithMetadata.filter(file => file.daysUntilDue <= 0);

  if (options.list) {
    for (let fileData of allFilesWithMetadata) {
      log(generateLogString(fileData));
    }
  }

  if (!options.list) {
    let originalFilePaths = [];
    if (dueFilesWithMetadata.length > 0) {
      originalFilePaths = options.all
        ? dueFilesWithMetadata.map(file => file.filePath)
        : [dueFilesWithMetadata[0].filePath];
    } else if (allFilesWithMetadata.length > 0) {
      originalFilePaths = [allFilesWithMetadata[0].filePath];
    }

    if (originalFilePaths.length) {
      try {
        await bulk(originalFilePaths);
      } catch(e) {
        return log(chalk.red('Review aborted.'));
      }

      // Refresh state after bulk review.
      explFileObjects = getExplFileObjects(path.resolve('topics'), options);
    }

    // Second scan: apply decay/increment logic.
    if (originalFilePaths.length) {
      let changes = { added: [], deleted: [], modified: [] };

      scanFileSystem({
        reviewDataByFilePath,
        explFileObjects,
        path,
        now,
        onAddition: (filePath) => {
          const currentDate = new Date(now()).toISOString();
          changes.added.push(filePath);
          reviewDataByFilePath[filePath] = { lastReviewed: currentDate, iterations: 0 };
          return;  // ensure only one branch executes per file
        },
        onDeletion: (filePath) => {
          changes.deleted.push(filePath);
          delete reviewDataByFilePath[filePath];
          return;
        },
        onChange: (filePath) => {
          const currentDate = new Date(now()).toISOString();
          changes.modified.push(filePath);
          reviewDataByFilePath[filePath] = { lastReviewed: currentDate, iterations: 0 };
          return;
        },
        onNoChange: (filePath) => {
          if (originalFilePaths.includes(filePath)) {
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

      let logFilePaths = Array.from(new Set([...originalFilePaths, ...changes.added, ...changes.modified, ...changes.deleted]));
      for (let filePath of logFilePaths) {
        const updated = reviewDataByFilePath[filePath] && computeMetadata(filePath, reviewDataByFilePath[filePath], now);
        log(generateLogString(updated, changes, filePath));
      }
    }
  }

  let reviewMetadataContent = Object.entries(reviewDataByFilePath)
    .map(([filePath, { lastReviewed, iterations }]) => `${filePath} ${lastReviewed} ${iterations}`)
    .sort()
    .join('\n') + '\n';
  fs.writeFileSync('./.canopy_review_data', reviewMetadataContent);
}

function computeMetadata(filePath, fileReviewDataObject, now) {
  let { iterations } = fileReviewDataObject;
  let timestamp = new Date(fileReviewDataObject.lastReviewed).getTime();
  const nowTimestamp = now();
  let ageInMilliseconds = nowTimestamp - timestamp;
  let ageInDays = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24));
  let reviewThresholdInDays = iterations === 0 ? 1 : Math.pow(2, iterations);
  let daysUntilDue = reviewThresholdInDays - ageInDays;
  const due = new Date(timestamp + reviewThresholdInDays * 24 * 60 * 60 * 1000);
  const localDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  return {
    filePath,
    iterations,
    ageInDays,
    daysUntilDue,
    dueDate: localDue
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

function getDueStatus(daysUntilDue, dueDate) {
  const now = new Date();
  const diffDays = Math.floor((dueDate - now) / (1000 * 60 * 60 * 24));
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
  const mm = date.getMonth() + 1;
  const dd = date.getDate();
  const yy = String(date.getFullYear()).slice(-2);
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
    prefix = chalk.bgYellow.black("CHANGED:") + " ";
  }
  return (
    `${prefix}${chalk.white.bold(fileData.filePath)} ` +
    `${chalk.yellow(`[age: ${fileData.ageInDays} days]`)} ` +
    `${chalk.cyanBright(`[iterations: ${fileData.iterations}]`)} ` +
    bracketText
  );
}

module.exports = review;
