import { getCombinedBoundingRect } from 'render/helpers';

// How strict snapping is for width
const WIDTH_BASE_SIMILARITY_PERCENT = 20;   // baseline strictness
const WIDTH_SIZE_SENSITIVITY = 3700;        // more tolerance for small table max widths

// Select one mode by changing this value.
// strict_all_columns:
// Approach: assign computed widths to every column and lock total table width to that sum.
// Pros: most deterministic column geometry; easiest to compare snapping output.
// Cons: can exceed container width and cause overflow/horizontal squeeze in tight layouts.
//
// scale_data_columns_to_container:
// Approach: keep non-target columns (like row headers) at their width, and scale snap-target/data columns down to fit container.
// Pros: avoids crushing header columns and keeps table within available width.
// Cons: data columns become proportionally scaled, so absolute snapped widths are not preserved.
const TABLE_FIXED_WIDTH_MODE = 'scale_data_columns_to_container';

// How strict snapping is for row height -- currently disabled
// const HEIGHT_BASE_SIMILARITY_PERCENT = 15;  // baseline strictness
// const HEIGHT_SIZE_SENSITIVITY = 2500;       // more tolerance for small heights

function renderTable(token, renderContext, renderTokenElements) {
  const tableElement = buildTableDOM(token, renderContext, renderTokenElements);
  applyHiddenRowColClasses(tableElement);

  renderContext.preDisplayCallbacks.push(() => {
    clearCellWidths(tableElement);
    removeColgroup(tableElement);
    setTableLayoutForMeasure(tableElement);
    const measurements = measureTable(tableElement);
    const snapPlan = computeSnapPlan(measurements);
    applyColumnGroupWidths(tableElement, measurements, snapPlan);
    setTableLayoutForFixed(tableElement);
    writeSnapDebug(tableElement, measurements, snapPlan);
    writeTableDebug(tableElement, measurements);
  });

  return [tableElement];
}

function buildTableDOM(token, renderContext, renderTokenElements) {
  const tableElement = document.createElement('TABLE');
  tableElement.setAttribute('dir', 'auto');
  if (token.rtl) tableElement.setAttribute('dir', 'rtl');

  token.rows.forEach(row => {
    const tableRowElement = document.createElement('TR');
    if (token.rtl) tableRowElement.setAttribute('dir', 'rtl');

    row.forEach(cellObject => {
      const tableCellElement = document.createElement('TD');
      if (cellObject.hidden) tableCellElement.classList.add('hidden');
      if (cellObject.colspan) tableCellElement.setAttribute('colspan', cellObject.colspan);
      if (cellObject.rowspan) tableCellElement.setAttribute('rowspan', cellObject.rowspan);

      cellObject.tokens.forEach(token => {
        const tokenElements = renderTokenElements(token, renderContext);

        tokenElements.forEach(tokenElement => {
          const isOrHasOnlyLink = (el) =>
            el.tagName === 'A' || (el.children.length === 1 && isOrHasOnlyLink(el.children[0]));
          if (cellObject.tokens.length === 1 && isOrHasOnlyLink(tokenElement)) {
            tableCellElement.classList.add('canopy-table-link-cell');
            tableCellElement.classList.add('canopy-bounding-box-container'); // rect to consider for arrow key comparisons
            const preDisplayTableCellLinkWiring = () => { // need to wait for .parentNode to exist
              const linkElement = tokenElement.parentNode.querySelector('a');
              linkElement.classList.add('canopy-table-link');
              linkElement.removeEventListener('click', linkElement._CanopyClickHandler);
              tableCellElement.addEventListener('click', linkElement._CanopyClickHandler);
            };
            renderContext.preDisplayCallbacks.push(preDisplayTableCellLinkWiring);
          }

          tableCellElement.appendChild(tokenElement);
        });
      });

      if (!cellObject.merge) {
        tableRowElement.appendChild(tableCellElement);
      }
    });

    tableElement.appendChild(tableRowElement);
  });

  return tableElement;
}

function applyHiddenRowColClasses(tableElement) {
  // collapse fully hidden rows and columns via CSS classes
  [...tableElement.rows]
    .filter(row => [...row.cells].every(cell => cell.classList.contains('hidden')))
    .forEach(row => row.classList.add('canopy-hidden-row'));

  const columnCount = Math.max(...[...tableElement.rows].map(row => row.cells.length));
  [...Array(columnCount)]
    .map((_, i) => [...tableElement.rows].map(row => row.cells[i]).filter(Boolean))
    .filter(col => col.every(cell => cell.classList.contains('hidden')))
    .flat()
    .forEach(cell => cell.classList.add('canopy-hidden-col'));
}

