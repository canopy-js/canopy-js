import { onLinkClick } from 'render/click_handlers';
import Link from 'models/link';
import Path from 'models/path';
import Topic from '../../cli/shared/topic';
import { projectPathPrefix, hashUrls, canopyContainer } from 'helpers/getters';
import ScrollableContainer from 'helpers/scrollable_container';
import { scrollToWithPromise, getScrollInProgress } from 'display/helpers';
import requestJson from 'requests/request_json';
import { measureVerticalOverflow, whenInDom, getCombinedBoundingRect } from 'render/helpers';

function renderTokenElements(token, renderContext) {
  if (token.type === 'text') {
    return renderTextToken(token);
  } else if (token.type === 'local') {
    renderContext.localLinkSubtreeCallback(token);
    return renderLocalLink(token, renderContext);
  } else if (token.type === 'global') {
    Path.for(token.pathString).topicArray.map(topic => requestJson(topic)); // eager load
    return renderGlobalLink(token, renderContext);
  } else if (token.type === 'disabled_reference') {
    return renderDisabledLink(token, renderContext);
  } else if (token.type === 'fragment_reference') {
    return renderFragmentReference(token, renderContext);
  } else if (token.type === 'external') {
    return renderExternalLink(token, renderContext);
  } else if (token.type === 'image') {
    return renderImage(token, renderContext);
  } else if (token.type === 'html_element') {
    return renderHtmlElement(token, renderContext);
  } else if (token.type === 'footnote_marker') {
    return renderFootnoteSymbol(token);
  } else if (token.type === 'code_block') {
    return renderCodeBlock(token);
  } else if (token.type === 'block_quote') {
    return renderBlockQuote(token, renderContext);
  } else if (token.type === 'outline') {
    return renderList(token.topLevelNodes, renderContext);
  } else if (token.type === 'table') {
    return renderTable(token, renderContext)
  } else if (token.type === 'menu') {
    return renderMenu(token, renderContext)
  } else if (token.type === 'footnote_lines') {
    return renderFootnoteLines(token, renderContext);
  } else if (token.type === 'bold') {
    return renderBoldText(token, renderContext);
  } else if (token.type === 'underlined') {
    return renderUnderlineText(token, renderContext);
  } else if (token.type === 'italics') {
    return renderItalicText(token, renderContext);
  } else if (token.type === 'inline_code') {
    return renderInlineCodeText(token, renderContext);
  } else if (token.type === 'tool_tip') {
    return renderToolTip(token, renderContext);
  } else {
    throw `Unhandled token type: ${token.type}`
  }
}

function renderTextToken(token) {
  let spans = [];

  if (!token.text.includes('\n')) {
    let spanElement = document.createElement('SPAN');
    spanElement.classList.add('canopy-text-span');
    spanElement.innerText = token.text;
    return [spanElement]
  }

  token.text.split('\n').forEach((textSegment, index, segments) => {
    if (textSegment) {
      let spanElement = document.createElement('SPAN');
      spanElement.classList.add('canopy-text-span');

      spanElement.innerText = textSegment;
      spans.push(spanElement);
    }

    if (index !== segments.length - 1) { // even if no text segment, insert linebreak
      let lineBreakSpan = document.createElement('SPAN');
      lineBreakSpan.classList.add('canopy-linebreak-span');
      spans.push(lineBreakSpan);
    }
  });

  return spans;
}

function renderLinkBase(token, renderContext) {
  let linkElement = document.createElement('a');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  linkElement.dataset.text = token.text;

  linkElement.dir = 'auto'; // necessary to get link icons with RTL link text on correct side and not breaking border

  let contentContainer = document.createElement('SPAN');
  contentContainer.classList.add('canopy-link-content-container');
  contentContainer.dir = "auto";
  linkElement.appendChild(contentContainer);

  // Append subtoken elements
  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => contentContainer.appendChild(subtokenElement));
  });

  // Prevent dragging for easier text selection in tables
  linkElement.addEventListener('dragstart', (e) => {
    e.preventDefault();
  });

  // Add click event handler
  let link = new Link(linkElement);
  let callback = onLinkClick(link);
  linkElement._CanopyClickHandler = callback;
  linkElement.addEventListener('click', callback);

  whenInDom(contentContainer)(() => {
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
  });

  return linkElement;
}

