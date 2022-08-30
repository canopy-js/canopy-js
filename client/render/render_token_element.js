import { onLocalLinkClick, onGlobalAndImportLinkClick } from 'render/click_handlers';
import externalLinkIconSvg from 'assets/external_link_icon/icon.svg';
import renderStyledText from 'render/render_styled_text';
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
    return renderLinkLiteral(token);
  } else if (token.type === 'image') {
    return renderImage(token);
  } else if (token.type === 'html_element') {
    return renderHtmlElement(token);
  } else if (token.type === 'footnote') {
    return renderFootnoteSymbol(token);
  } else if (token.type === 'code_block') {
    return renderCodeBlock(token);
  } else if (token.type === 'quote') {
    return renderBlockQuote(token);
  } else if (token.type === 'list') {
    return renderList(token.topLevelNodes);
  } else if (token.type === 'table') {
    return renderTable(token)
  } else if (token.type === 'html_block') {
    return renderHtmlBlock(token);
  } else if (token.type === 'footnote_rule') {
    return renderFootnoteRule(token);
  } else if (token.type === 'footnote_line') {
    return renderFootnoteLine(token);
  }
}

function renderTextToken(token) {
  let spanElement = document.createElement('SPAN');
  let styleElements = renderStyledText(token.text);
  appendElementsToParent(styleElements, spanElement);

  return spanElement;
}

function renderLocalLink(token, renderContext) {
  let {
    localLinkSubtreeCallback
  } = renderContext;

  localLinkSubtreeCallback(token);
  return createLocalLinkElement(token)
}

function createLocalLinkElement(token) {
  let linkElement = document.createElement('a');
  linkElement.classList.add('canopy-selectable-link');
  linkElement.dataset.targetTopic = token.targetTopic;
  linkElement.dataset.targetSubtopic = token.targetSubtopic;
  linkElement.dataset.enclosingTopic = token.enclosingTopic;
  linkElement.dataset.enclosingSubtopic = token.enclosingSubtopic;
  linkElement.dataset.text = token.text;

  let styleElements = renderStyledText(token.text);
  appendElementsToParent(styleElements, linkElement);

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

  let linkElement = createGlobalLinkElement(token, pathArray);

  globalLinkSubtreeCallback(token, linkElement);

  return linkElement;
}

function createGlobalLinkElement(token) {
  let linkElement = document.createElement('a');
  let styleElements = renderStyledText(token.text);
  appendElementsToParent(styleElements, linkElement);

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

  let linkElement = createImportLinkElement(token, pathArray);

  return linkElement;
}

function createImportLinkElement(token) {
  let linkElement = document.createElement('a');

  let styleElements = renderStyledText(token.text);
  appendElementsToParent(styleElements, linkElement);

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
  linkSpan.appendChild(linkElement);
  linkElement.innerHTML += externalLinkIconSvg.replace(/\r?\n|\r/g, '');

  return linkSpan;
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

function renderCodeBlock(token) {
  let preElement = document.createElement('PRE');
  let codeBlockElement = document.createElement('CODE');
  preElement.appendChild(codeBlockElement);

  codeBlockElement.innerText = token.text;

  return preElement;
}

function renderBlockQuote(token) {
  let blockQuoteElement = document.createElement('BLOCKQUOTE');

  blockQuoteElement.innerText = token.text;

  return blockQuoteElement;
}

function renderList(listNodeObjects) {
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
        let tokenElement = renderTokenElement(token);
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

function renderFootnoteRule() {
  let horizonalRule = document.createElement('HR');
  horizonalRule.classList.add('canopy-footnote-rule');
  return horizonalRule;
}

function renderFootnoteLine(footnoteLineToken, renderContext) {
  let footnoteSpan = document.createElement('SPAN');
  footnoteSpan.classList.add('canopy-footnote-span');
  let textNode = document.createTextNode(footnoteLineToken.superscript + '. ');
  footnoteSpan.appendChild(textNode);
  footnoteLineToken.tokens.forEach((token) => {
    let tokenElement = renderTokenElement(token, renderContext);
    footnoteSpan.appendChild(tokenElement);
  });

  return footnoteSpan;
}

export default renderTokenElement;
