import { onLocalLinkClick, onGlobalAndImportLinkClick } from 'render/click_handlers';
import externalLinkIconSvg from 'assets/external_link_icon/icon.svg';
import Link from 'models/link';
import Paragraph from 'models/paragraph';
import Path from 'models/path';
import Topic from '../../cli/shared/topic';
import { projectPathPrefix, hashUrls, canopyContainer } from 'helpers/getters';
import { scrollPage, imagesLoaded } from 'display/helpers';
import BackButton from 'render/back_button';

function renderTokenElement(token, renderContext) {
  if (token.type === 'text') {
    return renderTextToken(token);
  } else if (token.type === 'local') {
    return renderLocalLink(token, renderContext);
  } else if (token.type === 'global') {
    return renderGlobalLink(token, renderContext);
  } else if (token.type === 'import') {
    return renderImportLink(token, renderContext);
  } else if (token.type === 'url') {
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
  } else {
    throw `Unhandled token type: ${token.type} ${token.type === 'table_list'}`
  }
}

function renderTextToken(token) {
  let spanElement = document.createElement('SPAN');
  spanElement.innerText = token.text;

  return spanElement;
}

function renderLocalLink(token, renderContext) {
  let {
    localLinkSubtreeCallback
  } = renderContext;

  localLinkSubtreeCallback(token);
  return createLocalLinkElement(token, renderContext)
}

function createLocalLinkElement(token, renderContext) {
  let linkElement = document.createElement('a');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  linkElement.dataset.text = token.text;

  token.tokens.forEach(subtoken => {
    let subtokenElement = renderTokenElement(subtoken, renderContext);
    linkElement.appendChild(subtokenElement);
  });

  let callback = onLocalLinkClick(token.targetTopic, token.targetSubtopic, new Link(linkElement));

  linkElement.addEventListener(
    'click',
    callback
  );

  linkElement._CanopyClickHandler = callback

  linkElement.classList.add('canopy-local-link');
  linkElement.dataset.type = 'local';

  let targetTopic = new Topic(token.targetTopic);
  let targetSubtopic = new Topic(token.targetSubtopic);
  linkElement.href = `${projectPathPrefix ? '/' + projectPathPrefix : ''}${hashUrls ? '/#' : ''}/${targetTopic.url}#${targetSubtopic.url}`;
  return linkElement;
}

function renderGlobalLink(token, renderContext) {
  let {
    pathArray,
    globalLinkSubtreeCallback
  } = renderContext;

  let linkElement = createGlobalLinkElement(token, renderContext);

  globalLinkSubtreeCallback(token, linkElement);

  return linkElement;
}