function renderLocalLink(token, renderContext) {
  let linkElement = renderLinkBase(token, renderContext);

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

function renderGlobalLink(token, renderContext) {
  let linkElement = renderLinkBase(token, renderContext);

  // Set specific attributes for global links
  linkElement.classList.add('canopy-global-link');
  linkElement.dataset.type = 'global';
  linkElement.dataset.literalPathString = token.pathString;
  linkElement.path = token.path; // Helpful for debugger
  linkElement.href = Path.for(token.pathString).productionPathString;

  let link = new Link(linkElement);
  let cycleIcon;

  if (renderContext.pathToParagraph.overlaps(link.literalPath)) {
    cycleIcon = document.createElement('span');
    if (!containsUnicodeArrow(link.text) && !renderContext.pathToParagraph.terminalOverlap(link.literalPath)) {
      cycleIcon.classList.add('canopy-provisional-cycle-icon');
      cycleIcon.innerText = '↩';
    }
    linkElement.querySelector('.canopy-link-content-container').appendChild(cycleIcon);
  }
  
  whenInDom(link.element)(() => {
    if (!link.element) return;
    if (!link.element.closest('.canopy-paragraph')) console.error('No paragraph for link', linkElement);

    if (link.cycle) {
      cycleIcon.classList.remove('canopy-provisional-cycle-icon');

      if (link.isUpCycle) {
        cycleIcon.classList.add('canopy-up-cycle-icon');
        cycleIcon.innerText = '↩';
      } else if (link.isForwardCycle) {
        cycleIcon.classList.add('canopy-forward-cycle-icon');
        cycleIcon.innerText = '↪';
      } else if (link.isBackCycle) {
        cycleIcon.classList.add('canopy-back-cycle-icon');
        cycleIcon.innerText = '↩';
      } else if (link.isDownCycle) { // eg in A/B/C a link to [[B/C/D]]
        cycleIcon.classList.add('canopy-down-cycle-icon');
        cycleIcon.innerText = '';
      }

      if (containsUnicodeArrow(link.text)) { // user is taking responsibility for arrow
        cycleIcon.innerText = '';
      }
    }
  });

  return [linkElement];
}

function containsUnicodeArrow(str) {
  const arrowRegex = /[\u{2190}-\u{21FF}\u{27F0}-\u{27FF}\u{2900}-\u{297F}\u{2B00}-\u{2BFF}\u{1F800}-\u{1F8FF}]/u;
  return arrowRegex.test(str);
}

function renderDisabledLink(token, renderContext) {
  // Call the helper to create the base link element
  let linkElement = renderLinkBase(token, renderContext);

  linkElement.classList.remove('canopy-selectable-link'); // not selectable
  linkElement.removeAttribute('href');

  // Remove the click event listener to disable interactions
  if (linkElement._CanopyClickHandler) {
    linkElement.removeEventListener('click', linkElement._CanopyClickHandler);
    delete linkElement._CanopyClickHandler;
  }

  // Add disabled-specific styling and data attributes
  linkElement.classList.add('canopy-disabled-link');
  linkElement.dataset.type = 'disabled';

  return [linkElement];
}

function renderFragmentReference(token, renderContext) {
  let linkElement = renderLinkBase(token, renderContext);

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

function renderExternalLink(token, renderContext) {
  let linkElement = renderLinkBase(token, renderContext);

  // Add external link-specific classes and attributes
  linkElement.classList.add('canopy-external-link');
  linkElement.dataset.type = 'external';
  linkElement.setAttribute('href', token.url); // URL validation assumed to be done at the matcher/token stage
  linkElement.setAttribute('target', '_blank');
  linkElement.dataset.targetUrl = token.url;

  // Add external link icon
  let cycleIcon = document.createElement('span');
  cycleIcon.classList.add('canopy-external-link-icon');
  linkElement.querySelector('.canopy-link-content-container').appendChild(cycleIcon);

  // Add a class if the link contains an image
  whenInDom(linkElement)(() => {
    if (linkElement.querySelector('img')) {
      linkElement.classList.add('canopy-linked-image');
    }
  });

  return [linkElement];
}

function renderImage(token, renderContext) {
  // Outer container
  let outerDivElement = document.createElement('DIV');
  outerDivElement.classList.add('canopy-image-container');

  // Inner container (existing divElement)
  let innerDivElement = document.createElement('DIV');
  innerDivElement.classList.add('canopy-image');

  let imageElement = document.createElement('IMG');
  imageElement.setAttribute('src', token.resourceUrl);
  imageElement.setAttribute('decoding', 'async'); // don't wait for image decode to update selected link on change

  innerDivElement.appendChild(imageElement); // Append the image to the inner container

  if (token.title) {
    imageElement.setAttribute('title', token.title);
  }

  if (token.caption) {
    let spanElement = document.createElement('SPAN');
    spanElement.classList.add('canopy-image-caption');
    innerDivElement.appendChild(spanElement); // Append the caption to the inner container

    token.tokens.forEach(subtoken => {
      let subtokenElements = renderTokenElements(subtoken, renderContext);
      subtokenElements.forEach(subtokenElement => spanElement.appendChild(subtokenElement));
    });
  }

  if (token.altText) {
    imageElement.setAttribute('alt', token.altText);
  }

  handleDelayedImageLoad(imageElement, renderContext);

  outerDivElement.appendChild(innerDivElement); // Append the inner container to the outer container

  return [outerDivElement]; // Return the outer container
}

function handleDelayedImageLoad(imageElement, renderContext) { // we don't know how big the image will be, and don't want the load to disrupt viewport
  let originalHeight = imageElement.style.height;
  let originalOpacity = imageElement.style.opacity;
  let originalWidth = imageElement.style.width;
  if (imageElement.closest('.canopy-image')) var originalContainerWidth = imageElement.closest('.canopy-image').style.width;

  imageElement.style.setProperty('height', ScrollableContainer.visibleHeight + 'px'); // big so that content changing doesn't cause flash
  imageElement.style.setProperty('width', '100%');
  imageElement.style.setProperty('opacity', '0');
  if (imageElement.closest('.canopy-image')) imageElement.closest('.canopy-image').style.setProperty('width', '100%');

  setTimeout(() => { // after 200 ms add gray box but not before then to avoid flash
    if (!imageElement.complete) (imageElement.closest('.canopy-image')||imageElement).style.setProperty('background-color', '#f5f5f5')
  }, 200)

  imageElement.addEventListener('load', () => { // if images were unloaded, scroll was delayed and so we do it now to avoid viewport jump
    (getScrollInProgress() || Promise.resolve()).then(() => { // if there is a scroll in progress, wait for it to complete.
      let focusedElement = ScrollableContainer.focusedElement;
      let oldBottomOfCurrentParagraph = focusedElement.getBoundingClientRect().bottom;

      imageElement.style.setProperty('height', originalHeight);
      imageElement.style.setProperty('width', originalWidth);
      imageElement.style.setProperty('opacity', originalOpacity);
      if (imageElement.closest('.canopy-image')) imageElement.closest('.canopy-image').style.setProperty('width', originalContainerWidth);

      imageElement.closest('.canopy-image')?.style.setProperty('background-color', 'transparent') // remove gray placeholder
      let newBottomOfCurrentParagraph = focusedElement.getBoundingClientRect().bottom;
      let diff = newBottomOfCurrentParagraph - oldBottomOfCurrentParagraph
      let newScroll = ScrollableContainer.currentScroll + diff;
      if (window.getComputedStyle(imageElement).display === 'absolute') return; // doesn't disrupt flow

      let { pathToParagraph } = renderContext;
      if (Path.current.includes(pathToParagraph)) { // if when the image loads, it is on the current page and might jump the viewport
        scrollToWithPromise({  // restore old position
          top: newScroll,
          behavior: 'instant'
        });
      }
    });
  });
}

function renderHtmlElement(token, renderContext) {
  let divElement = document.createElement('DIV');
  divElement.classList.add('canopy-raw-html');

  let fragment = document.createRange().createContextualFragment(token.html); // make script tags functional
  divElement.appendChild(fragment);

  Array.from(divElement.querySelectorAll('.canopy-html-insertion')).forEach((placeholderDiv) => {
      let replacementIndex = placeholderDiv.dataset.replacementNumber;
      let tokens = token.tokenInsertions[replacementIndex];
      tokens.forEach(token => {
        let elements = renderTokenElements(token, renderContext);
        elements.forEach(element => placeholderDiv.appendChild(element));
      });
  });

  [...divElement.querySelectorAll('img')].forEach((imageElement) => { // if the html contains image tags that haven't loaded yet
    handleDelayedImageLoad(imageElement, renderContext);
  });

  return [divElement];
}

function renderFootnoteSymbol(token) {
  let superscriptElement = document.createElement('SUP');
  let textNode = document.createTextNode(token.text);
  superscriptElement.appendChild(textNode);
  return [superscriptElement];
}

function renderCodeBlock(token) {
  let preElement = document.createElement('PRE');
  let codeBlockElement = document.createElement('CODE');
  preElement.appendChild(codeBlockElement);

  codeBlockElement.innerText = token.text;
  codeBlockElement.classList.add('canopy-code-block')

  return [preElement];
}

function renderBlockQuote(token, renderContext) {
  let blockQuoteElement = document.createElement('BLOCKQUOTE');
  blockQuoteElement.setAttribute('dir', token.direction);

  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => blockQuoteElement.appendChild(subtokenElement));
  });

  // Clone blockQuoteElement for manipulation
  let clone = blockQuoteElement.cloneNode(true);

  // Convert all text nodes in the clone to single character spans
  function wrapEachLetterInSpan(element) {
    [...element.querySelectorAll('*')].forEach(parentElement => {
      [...parentElement.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.length > 1) {
          const text = node.textContent;
          const parent = node.parentNode;
          const fragment = document.createDocumentFragment();
          for (let char of text) {
            const span = document.createElement('span');
            span.classList.add('canopy-blockquote-character');
            span.textContent = char;
            fragment.appendChild(span);
          }

          parent.replaceChild(fragment, node);
        }
      });
    });
  }

  wrapEachLetterInSpan(clone);

  let tempSectionElement = new DOMParser().parseFromString('<section class="canopy-section"><p class="canopy-paragraph"></p></section>', 'text/html').body.firstChild;
  let tempParagraphElement = tempSectionElement.querySelector('p');
  canopyContainer.appendChild(tempSectionElement);
  tempParagraphElement.appendChild(clone);

  // Check direction consistency among characters in the clone
  let wraps = false;
  let direction = null; // neutral

  [...clone.querySelectorAll('span.canopy-blockquote-character,span.canopy-linebreak-span')].forEach((element, index, elements) => {
    if (element.classList.contains('canopy-linebreak-span')) { // we switched spans ie linebreak
      direction = null;
    } else { // The element is a character span
      let elementRect = element.getBoundingClientRect();
      let previousElement = elements[index - 1];
      let previousRect = elements[index - 1]?.getBoundingClientRect();

      let previousElementWasNewline = previousElement && (previousElement?.classList.contains('canopy-linebreak-span') 
        || previousElement.tagName === "BR" || previousElement.innerText === '\n');
      
      if (previousElement && !previousElementWasNewline) {  // don't compare first letter to last of last line
        if (direction === null) {
          direction = elementRect.right > previousRect.right ? 1 : -1;
        } else {
          wraps = wraps || (elementRect.right > previousRect.right ? 1 : -1) !== direction; // direction is not the same
        }
      }
    }
  });

  // Remove clone from DOM after measurement
  tempParagraphElement.removeChild(clone);

  if (wraps) {
    blockQuoteElement.querySelectorAll('.canopy-linebreak-span').forEach((span) => {
      span.classList.add('canopy-blockquote-padded-linebreak'); // there is no terminal linebreak so we pad all
    });
  }

  return [blockQuoteElement];
}

