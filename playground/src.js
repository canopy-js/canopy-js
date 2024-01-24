import './playground.scss';

let playgroundContainer = document.createElement('DIV');
playgroundContainer.id = 'playground-container';
document.body.appendChild(playgroundContainer);

let editorContainer = document.createElement('DIV');
editorContainer.id = 'editor-container';
playgroundContainer.appendChild(editorContainer);

let editor = document.createElement('TEXTAREA');
editor.id = 'editor'; // Added class
editorContainer.appendChild(editor);

let consoleElement = document.createElement('DIV');
consoleElement.id = 'console';
editorContainer.appendChild(consoleElement);
consoleElement.innerText = defaultConsoleText();
function defaultConsoleText() { return 'Edit the text area and then deselect to rebuild project. Delete text to restore default.';}

let scrollableContainer = document.createElement('DIV');
scrollableContainer.id = 'scrollable-container';
playgroundContainer.appendChild(scrollableContainer);

let canopyContainer = document.createElement('DIV');
canopyContainer.id = '_canopy';
scrollableContainer.appendChild(canopyContainer);

let newBulkFileString = localStorage.getItem('data') || defaultText();

localStorage.setItem('data', newBulkFileString);

editor.value = newBulkFileString;
editor.addEventListener('blur', (e) => setTimeout(() => rebuildCanopy(!!e)));
editor.addEventListener('focus', () => {
  if (consoleElement.classList.contains('error')) return;
  consoleElement.innerText = defaultConsoleText();
});

let BulkFileParser = require('../cli/bulk/bulk_file_parser');
let Topic = require('../cli/shared/topic');
import REQUEST_CACHE from 'requests/request_cache';
fetch = (url) => console.log(`Fetch request for '${url}' canceled by plaground`) || new Promise(() => {})
let Block = require('../cli/shared/block');
rebuildCanopy(); // initial build

let updateView = require('display/update_view').default;
let Path = require('models/path').default;

