import { onLinkClick } from 'render/click_handlers';
import Link from 'models/link';
import Paragraph from 'models/paragraph';
import Path from 'models/path';
import Topic from '../../cli/shared/topic';
import { projectPathPrefix, hashUrls, canopyContainer } from 'helpers/getters';
import ScrollableContainer from 'helpers/scrollable_container';
import { scrollPage, imagesLoaded, scrollToWithPromise, getScrollInProgress } from 'display/helpers';
import requestJson from 'requests/request_json';

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
  } else if (token.type === 'table_list') {
    return renderTableList(token, renderContext)
  } else if (token.type === 'footnote_lines') {
    return renderFootnoteLines(token, renderContext);
  } else if (token.type === 'bold') {
    return renderBoldText(token, renderContext);
  } else if (token.type === 'strikethrough') {
    return renderStrikethroughText(token, renderContext);
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

function renderLocalLink(token, renderContext) {
  let linkElement = document.createElement('a');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.targetTopic = token.targetTopic; // helpful for debugger
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.targetSubtopic = token.targetSubtopic; // helpful to have in debugger
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  linkElement.dataset.text = token.text;

  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => linkElement.appendChild(subtokenElement));
  });

  linkElement.addEventListener('dragstart', (e) => { // make text selection of table cell links easier
    e.preventDefault();
  });


  let callback = onLinkClick(new Link(linkElement));
  linkElement._CanopyClickHandler = callback;
  linkElement.addEventListener(
    'click',
    callback
  );

  linkElement.classList.add('canopy-local-link');
  linkElement.dataset.type = 'local';

  let targetTopic = new Topic(token.targetTopic);
  let targetSubtopic = new Topic(token.targetSubtopic);
  linkElement.href = `${projectPathPrefix ? '/' + projectPathPrefix : ''}${hashUrls ? '/#' : ''}/${targetTopic.url}#${targetSubtopic.url}`;
  return [linkElement];
}

function renderGlobalLink(token, renderContext) {
  let { fullPath, remainingPath, currentTopic, currentSubtopic } = renderContext;

  let linkElement = document.createElement('a');

  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => linkElement.appendChild(subtokenElement));
  });

  linkElement.classList.add('canopy-global-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.type = 'global';

  linkElement.dataset.literalPathString = token.pathString; // convert to mixed-case
  linkElement.path = token.path; // helpful to have in debugger
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;

  linkElement.dataset.text = token.text;

  linkElement.href = Path.for(token.pathString).productionPathString;

  let link = new Link(linkElement);
  let callback = onLinkClick(link);
  linkElement.addEventListener(
    'click',
    callback
  );

  linkElement._CanopyClickHandler = callback;

  if (link.isPathReference) linkElement.classList.add('canopy-provisional-icon-link'); // put icon for table list space allocation

  setTimeout(() => { // will run when the paragraph has a parent chain so we can detect cycle types
    if (!link.element) return;
    if (!link.element.closest('.canopy-paragraph')) console.error('No paragraph for link', linkElement);

    linkElement.classList.remove('canopy-provisional-icon-link')

    if (link.isBackCycle) {
      linkElement.classList.add('canopy-back-cycle-link');
    } else if (link.isLateralCycle) {
      linkElement.classList.add('canopy-lateral-cycle-link');
    } else if (link.isPathReference) {
      linkElement.classList.add('canopy-path-reference');
    }
  });

  return [linkElement]
}

function renderDisabledLink(token, renderContext) {
  let linkElement = document.createElement('a');
  //linkElement.classList.add('canopy-selectable-link');
  // linkElement.dataset.targetTopic = token.targetTopic;
  // linkElement.targetTopic = token.targetTopic; // helpful for debugger
  // linkElement.dataset.targetSubtopic = token.targetSubtopic;
  // linkElement.targetSubtopic = token.targetSubtopic; // helpful to have in debugger
  // linkElement.dataset.enclosingTopic = token.enclosingTopic;
  // linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  // linkElement.dataset.text = token.text;

  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => linkElement.appendChild(subtokenElement));
  });

  // let callback = onLinkClick(new Link(linkElement));

  // linkElement.addEventListener(
  //   'click',
  //   callback
  // );

  // linkElement._CanopyClickHandler = callback;

  linkElement.classList.add('canopy-disabled-link');
  linkElement.dataset.type = 'disabled';

  // let targetTopic = new Topic(token.targetTopic);
  // let targetSubtopic = new Topic(token.targetSubtopic);
  // linkElement.href = `${projectPathPrefix ? '/' + projectPathPrefix : ''}${hashUrls ? '/#' : ''}/${targetTopic.url}#${targetSubtopic.url}`;
  return [linkElement];
}