function renderList(listNodeObjects, renderContext) {
  let listElement = listNodeObjects[0].ordered ?
    document.createElement('OL') :
    document.createElement('UL');

  if (listNodeObjects[0].ordered) {
    listElement.setAttribute('type', listNodeObjects[0].ordinal);
  }

  listNodeObjects.forEach((listNodeObject) => {
    let listItemElement = document.createElement('LI');

    listNodeObject.tokensOfLine.forEach(
      (token) => {
        let tokenElements = renderTokenElements(token, renderContext);
        tokenElements.forEach(tokenElement => listItemElement.appendChild(tokenElement));
      }
    );

    if (listNodeObject.children.length > 0) {
      let [childList] = renderList(listNodeObject.children, renderContext);
      listItemElement.appendChild(childList);
    }

    listElement.appendChild(listItemElement);
  });
  return [listElement];
}

function renderTable(token, renderContext) {
  let tableElement = document.createElement('TABLE');
  tableElement.setAttribute('dir', 'auto');
  if (token.rtl) tableElement.setAttribute('dir', 'rtl');

  token.rows.forEach(
    (row) => {
      let tableRowElement = document.createElement('TR');
      if (token.rtl) tableRowElement.setAttribute('dir', 'rtl');

      row.forEach(
        (cellObject) => {
          let tableCellElement = document.createElement('TD');
          if (cellObject.hidden) tableCellElement.classList.add('hidden');
          if (cellObject.colspan) tableCellElement.setAttribute('colspan', cellObject.colspan);
          if (cellObject.rowspan) tableCellElement.setAttribute('rowspan', cellObject.rowspan);

          cellObject.tokens.forEach(
            (token) => {
              let tokenElements = renderTokenElements(token, renderContext);

              tokenElements.forEach(tokenElement => {
                const isOrHasOnlyLink = (el) => el.tagName === 'A' || (el.children.length === 1 && isOrHasOnlyLink(el.children[0]));
                if (cellObject.tokens.length === 1 && isOrHasOnlyLink(tokenElement)) {
                  tableCellElement.classList.add('canopy-table-link-cell');
                  tableCellElement.classList.add('canopy-bounding-box-container'); // rect to consider for arrow key comparisons
                  whenInDom(tableCellElement)(() => { // need to wait for .parentNode to exist
                    let linkElement = tokenElement.parentNode.querySelector('a');
                    linkElement.classList.add('canopy-table-link');
                    linkElement.removeEventListener('click', linkElement._CanopyClickHandler);
                    tableCellElement.addEventListener('click', linkElement._CanopyClickHandler);
                  });
                }

                tableCellElement.appendChild(tokenElement);
              });
            }
          );

          if (!cellObject.merge) {
            tableRowElement.appendChild(tableCellElement);
          }
        }
      )
      tableElement.appendChild(tableRowElement);
    }
  );

  let MAX_WIDTH_CHANGE_PERCENT = 200; // Maximum allowable percentage change for width
  let MAX_HEIGHT_CHANGE_PERCENT = 50; // Maximum allowable percentage change for height

  let tempSectionElement = new DOMParser().parseFromString('<section class="canopy-section"><p class="canopy-paragraph"></p></section>', 'text/html').body.firstChild;
  let tempParagraphElement = tempSectionElement.querySelector('p');
  canopyContainer.appendChild(tempSectionElement);
  tempParagraphElement.appendChild(tableElement);

  let sizes = {widestContent: -1, narrowestContent: Infinity, tallestContent: -1, shortestContent: Infinity};

  [...tableElement.querySelectorAll('td')].forEach(td => {  
    if (td.childNodes.length === 0) return;

    let clsp = td.getAttribute('colspan');
    let rwsp = td.getAttribute('rowspan');

    let contentRect = getCombinedBoundingRect([...td.childNodes]); // Get content size
    let contentWidth = contentRect.width;
    let contentHeight = contentRect.height;

    if (!clsp && contentWidth > sizes.widestContent) {
      sizes.widestContent = contentWidth;
      sizes.widestTd = td.offsetWidth;
    }
    if (!rwsp && contentHeight > sizes.tallestContent) { 
      sizes.tallestContent = contentHeight;
      sizes.tallestTd = td.offsetHeight;
    }
  });

  [...tableElement.querySelectorAll('td')].forEach(td => {
    if (td.childNodes.length === 0) return;

    // check if first bolded row
    const parentRow = td.parentElement;
    const firstTd = parentRow?.querySelector('td');
    if (firstTd === td && td.childNodes.length === 1 && td.firstElementChild?.tagName === 'B') return;

    let contentRect = getCombinedBoundingRect([...td.childNodes]);
    let currentContentWidth = contentRect.width;
    let widestContentWidth = sizes.widestContent;
    let widthChangePercent = Math.abs((widestContentWidth - currentContentWidth) / currentContentWidth) * 100;
    td.dataset.currentContentWidth = currentContentWidth;
    td.dataset.widestContentWidth = widestContentWidth;
    td.dataset.widestTd = sizes.widestTd;
    td.dataset.widthChangePercent = widthChangePercent;

    if (widthChangePercent <= MAX_WIDTH_CHANGE_PERCENT) {
      td.style.width = sizes.widestTd + 'px';
      td.style.boxSizing = 'border-box';
    }
  });

  [...tableElement.querySelectorAll('td')].forEach(td => {
    if (td.childNodes.length === 0) return;

    // check if first bolded column
    const parentRow = td.parentElement;
    const firstRow = tableElement?.querySelector('tr');
    if (firstRow === parentRow && td.childNodes.length === 1 && td.firstElementChild?.tagName === 'B') return;

    let contentRect = getCombinedBoundingRect([...td.childNodes]);
    let currentContentHeight = contentRect.height;
    let tallestContentHeight = sizes.tallestContent;
    let heightChangePercent = Math.abs((tallestContentHeight - currentContentHeight) / currentContentHeight) * 100;
    td.dataset.tallestContentHeight = tallestContentHeight;
    td.dataset.currentContentHeight = currentContentHeight;
    td.dataset.heightChangePercent = heightChangePercent;

    if (heightChangePercent <= MAX_HEIGHT_CHANGE_PERCENT) {
      td.style.height = sizes.tallestTd + 'px';
      td.style.boxSizing = 'border-box';
    }
  });

  tableElement.dataset.tallestContent = sizes.tallestContent;
  tableElement.dataset.tallestTd = sizes.tallestTd;
  tableElement.dataset.widest = sizes.widestContent;
  tableElement.dataset.widest = sizes.widestTd;

  canopyContainer.removeChild(tempSectionElement);
  tempParagraphElement.removeChild(tableElement);

  return [tableElement];
}

