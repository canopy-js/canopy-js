import fs from 'fs';
import listDgsFilesRecursive from 'helpers/list_dgs_files_recursive.js';
import buildNamespaceObject from 'components/build_namespace_object.js';
import jsonForDgsFile from 'components/json_for_dgs_file.js';
import extractKeyAndParagraph from 'helpers/extract_key_and_paragraph';
import topicKeyOfFile from 'helpers/topic_key_of_file';
import { slugFor } from 'helpers/identifiers';
import rimraf from 'rimraf';

function jsonForProjectDirectory(sourceDirectory, destinationBuildDirectory) {
  let destinationDataDirectory = destinationBuildDirectory + '/_data';
  let dgsFilePaths = listDgsFilesRecursive(sourceDirectory);
  let namespaceObject = buildNamespaceObject(dgsFilePaths);

  rimraf.sync(destinationDataDirectory);
  fs.mkdirSync(destinationDataDirectory);

  dgsFilePaths.forEach(function(path) {
    let json = jsonForDgsFile(path, namespaceObject);
    let dgsFileNameWithoutExtension = path.match(/\/(\w+)\.\w+$/)[1];

    if (dgsFileNameWithoutExtension.includes(' ')) {
      throw 'Data filenames may not contain spaces: ' + path;
    }

    let destinationPath = destinationDataDirectory +
      '/' +
      dgsFileNameWithoutExtension +
      '.json';

    console.log();
    console.log("WRITING TO " + destinationPath + ": " + json);
    fs.writeFileSync(destinationPath, json);

    let capitalizedKeySlug = slugFor(topicKeyOfFile(path));
    let topicFolderPath = destinationBuildDirectory + '/' + capitalizedKeySlug;
    if (!fs.existsSync(topicFolderPath)) {
      fs.mkdirSync(destinationBuildDirectory + '/' + capitalizedKeySlug);
    }
    console.log('Created directory: ' + topicFolderPath);
  });
}

export default jsonForProjectDirectory;
