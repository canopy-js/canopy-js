import { onLocalLinkClick, onGlobalAndImportLinkClick } from 'render/click_handlers';
import externalLinkIconSvg from 'assets/external_link_icon/icon.svg';
import Link from 'models/link';
import Paragraph from 'models/paragraph';
import Topic from '../../cli/shared/topic';
import { projectPathPrefix, hashUrls, canopyContainer } from 'helpers/getters';
import { scrollPage, imagesLoaded } from 'display/helpers';

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
    return renderLinkLiteral(token, renderContext);
  } else if (token.type === 'image') {
    return renderImage(token, renderContext);
  } else if (token.type === 'html_element') {
    return renderHtmlElement(token);
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

function renderLinkLiteral(token, renderContext) {
  let linkElement = document.createElement('A');
  linkElement.classList.add('canopy-url-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.type = 'url';
  linkElement.dataset.text = token.text;
  linkElement.setAttribute('href', token.url);
  linkElement.setAttribute('target', '_blank');

  let tokensContainer = document.createElement('SPAN');
  tokensContainer.classList.add('canopy-url-link-tokens-container');
  linkElement.appendChild(tokensContainer);

  token.tokens.forEach(subtoken => {
    let subtokenElement = renderTokenElement(subtoken, renderContext);
    tokensContainer.appendChild(subtokenElement);
  });

  tokensContainer.innerHTML += '<span class="canopy-url-link-tokens-spacing">&nbsp;&nbsp;</span>';

  let svgContainer = document.createElement('SPAN');
  svgContainer.classList.add('canopy-url-link-svg-container');
  svgContainer.innerHTML += externalLinkIconSvg.replace(/\r?\n|\r/g, '');
  linkElement.appendChild(svgContainer);

  linkElement.innerHTML += '<span class="canopy-url-link-svg-spacing">&nbsp;</span>'; // we don't want this to

  return linkElement;
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
    scrollPage({ scrollStyle: canopyContainer.dataset.imageLoadScrollBehavior });
  });

  return divElement;
}

function renderHtmlElement(token) {
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
      if (Paragraph.current) scrollPage({ scrollStyle: canopyContainer.dataset.imageLoadScrollBehavior });
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

  token.rows.forEach(
    (row) => {
      let tableRowElement = document.createElement('TR');
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
  let totalNumberOfCells = token.rows.reduce((sum, row) => sum + row.length, 0);

  let containerElement = document.createElement('DIV');
  containerElement.classList.add('canopy-table-list-container');

  let tableListElement = document.createElement('DIV');
  tableListElement.classList.add('canopy-table-list');
  containerElement.appendChild(tableListElement);

  token.rows.forEach(row => {
    let tableRowElement = document.createElement('DIV');
    tableRowElement.classList.add('canopy-table-list-row');
    tableListElement.appendChild(tableRowElement);

    row.forEach(cellObject => {
      let tableCellElement = document.createElement('DIV');
      tableCellElement.classList.add('canopy-table-list-cell');
      tableRowElement.appendChild(tableCellElement);

      let contentContainer = document.createElement('DIV');
      contentContainer.classList.add('canopy-table-list-content-container');
      tableCellElement.appendChild(contentContainer);

      cellObject.tokens.forEach(token => {
        let tokenElement = renderTokenElement(token, renderContext);
        if (cellObject.tokens.length === 1 && tokenElement.tagName === 'A') {
          tableCellElement.classList.add('canopy-table-list-link-cell');
          tokenElement.classList.add('canopy-table-list-link');
          tableCellElement.addEventListener('click', tokenElement._CanopyClickHandler);
          tokenElement.removeEventListener('click', tokenElement._CanopyClickHandler)
        }
        contentContainer.appendChild(tokenElement);
      });

      if (tableCellElement.innerText.length > 10) {
        let longestWord = tableCellElement.innerText.split(' ').sort((a, b) => b.length - a.length)[0];
        let fontSizeBasedOnTextSize = getFontSizeBasedOnTextSize(tableCellElement.innerText.length);
        let fontSizeBasedOnLongestWord = getFontSizeBasedOnLongestWord(longestWord.length);

        tableCellElement.setAttribute(
          'style',
          'font-size: ' + Math.max(Math.min(fontSizeBasedOnTextSize, fontSizeBasedOnLongestWord), 9) + 'px'
        );
      }
    });
  });

  return containerElement;
}

function getFontSizeBasedOnTextSize(characterCount) {
    const m = -4/43;
    const c = 17 + (m * 18);
    const originalSize = m * characterCount + c;
    return originalSize * 1.46;
}

function getFontSizeBasedOnLongestWord(longestWordLength) {
  const beta = -0.6;
  const alpha = 26.2;
  return alpha + beta * longestWordLength;
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