function rebuildCanopy(edit) {
  Array.from(canopyContainer.children).forEach(child => {
    if (child.tagName === 'SECTION' || child.tagName === 'H1') {
      canopyContainer.removeChild(child);
    }
  });

  try {
    editor.value = editor.value || defaultText();
    localStorage.setItem('data', editor.value);
    let bulkFileParser = new BulkFileParser(editor.value);
    let { newFileSet, defaultTopicPath, defaultTopicKey } = bulkFileParser.generateFileSet();
    defaultTopicKey ||= editor.value.split('\n').map(line => Block.for(line.match(/^\*?\*? ?(.*)/)[1]).key).find(key => key);
    let defaultTopic = Topic.for(defaultTopicKey);

    canopyContainer.dataset.defaultTopic = defaultTopic.mixedCase;
    canopyContainer.dataset.hashUrls = true;
    canopyContainer.dataset.projectPathPrefix = '';

    // if (!edit) history.replaceState(null, null, location.pathname + location.search); // clear fragment

    let jsonForProjectDirectory = require('../cli/build/components/json_for_project_directory');

    let directoriesToEnsure, filesToWrite;
    ({ directoriesToEnsure, filesToWrite } = jsonForProjectDirectory(newFileSet.fileContentsByPath, defaultTopicKey, {}));
    consoleElement.classList.remove('error');
    consoleElement.innerText = '';

    if (edit) { // Remove old data
      for (let key in REQUEST_CACHE) {
        if (REQUEST_CACHE.hasOwnProperty(key)) {
          delete REQUEST_CACHE[key];
        }
      }
    }

    // Copy new data into the cache
    Object.keys(filesToWrite).forEach(filePath => {
      let { displayTopicName } = JSON.parse(filesToWrite[filePath]);
      REQUEST_CACHE[Topic.for(displayTopicName).mixedCase] = Promise.resolve(JSON.parse(filesToWrite[filePath]));
    });

    // New data might invalidate old URL
    let hash = window.location.hash.slice(2).match(/^(.*?)(?<!\\)(?=[#\/]|$)/)[0];
    let hashWithSpaces = Topic.convertUnderscoresToSpaces(hash);
    if (!REQUEST_CACHE.hasOwnProperty(hashWithSpaces)) { // URL invalid
      history.replaceState(null, null, location.pathname + location.search); // clear fragment
    }

    if (edit) Path.initial.display({ scrollStyle: 'instant' });

    consoleElement.innerText = defaultConsoleText();

    require('../client/canopy.js');
  } catch(e) {
    consoleElement.innerText = e.message;
    consoleElement.classList.add('error');
    canopyContainer.innerHTML = '<h1> Error </h1>'
    history.replaceState(null, null, location.pathname + location.search); // clear fragment in case of invalid URL
    return;
  }
}

function defaultText() {
  return `[Canopy/Playground]

* Playground: This is a demo of Canopy.js, a library for creating interactive explanations.
![Canopy.js Logo](./logo.png)
===
> [[Part 2|Okay]]
===

Part 2: Canopy generates interactive websites from an easy-to-use text format.
===
> [[Part 2-1|Okay]]
===

Part 2-1: This website is being generated from the text on the left.
===
> [[Part 2-2|Cool]]
===

Part 2-2: See if you can find this paragraph on the left, edit it, and then deselect the text box to see the change.
===
> [[Part 2-3|Done]]
===

Part 2-3: Great! In Canopy, selecting links adds more paragraphs to the page.
===
> [[Part 3|I see]]
===

Part 3: Paths in Canopy can go in multiple directions.
===
> [[Part 4|Like this]]
> [[Part 5|Or like this]]
> [[Part 6|Continue]]
===

Part 4: This is one direction. [[Part 4-1|Go deeper]].

Part 4-1: This is more info.

Part 5: This is another direction. [[Part 5-1|Go deeper]].

Part 5-1: This is even more info.

Part 6: Links and buttons can redirect the user to a different part of the tree.
===
> [[Part 6-1|Go here first]]
> [[Part 6-2|You'll be taken here]]
===

Part 6-1:
===
< [[Part 6-1-A|Go deeper]]
===

Part 6-1-A:
===
< [[Part 6-1-B|Go deeper]]
===

Part 6-1-B:
===
< [[Part 6-1-C|Go deeper]]
===

Part 6-1-C:
===
< [[#Part 6-2-C|Go somewhere else]]
===


Part 6-2:
===
> [[Part 6-2-A|Down]]
===

Part 6-2-A:
===
> [[Part 6-2-B|Down]]
===

Part 6-2-B:
===
> [[Part 6-2-C|Down]]
===

Part 6-2-C: Welcome to this other part!
===
> [[Part 7|Continue]]
===

Part 7: Why might you use Canopy?
===
> [[Part 7-1|Tell me!]]
===

Part 7-1: Canopy allows you to create explanations that are customized to each reader, like this:
===
> [[Part 7-2|I love detail]]
> [[Part 7-3|I hate detail!]]
===

Part 7-2: Here it is!

Part 7-3: You won't see any!
===
> [[Part 8|What else can it do?]]
===

Part 8: Canopy can help you create very large explanations.
===
> [[Part 8-1|What do you mean?]]
===

Part 8-1: Each paragraph here can mention several other ideas, like this:
- [[Idea \\#1]], [[idea \\#2]], [[idea \\#3]], [[idea \\#4]].
===
> [[Part 8-2|Okay]]
===

Idea #1: This is the first idea!

Idea #2: This is the second idea!

Idea #3: This is the third idea!

Idea #4: This is the fourth idea!

Part 8-2: And, each path can go very deep, like this: [[{idea \\#1}-2]]

Idea #1-2: And [[{idea \\#2}-2]]

Idea #2-2: And [[{idea \\#3}-2]]

Idea #3-2: And [[{idea \\#4}-2]]

Idea #4-2: That's very deep!
===
> [[Part 8-3|Okay]]
===

Part 8-3: So:
- Lets say each paragraph mentions four other ideas
- And, lets say a user can burrow down seven paragraphs in any direction
- How many paragraphs would that be total?
===
> [[Part 8-4|How many?]]
===

Part 8-4: That would be over 1,000,000 paragraphs!
===
> [[Part 8-5|That's a lot!]]
===

Part 8-5: It is! Now you can see how Canopy might help you organize very large explanations.
===
> [[Part 9|What else does it do?]]
===

Part 9: Canopy allows you to build explanations out of reusable components.
===
> [[Part 9-1|What does that mean?]]
===

Part 9-1: Here are two explanations that reference the same concept:
- [[Carbon]]
- [[Nitrogen]]
===
> [[Part 10|I'm finished]]
===

Carbon: Carbon is a [[chemical element]] that has the symbol \`C\` and the number 6.

Nitrogen: Nitrogen is a [[chemical element]] that has the symbol \`N\` and the number 7.

Part 10: Great! Now lets see how entirely different explanations  can end up using the same content.
===
> [[Part 10-1|Ok]]
===

Part 10-1: Here is an explanation of the [[Atlantic Ocean]].
- Try *holding the option or alt key* and clicking the link above.
===
> [[Part 11|I'm finished]]
===

Part 11: *Welcome back!* See, we've returned to where we started before all that Oceans business.
===
> [[Part 11-1|Great!]]
===

Part 11-1: 👋 That's all for now! Click here to [learn more about Canopy.js](https://github.com/canopy-js/canopy-js) or get in touch at \`hello at canopyjs dot org\`.


[Oceans]

* Atlantic Ocean: Now we have started a new explanation about the Atlantic Ocean!
- (The *second time* you see this text, click [[Part 10-3|*here*]].)
===
> [[Part 10-1|Click here first]]
===
![Atlantic Ocean](https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/1710_De_La_Feuille_Map_of_Africa_-_Geographicus_-_Africa-lafeuille-1710.jpg/1920px-1710_De_La_Feuille_Map_of_Africa_-_Geographicus_-_Africa-lafeuille-1710.jpg "Atlantic Ocean" "Credit Wikipedia")

Part 10-1: The Atlantic ocean connects via the Panama Canal to the [[Pacific Ocean]].
- Try clicking the link above normally, *then try again with the alt or option key.*

Part 10-3: We went in a circle and ended up back where we started!
===
> [[Part 10-4|Wow!]]
===

Part 10-4: Explanations starting from different points can end up covering the same material!
- Click the button below for a dramatic return to our original location:
===
> [[Playground#Part 11|Great, now take me back]]
===


* Pacific Ocean: Now we have begun an explanation of the Pacific Ocean:
![Pacific Ocean](https://upload.wikimedia.org/wikipedia/commons/4/4e/Ortelius_-_Maris_Pacifici_1589.jpg "Atlantic Ocean" "Credit Wikipedia")
===
> [[Part 10-2|Great!]]
===

Part 10-2: The Pacific ocean connects via the Panama Canal to the [[Atlantic Ocean]].
- Try clicking that link normally.



[Chemistry]

* Chemical Element: A chemical element is a substance that cannot be broken down further by chemical reactions.`;
}
