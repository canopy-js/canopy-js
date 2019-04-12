import { slugFor } from 'helpers/identifiers';
import { onParentLinkClick, onGlobalLinkClick } from 'render/click_handlers';
import externalLinkIconSvg from 'assets/external_link_icon/icon.svg';
import renderStyledText from 'render/render_styled_text';
import eagerLoad from 'requests/eager_load';

function renderTokenElement(token, renderContext) {
  if (token.type === 'text') {
    return renderTextToken(token);
  } else if (token.type === 'local') {
    return renderParentLink(token, renderContext);
  } else if (token.type === 'global') {
    return renderGlobalLink(token, renderContext);
  } else if (token.type === 'url') {
    return renderLinkLiteral(token);
  } else if (token.type === 'image') {
    return renderImage(token);
  } else if (token.type === 'html') {
    return renderHtml(token);
  } else if (token.type === 'footnote') {
    return renderFootnoteSymbol(token);
  }
}

function renderTextToken(token) {
  let spanElement = document.createElement('SPAN');
  let styleElements = renderStyledText(token.text);
  appendElementsToParent(styleElements, spanElement);

  return spanElement;
}

function renderParentLink(token, renderContext) {
  let {
    subtopicsAlreadyRendered,
    parentLinkSubtreeCallback
  } = renderContext;

  if (!subtopicsAlreadyRendered.hasOwnProperty(token.targetSubtopic)) {
    parentLinkSubtreeCallback(token);
    return renderRegularParentLink(token);
  } else {
    return renderRedundantParentLink(token);
  }
}

function renderRegularParentLink(token) {
  let linkElement = renderSharedParentLinkBase(token);
  linkElement.classList.add('canopy-local-link');
  linkElement.dataset.type = 'local';
  linkElement.dataset.urlSubtopic = token.targetSubtopic;
  linkElement.href = `/${slugFor(token.targetTopic)}#${slugFor(token.targetSubtopic)}`;
  return linkElement;
}

function renderRedundantParentLink(token) {
  let linkElement = renderSharedParentLinkBase(token);
  linkElement.classList.add('canopy-redundant-local-link');
  linkElement.dataset.type = 'redundant-local';
  linkElement.dataset.urlSubtopic = token.enclosingSubtopic;
  linkElement.href = `/${slugFor(token.enclosingTopic)}#${slugFor(token.enclosingSubtopic)}`;
  return linkElement;
}

function renderSharedParentLinkBase(token) {
  let styleElements = renderStyledText(token.text);
  let linkElement = document.createElement('a');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  linkElement.dataset.text = token.text;
  appendElementsToParent(styleElements, linkElement);
  linkElement.addEventListener(
    'click',
    onParentLinkClick(token.targetTopic, token.targetSubtopic, linkElement)
  );
  return linkElement;
}

function renderGlobalLink(token, renderContext) {
  let {
    pathArray,
    subtopicName,
    globalLinkSubtreeCallback
  } = renderContext;

  window.setTimeout(() => eagerLoad(token.targetTopic), 0);

  let linkElement = createGlobalLinkElement(token, pathArray);

  if (globalLinkIsOpen(linkElement, pathArray, subtopicName)) {
    globalLinkSubtreeCallback(token);
  }

  return linkElement;
}

function createGlobalLinkElement(token) {
  let styleElements = renderStyledText(token.text);
  let linkElement = document.createElement('a');
  appendElementsToParent(styleElements, linkElement);
  linkElement.classList.add('canopy-global-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.type = 'global';
  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.dataset.urlSubtopic = token.enclosingSubtopic;
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  linkElement.dataset.text = token.text;
  linkElement.href = `/${slugFor(token.targetTopic)}#${slugFor(token.targetSubtopic)}`;
  linkElement.addEventListener(
    'click',
    onGlobalLinkClick(token.targetTopic, token.targetSubtopic, linkElement)
  );
  return linkElement
}

function globalLinkIsOpen(linkElement, pathArray, subtopicName) {
  let subtopicContainingOpenGlobalReference = pathArray[0][1];
  let openGlobalLinkExists = pathArray[1];
  let openGlobalLinkTargetTopic = pathArray[1] && pathArray[1][0];
  let openGlobalLinkTargetSubtopic = openGlobalLinkTargetTopic;

  return openGlobalLinkExists &&
    linkElement.dataset.targetTopic === openGlobalLinkTargetTopic &&
    linkElement.dataset.targetSubtopic === openGlobalLinkTargetSubtopic &&
    subtopicName === subtopicContainingOpenGlobalReference;
}

function renderLinkLiteral(token) {
  let linkSpan = document.createElement('SPAN');
  let linkElement = document.createElement('a');
  linkSpan.classList.add('canopy-url-link-span');
  linkElement.classList.add('canopy-url-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.setAttribute('href', token.url);
  let styleElements = renderStyledText(token.text);
  appendElementsToParent(styleElements, linkElement);
  linkElement.dataset.type = 'url';
  linkElement.dataset.text = token.text;
  linkElement.dataset.urlSubtopic = token.urlSubtopic;
  linkSpan.appendChild(linkElement);
  linkSpan.innerHTML += externalLinkIconSvg.replace(/\r?\n|\r/g, '');
  return linkSpan;
}

function renderImage(token) {
  let divElement = document.createElement('DIV');
  divElement.classList.add('canopy-image-div');

  let imageElement = document.createElement('IMG');
  divElement.appendChild(imageElement);

  imageElement.setAttribute('src', token.resourceUrl);

  let anchorElement = document.createElement('A');
  anchorElement.setAttribute('href', token.anchorUrl || token.resourceUrl);
  anchorElement.appendChild(imageElement);
  divElement.appendChild(anchorElement);

  if (token.title) {
    imageElement.setAttribute('title', token.title);
    let captionElement = document.createElement('SUP');
    let captionDiv = document.createElement('DIV');
    captionElement.appendChild(document.createTextNode(token.title));
    captionElement.classList.add('canopy-image-caption');
    captionDiv.classList.add('canopy-caption-div');
    divElement.appendChild(captionElement);
  } else {
    divElement.appendChild(anchorElement);
  }

  if (token.altText) {
    imageElement.setAttribute('alt', token.altText);
  }

  return divElement;
}

function renderHtml(token) {
  let divElement = document.createElement('DIV');
  divElement.innerHTML = token.html;
  divElement.classList.add('canopy-raw-html');
  return divElement;
}


function renderFootnoteSymbol(token) {
  let superscriptElement = document.createElement('SUP');
  let textNode = document.createTextNode(token.text);
  superscriptElement.appendChild(textNode);
  return superscriptElement;
}

function appendElementsToParent(collection, parent) {
  collection.forEach((item) => {
    parent.appendChild(item);
  });
}

export default renderTokenElement;
