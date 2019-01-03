import fs from 'fs';

function paragraphsOfFile(path) {
  let fileContents = fs.readFileSync(path, 'utf8');
  return fileContents.trim().split(/\n\n+/);
}

export default paragraphsOfFile;
