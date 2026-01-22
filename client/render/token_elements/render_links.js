import { onLinkClick } from 'render/click_handlers';
import Link from 'models/link';
import Topic from '../../../cli/shared/topic';
import Path from 'models/path';
import { projectPathPrefix, hashUrls } from 'helpers/getters';
import { measureVerticalOverflow } from 'render/helpers';

const rtlPattern = /[\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}\p{Script=Samaritan}\p{Script=Mandaic}\p{Script=Adlam}\p{Script=Hanifi_Rohingya}\p{Script=Phoenician}\p{Script=Imperial_Aramaic}]/u;

function isRtlText(text) {
  return rtlPattern.test((text || '').trim());
}

function renderLinkBase(token, renderContext, renderTokenElements) {
  let linkElement = document.createElement('a');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  linkElement.dataset.text = token.text;

  linkElement.dir = 'auto'; // necessary to get link icons with RTL link text on correct side and not breaking border

  let linkContainer = document.createElement('SPAN');
  linkContainer.classList.add('canopy-link-container');
  linkContainer.dir = 'auto';

  let contentContainer = document.createElement('SPAN');
  contentContainer.classList.add('canopy-link-content-container');
  contentContainer.dir = 'auto';

  linkContainer.appendChild(contentContainer);
  linkElement.appendChild(linkContainer);

  const terminalGap = document.createElement('span');
  terminalGap.classList.add('canopy-link-terminal-gap');
  linkElement.appendChild(terminalGap);

  // Append subtoken elements
  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => contentContainer.appendChild(subtokenElement));
  });
  const linkDirectionText = (contentContainer.textContent || '').trim();
  linkElement.dataset.linkDir = isRtlText(linkDirectionText) ? 'rtl' : 'ltr';

  // Prevent dragging for easier text selection in tables
  linkElement.addEventListener('dragstart', (e) => {
    e.preventDefault();
  });

  // Add click event handler
  let link = new Link(linkElement);
  let callback = onLinkClick(link);
  linkElement._CanopyClickHandler = callback;
  linkElement.addEventListener('click', callback);

  renderContext.preDisplayCallbacks.push(() => {
    let [spaceAbove, spaceBelow] = measureVerticalOverflow(contentContainer);
    linkElement.dataset.extraSpace = JSON.stringify(measureVerticalOverflow(contentContainer));
    if (spaceAbove) contentContainer.style.paddingTop = `${spaceAbove}px`;
    if (spaceBelow) contentContainer.style.paddingBottom = `${spaceBelow}px`;

    // Detect if a link wraps over a newline
    const computedStyle = window.getComputedStyle(linkElement);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const height = linkElement.getBoundingClientRect().height;

    if (height > lineHeight * 1.5) {
      linkElement.dataset.height = height;
      linkElement.dataset.lineHeight = lineHeight;
      linkElement.classList.add('canopy-multiline-link'); // Add class if wrapped
    }

    let direction = null;
    let cursor = linkElement;
    while (cursor && cursor.tagName !== 'P') {
      const dirAttr = cursor.getAttribute?.('dir');
      if (dirAttr && dirAttr !== 'auto') {
        direction = dirAttr;
        break;
      }
      cursor = cursor.parentNode;
    }
    if (!direction) {
      direction = window.getComputedStyle(contentContainer).direction;
    }
    linkElement.dir = direction;
    linkContainer.dir = direction;
    contentContainer.dir = direction;
  });

  return linkElement;
}

function renderLocalLink(token, renderContext, renderTokenElements) {
  let linkElement = renderLinkBase(token, renderContext, renderTokenElements);

  // Set specific attributes for local links
  linkElement.classList.add('canopy-local-link');
  linkElement.dataset.type = 'local';
  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.targetTopic = token.targetTopic; // Helpful for debugger
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.targetSubtopic = token.targetSubtopic; // Helpful for debugger

  let targetTopic = new Topic(token.targetTopic);
  let targetSubtopic = new Topic(token.targetSubtopic);
  linkElement.href = `${projectPathPrefix ? '/' + projectPathPrefix : ''}${hashUrls ? '/#' : ''}/${targetTopic.url}#${targetSubtopic.url}`;

  return [linkElement];
}

