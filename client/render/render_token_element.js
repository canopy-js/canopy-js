import { onLocalLinkClick, onGlobalAndImportLinkClick } from 'render/click_handlers';
import externalLinkIconSvg from 'assets/external_link_icon/icon.svg';
import Link from 'models/link';
import Topic from '../../cli/commands/shared/topic';

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
    return renderImage(token);
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
  } else if (token.type === 'html_block') {
    return renderHtmlBlock(token);
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
    throw `Unhandled token type: ${token.type}`
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

  linkElement.addEventListener(
    'click',
    onLocalLinkClick(token.targetTopic, token.targetSubtopic, new Link(linkElement))
  );

  linkElement.classList.add('canopy-local-link');
  linkElement.dataset.type = 'local';

  let targetTopic = new Topic(token.targetTopic);
  let targetSubtopic = new Topic(token.targetSubtopic);
  linkElement.href = `/${targetTopic.slug}#${targetSubtopic.slug}`;
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
  linkElement.href = `/${targetTopic.slug}`;

  linkElement.addEventListener(
    'click',
    onGlobalAndImportLinkClick(new Link(linkElement))
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

  linkElement.classList.add('canopy-global-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.type = 'import';

  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  linkElement.dataset.text = token.text;

  let targetTopic = new Topic(token.targetTopic);
  let targetSubtopic = new Topic(token.targetSubtopic);
  linkElement.href = `/${targetTopic.slug}#${targetSubtopic.slug}`;

  linkElement.addEventListener(
    'click',
    onGlobalAndImportLinkClick(new Link(linkElement))
  );

  return linkElement
}

function renderLinkLiteral(token, renderContext) {
  let linkElement = document.createElement('a');
  let linkSpan = document.createElement('SPAN');

  linkSpan.classList.add('canopy-url-link-span');
  linkElement.classList.add('canopy-url-link');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.type = 'url';
  linkElement.dataset.text = token.text;
  linkElement.setAttribute('href', token.url);
  linkElement.setAttribute('target', '_blank');

  token.tokens.forEach(subtoken => {
    let subtokenElement = renderTokenElement(subtoken, renderContext);
    linkSpan.appendChild(subtokenElement);
  });

  let container = document.createElement('div');
  container.classList.add('canopy-url-link-container');
  container.appendChild(linkSpan);

  // let svg = document.createElement('span');
  // svg.innerHTML += externalLinkIconSvg.replace(/\r?\n|\r/g, '');
  // container.appendChild(svg)

  linkElement.appendChild(linkSpan);

  return linkElement;
}

function renderImage(token) {
  let divElement = document.createElement('DIV');
  divElement.classList.add('canopy-image-div');

  let imageElement = document.createElement('IMG');
  divElement.appendChild(imageElement);

  imageElement.setAttribute('src', token.resourceUrl);
  imageElement.classList.add('canopy-image');

  let anchorElement = document.createElement('A');
  anchorElement.setAttribute('href', token.anchorUrl || token.resourceUrl);
  anchorElement.setAttribute('target', '_blank');
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

function renderHtmlElement(token) {
  let divElement = document.createElement('DIV');
  let fragment = document.createRange().createContextualFragment(token.html); // make script tags functional
  divElement.appendChild(fragment);
  divElement.classList.add('canopy-raw-html');
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
  token.rows.forEach(
    (tokensByCellOfRow) => {
      let tableRowElement = document.createElement('TR');
      tokensByCellOfRow.forEach(
        (tokensOfCell) => {
          let tableCellElement = document.createElement('TD');

          tokensOfCell.forEach(
            (token) => {
              let tokenElement = renderTokenElement(token, renderContext);
              tableCellElement.appendChild(tokenElement);
            }
          );

          tableRowElement.appendChild(tableCellElement);
        }
      )
      tableElement.appendChild(tableRowElement);
    }
  );
  return tableElement;
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
