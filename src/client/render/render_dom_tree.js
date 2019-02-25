import { htmlIdFor } from 'helpers/identifiers';
import displayPath from 'display/display_path';
import setPath from 'path/set_path';
import { slugFor } from 'helpers/identifiers';
import { paragraphElementOfSection, linkOfSectionByTarget } from 'helpers/getters';
import fetchAndRenderPath from 'render/fetch_and_render_path';
import { onParentLinkClick, onGlobalLinkClick } from 'render/click_handlers';

function renderDomTree(
  currentSubtopicName,
  pathArray,
  paragraphsBySubtopic,
  renderedSubtopics,
  pathDepth
  ) {
  let topicName = pathArray[0][0];
  let sectionElement = createNewSectionElement(topicName, currentSubtopicName, pathDepth);
  let linesOfParagraph = paragraphsBySubtopic[currentSubtopicName];
  let promises = [];
  renderedSubtopics[currentSubtopicName] = true;

  let tokenElements = renderElementsForTokens(
    linesOfParagraph,
    pathArray,
    currentSubtopicName,
    promises,
    generateIsSubtopicAlreadyRenderedCallback(renderedSubtopics),
    generateOnCreatingParentLinkTokenRequiringSubtreeCallback(
      pathArray,
      paragraphsBySubtopic,
      renderedSubtopics,
      pathDepth,
      sectionElement,
      promises
    ),
    generateOnCreatingGlobalLinkTokenRequiringSubtreeCallback(
      pathArray,
      pathDepth,
      sectionElement,
      promises
    )
  )

  tokenElements.forEach((tokenElement) => {
    paragraphElementOfSection(sectionElement).appendChild(tokenElement);
  });

  return Promise.all(promises).then((_) => sectionElement);
}

function generateIsSubtopicAlreadyRenderedCallback(renderedSubtopics) {
  return (targetSubtopic) => renderedSubtopics.hasOwnProperty(targetSubtopic);
}

function generateOnCreatingParentLinkTokenRequiringSubtreeCallback(
  pathArray,
  paragraphsBySubtopic,
  renderedSubtopics,
  pathDepth,
  sectionElement,
  promises
  ) {
    return (token) => {
      let promisedSubtree = renderDomTree(
        token.targetSubtopic,
        pathArray,
        paragraphsBySubtopic,
        renderedSubtopics,
        pathDepth
      );

      promisedSubtree.then((subtree) => {
        sectionElement.appendChild(subtree);
      });

      promises.push(promisedSubtree);
    }
  }

function generateOnCreatingGlobalLinkTokenRequiringSubtreeCallback(
  pathArray,
  pathDepth,
  sectionElement,
  promises
  ) {
  return (token) => {
    if (subtreeAlreadyRenderedForPriorGlobalLinkInParagraph(sectionElement, token)) {
      return;
    }

    let pathArrayForSubtree = (pathArray).slice(1);
    let pathDepthOfSubtree = pathDepth + 1;

    let whenTopicTreeRenders = fetchAndRenderPath(pathArrayForSubtree, pathDepthOfSubtree);
    let whenTopicTreeAppended = whenTopicTreeRenders.then((topicTree) => {
      sectionElement.appendChild(topicTree);
    });

    promises.push(whenTopicTreeAppended);
  }
}

function createNewSectionElement(topicName, currentSubtopicName, pathDepth) {
  let sectionElement = document.createElement('section');
  let paragraphElement = document.createElement('p');
  sectionElement.appendChild(paragraphElement);
  sectionElement.style.display = 'none';
  sectionElement.dataset.topicName = topicName;
  sectionElement.dataset.subtopicName = currentSubtopicName;
  sectionElement.dataset.pathDepth = pathDepth;
  return sectionElement;
}

function subtreeAlreadyRenderedForPriorGlobalLinkInParagraph(sectionElement, token) {
  return linkOfSectionByTarget(sectionElement,
    token.targetTopic,
    token.targetSubtopic
  );
}

function renderElementsForTokens(
  linesOfParagraph,
  pathArray,
  currentSubtopicName,
  promises,
  subtopicAlreadyRendered,
  onParentLinkTokenRequiringSubtree,
  onGlobalLinkTokenRequiringSubtree) {
  let tokenArray = [];

  linesOfParagraph.forEach((tokensOfLine, lineNumber) => {
    lineNumber > 0 && tokenArray.push(document.createElement('br'));
    let newElements = tokensOfLine.map((token) => {
      return generateTokenElement(
        token,
        pathArray,
        currentSubtopicName,
        promises,
        subtopicAlreadyRendered,
        onParentLinkTokenRequiringSubtree,
        onGlobalLinkTokenRequiringSubtree,
      );
    });

    tokenArray = tokenArray.concat(newElements);
  });

  return tokenArray;
}

