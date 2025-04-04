let { execSync } = require('child_process');
let path = require('path');
let Topic = require('./shared/topic');

function utility(options = {}) {

  if (options.categories) {
    let topicsDir = path.join(process.cwd(), 'topics');
    try {
      let output = execSync(`find "${topicsDir}" -type d`, { encoding: 'utf8' });
      let lines = output
        .split('\n')
        .map(p => p.trim())
        .filter(p => p && p !== topicsDir)
        .map(p => path.relative(topicsDir, p))
        .map(rel => rel.split(path.sep).join('/'))
        .sort();

      for (let line of lines) {
        console.log(Topic.convertUnderscoresToSpaces(line));
      }
    } catch (err) {
      console.log('Error: Failed to list directories:', err.message);
    }

    return;
  }

  if (options.topics) {
    // list topics for reference auto complete

  }

  if (options.target) {
    // take a link and return the expl target
  }

  console.log('Error: No argument given to utility command');

}

module.exports = utility;
