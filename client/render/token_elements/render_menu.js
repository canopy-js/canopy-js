import { getCombinedBoundingRect } from 'render/helpers';
function renderMenu(token, renderContext, renderTokenElements) {
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
      const getOnlyLink = el => el.tagName === 'A' ? el : el.children.length === 1 ? getOnlyLink(el.children[0]) : null;

      if (cellObject.tokens.length === 1 && isOrHasOnlyLink(tokenElement)) {
        menuCellElement.classList.add('canopy-menu-link-cell');
        menuCellElement.classList.add('canopy-bounding-box-container');
        menuCellElement.addEventListener('click', getOnlyLink(tokenElement)._CanopyClickHandler);
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

  function createNewRow() {
    let newRow = document.createElement('DIV');
    newRow.classList.add('canopy-menu-row');
    if (token.rtl) newRow.dir = 'rtl';
    menuElement.appendChild(newRow);
    return newRow;
  }

  // Provisional row so links exist in DOM; final rows built in preDisplay.
  const provisionalRow = createNewRow();
  cellElements.forEach(cell => provisionalRow.appendChild(cell));

  const preDisplayMenuLayout = () => {
    const visibleCells = cellElements
      .filter(cell => !cell.style.opacity)
      .map(menuCellElement => ({
        menuCellElement,
        contentContainer: menuCellElement.querySelector('.canopy-menu-content-container')
      }));

    while (true) {
      if (tableListSizeIndex === SizesByArea.indexOf('half-pill') && token.items.length > 2) {
        tableListSizeIndex = SizesByArea.indexOf('quarter-card'); // Quarters look better than halves
      }

      const sizeClass = `canopy-${SizesByArea[tableListSizeIndex]}`;
      menuElement.classList.add(sizeClass);

      let overflowFound = false;
      const overflowTolerance = 1;
      for (const { menuCellElement, contentContainer } of visibleCells) {
        const contentBoundingRect = getCombinedBoundingRect([contentContainer]);
        const containerStyles = window.getComputedStyle(menuCellElement);
        const containerRect = menuCellElement.getBoundingClientRect();
        const horizontalScale = menuCellElement.offsetWidth ? containerRect.width / menuCellElement.offsetWidth : 1;
        const verticalScale = menuCellElement.offsetHeight ? containerRect.height / menuCellElement.offsetHeight : 1;
        const containerPaddingLeft = parseFloat(containerStyles.paddingLeft) * horizontalScale;
        const containerPaddingRight = parseFloat(containerStyles.paddingRight) * horizontalScale;
        const containerPaddingTop = parseFloat(containerStyles.paddingTop) * verticalScale;
        const containerPaddingBottom = parseFloat(containerStyles.paddingBottom) * verticalScale;

        const adjustedContainerRect = {
          top: containerRect.top + containerPaddingTop,
          left: containerRect.left + containerPaddingLeft,
          bottom: containerRect.bottom - containerPaddingBottom,
          right: containerRect.right - containerPaddingRight
        };

        const isOverflowingHorizontally = contentBoundingRect.left < adjustedContainerRect.left - overflowTolerance || contentBoundingRect.right > adjustedContainerRect.right + overflowTolerance;
        const isOverflowingVertically = contentBoundingRect.top < adjustedContainerRect.top - overflowTolerance || contentBoundingRect.bottom > adjustedContainerRect.bottom + overflowTolerance;

        if (!isOverflowingHorizontally && !isOverflowingVertically) continue;

        overflowFound = true;
        break;
      }

      if (!overflowFound || tableListSizeIndex >= SizesByArea.length - 1) break;

      menuElement.classList.remove(sizeClass);
      tableListSizeIndex++;
    }

    // Rebuild rows using final size
    const removeRows = [...menuElement.querySelectorAll('.canopy-menu-row')];
    removeRows.forEach(r => r.remove());

    let rowSize;
    if (SizesByArea[tableListSizeIndex].includes('half')) rowSize = 2;
    if (SizesByArea[tableListSizeIndex].includes('third')) rowSize = 3;
    if (SizesByArea[tableListSizeIndex].includes('quarter')) rowSize = 4;
    if (SizesByArea[tableListSizeIndex].includes('eigth')) rowSize = 8;

    let tableRowElement = createNewRow();
    for (let i = 0; i < cellElements.length; i++) {
      tableRowElement.appendChild(cellElements[i]);
      if ((i + 1) % rowSize === 0 && (i + 1) !== cellElements.length) {
        tableRowElement = createNewRow();
      }
    }

    if (menuElement.childNodes.length > 1) {
      const remainingCells = cellElements.length % rowSize;
      const cellsToAdd = remainingCells > 0 ? rowSize - remainingCells : 0;
      for (let i = 0; i < cellsToAdd; i++) {
        let paddingElement = document.createElement('DIV');
        paddingElement.classList.add('canopy-menu-cell');
        paddingElement.style.opacity = '0';
        tableRowElement.appendChild(paddingElement);
      }
    }

    [...tableRowElement.childNodes]
      .filter(element => element.classList.contains('canopy-menu-cell-right-aligned'))?.[0]
      ?.classList.add('canopy-menu-cell-first-right');

    [...tableRowElement.childNodes]
      .filter(element => element.classList.contains('canopy-menu-cell-left-aligned')).slice(-1)?.[0]
      ?.classList.add('canopy-menu-cell-last-left');

    menuElement.classList.add(`canopy-${SizesByArea[tableListSizeIndex]}`);
  };
  renderContext.preDisplayCallbacks.push(preDisplayMenuLayout);

  return [menuElement];
}

export default renderMenu;