function createGlobalLinkElement(token, renderContext) {
  let linkElement = document.createElement('a');

  token.tokens.forEach(subtoken => {
    let subtokenElement = renderTokenElement(subtoken, renderContext);
    linkElement.appendChild(subtokenElement);
  });

  linkElement.classList.add('canopy-global-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.type = 'global';

  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;

  linkElement.dataset.text = token.text;

  let targetTopic = Topic.fromMixedCase(token.targetTopic);
  linkElement.href = `${projectPathPrefix ? '/' + projectPathPrefix : ''}${hashUrls ? '/#' : ''}/${targetTopic.url}`;

  let callback = onGlobalAndImportLinkClick(new Link(linkElement))

  linkElement._CanopyClickHandler = callback;

  linkElement.addEventListener(
    'click',
    callback
  );
  return linkElement
}

function renderImportLink(token, renderContext) {
  let {
    pathArray
  } = renderContext;

  let linkElement = createImportLinkElement(token, renderContext);

  return linkElement;
}

function createImportLinkElement(token, renderContext) {
  let linkElement = document.createElement('a');

  token.tokens.forEach(subtoken => {
    let subtokenElement = renderTokenElement(subtoken, renderContext);
    linkElement.appendChild(subtokenElement);
  });

  linkElement.classList.add('canopy-import-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.type = 'import';

  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  linkElement.dataset.text = token.text;

  let targetTopic = new Topic(token.targetTopic);
  let targetSubtopic = new Topic(token.targetSubtopic);
  linkElement.href = `${projectPathPrefix ? '/' + projectPathPrefix : ''}${hashUrls ? '/#' : ''}/${targetTopic.url}#${targetSubtopic.url}`;

  linkElement.addEventListener(
    'click',
    onGlobalAndImportLinkClick(new Link(linkElement))
  );

  return linkElement
}

function renderExternalLink(token, renderContext) {
  let linkElement = document.createElement('A');
  linkElement.classList.add('canopy-url-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.type = 'url';
  linkElement.dataset.text = token.text;
  linkElement.setAttribute('href', token.url);
  linkElement.setAttribute('target', '_blank');

  let externalLinkContainer = document.createElement('SPAN');
  externalLinkContainer.classList.add('canopy-url-link-container');
  linkElement.appendChild(externalLinkContainer);

  let tokensContainer = document.createElement('SPAN');
  tokensContainer.classList.add('canopy-url-link-tokens-container');
  externalLinkContainer.appendChild(tokensContainer);

  token.tokens.forEach(subtoken => {
    let subtokenElement = renderTokenElement(subtoken, renderContext);
    tokensContainer.appendChild(subtokenElement);
  });

  tokensContainer.innerHTML += '<span class="canopy-url-link-tokens-spacing">&nbsp;&nbsp;</span>';

  let svgContainer = document.createElement('SPAN');
  svgContainer.classList.add('canopy-url-link-svg-container');
  svgContainer.innerHTML += externalLinkIconSvg.replace(/\r?\n|\r/g, '');
  externalLinkContainer.appendChild(svgContainer);

  externalLinkContainer.innerHTML += '<span class="canopy-url-link-svg-spacing">&nbsp;</span>';

  return linkElement;
}

function isVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function renderImage(token, renderContext) {
  let divElement = document.createElement('DIV');
  divElement.classList.add('canopy-image');

  let imageElement = document.createElement('IMG');
  imageElement.setAttribute('src', token.resourceUrl);
  imageElement.setAttribute('decoding', 'async'); // don't wait for image decode to update selected link on change

  let anchorElement = document.createElement('A');
  anchorElement.setAttribute('href', token.anchorUrl || token.resourceUrl);
  anchorElement.setAttribute('target', '_blank');
  anchorElement.classList.add('canopy-image-anchor');
  anchorElement.appendChild(imageElement);
  divElement.appendChild(anchorElement);

  if (token.title) {
    imageElement.setAttribute('title', token.title);
  }

  if (token.caption) {
    let spanElement = document.createElement('SPAN');
    spanElement.classList.add('canopy-image-caption');
    divElement.appendChild(spanElement);

    token.tokens.forEach(subtoken => {
      let subtokenElement = renderTokenElement(subtoken, renderContext);
      spanElement.appendChild(subtokenElement);
    });
  } else {
    divElement.appendChild(anchorElement);
  }

  if (token.altText) {
    imageElement.setAttribute('alt', token.altText);
  }

  imageElement.style.setProperty('height', '700px');
  imageElement.style.setProperty('opacity', '0');
  imageElement.addEventListener('load', () => { // if images were unloaded, scroll was delayed and so we do it now to avoid viewport jump
    imageElement.style.setProperty('height', null);
    imageElement.style.setProperty('opacity', '1');
    // let pathOfImage = renderContext.paragraph.path;
    // if (Path.current.includes(pathOfImage)) { // if when the image loads, it is on the current page and might jump the viewport
      // This is breaking browser tests that involve scrolling
      // scrollPage(Link.selection, { scrollStyle: canopyContainer.dataset.imageLoadScrollBehavior });
      // BackButton.updateVisibilityState();
    // }
  });

  return divElement;
}

function renderHtmlElement(token, renderContext) {
  let divElement = document.createElement('DIV');
  let fragment = document.createRange().createContextualFragment(token.html); // make script tags functional
  divElement.appendChild(fragment);
  divElement.classList.add('canopy-raw-html');
  [...divElement.querySelectorAll('img')].forEach((imageElement) => { // if the html contains image tags that haven't loaded yet
    let imageContainer = document.createElement('div');
    let originalHeight = imageElement.style.height;
    let originalWidth = imageElement.style.width;
    let originalOpacity = imageElement.style.opacity;
    imageElement.style.setProperty('opacity', '0');
    imageElement.addEventListener('load', () => { // wait for them to load
      imageElement.style.setProperty('opacity', originalOpacity);
      // let pathOfImage = renderContext.paragraph.path;
      // if (Path.current.includes(pathOfImage)) { // if when the image loads, it is on the current page and might jump the viewport
        // This is breaking browser tests that involve scrolling
        // scrollPage(Link.selection, { scrollStyle: canopyContainer.dataset.imageLoadScrollBehavior });
        // BackButton.updateVisibilityState();
      // }
    });
  });
  return divElement;
}

function renderFootnoteSymbol(token) {
  let superscriptElement = document.createElement('SUP');
  let textNode = document.createTextNode(token.text);
  superscriptElement.appendChild(textNode);
  return superscriptElement;
}

function renderCodeBlock(token) {
  let preElement = document.createElement('PRE');
  let codeBlockElement = document.createElement('CODE');
  preElement.appendChild(codeBlockElement);

  codeBlockElement.innerText = token.text;

  return preElement;
}

function renderBlockQuote(token, renderContext) {
  let blockQuoteElement = document.createElement('BLOCKQUOTE');
  blockQuoteElement.setAttribute('dir', token.direction);

  token.tokens.forEach(subtoken => {
    let subtokenElement = renderTokenElement(subtoken, renderContext);
    blockQuoteElement.appendChild(subtokenElement);
  });

  return blockQuoteElement;
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
        let tokenElement = renderTokenElement(token, renderContext);
        listItemElement.appendChild(tokenElement);
      }
    );

    if (listNodeObject.children.length > 0) {
      let childList = renderList(listNodeObject.children);
      listItemElement.appendChild(childList);
    }

    listElement.appendChild(listItemElement);
  });
  return listElement;
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

          cellObject.tokens.forEach(
            (token) => {
              let tokenElement = renderTokenElement(token, renderContext);

              if (cellObject.colspan) tableCellElement.setAttribute('colspan', cellObject.colspan);
              if (cellObject.rowspan) tableCellElement.setAttribute('rowspan', cellObject.rowspan);

              if (cellObject.tokens.length === 1 && tokenElement.tagName === 'A') {
                tableCellElement.classList.add('canopy-table-link-cell');
                tokenElement.classList.add('canopy-table-link');
                tableCellElement.addEventListener('click', tokenElement._CanopyClickHandler);
                tokenElement.removeEventListener('click', tokenElement._CanopyClickHandler)
              }

              tableCellElement.appendChild(tokenElement);
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
  return tableElement;
}

function renderTableList(token, renderContext) {
  let tableListElement = document.createElement('DIV');
  tableListElement.classList.add('canopy-table-list');

  if (token.rtl) tableListElement.dir = 'rtl';

  if (token.items.every(item => item.alignment === 'right')) tableListElement.classList.add('align-right');
  if (token.items.every(item => item.alignment === 'left')) tableListElement.classList.add('align-left');

  let SizesByWidth = ['quarter', 'third', 'half'];
  let SizesByArea = ['quarter-pill', 'third-pill', 'half-pill', 'quarter-card', 'third-card', 'half-card'];

  let tableCellSize;
  let minimumCellArea = 'quarter-pill';
  let minimumCellWidth = 'quarter';
  if (token.items.length < 3) minimumCellArea = 'third-pill'; // even if content doesn't justify size, we expand if there aren't so many

  let cellElements = token.items.map(cellObject => {
    let tableCellElement = document.createElement('DIV');
    tableCellElement.classList.add('canopy-table-list-cell');
    let contentContainer = document.createElement('DIV');
    contentContainer.classList.add('canopy-table-list-content-container');

    if (cellObject.hidden) tableCellElement.style.opacity = '0';

    let tokenElement = renderTokenElement(cellObject.tokens[0], renderContext);

    if (cellObject.tokens.length === 1 && tokenElement.tagName === 'A') {
      tokenElement.classList.add('canopy-table-list-cell');
      tokenElement.classList.add('canopy-table-list-link-cell');
      while (tokenElement.firstChild) contentContainer.appendChild(tokenElement.firstChild);
      tableCellElement = tokenElement;
      tableCellElement.appendChild(contentContainer);
    } else {
      cellObject.tokens.forEach(token => {
        tokenElement = renderTokenElement(token, renderContext);
        contentContainer.appendChild(tokenElement);
      });
      tableCellElement.appendChild(contentContainer);
    }

    if (cellObject.list) {
      let ordinalElement = document.createElement('SPAN');
      ordinalElement.classList.add('canopy-table-list-ordinal');
      ordinalElement.innerHTML = cellObject.ordinal + '.&nbsp;';
      contentContainer.prepend(ordinalElement);
      tableCellElement.classList.add('canopy-table-list-ordinal-cell');
    }

    // determine cell size
    let longestWord = tableCellElement.innerText.split(' ').sort((a, b) => b.length - a.length)[0];
    let longestWordLength = longestWord.length;
    let totalLength = tableCellElement.innerText.length;

    let sizeOptionsBasedOnLargestWordLength;
    if (longestWordLength < 16) { // 0 - 10 eg "Acknowledgements"
      if (SizesByWidth.indexOf(minimumCellWidth) < SizesByWidth.indexOf('quarter')) minimumCellWidth = 'quarter';
    } else if (longestWordLength < 21) { // 10-30
      if (SizesByWidth.indexOf(minimumCellWidth) < SizesByWidth.indexOf('third')) minimumCellWidth = 'third';
    } else {
      minimumCellWidth = 'half';
    }

    if (totalLength < 17) {
      if (SizesByArea.indexOf(minimumCellArea) < SizesByArea.indexOf('quarter-pill')) minimumCellArea = 'quarter-pill';
    } else if (totalLength < 22) {
      if (SizesByArea.indexOf(minimumCellArea) < SizesByArea.indexOf('third-pill')) minimumCellArea = 'third-pill';
    } else if (totalLength < 29 && token.items.length <= 2) {
      if (SizesByArea.indexOf(minimumCellArea) < SizesByArea.indexOf('half-pill')) minimumCellArea = 'half-pill';
    } else if (totalLength < 26) {
      if (SizesByArea.indexOf(minimumCellArea) < SizesByArea.indexOf('quarter-card')) minimumCellArea = 'quarter-card';
    } else if (totalLength < 51) {
      if (SizesByArea.indexOf(minimumCellArea) < SizesByArea.indexOf('third-card')) minimumCellArea = 'third-card';
    } else {
      if (SizesByArea.indexOf(minimumCellArea) < SizesByArea.indexOf('half-card')) minimumCellArea = 'half-card';
    }

    tableCellSize = SizesByArea.find((newSize, index) => {
      if (SizesByWidth.indexOf(minimumCellWidth) > SizesByWidth.indexOf(newSize.match(/^[a-z]+/)[0])) return false;
      if (SizesByArea.indexOf(minimumCellArea) > SizesByArea.indexOf(newSize)) return false;
      return true; // otherwise update tableCellSize
    });

    return tableCellElement;
  });

  tableListElement.style.opacity = '0';
  let id = setInterval(() => { // once elements are in DOM and have height, make heights consistent
    if (setLargestHeightToAll(cellElements)) {
      clearInterval(id);
      tableListElement.style.opacity = '1'; //once resizing has occurred to avoid flashing
    }
  }, 0)

  tableListElement.classList.add(`canopy-${tableCellSize}`);

  // Function to create a new row
  function createNewRow() {
    let newRow = document.createElement('DIV');
    newRow.classList.add('canopy-table-list-row');
    if (token.rtl) newRow.dir = 'rtl';
    tableListElement.appendChild(newRow);
    return newRow;
  }

  let rowSize;
  if (tableCellSize.includes('half')) rowSize = 2;
  if (tableCellSize.includes('third')) rowSize = 3;
  if (tableCellSize.includes('quarter')) rowSize = 4;

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

  return tableListElement;

  function getLargestHeight(elements) {
    let largestHeight = 0;
    elements.forEach(element => {
      let computedHeight = window.getComputedStyle(element).height;
      let height = parseFloat(computedHeight);
      if (height > largestHeight) {
        largestHeight = height;
      }
    });
    return largestHeight;
  }

  function setLargestHeightToAll(elements) {
    let largestHeight = getLargestHeight(elements);
    if (largestHeight === 0) return false;
    elements.forEach(element => {
      element.style.height = largestHeight + 'px';
    });
    if (largestHeight > 0) return true;
  }
}

function renderHtmlBlock(token) {
  let htmlContainer = document.createElement('DIV');
  htmlContainer.innerHTML = token.html;
  htmlContainer.classList.add('canopy-raw-html');
  return htmlContainer;
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
      let tokenElement = renderTokenElement(token, renderContext);
      footnoteSpan.appendChild(tokenElement);
    });

    div.appendChild(footnoteSpan);
  });

  return div;
}

function renderBoldText(token, renderContext) {
  let element = document.createElement('B');
  token.tokens.forEach(subtoken => {
    let subtokenElement = renderTokenElement(subtoken, renderContext);
    element.appendChild(subtokenElement);
  });
  return element;
}
function renderStrikethroughText(token, renderContext) {
  let element = document.createElement('S');
  token.tokens.forEach(subtoken => {
    let subtokenElement = renderTokenElement(subtoken, renderContext);
    element.appendChild(subtokenElement);
  });
  return element;
}

function renderItalicText(token, renderContext) {
  let element = document.createElement('I');
  token.tokens.forEach(subtoken => {
    let subtokenElement = renderTokenElement(subtoken, renderContext);
    element.appendChild(subtokenElement);
  });
  return element;
}

function renderInlineCodeText(token, renderContext) {
  let element = document.createElement('CODE');
  element.innerText = token.text;
  return element;
}

export default renderTokenElement;
