let Topic = require('./shared/topic');
let { getCategoryPathStrings } = require('./shared/fs-helpers');

function utility(options = {}) {
  if (options.categories) {
    try {
      let lines = getCategoryPathStrings();
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
