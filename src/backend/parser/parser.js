import generateJsonFilesFromDgsDirectory from './components/generate_json_files_from_dgs_directory';

if (process.argv.length < 3) {
  console.log('Project directory argument required');
  console.log('Example Usage:');
  console.log('node dist/parser.js /Users/Me/project');
  throw('Missing commandline argument');
}

var projectDir = process.argv[2].replace(/\/$/, '');

generateJsonFilesFromDgsDirectory(
  projectDir + '/topics',
  projectDir + '/build/data'
);
