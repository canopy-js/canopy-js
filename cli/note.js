const fs = require('fs');
const path = require('path');
const readline = require('readline');
const bulk = require('./bulk/bulk');
const { enquirerSelect } = require('./shared/pickers');
const chalk = require('chalk');
let { getCategoryPathStrings } = require('./shared/fs-helpers');

async function promptForNote() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const text = await new Promise(resolve => rl.question(chalk.yellow('Note: '), resolve));
  rl.close();
  return text.trim();
}

async function note(args = []) {
  if (!fs.existsSync('./topics')) throw new Error(chalk.red("You are not in a Canopy project directory.  Try canopy init to start project."));

  let [categoryPath, noteText] = Array.isArray(args) ? args : [];

  if (!noteText && process.stdin.isTTY) {
    noteText = await promptForNote();
  } else if (!noteText) {
    noteText = await new Promise(resolve => {
      const chunks = [];
      process.stdin.on('data', chunk => chunks.push(chunk));
      process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString().trim()));
      process.stdin.resume();
    });
  }

  if (!categoryPath && process.stdin.isTTY) {
    const dirs = getCategoryPathStrings();
    const selected = await enquirerSelect(dirs, {
      allowCustomInput: true,
      multi: false
    });

    categoryPath = selected;
  }

  if (!categoryPath || !noteText) {
    throw new Error(chalk.red('Must provide a category path and a note'));
  }

  noteText = noteText.replace(/(^[^-][^:;.,?!]*[^\\])(?=[:?](?=\s|$))/, '$1\\'); // escape : or ? that are part of plaintext not key delimiter
  const bulkText = `[${categoryPath}]\n\n${noteText}\n`;
  const tmpFile = '.canopy_note_input';
  fs.writeFileSync(tmpFile, bulkText);

  await bulk([], { bulkFileName: tmpFile, finish: true, blank: true });

  const finalSegment = path.basename(categoryPath);
  console.log(`✅ Note added to topics/${categoryPath}/${finalSegment}.expl`);
}

module.exports = note;
