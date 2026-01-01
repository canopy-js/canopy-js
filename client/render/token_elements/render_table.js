import { getCombinedBoundingRect } from 'render/helpers';

function renderTable(token, renderContext, renderTokenElements) {
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
                  renderContext.preDisplayCallbacks.push(() => { // need to wait for .parentNode to exist
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
      );
      tableElement.appendChild(tableRowElement);

      // collapse fully hidden rows and columns via CSS classes
      [...tableElement.rows]
        .filter(r => [...r.cells].every(c => c.classList.contains('hidden')))
        .forEach(r => r.classList.add('canopy-hidden-row'));

      [...Array(Math.max(...[...tableElement.rows].map(r => r.cells.length)))]
        .map((_, i) => [...tableElement.rows].map(r => r.cells[i]).filter(Boolean))
        .filter(col => col.every(c => c.classList.contains('hidden')))
        .flat()
        .forEach(td => td.classList.add('canopy-hidden-col'));
    }
  );

  // How strict snapping is for width
  const WIDTH_BASE_SIMILARITY_PERCENT = 15;   // baseline strictness
  const WIDTH_SIZE_SENSITIVITY = 2500;        // more tolerance for small widths
  // Extra tolerance for very small cells so they're more likely to snap
  // while keeping the old (target-based) distribution for larger cells.
  const WIDTH_SMALL_CELL_SENSITIVITY = 230;

  // How strict snapping is for row height -- currently disabled
  // const HEIGHT_BASE_SIMILARITY_PERCENT = 15;  // baseline strictness
  // const HEIGHT_SIZE_SENSITIVITY = 2500;       // more tolerance for small heights

  function isBoldOnlyCell(td) {
    return td.children.length === 1 && td.firstElementChild?.tagName === 'B';
  }

  function isRowHeaderCell(td) {
    const parentRow = td.parentElement;
    if (!parentRow) return false;
    const firstCell = parentRow.querySelector('td, th');
    return firstCell === td && isBoldOnlyCell(td);
  }

  function isColumnHeaderCell(td, tableElement) {
    const parentRow = td.parentElement;
    if (!parentRow) return false;
    const firstRow = tableElement.querySelector('tr');
    return firstRow === parentRow && isBoldOnlyCell(td);
  }

  function shouldSnapSize({
    currentSize,
    targetSize,
    baseSimilarityPercent,
    sizeSensitivity,
    smallCellSensitivity = 0
  }) {
    if (!isFinite(targetSize) || targetSize <= 0) return null;
    if (!isFinite(currentSize) || currentSize <= 0) return null;

    // Percent difference relative to the target
    const differencePercent =
      Math.abs(targetSize - currentSize) / targetSize * 100;

    // Small targets get more tolerance; large targets get stricter.
    // Very small current sizes get extra tolerance so small cells are more likely to snap.
    const allowedPercent =
      baseSimilarityPercent +
      sizeSensitivity / targetSize +
      smallCellSensitivity / currentSize;

    return {
      differencePercent,
      allowedPercent,
      willSnap: differencePercent <= allowedPercent
    };
  }

  renderContext.preDisplayCallbacks.push(() => {
    let sizes = {
      minContentWidth: Infinity,       // per-column "unit" width
      maxContentWidth: -1,             // per-column "unit" width
      minContentHeight: Infinity,  // optional: debug only
      maxContentHeight: -1,        // optional: debug only
      maxTdBoxWidth: -1,           // per-column "unit" width
      minRowHeight: Infinity,
      maxRowHeight: -1
    };

    // first pass: per-column "unit" widths + max per-unit box width
    [...tableElement.querySelectorAll('td')].forEach(td => {
      if (td.childNodes.length === 0) return;

      const isRowHeader = isRowHeaderCell(td);
      const isColumnHeader = isColumnHeaderCell(td, tableElement);
      const excludeFromBaseline = isRowHeader || isColumnHeader;

      const colspanAttribute = td.getAttribute('colspan');
      const colspan = Number.parseInt(colspanAttribute || '1', 10);
      const columnSpan = Number.isFinite(colspan) && colspan > 0 ? colspan : 1;
      const rowspan = td.getAttribute('rowspan');

      const contentRect = getCombinedBoundingRect([...td.childNodes]);
      const contentWidth = contentRect.width;
      const contentHeight = contentRect.height;
      const unitContentWidth = contentWidth / columnSpan;

      // Width range: use per-column unit width so colspan cells can participate
      if (!excludeFromBaseline && isFinite(unitContentWidth) && unitContentWidth > 0) {
        if (unitContentWidth < sizes.minContentWidth) {
          sizes.minContentWidth = unitContentWidth;
        }
        if (unitContentWidth > sizes.maxContentWidth) {
          sizes.maxContentWidth = unitContentWidth;
        }
      }

      // Height range (optional, for debug): only non-rowspan cells and (optionally) non-headers
      if (!rowspan && !excludeFromBaseline && isFinite(contentHeight) && contentHeight > 0) {
        if (contentHeight < sizes.minContentHeight) {
          sizes.minContentHeight = contentHeight;
        }
        if (contentHeight > sizes.maxContentHeight) {
          sizes.maxContentHeight = contentHeight;
        }
      }

      // max per-unit box width: consider all tds, normalized by colspan
      const boxRect = td.getBoundingClientRect();
      const boxWidth = boxRect.width;
      const unitBoxWidth = boxWidth / columnSpan;

      if (isFinite(unitBoxWidth) && unitBoxWidth > sizes.maxTdBoxWidth) {
        sizes.maxTdBoxWidth = unitBoxWidth;
      }
    });

    // measure row heights after table is in the DOM
    [...tableElement.querySelectorAll('tr')].forEach(row => {
      const cells = row.querySelectorAll('td');
      if (!cells.length) return;

      const isHeaderRow = [...cells].every(td =>
        isRowHeaderCell(td) || isColumnHeaderCell(td, tableElement)
      );
      if (isHeaderRow) return;

      const rect = row.getBoundingClientRect();
      const height = rect.height;

      if (isFinite(height) && height > 0) {
        if (height < sizes.minRowHeight) sizes.minRowHeight = height;
        if (height > sizes.maxRowHeight) sizes.maxRowHeight = height;
      }
    });

    // Width normalization (per cell)
    [...tableElement.querySelectorAll('td')].forEach(cell => {
      if (cell.childNodes.length === 0) return;

      const contentRectangle = getCombinedBoundingRect([...cell.childNodes]);
      const currentContentWidth = contentRectangle.width;
      const colspanAttribute = cell.getAttribute('colspan');
      const colspan = Number.parseInt(colspanAttribute || '1', 10);
      const columnSpan = Number.isFinite(colspan) && colspan > 0 ? colspan : 1;
      const currentUnitContentWidth = currentContentWidth / columnSpan;

      const snapResult = shouldSnapSize({
        currentSize: currentUnitContentWidth,
        targetSize: sizes.maxContentWidth,
        baseSimilarityPercent: WIDTH_BASE_SIMILARITY_PERCENT,
        sizeSensitivity: WIDTH_SIZE_SENSITIVITY,
        smallCellSensitivity: WIDTH_SMALL_CELL_SENSITIVITY
      });

      if (!snapResult) return;

      const {
        differencePercent,
        allowedPercent,
        willSnap
      } = snapResult;

      cell.dataset.currentContentWidth = currentContentWidth;
      cell.dataset.currentUnitContentWidth = currentUnitContentWidth;
      cell.dataset.colspan = String(columnSpan);
      cell.dataset.minContentWidth = sizes.minContentWidth;
      cell.dataset.maxContentWidth = sizes.maxContentWidth;
      cell.dataset.widthDiffPercent = differencePercent;
      cell.dataset.widthAllowedPercent = allowedPercent;
      cell.dataset.widthWillSnap = willSnap ? 'true' : 'false';

      if (willSnap && sizes.maxTdBoxWidth > 0) {
        cell.style.width = (sizes.maxTdBoxWidth * columnSpan) + 'px';
        cell.style.boxSizing = 'border-box';
      }
    });

    // Row height normalization (across rows) -- currently disabled
    // [...tableElement.querySelectorAll('tr')].forEach(row => {
    //   const cells = row.querySelectorAll('td');
    //   if (!cells.length) return;

    //   const rect = row.getBoundingClientRect();
    //   const currentRowHeight = rect.height;

    //   const snapResult = shouldSnapSize({
    //     currentSize: currentRowHeight,
    //     targetSize: sizes.maxRowHeight,
    //     baseSimilarityPercent: HEIGHT_BASE_SIMILARITY_PERCENT,
    //     sizeSensitivity: HEIGHT_SIZE_SENSITIVITY
    //   });

    //   if (!snapResult) return;

    //   const { differencePercent, allowedPercent, willSnap } = snapResult;

    //   row.dataset.currentRowHeight = currentRowHeight;
    //   row.dataset.minRowHeight = sizes.minRowHeight;
    //   row.dataset.maxRowHeight = sizes.maxRowHeight;
    //   row.dataset.rowHeightDiffPercent = differencePercent;
    //   row.dataset.rowHeightAllowedPercent = allowedPercent;
    //   row.dataset.rowHeightWillSnap = willSnap ? 'true' : 'false';

    //   if (!willSnap || sizes.maxRowHeight <= 0) return;

    //   cells.forEach(td => {
    //     td.style.height = sizes.maxRowHeight + 'px';
    //     td.style.boxSizing = 'border-box';
    //   });
    // });

    tableElement.dataset.minContentWidth = sizes.minContentWidth;
    tableElement.dataset.maxContentWidth = sizes.maxContentWidth;
    tableElement.dataset.minContentHeight = sizes.minContentHeight;
    tableElement.dataset.maxContentHeight = sizes.maxContentHeight;
    tableElement.dataset.maxTdBoxWidth = sizes.maxTdBoxWidth;
    tableElement.dataset.minRowHeight = sizes.minRowHeight;
    tableElement.dataset.maxRowHeight = sizes.maxRowHeight;
  });

  return [tableElement];
}

export default renderTable;
