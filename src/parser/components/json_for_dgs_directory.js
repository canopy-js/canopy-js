import fs from 'fs';
import listDgsFilesRecursive from 'helpers/list_dgs_files_recursive.js';
import buildProvisionalNamespaceObject from 'components/build_provisional_namespace_object.js';
import buildFinalNamespaceObject from 'components/build_final_namespace_object.js';
import jsonForDgsFile from 'components/json_for_dgs_file.js';
import topicKeyOfFile from 'helpers/topic_key_of_file';
import { slugFor } from 'helpers/identifiers';
import rimraf from 'rimraf';
import { removeMarkdownTokens } from 'helpers/identifiers';

function jsonForProjectDirectory(sourceDirectory, destinationBuildDirectory, makeFolders) {
  let destinationDataDirectory = destinationBuildDirectory + '/_data';
  let dgsFilePaths = listDgsFilesRecursive(sourceDirectory);
  let namespaceObject = buildProvisionalNamespaceObject(dgsFilePaths);

  rimraf.sync(destinationDataDirectory);
  fs.mkdirSync(destinationDataDirectory);

  dgsFilePaths.forEach(function(path) {
    if (!topicKeyOfFile(path)) return; // For note files

    let finalNamespaceObject = buildFinalNamespaceObject(dgsFilePaths, namespaceObject);
    let json = jsonForDgsFile(path, finalNamespaceObject);
    let dgsFileNameWithoutExtension = path.match(/\/(\w+)\.\w+$/)[1];

    if (dgsFileNameWithoutExtension.includes(' ')) {
      throw 'Data filenames may not contain spaces: ' + path;
    }

    let destinationPath = destinationDataDirectory +
      '/' +
      dgsFileNameWithoutExtension +
      '.json';

    if (process.env['CANOPY_LOGGING']) {
      console.log();
      console.log("WRITING TO " + destinationPath + ": " + json);
    }
    fs.writeFileSync(destinationPath, json);

    if (makeFolders) {
      let capitalizedKeySlug = slugFor(removeMarkdownTokens(topicKeyOfFile(path)));
      let topicFolderPath = destinationBuildDirectory + '/' + capitalizedKeySlug;
      rimraf.sync(topicFolderPath);
      fs.mkdirSync(destinationBuildDirectory + '/' + capitalizedKeySlug);
      if (process.env['CANOPY_LOGGING']) console.log('Created directory: ' + topicFolderPath);
    }
  });
}

export default jsonForProjectDirectory;