function clearCellWidths(tableElement) {
  [...tableElement.rows].forEach(row => {
    [...row.cells].forEach(cell => {
      cell.style.width = '';
      cell.style.boxSizing = '';
    });
  });
}

function removeColgroup(tableElement) {
  const existing = tableElement.querySelector('colgroup');
  if (existing) existing.remove();
}

function ensureColgroup(tableElement, columnCount) {
  let colgroup = tableElement.querySelector('colgroup');
  if (!colgroup) {
    colgroup = document.createElement('COLGROUP');
    tableElement.insertBefore(colgroup, tableElement.firstChild);
  }

  while (colgroup.children.length < columnCount) {
    colgroup.appendChild(document.createElement('COL'));
  }
  while (colgroup.children.length > columnCount) {
    colgroup.removeChild(colgroup.lastChild);
  }

  return colgroup;
}

function setTableLayoutForMeasure(tableElement) {
  tableElement.style.tableLayout = 'auto';
  tableElement.style.width = 'auto';
  tableElement.style.minWidth = '0';
  tableElement.style.maxWidth = 'none';
}

function setTableLayoutForFixed(tableElement) {
  tableElement.style.tableLayout = 'fixed';
  tableElement.style.minWidth = '0';
  tableElement.style.maxWidth = 'none';
}

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

function getChildElements(element) {
  return Array.from(element.children || []);
}

function getRangeBoundingRect(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const rect = range.getBoundingClientRect();
  if (rect && isFinite(rect.width) && rect.width > 0 && isFinite(rect.height) && rect.height > 0) {
    return rect;
  }
  return null;
}

function measureCellContent(cell, { useChildNodes = false } = {}) {
  const nodes = useChildNodes ? [...cell.childNodes] : getChildElements(cell);
  const contentRect = getCombinedBoundingRect(nodes);
  const rangeRect = getRangeBoundingRect(cell);
  const contentWidth = contentRect.width;
  const contentHeight = contentRect.height;
  const measuredContentWidth = isFinite(contentWidth) && contentWidth > 0
    ? contentWidth
    : (rangeRect ? rangeRect.width : contentWidth);
  const measuredContentHeight = isFinite(contentHeight) && contentHeight > 0
    ? contentHeight
    : (rangeRect ? rangeRect.height : contentHeight);
  return {
    contentRect,
    rangeRect,
    contentWidth,
    contentHeight,
    measuredContentWidth,
    measuredContentHeight
  };
}

function measureCellBox(cell) {
  const boxRect = cell.getBoundingClientRect();
  return {
    boxRect,
    boxWidth: boxRect.width,
    boxHeight: boxRect.height
  };
}

function getCellSpan(cell) {
  const colspanAttribute = cell.getAttribute('colspan');
  const colspan = Number.parseInt(colspanAttribute || '1', 10);
  const columnSpan = Number.isFinite(colspan) && colspan > 0 ? colspan : 1;
  const rowspan = cell.getAttribute('rowspan');
  return { columnSpan, rowspan };
}

