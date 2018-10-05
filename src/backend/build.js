var generateJsonFilesFromDgsDirectory = require('./generate_json_files_from_dgs_directory');

if (process.argv.length < 4) {
  console.log('Example Usage:')
  console.log('node src/backend/build.js /Users/Me/project/topics /Users/Me/project/build')
  throw('Script requires source and destination path as command line arguments')
}

generateJsonFilesFromDgsDirectory(
  process.argv[2],
  process.argv[3]
);
