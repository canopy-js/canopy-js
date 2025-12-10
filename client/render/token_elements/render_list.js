function renderList(listNodeObjects, renderContext, renderTokenElements) {
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
      let [childList] = renderList(listNodeObject.children, renderContext, renderTokenElements);
      listItemElement.appendChild(childList);
    }

    listElement.appendChild(listItemElement);
  });
  return [listElement];
}

export default renderList;
