import Paragraph from 'models/paragraph';
import Topic from '../../cli/shared/topic';
import renderTokenElements from 'render/render_token_element';

function renderDomTree(topic, subtopic, renderContext, sectionElement = null) {
  sectionElement = sectionElement || createSectionElement(topic, subtopic, renderContext);
  populateSectionElement(sectionElement, topic, subtopic, renderContext);
  return sectionElement;
}

function populateSectionElement(sectionElement, topic, subtopic, renderContext) {
  let { paragraphsBySubtopic } = renderContext;

  let mixedCaseSubtopic = Object.keys(paragraphsBySubtopic).find(key => Topic.fromMixedCase(key).matches(subtopic)) // in case our subtopic is incorrectly capitalized
  let tokensOfParagraph = paragraphsBySubtopic[mixedCaseSubtopic];
  if (!tokensOfParagraph) throw new Error(`Paragraph with subtopic not found: ${subtopic.mixedCase}`);

  ensureParagraphElement(sectionElement);
  updateSectionMetadata(sectionElement, topic, subtopic, renderContext, tokensOfParagraph);
  let paragraph = new Paragraph(sectionElement);
  paragraph.paragraphElement.replaceChildren();

  renderContext.localLinkSubtreeCallback = localLinkSubtreeCallback(topic, sectionElement, renderContext);
  renderContext.claimedSubtopics = {};

  renderContext.currentTopic = topic;
  renderContext.currentSubtopic = subtopic;

  tokensOfParagraph.forEach((token) => {
    let elements = renderTokenElements(token, renderContext);
    elements.forEach(element => paragraph.paragraphElement.appendChild(element));
  });

  // Run after token-level layout callbacks so classes like canopy-blockquote-padded-linebreak are final.
  renderContext.preDisplayCallbacks.push(() => applyLinebreakSpacing(paragraph.paragraphElement));

  sectionElement.preDisplayCallbacks = renderContext.preDisplayCallbacks;
  return sectionElement;
}

function localLinkSubtreeCallback(topic, parentSectionElement, renderContext) {
  return (token) => {
    let { fullPath, remainingPath, claimedSubtopics } = renderContext;
    let newSubtopic = Topic.fromMixedCase(token.targetSubtopic);
    let pathToEnclosingTopic = fullPath.slice(0, fullPath.length - remainingPath.length);
    let pathToParagraph = pathToEnclosingTopic.addSegment(topic, newSubtopic);
    if (claimedSubtopics.hasOwnProperty(token.targetSubtopic)) return; // redundant parent links

    let existingChildSectionElement = Paragraph.byPath(pathToParagraph)?.sectionElement;

    let childSectionElement = renderDomTree(
      topic,
      Topic.fromMixedCase(token.targetSubtopic),
      Object.assign({}, renderContext, { pathToParagraph, preDisplayCallbacks: [] }),
      existingChildSectionElement
    );

    claimedSubtopics[token.targetSubtopic] = true;
    parentSectionElement.appendChild(childSectionElement);
  }
}

function createSectionElement(topic, subtopic, renderContext) {
  let sectionElement = document.createElement('section');
  sectionElement.classList.add('canopy-section');
  ensureParagraphElement(sectionElement);
  sectionElement.style.display = 'none';
  sectionElement.style.opacity = '0';
  updateSectionMetadata(sectionElement, topic, subtopic, renderContext);

  return sectionElement;
}

function ensureParagraphElement(sectionElement) {
  let paragraphElement = sectionElement.querySelector(':scope > p.canopy-paragraph');
  if (paragraphElement) return paragraphElement;

  paragraphElement = document.createElement('p');
  paragraphElement.classList.add('canopy-paragraph');
  sectionElement.appendChild(paragraphElement);
  return paragraphElement;
}

function updateSectionMetadata(sectionElement, topic, subtopic, renderContext, tokens = null) {
  let {
    displayTopicName, pathDepth, paragraphsBySubtopic, pathToParagraph
  } = renderContext;

  sectionElement.dataset.displayTopicName = displayTopicName;
  sectionElement.dataset.topicName = Topic.for(displayTopicName).mixedCase;
  sectionElement.topicName = Topic.for(displayTopicName).mixedCase; // helpful to have in debugger
  sectionElement.dataset.subtopicName = subtopic.mixedCase; // trustworthy because not coming from user-supplied URL
  sectionElement.subtopicName = subtopic.mixedCase; // helpful to have in debugger
  sectionElement.dataset.pathDepth = pathDepth;
  sectionElement.dataset.pathString = pathToParagraph.replaceTerminalSubtopic(subtopic).string;

  tokens = tokens || paragraphsBySubtopic[topic.mixedCase];

  if (topic.equals(subtopic)) {
    sectionElement.classList.add('canopy-topic-section');
    let hr = sectionElement.querySelector(':scope > hr.canopy-hr');
    if (pathDepth > 0 && tokens.length > 0 && !hr) {
      hr = document.createElement('hr')
      hr.classList.add('canopy-hr');
      sectionElement.insertBefore(hr, sectionElement.querySelector(':scope > p.canopy-paragraph'));
    } else if (hr && (pathDepth === 0 || tokens.length === 0)) {
      hr.remove();
    }
  }
}

function applyLinebreakSpacing(paragraphElement) {
  const linebreaks = paragraphElement.querySelectorAll('.canopy-linebreak-span');

  linebreaks.forEach(linebreak => {
    const previous = linebreak.previousElementSibling;
    const next = linebreak.nextElementSibling;
    const inBlockquote = !!linebreak.closest('blockquote');
    const isLastChild = linebreak === linebreak.parentElement?.lastElementChild;
    const previousIsBlockLike = isBlockBoundaryElement(previous);
    const nextIsBlockLike = isBlockBoundaryElement(next);
    const nextIsMenu = next?.classList.contains('canopy-menu');

    linebreak.style.removeProperty('margin-bottom');

    if (linebreak.classList.contains('canopy-blockquote-padded-linebreak')) {
      linebreak.style.marginBottom = '8px';
    } else if (isLastChild) {
      linebreak.style.marginBottom = '0px';
    } else if (inBlockquote) {
      linebreak.style.marginBottom = '2px';
    } else if (nextIsMenu) {
      linebreak.style.marginBottom = '20px';
    } else if (previousIsBlockLike) {
      linebreak.style.marginBottom = '20px';
    } else if (nextIsBlockLike) {
      linebreak.style.marginBottom = '17px';
    } else {
      linebreak.style.marginBottom = '13px';
    }
  });
}

function isBlockBoundaryElement(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
  if (element.matches('table, .canopy-menu, .canopy-image-container, code.canopy-code-block, hr.canopy-footnote-rule, .canopy-footnotes')) return true;
  return element.matches('div.canopy-raw-html') && !!element.querySelector('table');
}

export default renderDomTree;
export { createSectionElement };
