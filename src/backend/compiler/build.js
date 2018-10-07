var generateJsonFilesFromDgsDirectory = require('./parser/generate_json_files_from_dgs_directory');

if (process.argv.length < 3) {
  console.log('Project directory argument required');
  console.log('Example Usage:');
  console.log('node src/backend/build.js /Users/Me/project');
}

var projectDir = process.argv[2].replace(/\/$/, '');

generateJsonFilesFromDgsDirectory(
  projectDir + '/topics',
  projectDir + '/build/data'
);
