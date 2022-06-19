import fs from 'fs';
import listExplFilesRecursive from 'helpers/list_expl_files_recursive.js';
import buildProvisionalNamespaceObject from 'components/build_provisional_namespace_object.js';
import buildFinalNamespaceObject from 'components/build_final_namespace_object.js';
import jsonForExplFile from 'components/json_for_expl_file.js';
import topicKeyOfFile from 'helpers/topic_key_of_file';
import { slugFor } from 'helpers/identifiers';
import rimraf from 'rimraf';
import { removeMarkdownTokens } from 'helpers/identifiers';

function jsonForProjectDirectory(sourceDirectory, destinationBuildDirectory, makeFolders) {
  let destinationDataDirectory = destinationBuildDirectory + '/_data';
  let explFilePaths = listExplFilesRecursive(sourceDirectory);
  let namespaceObject = buildProvisionalNamespaceObject(explFilePaths);

  rimraf.sync(destinationDataDirectory);
  fs.mkdirSync(destinationDataDirectory);

  explFilePaths.forEach(function(path) {
    if (!topicKeyOfFile(path)) return; // For note files

    let finalNamespaceObject = buildFinalNamespaceObject(explFilePaths, namespaceObject);
    let json = jsonForExplFile(path, finalNamespaceObject);
    let explFileNameWithoutExtension = path.match(/\/([\w-]+)\.\w+$/)[1];

    if (explFileNameWithoutExtension.includes(' ')) {
      throw 'Data filenames may not contain spaces: ' + path;
    }

    let destinationPath = destinationDataDirectory +
      '/' +
      explFileNameWithoutExtension +
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