function generateTokenElement(
  token,
  pathArray,
  currentSubtopicName,
  promises,
  subtopicAlreadyRendered,
  onParentLinkTokenRequiringSubtree,
  onGlobalLinkTokenRequiringSubtree,
  ) {
  if (token.type === 'text') {
    return document.createTextNode(token.text);
  } else if (token.type === 'local') {
    return generateParentLink(
      token,
      subtopicAlreadyRendered,
      onParentLinkTokenRequiringSubtree
    );
  } else if (token.type === 'global') {
    return generateGlobalLink(
      token,
      pathArray,
      currentSubtopicName,
      onGlobalLinkTokenRequiringSubtree
    );
  }
}

function generateParentLink(token, subtopicAlreadyRendered, onParentLinkTokenRequiringSubtree) {
  if (!subtopicAlreadyRendered(token.targetSubtopic)) {
    onParentLinkTokenRequiringSubtree(token);
    return generateRegularParentLink(token);
  } else {
    return generateRedundantParentLink(token);
  }
}

function generateRegularParentLink(token) {
  let tokenElement = generateSharedParentLinkBase(token);
  tokenElement.classList.add('canopy-local-link');
  tokenElement.dataset.type = 'local';
  tokenElement.dataset.targetTopic = token.targetTopic;
  tokenElement.dataset.targetSubtopic = token.targetSubtopic;
  tokenElement.dataset.urlSubtopic = token.targetSubtopic;
  tokenElement.dataset.enclosingTopic = token.enclosingTopic;
  tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  tokenElement.href = `/${slugFor(token.targetTopic)}#${slugFor(token.targetSubtopic)}`;
  return tokenElement;
}

function generateRedundantParentLink(token) {
  let tokenElement = generateSharedParentLinkBase(token);
  tokenElement.classList.add('canopy-redundant-local-link');
  tokenElement.dataset.type = 'redundant-local';
  tokenElement.dataset.targetTopic = token.targetTopic;
  tokenElement.dataset.targetSubtopic = token.targetSubtopic;
  tokenElement.dataset.enclosingTopic = token.enclosingTopic;
  tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  tokenElement.dataset.urlSubtopic = token.enclosingSubtopic;
  tokenElement.href = `/${slugFor(token.enclosingTopic)}#${slugFor(token.enclosingSubtopic)}`;
  return tokenElement;
}

function generateSharedParentLinkBase(token) {
  let textElement = document.createTextNode(token.text);
  let tokenElement = document.createElement('a');
  tokenElement.appendChild(textElement);
  tokenElement.addEventListener(
    'click',
    onParentLinkClick(token.targetTopic, token.targetSubtopic, tokenElement)
  );
  return tokenElement;
}

function generateGlobalLink(token, pathArray, currentSubtopicName, onGlobalLinkTokenRequiringSubtree) {
  let tokenElement = createGlobalLinkElement(token, pathArray);

  if (globalLinkIsOpen(tokenElement, pathArray, currentSubtopicName)) {
    onGlobalLinkTokenRequiringSubtree(token);
  }

  return tokenElement;
}

function createGlobalLinkElement(token) {
  let textElement = document.createTextNode(token.text);
  let tokenElement = document.createElement('a');
  tokenElement.appendChild(textElement);
  tokenElement.dataset.type = 'global';
  tokenElement.dataset.targetTopic = token.targetTopic;
  tokenElement.dataset.targetSubtopic = token.targetSubtopic;
  tokenElement.dataset.urlSubtopic = token.enclosingSubtopic;
  tokenElement.dataset.enclosingTopic = token.enclosingTopic;
  tokenElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  tokenElement.classList.add('canopy-global-link');
  tokenElement.href = `/${slugFor(token.targetTopic)}#${slugFor(token.targetSubtopic)}`;
  tokenElement.addEventListener(
    'click',
    onGlobalLinkClick(token.targetTopic, token.targetSubtopic, tokenElement)
  );
  return tokenElement
}

function globalLinkIsOpen(tokenElement, pathArray, currentSubtopicName) {
  let subtopicContainingOpenGlobalReference = pathArray[0][1];
  let openGlobalLinkExists = pathArray[1];
  let openGlobalLinkTargetTopic = pathArray[1] && pathArray[1][0];
  let openGlobalLinkTargetSubtopic = openGlobalLinkTargetTopic;

  return openGlobalLinkExists &&
    tokenElement.dataset.targetTopic === openGlobalLinkTargetTopic &&
    tokenElement.dataset.targetSubtopic === openGlobalLinkTargetSubtopic &&
    currentSubtopicName === subtopicContainingOpenGlobalReference;
}

export default renderDomTree;
