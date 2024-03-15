import './playground.scss';
import { rebuild as rebuildCanopy } from '../client/rebuild_canopy';

let playgroundContainer = document.createElement('DIV');
playgroundContainer.id = 'playground-container';
document.body.appendChild(playgroundContainer);

let editorContainer = document.createElement('DIV');
editorContainer.id = 'editor-container';
playgroundContainer.appendChild(editorContainer);

let editor = document.createElement('TEXTAREA');
editor.id = 'editor';
editorContainer.appendChild(editor);

let consoleElement = document.createElement('DIV');
consoleElement.id = 'console';
editorContainer.appendChild(consoleElement);
consoleElement.innerText = defaultConsoleText();
function defaultConsoleText() {
  return 'Edit the text area and then deselect to rebuild project. Delete text to restore default.';
}

let scrollableContainer = document.createElement('DIV');
scrollableContainer.id = 'scrollable-container';
playgroundContainer.appendChild(scrollableContainer);

let canopyContainer = document.createElement('DIV');
canopyContainer.id = '_canopy';
scrollableContainer.appendChild(canopyContainer);

const defaultText = require('./default_text').default;
let newBulkFileString = localStorage.getItem('data') || defaultText;
if (['localhost', '127.0.0.1'].includes(window.location.hostname)) newBulkFileString = defaultText;

editor.value = newBulkFileString;
editor.addEventListener('blur', (e) => setTimeout(() => tryBuild()));

editor.addEventListener('focus', () => {
  if (consoleElement.classList.contains('error')) return;
  consoleElement.innerText = defaultConsoleText();
});

fetch = (url) => console.log(`Fetch request for '${url}' canceled by plaground`) || Promise.reject();

tryBuild();

function tryBuild() {
  editor.value = editor.value || defaultText;
  localStorage.setItem('data', editor.value);

  consoleElement.classList.remove('error');
  consoleElement.innerText = defaultConsoleText();

  try {
    rebuildCanopy(editor.value);
  } catch(e) {
    consoleElement.innerText = e.message;
    consoleElement.classList.add('error');
    canopyContainer.innerHTML = '<h1> Error </h1>';
    console.error(e);
  }
}
