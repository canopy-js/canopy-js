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
    ({ directoriesToEnsure, filesToWrite } = jsonForProjectDirectory(newFileSet.fileContentsByPath, null, defaultTopicKey));
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

Part 2-1: This content is being generated from the text on the left, which can be edited live.
===
> [[Part 2-2|Cool]]
===

Part 2-2: In Canopy, selecting links adds more paragraphs to the page.
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

Part 11-1: So, now you've seen the main feature set of Canopy.
===
> [[Part 11-2|Great]]
===

Part 11-2: So, you’re probably thinking, “Amazing! But, what would I actually use this for?”
===
> [[Part 11-3|True]]
===

Part 11-3: The answer is, Canopy is a good fit for any domain that is:
1. Detailed
2. Broad
3. Highly-interconnected
4. Where different users need meaningfully different information from the same corpus
===
> [[Part 11-4|Interesting]]
===

Part 11-4: Lets see some examples.
===
> [[Part 11-5|Okay]]
===

Part 11-5: Canopy might be a good fit for historical information. For example:
- [[World War I]]
- [[World War II]]
===
> [[Part 11-6|Okay]]
===

World War I: World War I was a conflict that lasted from 1914–1918.
===
- [[Results of WWI]]
===

Results of WWI: The Treaty of Versailles which forced Germany to accept blame and financial obligations for the war, is cited as one of the [[#causes of WWII]]
===
> [[#Part 11-6|Done]]
===

World War II: World War II was a conflict that lasted from 1939-1945.
===
- [[Causes of WWII]]
===

Causes of WWII: The Treaty of Versailles which heavily penalized Germany was one of the major [[#results of WWI]]
===
> [[#Part 11-6|Done]]
===

Part 11-6: Another application area is documenting large software projects.
===
> [[Part 11-7|How so?]]
===

Part 11-7: Let’s see an example. “MailerApp” is a tool for managing email lists. [[Part 11-8|(Continue)]]
===
- [[Features]]
- [[Patterns]]
- [[Code]]
===

Features: A major feature of MailerApp is [[message scheduling]].

Message scheduling: Message scheduling is when a user logs in to the app, creates a message, and schedules it to be sent.
- This functionality is implemented using a [[#sending queue]]
===
> [[#Part 11-8|Done]]
===

Patterns: The app has certain high-level abstractions that support the features, such as the [[sending queue]].

Sending queue: MailerApp allows a user to schedule emails to be sent.
- This is done by creating a “sending queue.”
- The job of the queue is to keep track of a list of messages the user has scheduled, and whether they have been sent yet.
- The queue must be checked periodically to see if there are unsent messages, and to send them.
- These concepts are implemented in the using [[#SendWorker class]] and the [[#PendingMessages database table]]
===
> [[#Part 11-8|Done]]
===

Code: The code base has a [[\`SendWorker\` class]], and a [[\`PendingMessages\` database table]].

SendWorker class: The \`SendWorker\` class periodically checks the \`PendingMessages\` table of the database and makes a SMPT request when it sees a record with \`sent\` set to false.
- The \`SendWorker\` class relies on the [[#PendingMessages database table]].
- The \`SendWorker\` class is part of the implementation of the app's [[#sending queue]]
===
> [[#Part 11-8|Done]]
===

PendingMessages database table: There is a \`PendingMessages\` database table:
- The \`PendingMessages\` table has a \`text\` field for the text of the email.
- The \`PendingMessages\` table has a \`sent\` boolean field to indicate whether the message has been sent yet.
- The PendingMessages table is used by the [[#SendWorker class]]
- The SendWorker class is part of the implementation of the app's [[#sending queue]]
===
> [[#Part 11-8|Done]]
===

Part 11-8: Lastly, Canopy can be useful for building personal knowledge bases.
===
> [[Part 11-9|What’s that?]]
===

Part 11-9: The concept of a personal blog has become very common.
- However, an author may make the same point many times.
- Additionally, certain useful points might not merit a full article.
- Also, certain topic connections may be too dense to capture in an article.
===
> [[Part 11-10|Okay]]
===

Part 11-10: So, an author could use Canopy to represent “all” their views on a variety of subjects, creating a network of interconnected points, with each user exploring in different directions.
===
> [[Part 12-1|Got it]]
===

Part 12-1: 👋 That's all for now! Click here to [learn more about Canopy.js](https://github.com/canopy-js/canopy-js) or get in touch at \`hello at canopyjs dot org\`.


[Oceans]

* Atlantic Ocean: Now we have started a new explanation about the Atlantic Ocean!
- (The *second* time you see this text, click [[Part 10-3|here]].)
===
> [[Part 10-1|Click here first]]
===
![Atlantic Ocean](https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/1710_De_La_Feuille_Map_of_Africa_-_Geographicus_-_Africa-lafeuille-1710.jpg/1920px-1710_De_La_Feuille_Map_of_Africa_-_Geographicus_-_Africa-lafeuille-1710.jpg "Atlantic Ocean" "Credit Wikipedia")

Part 10-1: The Atlantic ocean connects via the Panama Canal to the [[Pacific Ocean]].
- Try clicking the link above normally.

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

Part 10-2: Now lets start the explanation from [[Pacific Ocean]].
- Try clicking that link normally.
- The *second time* you see this, click [[Part 10-3|here]]

Part 10-3: The Pacific ocean connects via the Panama Canal to the [[Atlantic Ocean]].
- Try clicking that link normally.



[Chemistry]

* Chemical Element: A chemical element is a substance that cannot be broken down further by chemical reactions.`;
}
