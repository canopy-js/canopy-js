const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const bulk = require('./bulk/bulk');
const { enquirerSelect } = require('./shared/pickers');
const chalk = require('chalk');

function getTopicDirectories() {
  const topicsDir = path.join(process.cwd(), 'topics');
  const output = execSync(`find "${topicsDir}" -type d`, { encoding: 'utf8' });
  return output
    .split('\n')
    .map(p => p.trim())
    .filter(p => p && p !== topicsDir)
    .map(p => path.relative(topicsDir, p).split(path.sep).join('/'))
    .sort();
}

async function promptForNote() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const text = await new Promise(resolve => rl.question('Note: ', resolve));
  rl.close();
  return text.trim();
}

async function note(args = []) {
  if (!fs.existsSync('./topics')) throw new Error(chalk.red("You are not in a Canopy project directory."));

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
    const dirs = getTopicDirectories();
    const [selected] = await enquirerSelect(dirs, {
      allowCustomInput: true,
      multi: false
    });
    categoryPath = selected;
  }

  if (!categoryPath || !noteText) {
    throw new Error(chalk.red('Must provide a category path and a note'));
  }

  const bulkText = `[${categoryPath}]\n\n${noteText}\n`;
  const tmpFile = '.canopy_note_input';
  fs.writeFileSync(tmpFile, bulkText);

  await bulk([], { bulkFileName: tmpFile, finish: true, blank: true });

  const finalSegment = categoryPath.split('/').pop();
  console.log(`✅ Note added to topics/${categoryPath}/${finalSegment}.expl`);
}

module.exports = note;
