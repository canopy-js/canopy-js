// Take a bulk string and build or rebuild the #_canopy element.

let Topic = require('../cli/shared/topic');

function rebuild (bulkFileString) {
  const REQUEST_CACHE = require('requests/request_cache').default;
  if (!bulkFileString) throw new Error('No bulk file string given');
  let canopyContainer = document.querySelector('#_canopy'); // run after DOM set up

  try {
    Array.from(canopyContainer.children).forEach(child => { // clear old header data
      if (child.tagName === 'SECTION' || child.tagName === 'H1') {
        canopyContainer.removeChild(child);
      }
    });

    let BulkFileParser = require('../cli/bulk/bulk_file_parser');
    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet, defaultTopicKey } = bulkFileParser.generateFileSet();
    let Block = require('../cli/shared/block');
    defaultTopicKey ||= bulkFileString.split('\n').map(line => Block.for(line.match(/^\*?\*? ?(.*)/)[1]).key).find(key => key);
    let defaultTopic = Topic.for(defaultTopicKey);

    canopyContainer.dataset.defaultTopic = defaultTopic.mixedCase;
    canopyContainer.dataset.hashUrls = true;
    canopyContainer.dataset.projectPathPrefix = canopyContainer.dataset.projectPathPrefix || '';

    let jsonForProjectDirectory = require('../cli/build/components/json_for_project_directory');

    let filesToWrite;
    ({ filesToWrite } = jsonForProjectDirectory(newFileSet.fileContentsByPath, defaultTopicKey));

    for (let key in REQUEST_CACHE) { // Remove old data
      if (REQUEST_CACHE.hasOwnProperty(key)) {
        delete REQUEST_CACHE[key];
      }
    }

    // Copy new data into the cache
    Object.keys(filesToWrite).forEach(filePath => {
      let { displayTopicName } = JSON.parse(filesToWrite[filePath]);
      REQUEST_CACHE[Topic.for(displayTopicName).mixedCase] = Promise.resolve(JSON.parse(filesToWrite[filePath]));
    });

    // New data might invalidate old URL
    let Path = require('models/path').default;
    let path = Path.for(window.location.hash.slice(2));
    let firstTopic = path.firstTopic;

    if (firstTopic && !REQUEST_CACHE.hasOwnProperty(firstTopic.mixedCase)) { // URL invalid
      history.replaceState(null, null, location.pathname + location.search); // clear fragment
    }

    require('render/fetch_and_render_path').invalidateFetchAndRenderCache();
    require('models/paragraph').default.paragraphsByPath = {};

    require('./canopy.js');

    if (window.location.hash) {
      Path.current.display();
    } else {
      Path.initial.display({ scrollStyle: 'instant' });
    }
  } catch(e) {
    history.replaceState(null, null, location.pathname + location.search); // clear fragment in case of invalid URL
    let ScrollableContainer = require('helpers/scrollable_container').default;
    ScrollableContainer.scrollTo({ top: 0 });
    throw e;
  }
}

export { rebuild };