function renderGlobalLink(token, renderContext, renderTokenElements) {
  let linkElement = renderLinkBase(token, renderContext, renderTokenElements);

  // Set specific attributes for global links
  linkElement.classList.add('canopy-global-link');
  linkElement.dataset.type = 'global';
  linkElement.dataset.literalPathString = token.pathString;
  linkElement.path = token.path; // Helpful for debugger
  linkElement.href = Path.for(token.pathString).productionPathString;

  let link = new Link(linkElement);
  
  renderContext.preDisplayCallbacks.push(() => {
    if (!link.element) return;
    if (link.cycle || link.isSelfReference) {
      const targetPath = link.inlinePath?.reduce();
      const fulcrumPath = targetPath ? link.enclosingPath.initialOverlap(targetPath) : null;
      const fulcrumParagraph = fulcrumPath?.paragraph;
      if (fulcrumParagraph?.paragraphElement) {
        const fulcrumText = fulcrumParagraph.paragraphElement.textContent;
        link.element.dataset.fulcrumDir = isRtlText(fulcrumText) ? 'rtl' : 'ltr';
      }

      if (containsIconOrEmoji(link.text)) { // user is taking responsibility for arrow
        return;
      }

      const cycleIcon = document.createElement('span');

      if (link.isForwardCycle) {
        cycleIcon.classList.add('canopy-forward-cycle-icon');
        cycleIcon.innerText = '↪';
      } else if (link.isDownCycle) {
        cycleIcon.classList.add('canopy-down-cycle-icon');
        cycleIcon.innerText = '↪';
      } else if (link.isUpCycle || link.isSelfReference) {
        cycleIcon.classList.add('canopy-up-cycle-icon');
        cycleIcon.innerText = '↩';
      } else if (link.isBackCycle) {
        cycleIcon.classList.add('canopy-back-cycle-icon');
        cycleIcon.innerText = '↩';
      }

      const linkContainer = linkElement.querySelector('.canopy-link-container');
      const iconGap = document.createElement('span');
      iconGap.classList.add('canopy-link-icon-gap');
      linkContainer.appendChild(iconGap);
      linkContainer.appendChild(cycleIcon);
    }
  });

  return [linkElement];
}

function renderDisabledLink(token, renderContext, renderTokenElements) {
  // Build the same link the user would get (local vs global), then disable.
  let linkElement;
  if (token.targetTopic && token.targetSubtopic) {
    [linkElement] = renderLocalLink(token, renderContext, renderTokenElements);
  } else if (token.pathString) {
    [linkElement] = renderGlobalLink(token, renderContext, renderTokenElements);
  } else {
    // Fallback: plain base if neither local nor global fields are present
    linkElement = renderLinkBase(token, renderContext, renderTokenElements);
  }

  // Disable interactivity and navigation, keep content and layout identical.
  linkElement.classList.remove('canopy-selectable-link');
  linkElement.classList.add('canopy-disabled-link');
  linkElement.dataset.type = 'disabled';
  linkElement.removeAttribute('href');
  linkElement.setAttribute('aria-disabled', 'true');
  linkElement.setAttribute('tabindex', '-1');

  if (linkElement._CanopyClickHandler) {
    linkElement.removeEventListener('click', linkElement._CanopyClickHandler);
    delete linkElement._CanopyClickHandler;
  }
  // Hard-stop any stray clicks (e.g., nested elements)
  linkElement.addEventListener('click', e => e.preventDefault(), { capture: true });

  return [linkElement];
}

function renderFragmentReference(token, renderContext, renderTokenElements) {
  let linkElement = renderLinkBase(token, renderContext, renderTokenElements);

  // Add fragment reference-specific classes and attributes
  linkElement.classList.add('canopy-local-link');
  linkElement.dataset.type = 'local';
  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.targetTopic = token.targetTopic; // Helpful for debugging
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.targetSubtopic = token.targetSubtopic; // Helpful for debugging

  // Construct the href attribute based on projectPathPrefix and hashUrls
  let targetTopic = new Topic(token.targetTopic);
  let targetSubtopic = new Topic(token.targetSubtopic);
  linkElement.href = `${projectPathPrefix ? '/' + projectPathPrefix : ''}${hashUrls ? '/#' : ''}/${targetTopic.url}#${targetSubtopic.url}`;

  return [linkElement];
}

function renderExternalLink(token, renderContext, renderTokenElements) {
  let linkElement = renderLinkBase(token, renderContext, renderTokenElements);

  // Add external link-specific classes and attributes
  linkElement.classList.add('canopy-external-link');
  linkElement.dataset.type = 'external';
  linkElement.setAttribute('href', token.url); // URL validation assumed to be done at the matcher/token stage
  linkElement.setAttribute('target', '_blank');
  linkElement.dataset.targetUrl = token.url;

  // Add external link icon
  let cycleIcon = document.createElement('span');
  cycleIcon.classList.add('canopy-external-link-icon');
  const linkContainer = linkElement.querySelector('.canopy-link-container');
  const iconGap = document.createElement('span');
  iconGap.classList.add('canopy-link-icon-gap');
  linkContainer.appendChild(iconGap);
  linkContainer.appendChild(cycleIcon);

  // Add a class if the link contains an image
  renderContext.preDisplayCallbacks.push(() => {
    if (linkElement.querySelector('img')) {
      linkElement.classList.add('canopy-linked-image');
    }
  });

  return [linkElement];
}

function containsIconOrEmoji(str) {
  if (!str) return false;
  const plainText = str.replace(/<[^>]*>/g, ''); // avoid treating HTML markup as symbols
  const emojiPattern = /\p{Emoji}/u;
  const symbolPattern = /[\p{Symbol}\p{Extended_Pictographic}]/u;
  return emojiPattern.test(plainText) || symbolPattern.test(plainText);
}

export {
  renderLocalLink,
  renderGlobalLink,
  renderDisabledLink,
  renderFragmentReference,
  renderExternalLink,
};