function shouldSnapSize({
  currentSize,
  targetSize,
  baseSimilarityPercent,
  sizeSensitivity
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
    sizeSensitivity / targetSize;

  return {
    differencePercent,
    allowedPercent,
    willSnap: differencePercent <= allowedPercent
  };
}

function buildGreedyColumnTargets(columnSizes) {
  const columns = columnSizes
    .map((column, index) => ({ index, ...column }))
    .filter(column => isFinite(column.maxUnitContentWidth) && column.maxUnitContentWidth > 0)
    .sort((a, b) => b.maxUnitContentWidth - a.maxUnitContentWidth);

  const assignments = new Array(columnSizes.length).fill(null);

  for (const anchor of columns) {
    if (assignments[anchor.index]) continue;
    const anchorTarget = {
      unitContentWidth: anchor.maxUnitContentWidth,
      unitBoxWidth: anchor.maxUnitBoxWidth
    };
    const anchorSnapResult = shouldSnapSize({
      currentSize: anchor.maxUnitContentWidth,
      targetSize: anchorTarget.unitContentWidth,
      baseSimilarityPercent: WIDTH_BASE_SIMILARITY_PERCENT,
      sizeSensitivity: WIDTH_SIZE_SENSITIVITY
    });
    const anchorCandidates = [];
    assignments[anchor.index] = {
      target: anchorTarget,
      anchorIndex: anchor.index,
      snapResult: anchorSnapResult,
      anchorSource: 'self',
      anchorCandidates
    };

    for (const candidate of columns) {
      if (assignments[candidate.index]) continue;
      const snapResult = shouldSnapSize({
        currentSize: candidate.maxUnitContentWidth,
        targetSize: anchorTarget.unitContentWidth,
        baseSimilarityPercent: WIDTH_BASE_SIMILARITY_PERCENT,
        sizeSensitivity: WIDTH_SIZE_SENSITIVITY
      });
      anchorCandidates.push({
        index: candidate.index,
        currentSize: candidate.maxUnitContentWidth,
        differencePercent: snapResult?.differencePercent,
        allowedPercent: snapResult?.allowedPercent,
        willSnap: snapResult?.willSnap
      });
      if (snapResult?.willSnap) {
        assignments[candidate.index] = {
          target: anchorTarget,
          anchorIndex: anchor.index,
          snapResult,
          anchorSource: 'snapped_to_anchor',
          anchorCandidates
        };
      }
    }
  }

  return assignments;
}

function measureTable(tableElement) {
  const rows = [...tableElement.rows];
  const columnCount = Math.max(...rows.map(row => row.cells.length));
  const columnSizes = Array.from({ length: columnCount }, () => ({
    maxUnitContentWidth: 0,
    maxUnitBoxWidth: 0
  }));
  const sizes = {
    minContentWidth: Infinity,       // per-column "unit" width
    maxContentWidth: -1,             // per-column "unit" width
    minContentHeight: Infinity,  // optional: debug only
    maxContentHeight: -1,        // optional: debug only
    maxTdBoxWidth: -1,           // per-column "unit" width
    minRowHeight: Infinity,
    maxRowHeight: -1
  };

  // Phase 1: Measure global min/max sizes so we can normalize later.
  [...tableElement.querySelectorAll('td')].forEach(cell => {
    if (cell.childNodes.length === 0) return;

    const isRowHeader = isRowHeaderCell(cell);
    const isColumnHeader = isColumnHeaderCell(cell, tableElement);
    const excludeFromBaseline = isRowHeader || isColumnHeader;
    const { columnSpan, rowspan } = getCellSpan(cell);
    const { measuredContentWidth, measuredContentHeight, contentWidth, contentHeight } = measureCellContent(cell, { useChildNodes: true });
    const { boxWidth } = measureCellBox(cell);

    const unitContentWidth = contentWidth / columnSpan;
    const measuredUnitContentWidth = measuredContentWidth / columnSpan;
    if (!excludeFromBaseline && isFinite(measuredUnitContentWidth) && measuredUnitContentWidth > 0) {
      if (unitContentWidth < sizes.minContentWidth) sizes.minContentWidth = measuredUnitContentWidth;
      if (unitContentWidth > sizes.maxContentWidth) sizes.maxContentWidth = measuredUnitContentWidth;
    }

    if (!rowspan && !excludeFromBaseline && isFinite(measuredContentHeight) && measuredContentHeight > 0) {
      if (contentHeight < sizes.minContentHeight) sizes.minContentHeight = measuredContentHeight;
      if (contentHeight > sizes.maxContentHeight) sizes.maxContentHeight = measuredContentHeight;
    }

    const unitBoxWidth = boxWidth / columnSpan;
    if (isFinite(unitBoxWidth) && unitBoxWidth > sizes.maxTdBoxWidth) {
      sizes.maxTdBoxWidth = unitBoxWidth;
    }
  });

  // Phase 2: Measure per-column max sizes so snapping has targets.
  rows.forEach(row => {
    let colIndex = 0;
    [...row.cells].forEach(cell => {
      const { columnSpan } = getCellSpan(cell);
      const isRowHeader = isRowHeaderCell(cell);
      const isColumnHeader = isColumnHeaderCell(cell, tableElement);
      const excludeFromBaseline = isRowHeader || isColumnHeader;
      const childElements = getChildElements(cell);
      const hasChildNodes = childElements.length > 0;

      if (excludeFromBaseline) {
        cell.dataset.columnSizeSkipReason = isRowHeader ? 'row_header' : 'column_header';
      } else if (!hasChildNodes) {
        cell.dataset.columnSizeSkipReason = 'no_children';
      }

      if (!excludeFromBaseline && hasChildNodes) {
        const { measuredContentWidth } = measureCellContent(cell);
        const { boxWidth } = measureCellBox(cell);
        const unitContentWidth = isFinite(measuredContentWidth) && measuredContentWidth > 0
          ? (measuredContentWidth / columnSpan)
          : NaN;
        const unitBoxWidth = boxWidth / columnSpan;
        const fallbackUnitContentWidth = isFinite(unitContentWidth) && unitContentWidth > 0 ? unitContentWidth : unitBoxWidth;

        if (isFinite(fallbackUnitContentWidth) && fallbackUnitContentWidth > 0 && isFinite(unitBoxWidth) && unitBoxWidth > 0) {
          for (let i = 0; i < columnSpan; i++) {
            const column = columnSizes[colIndex + i];
            if (!column) continue;
            if (fallbackUnitContentWidth > column.maxUnitContentWidth) column.maxUnitContentWidth = fallbackUnitContentWidth;
            if (unitBoxWidth > column.maxUnitBoxWidth) column.maxUnitBoxWidth = unitBoxWidth;
          }
        } else {
          cell.dataset.columnSizeSkipReason = 'invalid_sizes';
          cell.dataset.columnSizeUnitContentWidth = String(unitContentWidth);
          cell.dataset.columnSizeUnitBoxWidth = String(unitBoxWidth);
        }
      }
      colIndex += columnSpan;
    });
  });

  // Phase 3: Measure row heights so we can debug vertical variance.
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

  return { rows, columnSizes, sizes };
}

function computeSnapPlan({ columnSizes }) {
  const snapTargets = columnSizes
    .filter(column => isFinite(column.maxUnitContentWidth) && column.maxUnitContentWidth > 0)
    .map(column => ({
      unitContentWidth: column.maxUnitContentWidth,
      unitBoxWidth: column.maxUnitBoxWidth
    }))
    .sort((a, b) => b.unitContentWidth - a.unitContentWidth);

  const columnTargets = buildGreedyColumnTargets(columnSizes);

  const columnDebugAttempts = columnSizes.map(column => {
    if (!isFinite(column.maxUnitContentWidth) || column.maxUnitContentWidth <= 0) return [];
    return snapTargets.map((target, targetIndex) => {
      const snapResult = shouldSnapSize({
        currentSize: column.maxUnitContentWidth,
        targetSize: target.unitContentWidth,
        baseSimilarityPercent: WIDTH_BASE_SIMILARITY_PERCENT,
        sizeSensitivity: WIDTH_SIZE_SENSITIVITY
      });
      return {
        targetIndex,
        targetUnitContentWidth: target.unitContentWidth,
        targetUnitBoxWidth: target.unitBoxWidth,
        differencePercent: snapResult?.differencePercent,
        allowedPercent: snapResult?.allowedPercent,
        willSnap: snapResult?.willSnap
      };
    });
  });

  const columnSnapResults = columnSizes.map((column, index) => {
    if (!isFinite(column.maxUnitContentWidth) || column.maxUnitContentWidth <= 0) return null;
    const snapTarget = columnTargets[index];
    if (!snapTarget) return null;
    const snapResult = shouldSnapSize({
      currentSize: column.maxUnitContentWidth,
      targetSize: snapTarget.target.unitContentWidth,
      baseSimilarityPercent: WIDTH_BASE_SIMILARITY_PERCENT,
      sizeSensitivity: WIDTH_SIZE_SENSITIVITY
    });
    if (!snapResult) return null;
    return { snapTarget, snapResult };
  });

  return {
    snapTargets,
    columnTargets,
    columnDebugAttempts,
    columnSnapResults
  };
}

function getObservedColumnBoxWidths(tableElement, columnCount) {
  const observedWidths = new Array(columnCount).fill(0);

  [...tableElement.rows].forEach(row => {
    let colIndex = 0;
    [...row.cells].forEach(cell => {
      const { columnSpan } = getCellSpan(cell);
      const unitBoxWidth = cell.getBoundingClientRect().width / columnSpan;
      if (isFinite(unitBoxWidth) && unitBoxWidth > 0) {
        for (let i = 0; i < columnSpan; i++) {
          if (unitBoxWidth > observedWidths[colIndex + i]) observedWidths[colIndex + i] = unitBoxWidth;
        }
      }
      colIndex += columnSpan;
    });
  });

  return observedWidths;
}

function applyColumnGroupWidths(tableElement, { columnSizes }, snapPlan) {
  const { columnSnapResults } = snapPlan;
  const colgroup = ensureColgroup(tableElement, columnSizes.length);
  const observedWidths = getObservedColumnBoxWidths(tableElement, columnSizes.length);

  let widths = columnSizes.map((column, index) => {
    const snapResult = columnSnapResults[index];
    const snappedWidth = snapResult?.snapResult?.willSnap
      ? snapResult?.snapTarget?.target?.unitBoxWidth
      : null;
    const fallbackWidth = column?.maxUnitBoxWidth;
    const observedWidth = observedWidths[index];
    const width = isFinite(snappedWidth) && snappedWidth > 0
      ? snappedWidth
      : ((isFinite(fallbackWidth) && fallbackWidth > 0)
        ? fallbackWidth
        : observedWidth);
    return isFinite(width) && width > 0 ? width : NaN;
  });

  const validWidths = widths.filter(width => isFinite(width) && width > 0);
  const averageWidth = validWidths.length
    ? validWidths.reduce((sum, width) => sum + width, 0) / validWidths.length
    : 120;

  widths = widths.map(width => (isFinite(width) && width > 0 ? width : averageWidth));

  let finalWidths = widths;

  if (TABLE_FIXED_WIDTH_MODE === 'strict_all_columns') {
    finalWidths = widths;
  } else if (TABLE_FIXED_WIDTH_MODE === 'scale_data_columns_to_container') {
    const containerWidth = tableElement.parentElement?.getBoundingClientRect?.().width;

    const scalableIndices = widths
      .map((_, index) => index)
      .filter(index => !!columnSnapResults[index]);
    const fixedIndices = widths
      .map((_, index) => index)
      .filter(index => !columnSnapResults[index]);

    const fixedTotalWidth = fixedIndices.reduce((sum, index) => sum + widths[index], 0);
    const scalableTotalWidth = scalableIndices.reduce((sum, index) => sum + widths[index], 0);

    let scale = 1;
    if (isFinite(containerWidth) && containerWidth > 0 && scalableIndices.length > 0) {
      const availableForScalable = Math.max(containerWidth - fixedTotalWidth, 0);
      if (scalableTotalWidth > 0 && scalableTotalWidth > availableForScalable) {
        scale = availableForScalable / scalableTotalWidth;
      }
    }

    finalWidths = widths.map((width, index) =>
      scalableIndices.includes(index) ? width * scale : width
    );
  }

  finalWidths.forEach((width, index) => {
    colgroup.children[index].style.width = width + 'px';
  });

  const totalWidth = finalWidths.reduce((sum, width) => sum + width, 0);
  tableElement.style.width = totalWidth + 'px';
}


function writeSnapDebug(tableElement, { rows, columnSizes, sizes }, snapPlan) {
  const { snapTargets, columnTargets, columnDebugAttempts, columnSnapResults } = snapPlan;

  rows.forEach(row => {
    let colIndex = 0;
    [...row.cells].forEach(cell => {
      const { columnSpan } = getCellSpan(cell);
      const columnStartIndex = colIndex;
      colIndex += columnSpan;

      if (cell.childNodes.length === 0) return;

      const childElements = getChildElements(cell);
      if (childElements.length === 0) return;

      const { contentWidth } = measureCellContent(cell);
      const rangeRect = getRangeBoundingRect(cell);
      const currentBoxWidth = cell.getBoundingClientRect().width;
      const fallbackContentWidth = currentBoxWidth;
      const currentContentWidth = isFinite(contentWidth) && contentWidth > 0
        ? contentWidth
        : (rangeRect ? rangeRect.width : fallbackContentWidth);
      const currentUnitContentWidth = currentContentWidth / columnSpan;

      const spanResults = columnSnapResults.slice(columnStartIndex, columnStartIndex + columnSpan);
      if (!spanResults.length || spanResults.some(result => !result)) {
        cell.dataset.columnSnapSkipReason = 'no_column_target';
        return;
      }

      const targetUnitContentWidth = spanResults.reduce((sum, result) => sum + result.snapTarget.target.unitContentWidth, 0);
      const targetUnitBoxWidth = spanResults.reduce((sum, result) => sum + (result.snapTarget.target.unitBoxWidth || 0), 0);
      const combinedDifferencePercent = spanResults.reduce((sum, result) => sum + result.snapResult.differencePercent, 0) / columnSpan;
      const combinedAllowedPercent = spanResults.reduce((sum, result) => sum + result.snapResult.allowedPercent, 0) / columnSpan;
      const willSnap = spanResults.every(result => result.snapResult.willSnap);

      writeCellDebug(cell, {
        currentContentWidth,
        currentUnitContentWidth,
        columnSpan,
        sizes,
        combinedDifferencePercent,
        combinedAllowedPercent,
        willSnap,
        columnStartIndex,
        columnSizes,
        columnDebugAttempts,
        targetUnitContentWidth,
        targetUnitBoxWidth,
        snapTargets,
        spanResults,
        columnTargets
      });

    });
  });
}

function writeCellDebug(cell, {
  currentContentWidth,
  currentUnitContentWidth,
  columnSpan,
  sizes,
  combinedDifferencePercent,
  combinedAllowedPercent,
  willSnap,
  columnStartIndex,
  columnSizes,
  columnDebugAttempts,
  targetUnitContentWidth,
  targetUnitBoxWidth,
  snapTargets,
  spanResults,
  columnTargets
}) {
  cell.dataset.currentContentWidth = currentContentWidth;
  cell.dataset.currentUnitContentWidth = currentUnitContentWidth;
  const naturalContentWidth = cell.scrollWidth;
  if (isFinite(naturalContentWidth) && naturalContentWidth > 0) {
    cell.dataset.naturalContentWidth = naturalContentWidth;
  }
  cell.dataset.colspan = String(columnSpan);
  cell.dataset.minContentWidth = sizes.minContentWidth;
  cell.dataset.maxContentWidth = sizes.maxContentWidth;
  cell.dataset.widthDiffPercent = combinedDifferencePercent;
  cell.dataset.widthAllowedPercent = combinedAllowedPercent;
  cell.dataset.widthWillSnap = willSnap ? 'true' : 'false';
  cell.dataset.columnIndex = String(columnStartIndex);
  cell.dataset.columnSpan = String(columnSpan);
  cell.dataset.columnMaxUnitBoxWidth = String(columnSizes[columnStartIndex]?.maxUnitBoxWidth || 0);
  cell.dataset.columnMaxUnitContentWidth = String(columnSizes[columnStartIndex]?.maxUnitContentWidth || 0);
  cell.dataset.columnSnapAttempts = JSON.stringify(columnDebugAttempts[columnStartIndex] || []);
  cell.dataset.snapTargetUnitContentWidth = targetUnitContentWidth;
  cell.dataset.snapTargetUnitBoxWidth = targetUnitBoxWidth;

  if (spanResults[0]) {
    const anchorWidth = spanResults[0].snapTarget.target?.unitContentWidth;
    const snapIndex = snapTargets.findIndex(t => t.unitContentWidth === anchorWidth);
    cell.dataset.snapTargetIndex = String(snapIndex);
  } else {
    cell.dataset.snapTargetIndex = String(-1);
  }
  cell.dataset.snapTargetCount = String(snapTargets.length);

  if (columnTargets[columnStartIndex]?.anchorIndex != null) {
    cell.dataset.columnSnapAnchorIndex = String(columnTargets[columnStartIndex].anchorIndex);
    cell.dataset.columnSnapAnchorWidth = String(columnTargets[columnStartIndex].target?.unitContentWidth || 0);
    if (columnTargets[columnStartIndex].snapResult) {
      cell.dataset.columnSnapAnchorDiffPercent = String(columnTargets[columnStartIndex].snapResult.differencePercent);
      cell.dataset.columnSnapAnchorAllowedPercent = String(columnTargets[columnStartIndex].snapResult.allowedPercent);
      cell.dataset.columnSnapAnchorWillSnap = columnTargets[columnStartIndex].snapResult.willSnap ? 'true' : 'false';
    }
    if (columnTargets[columnStartIndex].anchorSource) {
      cell.dataset.columnSnapAnchorSource = columnTargets[columnStartIndex].anchorSource;
    }
    if (columnTargets[columnStartIndex].anchorCandidates) {
      cell.dataset.columnSnapAnchorCandidates = JSON.stringify(columnTargets[columnStartIndex].anchorCandidates);
    }
  }
}

function writeTableDebug(tableElement, { sizes }) {
  tableElement.dataset.minContentWidth = sizes.minContentWidth;
  tableElement.dataset.maxContentWidth = sizes.maxContentWidth;
  tableElement.dataset.minContentHeight = sizes.minContentHeight;
  tableElement.dataset.maxContentHeight = sizes.maxContentHeight;
  tableElement.dataset.maxTdBoxWidth = sizes.maxTdBoxWidth;
  tableElement.dataset.minRowHeight = sizes.minRowHeight;
  tableElement.dataset.maxRowHeight = sizes.maxRowHeight;
}

export default renderTable;
