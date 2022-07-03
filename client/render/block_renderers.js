import renderTokenElement from 'render/render_token_element';

let BlockRenderers = {
  'text': renderTextBlock,
  'code': renderCodeBlock,
  'quote': renderQuoteBlock,
  'list': renderListBlock,
  'table': renderTableBlock,
  'html': renderHtmlBlock,
  'footnote': renderFootnoteBlock
};

function renderTextBlock(blockObject, renderContext) {
  let lineSpans = [];

  blockObject.tokensByLine.forEach(
    (tokensOfLine, lineNumber) => {
      let lineSpan = document.createElement('SPAN');
      lineSpan.classList.add('canopy-text-span');
      lineSpans.push(lineSpan);

      tokensOfLine.forEach(
        (token) => {
          let tokenElement = renderTokenElement(token, renderContext);
          lineSpan.appendChild(tokenElement);
        }
      )
    }
  );

  return lineSpans;
}

function renderCodeBlock(blockObject, renderContext) {
  let preElement = document.createElement('PRE');
  let codeBlockElement = document.createElement('CODE');
  preElement.appendChild(codeBlockElement);

  blockObject.lines.forEach(
    (lineText, lineNumber) => {
      lineNumber > 0 && codeBlockElement.appendChild(document.createElement('BR'));
      let lineTextNode = document.createTextNode(lineText);
      codeBlockElement.appendChild(lineTextNode);
    }
  );

  return [preElement];
}

function renderQuoteBlock(blockObject, renderContext) {
  let blockQuoteElement = document.createElement('BLOCKQUOTE');

  blockObject.tokensByLine.forEach(
    (tokensOfLine, lineNumber) => {
      lineNumber > 0 && blockQuoteElement.appendChild(
        document.createElement('br')
      );

      tokensOfLine.forEach(
        (token) => {
          let tokenElement = renderTokenElement(token, renderContext);
          blockQuoteElement.appendChild(tokenElement);
        }
      );
    }
  );

  return [blockQuoteElement];
}

function renderListBlock(blockObject, renderContext) {
  return renderListNodes(blockObject.topLevelNodes);

  function renderListNodes(listNodeObjects) {
    let listElement = blockObject.topLevelNodes[0].ordered ?
      document.createElement('OL') :
      document.createElement('UL');

    listElement.setAttribute('type', listNodeObjects[0].ordinal);

    listNodeObjects.forEach((listNodeObject) => {
      let listItemElement = document.createElement('LI');

      let tokenElementsOfLine = listNodeObject.tokensOfLine.forEach(
        (token) => {
          let tokenElement = renderTokenElement(token, renderContext);
          listItemElement.appendChild(tokenElement);
        }
      );

      if (listNodeObject.children.length > 0) {
        let childList = renderListNodes(listNodeObject.children);
        listItemElement.appendChild(childList);
      }

      listElement.appendChild(listItemElement);
    });
    return listElement;
  }
}

function renderTableBlock(blockObject, renderContext) {
  let tableElement = document.createElement('TABLE');
  blockObject.tokensByCellByRow.forEach(
    (tokensByCellOfRow, rowIndex) => {
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
  return [tableElement];
}

function renderHtmlBlock(blockObject, renderContext) {
  let html = blockObject.tokensByLine.map((tokensOfLine, lineNumber) => {
    return tokensOfLine.map((token) => token.html)
  }).join('');

  let htmlContainer = document.createElement('DIV');
  htmlContainer.innerHTML = html;

  return [htmlContainer];
}

function renderFootnoteBlock(blockObject, renderContext) {
  let horizonalRule = document.createElement('HR');
  horizonalRule.classList.add('footnote-rule');

  let footnoteSpans = Array.prototype.concat.apply([], blockObject.footnoteObjects.map(
    (footnoteObject, index) => {
      let footnoteSpan = document.createElement('SPAN');
      footnoteSpan.classList.add('footnote-span');
      let textNode = document.createTextNode(footnoteObject.superscript + '. ');
      footnoteSpan.appendChild(textNode);
      footnoteObject.tokens.forEach((token) => {
        let tokenElement = renderTokenElement(token, renderContext);
        footnoteSpan.appendChild(tokenElement);
      });
      let result = [];
      index > 0 && result.push(document.createElement('BR'));
      result.push(footnoteSpan);
      return result;
    }
  ));

  return [horizonalRule].concat(footnoteSpans);
}

export default BlockRenderers;