function renderExternalLink(token, renderContext) {
  let linkElement = document.createElement('A');
  linkElement.classList.add('canopy-external-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.type = 'external';
  linkElement.dataset.text = token.text;
  linkElement.setAttribute('href', token.url); // validation should have been done at the matcher/token stage
  linkElement.setAttribute('target', '_blank');
  linkElement.dataset.targetUrl = token.url;

  setTimeout(() => {
    if (linkElement.querySelector('img')) linkElement.classList.add('canopy-linked-image');
  });

  token.tokens.forEach(subtoken => {
    let subtokenElements = renderTokenElements(subtoken, renderContext);
    subtokenElements.forEach(subtokenElement => linkElement.appendChild(subtokenElement));
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
      let current = ScrollableContainer.currentScroll;
      let newScroll = ScrollableContainer.currentScroll + diff;

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

  divElement.classList.add('canopy-raw-html');

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

  // Temporarily append clone to the DOM for measurement
  clone.style.visibility = 'hidden';
  clone.style.position = 'absolute';

  let tempSectionElement = new DOMParser().parseFromString('<section class="canopy-section"><p class="canopy-paragraph"></p></section>', 'text/html').body.firstChild;
  let tempParagraphElement = tempSectionElement.querySelector('p');
  canopyContainer.appendChild(tempSectionElement);
  tempParagraphElement.appendChild(clone);

  // Check direction consistency among characters in the clone
  let wraps = false;
  let direction = null; // neutral
  let parentSpan;

  [...clone.querySelectorAll('span.canopy-blockquote-character')].forEach((element, index, elements) => {
    parentSpan = parentSpan || element.closest('.canopy-text-span');
    if (parentSpan !== element.closest('.canopy-text-span')) { // we switched spans ie linebreak
      direction = null;
    } else { // The element is a span
      let elementRect = element.getBoundingClientRect();
      let previousElement = elements[index - 1];
      let previousRect = elements[index - 1]?.getBoundingClientRect();
      let previousParentSpan = previousElement?.closest('.canopy-text-span');

      if (previousElement && previousParentSpan === parentSpan) { // don't compare first letter to last of last line
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
    blockQuoteElement.querySelectorAll('.canopy-linebreak-span').forEach((span, i, all) => {
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
      let [childList] = renderList(listNodeObject.children);
      listItemElement.appendChild(childList);
    }

    listElement.appendChild(listItemElement);
  });
  return [listElement];
}

function renderTable(token, renderContext) {
  let tableElement = document.createElement('TABLE');
  tableElement.setAttribute('dir', 'instant');
  if (token.rtl) tableElement.setAttribute('dir', 'rtl');

  token.rows.forEach(
    (row) => {
      let tableRowElement = document.createElement('TR');
      if (token.rtl) tableRowElement.setAttribute('dir', 'rtl');

      row.forEach(
        (cellObject) => {
          let tableCellElement = document.createElement('TD');
          if (cellObject.hidden) tableCellElement.classList.add('hidden');

          cellObject.tokens.forEach(
            (token) => {
              let tokenElements = renderTokenElements(token, renderContext);

              tokenElements.forEach(tokenElement => {
                if (cellObject.colspan) tableCellElement.setAttribute('colspan', cellObject.colspan);
                if (cellObject.rowspan) tableCellElement.setAttribute('rowspan', cellObject.rowspan);

                if (cellObject.tokens.length === 1 && tokenElement.tagName === 'A') {
                  tableCellElement.classList.add('canopy-table-link-cell');
                  tokenElement.classList.add('canopy-table-link');
                  tableCellElement.addEventListener('click', tokenElement._CanopyClickHandler);
                  tokenElement.removeEventListener('click', tokenElement._CanopyClickHandler)
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
  return [tableElement];
}

function renderTableList(token, renderContext) {
  let tableListElement = document.createElement('DIV');
  tableListElement.classList.add('canopy-table-list');

  if (token.rtl) tableListElement.dir = 'rtl';

  if (token.alignment === 'right') tableListElement.classList.add('canopy-align-right');
  if (token.alignment === 'left') tableListElement.classList.add('canopy-align-left');
  if (token.alignment === 'mixed') tableListElement.classList.add('canopy-align-mixed');

  let SizesByArea = ['eigth-pill', 'quarter-pill', 'third-pill', 'half-pill', 'quarter-card', 'third-card', 'half-tube', 'half-card'];
  let tableListSizeIndex = 0;

  let cellElements = token.items.map((cellObject, cellIndex) => {
    let tableCellElement = document.createElement('DIV');
    tableCellElement.classList.add('canopy-table-list-cell');
    let contentContainer = document.createElement('DIV');
    contentContainer.classList.add('canopy-table-list-content-container');

    if (cellObject.hidden) tableCellElement.style.opacity = '0';

    let tokenElements = renderTokenElements(cellObject.tokens[0], renderContext);

    tokenElements.forEach(tokenElement => {
      if (cellObject.tokens.length === 1 && tokenElement.tagName === 'A') {
        tokenElement.classList.add('canopy-table-list-cell');
        tokenElement.classList.add('canopy-table-list-link-cell');
        while (tokenElement.firstChild) contentContainer.appendChild(tokenElement.firstChild);
        tableCellElement = tokenElement;
        tableCellElement.appendChild(contentContainer);
        tableCellElement.addEventListener('dragstart', e => e.preventDefault());
      } else {
        cellObject.tokens.forEach(token => {
          tokenElements.forEach(tokenElement => contentContainer.appendChild(tokenElement));
        });
        tableCellElement.appendChild(contentContainer);
      }      

      if (cellObject.alignment || token.alignment) { // apply alignment to specific cells
        tableCellElement.classList.add(`canopy-table-list-cell-${cellObject.alignment || token.alignment}-aligned`);
      }
    });

    if (cellObject.list) {
      let ordinalElement = document.createElement('SPAN');
      ordinalElement.classList.add('canopy-table-list-ordinal');
      ordinalElement.innerHTML = cellObject.ordinal + '.&nbsp;';
      contentContainer.prepend(ordinalElement);
      tableCellElement.classList.add('canopy-table-list-ordinal-cell');
    }

    return tableCellElement;
  });

  let tempParagraphElement = document.createElement('p');
  tempParagraphElement.classList.add('canopy-paragraph');
  let tempSectionElement = document.createElement('section');
  tempSectionElement.classList.add('canopy-section');
  let tempRowElement = createNewRow();
  canopyContainer.appendChild(tempSectionElement);
  tempSectionElement.appendChild(tempParagraphElement);
  tempParagraphElement.appendChild(tableListElement);
  tableListElement.appendChild(tempRowElement);

  for (let i = 0; i < cellElements.length; i++) {
    // try fitting text into boxes and find the minimum cell size that fits
    let tableCellElement = cellElements[i];
    tempRowElement.appendChild(tableCellElement);
    tableCellElement.style.overflow = 'scroll';

    while(1) {
      if (tableListSizeIndex === SizesByArea.indexOf('half-pill') && token.items.length > 2) tableListSizeIndex = SizesByArea.indexOf('quarter-card'); // quarters look better than halves
      // if (token.items.length < 3 && !token.alignment && tableListSizeIndex < 2) { // even if content isn't big, expand if there aren't so many
      //   tableListSizeIndex = 2;
      // }

      tableListElement.classList.add(`canopy-${SizesByArea[tableListSizeIndex]}`);

      let availableWidth = tableCellElement.clientWidth -
        parseFloat(window.getComputedStyle(tableCellElement).paddingLeft) -
        parseFloat(window.getComputedStyle(tableCellElement).paddingRight);

      let availableHeight = tableCellElement.clientHeight -
        parseFloat(window.getComputedStyle(tableCellElement).paddingTop) -
        parseFloat(window.getComputedStyle(tableCellElement).paddingBottom);

      let scrollWidth = tableCellElement.firstChild.scrollWidth -
        parseFloat(window.getComputedStyle(tableCellElement).borderWidth) * 2;

      let scrollHeight = tableCellElement.firstChild.scrollHeight -
        parseFloat(window.getComputedStyle(tableCellElement).borderWidth) * 2;

      let tooWide = scrollWidth > availableWidth;
      let tooTall = scrollHeight > availableHeight;

      if (!tooWide && !tooTall) break; // fits
      if (tableListSizeIndex >= SizesByArea.length - 1) break; // no bigger sizes

      tableListElement.classList.remove(`canopy-${SizesByArea[tableListSizeIndex]}`);
      tableListSizeIndex++;
      i = 0; // once we increment the size, we have to try on all previous elements because larger area might have narrower width
    }

  }

  tempParagraphElement.remove();
  tempRowElement.remove();
  tempSectionElement.remove();
  tableListElement.classList.add(`canopy-${SizesByArea[tableListSizeIndex]}`);

  function createNewRow() {
    let newRow = document.createElement('DIV');
    newRow.classList.add('canopy-table-list-row');
    if (token.rtl) newRow.dir = 'rtl';
    tableListElement.appendChild(newRow);
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

  if (tableListElement.childNodes.length > 1) { // if there is more than one row
    const remainingCells = cellElements.length % rowSize;
    const cellsToAdd = remainingCells > 0 ? rowSize - remainingCells : 0;
    for (let i = 0; i < cellsToAdd; i++) {
      let paddingElement = document.createElement('DIV');
      paddingElement.classList.add('canopy-table-list-cell');
      paddingElement.style.opacity = '0';
      tableRowElement.appendChild(paddingElement);
    }
  }

  return [tableListElement];

  function getTotalWidthWithAfter(element) {
    // Get the width of the main element
    const mainWidth = element.getBoundingClientRect().width;

    // Get the computed style of the ::after pseudo-element
    const afterStyle = window.getComputedStyle(element, '::after');

    // Try to parse the width of the ::after pseudo-element
    // This assumes a fixed width is set in CSS
    const afterWidth = parseFloat(afterStyle.width);

    // If afterWidth is NaN (not a number), it means the width couldn't be parsed,
    // so we assume it's 0 or handle it according to your use case.
    return mainWidth + (isNaN(afterWidth) ? 0 : afterWidth);
  }
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
function renderStrikethroughText(token, renderContext) {
  let element = document.createElement('S');
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

function renderInlineCodeText(token, renderContext) {
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

function renderLineBreak() {
  let lineBreakSpan = document.createElement('SPAN');
  lineBreakSpan.classList.add('canopy-linebreak-span');
  return [lineBreakSpan];
}

export default renderTokenElements;
