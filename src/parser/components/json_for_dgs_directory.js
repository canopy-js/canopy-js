import fs from 'fs';
import listDgsFilesRecursive from 'helpers/list_dgs_files_recursive.js';
import buildNamespaceObject from 'components/build_namespace_object.js';
import jsonForDgsFile from 'components/json_for_dgs_file.js';
import extractKeyAndParagraph from 'helpers/extract_key_and_paragraph';
import topicKeyOfFile from 'helpers/topic_key_of_file';
import { slugFor } from 'helpers/identifiers';
import rimraf from 'rimraf';
import { removeMarkdownTokens } from 'helpers/identifiers';

function jsonForProjectDirectory(sourceDirectory, destinationBuildDirectory, makeFolders) {
  let destinationDataDirectory = destinationBuildDirectory + '/data';
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

    if (process.env['CANOPY_LOGGING']) console.log();
    if (process.env['CANOPY_LOGGING']) console.log("WRITING TO " + destinationPath + ": " + json);
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