function renderMenu(token, renderContext) {
  let menuElement = document.createElement('DIV');
  menuElement.classList.add('canopy-menu');

  if (token.rtl) menuElement.dir = 'rtl';

  if (token.alignment === 'right') menuElement.classList.add('canopy-align-right');
  if (token.alignment === 'left') menuElement.classList.add('canopy-align-left');
  if (token.alignment === 'mixed') menuElement.classList.add('canopy-align-mixed');

  let SizesByArea = ['eigth-pill', 'quarter-pill', 'third-pill', 'half-pill', 'quarter-card', 'third-card', 'half-tube', 'half-card'];
  let tableListSizeIndex = 0;

  let cellElements = token.items.map((cellObject) => {
    let menuCellElement = document.createElement('DIV');
    menuCellElement.classList.add('canopy-menu-cell');
    let contentContainer = document.createElement('DIV');
    contentContainer.classList.add('canopy-menu-content-container');

    if (cellObject.hidden || cellObject.tokens.length === 0) {
      menuCellElement.style.opacity = '0';
      return menuCellElement;
    }

    let tokenElements = renderTokenElements(cellObject.tokens[0], renderContext);

    tokenElements.forEach(tokenElement => {
      const isOrHasOnlyLink = (el) => el.tagName === 'A' || (el.children.length === 1 && isOrHasOnlyLink(el.children[0]));
      if (cellObject.tokens.length === 1 && isOrHasOnlyLink(tokenElement)) {
        menuCellElement.classList.add('canopy-menu-link-cell');
        menuCellElement.classList.add('canopy-bounding-box-container');
        menuCellElement.addEventListener('click', tokenElement._CanopyClickHandler);
        tokenElement.removeEventListener('click', tokenElement._CanopyClickHandler);
      }
      contentContainer.appendChild(tokenElement);
      menuCellElement.appendChild(contentContainer);

      if (cellObject.alignment || ['left', 'right'].includes(token.alignment)) { // apply alignment to specific cells
        menuCellElement.classList.add(`canopy-menu-cell-${cellObject.alignment || token.alignment}-aligned`);
      }
    });

    if (cellObject.list) {
      let ordinalElement = document.createElement('SPAN');
      ordinalElement.classList.add('canopy-menu-ordinal');
      ordinalElement.innerHTML = cellObject.ordinal + '.&nbsp;';
      contentContainer.prepend(ordinalElement);
      menuCellElement.classList.add('canopy-menu-ordinal-cell');
    }

    return menuCellElement;
  });

  let tempSectionElement = new DOMParser().parseFromString('<section class="canopy-section"><p class="canopy-paragraph"></p></section>', 'text/html').body.firstChild;
  let tempParagraphElement = tempSectionElement.querySelector('p');
  let tempRowElement = createNewRow();
  canopyContainer.appendChild(tempSectionElement);
  tempParagraphElement.appendChild(menuElement);
  menuElement.appendChild(tempRowElement);

  for (let i = 0; i < cellElements.length; i++) {
    if (cellElements[i].style.opacity) continue;
    let menuCellElement = cellElements[i];
    tempRowElement.appendChild(menuCellElement);

    while (true) {
      if (tableListSizeIndex === SizesByArea.indexOf('half-pill') && token.items.length > 2) 
        tableListSizeIndex = SizesByArea.indexOf('quarter-card'); // Quarters look better than halves

      menuElement.classList.add(`canopy-${SizesByArea[tableListSizeIndex]}`);

      let contentBoundingRect = getCombinedBoundingRect([menuCellElement.querySelector('.canopy-menu-content-container')]);

      let container = menuCellElement.closest('.canopy-menu-cell');
      let containerStyles = window.getComputedStyle(container);
      let containerRect = container.getBoundingClientRect();

      let containerPaddingLeft = parseFloat(containerStyles.paddingLeft);
      let containerPaddingRight = parseFloat(containerStyles.paddingRight);
      let containerPaddingTop = parseFloat(containerStyles.paddingTop);
      let containerPaddingBottom = parseFloat(containerStyles.paddingBottom);

      let adjustedContainerRect = {
        top: containerRect.top + containerPaddingTop,
        left: containerRect.left + containerPaddingLeft,
        bottom: containerRect.bottom - containerPaddingBottom,
        right: containerRect.right - containerPaddingRight
      };

      let isOverflowingHorizontally = contentBoundingRect.left < adjustedContainerRect.left || contentBoundingRect.right > adjustedContainerRect.right;
      let isOverflowingVertically = contentBoundingRect.top < adjustedContainerRect.top || contentBoundingRect.bottom > adjustedContainerRect.bottom;

      if (!isOverflowingHorizontally && !isOverflowingVertically) break; // try next menu element

      if (tableListSizeIndex >= SizesByArea.length - 1) break; // No larger sizes available

      menuElement.classList.remove(`canopy-${SizesByArea[tableListSizeIndex]}`);
      tableListSizeIndex++;
      i = 0; // Once we increment the size, we need to recheck all previous elements because a larger area might have a narrower width
    }
  }

  tempParagraphElement.remove();
  tempRowElement.remove();
  tempSectionElement.remove();
  menuElement.classList.add(`canopy-${SizesByArea[tableListSizeIndex]}`);

  function createNewRow() {
    let newRow = document.createElement('DIV');
    newRow.classList.add('canopy-menu-row');
    if (token.rtl) newRow.dir = 'rtl';
    menuElement.appendChild(newRow);
    return newRow;
  }

  let rowSize;
  if (SizesByArea[tableListSizeIndex].includes('half')) rowSize = 2;
  if (SizesByArea[tableListSizeIndex].includes('third')) rowSize = 3;
  if (SizesByArea[tableListSizeIndex].includes('quarter')) rowSize = 4;
  if (SizesByArea[tableListSizeIndex].includes('eigth')) rowSize = 8;

  // Create the first row
  let tableRowElement = createNewRow();

  // Assuming cellElements is your array of cells
  for (let i = 0; i < cellElements.length; i++) {
    // Append cell to current row
    tableRowElement.appendChild(cellElements[i]);

    // If row is full and there are more cells to add, create a new row
    if ((i + 1) % rowSize === 0 && (i + 1) !== cellElements.length) {
      tableRowElement = createNewRow();
    }
  }

  if (menuElement.childNodes.length > 1) { // if there is more than one row
    const remainingCells = cellElements.length % rowSize;
    const cellsToAdd = remainingCells > 0 ? rowSize - remainingCells : 0;
    for (let i = 0; i < cellsToAdd; i++) {
      let paddingElement = document.createElement('DIV');
      paddingElement.classList.add('canopy-menu-cell');
      paddingElement.style.opacity = '0';
      tableRowElement.appendChild(paddingElement);
    }
  }

  // Only inner-most of left and right aligned links need margin
  [...tableRowElement.childNodes]
    .filter(element => element.classList.contains('canopy-menu-cell-right-aligned'))?.[0]
    ?.classList.add('canopy-menu-cell-first-right');

  [...tableRowElement.childNodes]
    .filter(element => element.classList.contains('canopy-menu-cell-left-aligned')).slice(-1)?.[0]
    ?.classList.add('canopy-menu-cell-last-left');

  return [menuElement];
}

