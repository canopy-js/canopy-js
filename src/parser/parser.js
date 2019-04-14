import jsonForProjectDirectory from './components/json_for_dgs_directory';

if (process.argv.length < 2) {
  console.log('Project directory argument required');
  console.log('Example Usage:');
  console.log('node dist/parser.js /Users/Me/project');
  throw('Missing commandline argument');
}

let projectDir = process.argv[2].replace(/\/$/, '');

jsonForProjectDirectory(
  projectDir + '/topics',
  projectDir + '/build',
  process.argv[3] !== '--without-folders'
);