function renderFootnoteLines(footnoteLinesToken, renderContext) {
  let div = document.createElement('DIV');
  let horizonalRule = document.createElement('HR');
  horizonalRule.classList.add('canopy-footnote-rule');
  div.appendChild(horizonalRule)

  footnoteLinesToken.lines.forEach(line => {
    let footnoteSpan = document.createElement('SPAN');
    footnoteSpan.classList.add('canopy-footnote-span');
    let textNode = document.createTextNode(line.superscript + '. ');
    footnoteSpan.appendChild(textNode);
    line.tokens.forEach((token) => {
      let [tokenElement] = renderTokenElements(token, renderContext);
      footnoteSpan.appendChild(tokenElement);
    });

    div.appendChild(footnoteSpan);
  });

  return [div];
}

function renderBoldText(token, renderContext) {
  let element = document.createElement('B');
  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => element.appendChild(subtokenElement));
  });
  return [element];
}
function renderUnderlineText(token, renderContext) {
  let element = document.createElement('u');
  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => element.appendChild(subtokenElement));
  });
  return [element];
}

function renderItalicText(token, renderContext) {
  let element = document.createElement('I');
  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => element.appendChild(subtokenElement));
  });
  return [element];
}

function renderInlineCodeText(token) {
  let element = document.createElement('CODE');
  element.innerText = token.text;
  return [element];
}

function renderToolTip(token, renderContext) {
  let tooltipContainerSpan = document.createElement('span');
  tooltipContainerSpan.className = 'canopy-tooltip';

  let tooltipIcon = document.createElement('sup');
  tooltipIcon.textContent = 'ⓘ';
  tooltipIcon.classList.add('canopy-tooltip-icon');
  tooltipContainerSpan.appendChild(tooltipIcon);

  // Create the tooltip text span
  var tooltipTextSpan = document.createElement('span');
  tooltipTextSpan.className = 'canopy-tooltiptext';
  tooltipTextSpan.dir = 'auto';
  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => tooltipTextSpan.appendChild(subtokenElement));
  });

  // Append the tooltip text span to the tooltip span
  tooltipContainerSpan.appendChild(tooltipTextSpan);
  return [tooltipContainerSpan];
}

export default renderTokenElements;
