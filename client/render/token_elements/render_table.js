import { getCombinedBoundingRect } from 'render/helpers';
import { writeSnapDebug, writeTableDebug } from 'render/token_elements/render_table_debug';

// How strict snapping is for width
const WIDTH_BASE_SIMILARITY_PERCENT = 15;   // baseline strictness
const WIDTH_SIZE_SENSITIVITY = 3000;        // more tolerance for small table max widths

const OVERFLOW_HORIZONTAL_CELL_PADDING_PX = 15;
// Allow space to detect natural cell width before applying constraints.
const MEASURE_TABLE_WIDTH_PX = 1000;
const ABSOLUTE_COLUMN_WIDTH_CAP_PX = 350;
const RELAXED_ABSOLUTE_COLUMN_WIDTH_CAP_PX = 450;
const RELATIVE_COLUMN_WIDTH_CAP_DELTA_PX = 200;
const RELAXED_RELATIVE_COLUMN_WIDTH_CAP_DELTA_PX = 300;
const SPARE_WIDTH_RELAXATION_SHARE = 0.5;
const SHRINKABLE_COLUMN_MIN_WIDTH_PX = 100;
const ATOMIC_COLUMN_MIN_WIDTH_PX = 110;
const FLEXIBLE_COLUMN_TEXT_WEIGHT_FACTOR = 0.75;

// How strict snapping is for row height -- currently disabled
// const HEIGHT_BASE_SIMILARITY_PERCENT = 15;  // baseline strictness
// const HEIGHT_SIZE_SENSITIVITY = 2500;       // more tolerance for small heights

function renderTable(token, renderContext, renderTokenElements) {
  const tableElement = buildTableDOM(token, renderContext, renderTokenElements);
  assignVisualCellPositions(tableElement);
  applyHiddenRowColClasses(tableElement);

  renderContext.preDisplayCallbacks.push(() => {
    const { measurements, snapPlan, totalWidth, containerWidth } = layoutTable(tableElement);

    setTableLayoutForFixed(tableElement);
    writeSnapDebug(tableElement, measurements, snapPlan, {
      getCellMeta,
      isBoldOnlyCell,
      measureCellContent,
      getRangeBoundingRect
    });
    writeTableDebug(tableElement, measurements);
    if (isFinite(totalWidth) && totalWidth > 0) {
      tableElement.dataset.appliedTableWidth = String(totalWidth);
    }
    if (isFinite(containerWidth) && containerWidth > 0) {
      tableElement.dataset.containerWidth = String(containerWidth);
    }
    const { minPadding, maxPadding } = getAppliedHorizontalPaddingRange(tableElement);
    if (isFinite(minPadding)) tableElement.dataset.minHorizontalCellPadding = String(minPadding);
    if (isFinite(maxPadding)) tableElement.dataset.maxHorizontalCellPadding = String(maxPadding);
  });

  return [tableElement];
}

function layoutTable(tableElement) {
  const containerWidth = tableElement.parentElement?.getBoundingClientRect?.().width;
  const capContainerWidth = isFinite(containerWidth) && containerWidth > 0
    ? containerWidth
    : undefined;

  let { measurements, snapPlan, totalWidth } = runTableWidthPass(tableElement, {
    capContainerWidth
  });

  if (
    isFinite(containerWidth) &&
    containerWidth > 0 &&
    isFinite(totalWidth) &&
    totalWidth > containerWidth
  ) {
    ({ measurements, snapPlan, totalWidth } = runTableWidthPass(tableElement, {
      forcedHorizontalPadding: OVERFLOW_HORIZONTAL_CELL_PADDING_PX,
      capContainerWidth: containerWidth,
      fitContainerWidth: containerWidth
    }));
  }

  return { measurements, snapPlan, totalWidth, containerWidth };
}

function runTableWidthPass(tableElement, { forcedHorizontalPadding, capContainerWidth, fitContainerWidth } = {}) {
  clearCellWidths(tableElement);
  removeColgroup(tableElement);
  setTableLayoutForMeasure(tableElement);
  if (isFinite(forcedHorizontalPadding) && forcedHorizontalPadding >= 0) {
    setTableHorizontalPadding(tableElement, forcedHorizontalPadding);
  }
  const measurements = measureTable(tableElement);
  const snapPlan = computeSnapPlan(measurements);
  const totalWidth = applyColumnGroupWidths(tableElement, measurements, snapPlan, {
    capContainerWidth,
    fitContainerWidth
  });
  return { measurements, snapPlan, totalWidth };
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
      if (cellObject.style) tableCellElement.setAttribute('style', cellObject.style);
      if (cellObject.classNames) tableCellElement.classList.add(...cellObject.classNames);

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

function assignVisualCellPositions(tableElement) {
  const occupied = [];

  [...tableElement.rows].forEach((row, rowIndex) => {
    if (!occupied[rowIndex]) occupied[rowIndex] = [];

    let columnIndex = 0;
    [...row.cells].forEach(cell => {
      while (occupied[rowIndex][columnIndex]) columnIndex++;

      const columnSpan = validSpan(cell.getAttribute('colspan'));
      const rowSpan = validSpan(cell.getAttribute('rowspan'));

      cell.dataset.visualRow = String(rowIndex);
      cell.dataset.visualRowEnd = String(rowIndex + rowSpan - 1);
      cell.dataset.visualCol = String(columnIndex);
      cell.dataset.visualColEnd = String(columnIndex + columnSpan - 1);

      for (let y = rowIndex; y < rowIndex + rowSpan; y++) {
        if (!occupied[y]) occupied[y] = [];
        for (let x = columnIndex; x < columnIndex + columnSpan; x++) {
          occupied[y][x] = true;
        }
      }

      columnIndex += columnSpan;
    });
  });
}

function validSpan(value) {
  const span = Number.parseInt(value || '1', 10);
  return Number.isFinite(span) && span > 0 ? span : 1;
}

function applyHiddenRowColClasses(tableElement) {
  // collapse fully hidden rows and columns via CSS classes
  [...tableElement.rows]
    .filter(row => [...row.cells].every(cell => cell.classList.contains('hidden')))
    .forEach(row => row.classList.add('canopy-hidden-row'));

  const columnCount = getLogicalColumnCount([...tableElement.rows]);
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
      cell.style.paddingLeft = '';
      cell.style.paddingRight = '';
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

function getAppliedHorizontalPaddingRange(tableElement) {
  const values = [...tableElement.querySelectorAll('td, th')]
    .map(cell => {
      const style = window.getComputedStyle(cell);
      const left = Number.parseFloat(style.paddingLeft);
      const right = Number.parseFloat(style.paddingRight);
      if (!isFinite(left) || !isFinite(right)) return NaN;
      return (left + right) / 2;
    })
    .filter(value => isFinite(value) && value >= 0);

  if (!values.length) return { minPadding: NaN, maxPadding: NaN };
  return {
    minPadding: Math.min(...values),
    maxPadding: Math.max(...values)
  };
}

function setTableHorizontalPadding(tableElement, paddingPx) {
  tableElement.querySelectorAll('td, th').forEach(cell => {
    cell.style.paddingLeft = paddingPx + 'px';
    cell.style.paddingRight = paddingPx + 'px';
  });
}

function getMeaningfulElementChildren(element) {
  return [...(element?.children || [])].filter(child =>
    !child.classList?.contains('canopy-link-terminal-gap')
  );
}

function hasOnlyChildChainToBold(element) {
  let current = element;
  while (current) {
    const meaningfulChildren = getMeaningfulElementChildren(current);
    if (meaningfulChildren.length !== 1) return false;
    const onlyChild = meaningfulChildren[0];
    if (!onlyChild) return false;
    if (onlyChild.tagName === 'B') return true;
    current = onlyChild;
  }
  return false;
}

function isBoldOnlyCell(td) {
  return hasOnlyChildChainToBold(td);
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

// If a cell spans to the table bottom, there are no later rows below it.
function isTerminalRowspanCell(cell, tableElement) {
  const { rowspan } = getCellSpan(cell);
  const rowspanCount = Number.parseInt(rowspan || '1', 10);
  if (!Number.isFinite(rowspanCount) || rowspanCount <= 1) return false;

  const row = cell.parentElement;
  if (!row) return false;

  const rows = [...tableElement.rows];
  const rowIndex = rows.indexOf(row);
  if (rowIndex < 0) return false;

  return rowIndex + rowspanCount >= rows.length;
}

// If a cell is bolded but has no cells below it, allow it to snap as content.
function excludeCellFromBaseline(cell, tableElement, meta) {
  if (meta.isRowHeader && isTerminalRowspanCell(cell, tableElement)) {
    return false;
  }

  return meta.isRowHeader || meta.isColumnHeader;
}

function getChildElements(element) {
  return Array.from(element.children || []);
}

function getCellMeta(cell, tableElement) {
  const { columnSpan, rowspan } = getCellSpan(cell);
  const isRowHeader = isRowHeaderCell(cell);
  const isColumnHeader = isColumnHeaderCell(cell, tableElement);
  const meta = {
    columnSpan,
    rowspan,
    hasChildElements: getChildElements(cell).length > 0,
    isRowHeader,
    isColumnHeader
  };

  return {
    ...meta,
    excludeFromBaseline: excludeCellFromBaseline(cell, tableElement, meta)
  };
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
  const rangeWidth = rangeRect?.width;
  const rangeHeight = rangeRect?.height;
  const scrollWidth = cell.scrollWidth;
  const scrollHeight = cell.scrollHeight;
  const clientWidth = cell.clientWidth;
  const overflowScrollWidth = scrollWidth > clientWidth + 0.5 ? scrollWidth : NaN;

  const widthCandidates = [contentWidth, rangeWidth, overflowScrollWidth]
    .filter(width => isFinite(width) && width > 0);
  const heightCandidates = [contentHeight, rangeHeight, scrollHeight]
    .filter(height => isFinite(height) && height > 0);

  const measuredContentWidth = widthCandidates.length ? Math.max(...widthCandidates) : contentWidth;
  const measuredContentHeight = heightCandidates.length ? Math.max(...heightCandidates) : contentHeight;
  return {
    contentRect,
    rangeRect,
    contentWidth,
    contentHeight,
    measuredContentWidth,
    measuredContentHeight
  };
}

function getCellHorizontalBoxSpacing(cell) {
  const style = window.getComputedStyle(cell);
  const values = [
    style.paddingLeft,
    style.paddingRight,
    style.borderLeftWidth,
    style.borderRightWidth
  ].map(value => Number.parseFloat(value));

  return values.reduce((sum, value) => sum + (isFinite(value) ? value : 0), 0);
}

function getMeasuredUnitBoxWidth(cell, measuredContentWidth, columnSpan) {
  if (!isFinite(measuredContentWidth) || measuredContentWidth <= 0) return NaN;
  return (measuredContentWidth + getCellHorizontalBoxSpacing(cell)) / columnSpan;
}

function withTemporaryTableMeasureWidth(tableElement, widthPx, callback) {
  const previousWidth = tableElement.style.width;
  tableElement.style.width = widthPx + 'px';
  try {
    return callback();
  } finally {
    tableElement.style.width = previousWidth;
  }
}

function getCellSpan(cell) {
  const colspanAttribute = cell.getAttribute('colspan');
  const colspan = Number.parseInt(colspanAttribute || '1', 10);
  const columnSpan = Number.isFinite(colspan) && colspan > 0 ? colspan : 1;
  const rowspan = cell.getAttribute('rowspan');
  return { columnSpan, rowspan };
}

function getLogicalColumnCount(rows) {
  return Math.max(
    0,
    ...rows.map(row =>
      [...row.cells].reduce((sum, cell) => sum + getCellSpan(cell).columnSpan, 0)
    )
  );
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
  const columnCount = getLogicalColumnCount(rows);
  const columnSizes = Array.from({ length: columnCount }, () => ({
    maxUnitContentWidth: 0,
    maxUnitBoxWidth: 0,
    aggregateContentHeight: 0
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

  withTemporaryTableMeasureWidth(tableElement, MEASURE_TABLE_WIDTH_PX, () => {
    // Phase 1: Measure global min/max sizes so we can normalize later.
    [...tableElement.querySelectorAll('td')].forEach(cell => {
      if (cell.childNodes.length === 0) return;

      const {
        columnSpan,
        rowspan,
        excludeFromBaseline
      } = getCellMeta(cell, tableElement);
      const { measuredContentWidth, measuredContentHeight } = measureCellContent(cell, { useChildNodes: true });

      const measuredUnitContentWidth = measuredContentWidth / columnSpan;
      if (!excludeFromBaseline && isFinite(measuredUnitContentWidth) && measuredUnitContentWidth > 0) {
        if (measuredUnitContentWidth < sizes.minContentWidth) sizes.minContentWidth = measuredUnitContentWidth;
        if (measuredUnitContentWidth > sizes.maxContentWidth) sizes.maxContentWidth = measuredUnitContentWidth;
      }

      if (!rowspan && !excludeFromBaseline && isFinite(measuredContentHeight) && measuredContentHeight > 0) {
        if (measuredContentHeight < sizes.minContentHeight) sizes.minContentHeight = measuredContentHeight;
        if (measuredContentHeight > sizes.maxContentHeight) sizes.maxContentHeight = measuredContentHeight;
      }

      const unitBoxWidth = getMeasuredUnitBoxWidth(cell, measuredContentWidth, columnSpan);
      if (isFinite(unitBoxWidth) && unitBoxWidth > sizes.maxTdBoxWidth) {
        sizes.maxTdBoxWidth = unitBoxWidth;
      }
    });

    // Phase 2: Measure per-column max sizes so snapping has targets.
    rows.forEach(row => {
      let colIndex = 0;
      [...row.cells].forEach(cell => {
        const {
          columnSpan,
          hasChildElements,
          isRowHeader,
          excludeFromBaseline
        } = getCellMeta(cell, tableElement);

        if (excludeFromBaseline) {
          cell.dataset.columnSizeSkipReason = isRowHeader ? 'row_header' : 'column_header';
        } else if (!hasChildElements) {
          cell.dataset.columnSizeSkipReason = 'no_children';
        }

        if (!excludeFromBaseline && hasChildElements) {
          const { measuredContentWidth, measuredContentHeight } = measureCellContent(cell);
          const unitContentWidth = isFinite(measuredContentWidth) && measuredContentWidth > 0
            ? (measuredContentWidth / columnSpan)
            : NaN;
          const unitContentHeight = isFinite(measuredContentHeight) && measuredContentHeight > 0
            ? (measuredContentHeight / columnSpan)
            : NaN;
          const unitBoxWidth = getMeasuredUnitBoxWidth(cell, measuredContentWidth, columnSpan);
          const fallbackUnitContentWidth = isFinite(unitContentWidth) && unitContentWidth > 0 ? unitContentWidth : unitBoxWidth;

          if (isFinite(fallbackUnitContentWidth) && fallbackUnitContentWidth > 0 && isFinite(unitBoxWidth) && unitBoxWidth > 0) {
            for (let i = 0; i < columnSpan; i++) {
              const column = columnSizes[colIndex + i];
              if (!column) continue;
              if (fallbackUnitContentWidth > column.maxUnitContentWidth) column.maxUnitContentWidth = fallbackUnitContentWidth;
              if (unitBoxWidth > column.maxUnitBoxWidth) column.maxUnitBoxWidth = unitBoxWidth;
              if (isFinite(unitContentHeight) && unitContentHeight > 0) {
                column.aggregateContentHeight += unitContentHeight;
              }
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

function getObservedColumnScrollWidths(tableElement, columnCount) {
  const observedWidths = new Array(columnCount).fill(0);

  [...tableElement.rows].forEach(row => {
    let colIndex = 0;
    [...row.cells].forEach(cell => {
      const { columnSpan } = getCellSpan(cell);
      const unitScrollWidth = cell.scrollWidth / columnSpan;
      if (isFinite(unitScrollWidth) && unitScrollWidth > 0) {
        for (let i = 0; i < columnSpan; i++) {
          if (unitScrollWidth > observedWidths[colIndex + i]) observedWidths[colIndex + i] = unitScrollWidth;
        }
      }
      colIndex += columnSpan;
    });
  });

  return observedWidths;
}

function cellHasBreakOpportunities(cell) {
  if (cell.querySelector('br')) return true;
  return /[ \t\r\n\f,;:/-]/.test(cell.textContent || '');
}

function getShrinkableColumns(tableElement, columnCount) {
  const shrinkableColumns = new Array(columnCount).fill(false);

  [...tableElement.rows].forEach(row => {
    let colIndex = 0;
    [...row.cells].forEach(cell => {
      const { columnSpan, excludeFromBaseline } = getCellMeta(cell, tableElement);
      if (!excludeFromBaseline && cellHasBreakOpportunities(cell)) {
        for (let i = 0; i < columnSpan; i++) {
          if (colIndex + i < shrinkableColumns.length) {
            shrinkableColumns[colIndex + i] = true;
          }
        }
      }
      colIndex += columnSpan;
    });
  });

  return shrinkableColumns;
}

function isReadableAtomicText(text) {
  const compactText = (text || '').replace(/[ \t\r\n\f,;:/-]+/g, '');
  return (
    compactText.length >= 4 &&
    !/^\d+$/.test(compactText) &&
    /[A-Za-z0-9\u0590-\u05FF]/.test(compactText)
  );
}

function getAtomicReadableColumns(tableElement, columnCount, shrinkableColumns) {
  const atomicReadableColumns = new Array(columnCount).fill(false);

  [...tableElement.rows].forEach(row => {
    let colIndex = 0;
    [...row.cells].forEach(cell => {
      const { columnSpan, excludeFromBaseline } = getCellMeta(cell, tableElement);
      if (!excludeFromBaseline && !cellHasBreakOpportunities(cell) && isReadableAtomicText(cell.textContent)) {
        for (let i = 0; i < columnSpan; i++) {
          const index = colIndex + i;
          if (index < atomicReadableColumns.length && !shrinkableColumns[index]) {
            atomicReadableColumns[index] = true;
          }
        }
      }
      colIndex += columnSpan;
    });
  });

  return atomicReadableColumns;
}

function applyReadableMinimumWidths(widths, atomicReadableColumns) {
  const minAmounts = new Array(widths.length).fill(0);
  const resolvedWidths = widths.map((width, index) => {
    if (!atomicReadableColumns[index] || width >= ATOMIC_COLUMN_MIN_WIDTH_PX) return width;
    minAmounts[index] = ATOMIC_COLUMN_MIN_WIDTH_PX - width;
    return ATOMIC_COLUMN_MIN_WIDTH_PX;
  });
  return { widths: resolvedWidths, minAmounts };
}

function fitWidthsToContainer(widths, shrinkableColumns, containerWidth) {
  if (!isFinite(containerWidth) || containerWidth <= 0) {
    return { widths, shrinkAmounts: new Array(widths.length).fill(0) };
  }

  const fittedWidths = [...widths];
  const shrinkAmounts = new Array(widths.length).fill(0);
  let overflow = fittedWidths.reduce((sum, width) => sum + width, 0) - containerWidth;

  while (overflow > 0.5) {
    const candidates = fittedWidths
      .map((width, index) => ({ width, index }))
      .filter(({ width, index }) =>
        shrinkableColumns[index] &&
        isFinite(width) &&
        width > SHRINKABLE_COLUMN_MIN_WIDTH_PX
      );

    if (!candidates.length) break;

    const shrinkPerColumn = overflow / candidates.length;
    let appliedShrink = 0;

    candidates.forEach(({ width, index }) => {
      const shrinkBy = Math.min(shrinkPerColumn, width - SHRINKABLE_COLUMN_MIN_WIDTH_PX);
      if (shrinkBy <= 0) return;
      fittedWidths[index] -= shrinkBy;
      shrinkAmounts[index] += shrinkBy;
      appliedShrink += shrinkBy;
    });

    if (appliedShrink <= 0) break;
    overflow -= appliedShrink;
  }

  return { widths: fittedWidths, shrinkAmounts };
}

function getProportionalFlexibleColumnWidths(widths, shrinkableColumns, containerWidth, proportionalWidths = widths) {
  if (!isFinite(containerWidth) || containerWidth <= 0) return null;
  if (!widths.length) return null;
  if (widths.some(width => !isFinite(width) || width <= 0)) return null;
  if (!shrinkableColumns.some(Boolean)) return null;

  const fixedWidth = widths.reduce((sum, width, index) =>
    sum + (shrinkableColumns[index] ? 0 : width), 0);
  const availableFlexibleWidth = containerWidth - fixedWidth;
  if (availableFlexibleWidth <= 0) return null;

  const flexibleIndexes = shrinkableColumns
    .map((isShrinkable, index) => isShrinkable ? index : null)
    .filter(index => index != null);
  const minFlexibleWidth = SHRINKABLE_COLUMN_MIN_WIDTH_PX * flexibleIndexes.length;
  if (availableFlexibleWidth < minFlexibleWidth) return null;

  const proportionalWidthsByIndex = new Map(flexibleIndexes.map(index => {
    const proportionalWidth = proportionalWidths[index];
    return [index, isFinite(proportionalWidth) && proportionalWidth > 0
      ? proportionalWidth
      : widths[index]];
  }));
  const averageProportionalWidth = [...proportionalWidthsByIndex.values()]
    .reduce((sum, width) => sum + width, 0) / flexibleIndexes.length;
  proportionalWidthsByIndex.forEach((width, index) => {
    proportionalWidthsByIndex.set(
      index,
      averageProportionalWidth + ((width - averageProportionalWidth) * FLEXIBLE_COLUMN_TEXT_WEIGHT_FACTOR)
    );
  });
  const totalProportionalWidth = [...proportionalWidthsByIndex.values()]
    .reduce((sum, width) => sum + width, 0);
  if (totalProportionalWidth <= 0) return null;

  const adjustedWidths = [...widths];
  const constrainedIndexes = new Set();
  let remainingWidth = availableFlexibleWidth;
  let remainingWeight = totalProportionalWidth;

  while (constrainedIndexes.size < flexibleIndexes.length && remainingWeight > 0) {
    let constrainedThisPass = false;

    flexibleIndexes.forEach(index => {
      if (constrainedIndexes.has(index)) return;
      const weight = proportionalWidthsByIndex.get(index);
      const nextWidth = remainingWidth * weight / remainingWeight;

      if (nextWidth < SHRINKABLE_COLUMN_MIN_WIDTH_PX) {
        adjustedWidths[index] = SHRINKABLE_COLUMN_MIN_WIDTH_PX;
        constrainedIndexes.add(index);
        remainingWidth -= SHRINKABLE_COLUMN_MIN_WIDTH_PX;
        remainingWeight -= weight;
        constrainedThisPass = true;
      }
    });

    if (!constrainedThisPass) break;
  }

  flexibleIndexes.forEach(index => {
    if (constrainedIndexes.has(index)) return;
    const weight = proportionalWidthsByIndex.get(index);
    adjustedWidths[index] = remainingWidth * weight / remainingWeight;
  });

  return adjustedWidths;
}

function getWidthSum(widths) {
  return widths.reduce((sum, width) => sum + width, 0);
}

function undoOverflowSnapping(widths, unsnappedWidths, columnSnapResults, containerWidth) {
  if (!isFinite(containerWidth) || containerWidth <= 0) {
    return { widths, unsnapAmounts: new Array(widths.length).fill(0) };
  }

  const fittedWidths = [...widths];
  const unsnapAmounts = new Array(widths.length).fill(0);
  let overflow = getWidthSum(fittedWidths) - containerWidth;

  const candidates = fittedWidths
    .map((width, index) => {
      const unsnappedWidth = unsnappedWidths[index];
      return {
        index,
        width,
        unsnappedWidth,
        savings: width - unsnappedWidth,
        snapSource: columnSnapResults[index]?.snapTarget?.anchorSource
      };
    })
    .filter(({ savings, snapSource, unsnappedWidth }) =>
      snapSource === 'snapped_to_anchor' &&
      isFinite(unsnappedWidth) &&
      unsnappedWidth > 0 &&
      savings > 0
    )
    .sort((a, b) => b.savings - a.savings);

  for (const candidate of candidates) {
    if (overflow <= 0.5) break;
    fittedWidths[candidate.index] = candidate.unsnappedWidth;
    unsnapAmounts[candidate.index] = candidate.savings;
    overflow -= candidate.savings;
  }

  return { widths: fittedWidths, unsnapAmounts };
}

function resolveAppliedColumnWidth({ column, snapResult, observedWidth, observedScrollWidth }) {
  const snappedWidth = snapResult?.snapResult?.willSnap
    ? snapResult?.snapTarget?.target?.unitBoxWidth
    : null;
  const fallbackWidth = column?.maxUnitBoxWidth;

  const candidates = [snappedWidth, fallbackWidth, observedWidth, observedScrollWidth]
    .filter(width => isFinite(width) && width > 0);
  if (!candidates.length) return NaN;

  // Never let snapping shrink a column below the observed/fallback size.
  return Math.max(...candidates);
}

function clamp(number, min, max) {
  return Math.min(max, Math.max(min, number));
}

function getTextHeavyRelaxationFactor(columnSizes, index) {
  const columnContentWidth = columnSizes[index]?.maxUnitContentWidth;
  if (!isFinite(columnContentWidth) || columnContentWidth <= 0) return 0;

  const otherColumns = columnSizes.filter((_, otherIndex) => otherIndex !== index);
  const otherContentWidths = otherColumns
    .map(column => column?.maxUnitContentWidth)
    .filter(width => isFinite(width) && width > 0);

  if (!otherContentWidths.length) return 0;

  const nextLargestContentWidth = Math.max(...otherContentWidths);
  const contentRatio = columnContentWidth > nextLargestContentWidth
    ? columnContentWidth / nextLargestContentWidth
    : 1;
  const ratioFactor = clamp((contentRatio - 1) / 4, 0, 1);
  const excessContentWidth = Math.max(0, columnContentWidth - nextLargestContentWidth);
  const excessFactor = clamp(excessContentWidth / RELATIVE_COLUMN_WIDTH_CAP_DELTA_PX, 0, 1);
  const widthFactor = Math.min(ratioFactor, excessFactor);

  const columnContentHeight = columnSizes[index]?.aggregateContentHeight;
  const otherContentHeights = otherColumns
    .map(column => column?.aggregateContentHeight)
    .filter(height => isFinite(height) && height > 0);
  const nextLargestContentHeight = otherContentHeights.length ? Math.max(...otherContentHeights) : NaN;
  const heightRatio = isFinite(columnContentHeight) &&
    columnContentHeight > 0 &&
    isFinite(nextLargestContentHeight) &&
    nextLargestContentHeight > 0
    ? columnContentHeight / nextLargestContentHeight
    : 1;
  const heightFactor = clamp((heightRatio - 1) / 4, 0, 1);

  return Math.max(widthFactor, heightFactor);
}

function getColumnWidthCaps(widths, columnSizes = [], containerWidth) {
  const baseCaps = widths.map((width, index) => {
    const otherWidths = widths.filter((_, otherIndex) => otherIndex !== index);
    const nextLargestWidth = otherWidths.length ? Math.max(...otherWidths) : NaN;
    const relativeCap = isFinite(nextLargestWidth) && nextLargestWidth > 0
      ? nextLargestWidth + RELATIVE_COLUMN_WIDTH_CAP_DELTA_PX
      : ABSOLUTE_COLUMN_WIDTH_CAP_PX;

    return {
      absoluteCap: ABSOLUTE_COLUMN_WIDTH_CAP_PX,
      relativeCap,
      appliedCap: Math.min(ABSOLUTE_COLUMN_WIDTH_CAP_PX, relativeCap),
      relaxationFactor: 0
    };
  });

  const baseCappedWidth = widths.reduce((sum, width, index) =>
    sum + Math.min(width, baseCaps[index].appliedCap), 0);
  const availableSpareWidth = isFinite(containerWidth) && containerWidth > 0
    ? Math.max(0, containerWidth - baseCappedWidth)
    : 0;

  return widths.map((width, index) => {
    const otherWidths = widths.filter((_, otherIndex) => otherIndex !== index);
    const nextLargestWidth = otherWidths.length ? Math.max(...otherWidths) : NaN;
    const baseCap = baseCaps[index];
    const relaxationFactor = width > baseCap.appliedCap && availableSpareWidth > 0
      ? getTextHeavyRelaxationFactor(columnSizes, index)
      : 0;
    const relaxedAbsoluteCap = ABSOLUTE_COLUMN_WIDTH_CAP_PX + Math.min(
      RELAXED_ABSOLUTE_COLUMN_WIDTH_CAP_PX - ABSOLUTE_COLUMN_WIDTH_CAP_PX,
      availableSpareWidth * SPARE_WIDTH_RELAXATION_SHARE * relaxationFactor
    );
    const relativeDelta = RELATIVE_COLUMN_WIDTH_CAP_DELTA_PX + (
      (RELAXED_RELATIVE_COLUMN_WIDTH_CAP_DELTA_PX - RELATIVE_COLUMN_WIDTH_CAP_DELTA_PX) *
      relaxationFactor
    );
    const relativeCap = isFinite(nextLargestWidth) && nextLargestWidth > 0
      ? nextLargestWidth + relativeDelta
      : relaxedAbsoluteCap;

    return {
      absoluteCap: relaxedAbsoluteCap,
      relativeCap,
      appliedCap: Math.min(relaxedAbsoluteCap, relativeCap),
      relaxationFactor
    };
  });
}

function setDatasetFlag(element, key, enabled) {
  if (enabled) {
    element.dataset[key] = 'true';
  } else {
    delete element.dataset[key];
  }
}

function setDatasetValues(element, values, enabled) {
  Object.entries(values).forEach(([key, value]) => {
    if (enabled) {
      element.dataset[key] = String(value);
    } else {
      delete element.dataset[key];
    }
  });
}

function applyColumnGroupWidths(tableElement, { columnSizes }, snapPlan, { capContainerWidth, fitContainerWidth } = {}) {
  const { columnSnapResults } = snapPlan;
  const logicalColumnCount = getLogicalColumnCount([...tableElement.rows]);
  const columnCount = Math.max(columnSizes.length, logicalColumnCount);
  tableElement.dataset.logicalColumnCount = String(logicalColumnCount);
  tableElement.dataset.appliedColumnCount = String(columnCount);
  const colgroup = ensureColgroup(tableElement, columnCount);
  const observedWidths = getObservedColumnBoxWidths(tableElement, columnCount);
  const observedScrollWidths = getObservedColumnScrollWidths(tableElement, columnCount);

  const columns = Array.from({ length: columnCount }, (_, index) => {
    const column = columnSizes[index];
    const snapResult = columnSnapResults[index];
    const observedWidth = observedWidths[index];
    const observedScrollWidth = observedScrollWidths[index];
    return {
      index,
      column,
      snapResult,
      observedWidth,
      observedScrollWidth,
      naturalWidth: resolveAppliedColumnWidth({
        column,
        snapResult,
        observedWidth,
        observedScrollWidth
      })
    };
  });

  const validWidths = columns
    .map(column => column.naturalWidth)
    .filter(width => isFinite(width) && width > 0);
  const averageWidth = validWidths.length
    ? validWidths.reduce((sum, width) => sum + width, 0) / validWidths.length
    : 120;

  columns.forEach(column => {
    column.naturalWidth = isFinite(column.naturalWidth) && column.naturalWidth > 0
      ? column.naturalWidth
      : averageWidth;

    const unsnappedWidth = resolveAppliedColumnWidth({
      column: column.column,
      snapResult: null,
      observedWidth: column.observedWidth,
      observedScrollWidth: column.observedScrollWidth
    });
    column.unsnappedWidth = isFinite(unsnappedWidth) && unsnappedWidth > 0
      ? unsnappedWidth
      : column.naturalWidth;
  });

  const naturalWidths = columns.map(column => column.naturalWidth);
  const columnWidthCaps = getColumnWidthCaps(naturalWidths, columnSizes, capContainerWidth);
  columns.forEach(column => {
    const cap = columnWidthCaps[column.index];
    column.widthCap = cap;
    column.cappedWidth = column.naturalWidth > cap.appliedCap
      ? cap.appliedCap
      : column.naturalWidth;
  });

  const shrinkableColumns = getShrinkableColumns(tableElement, columnCount);
  const atomicReadableColumns = getAtomicReadableColumns(tableElement, columnCount, shrinkableColumns);
  const { widths: readableWidths, minAmounts } = applyReadableMinimumWidths(
    columns.map(column => column.cappedWidth),
    atomicReadableColumns
  );
  const { widths: readableUnsnappedWidths } = applyReadableMinimumWidths(
    columns.map(column => column.unsnappedWidth),
    atomicReadableColumns
  );
  columns.forEach(column => {
    column.isShrinkable = shrinkableColumns[column.index];
    column.isAtomicReadable = atomicReadableColumns[column.index];
    column.readableWidth = readableWidths[column.index];
    column.readableUnsnappedWidth = readableUnsnappedWidths[column.index];
    column.readableMinAmount = minAmounts[column.index];
  });

  const adjustedFlexibleWidths = getProportionalFlexibleColumnWidths(
    readableWidths,
    shrinkableColumns,
    fitContainerWidth,
    naturalWidths
  );
  const fittingWidths = adjustedFlexibleWidths || readableWidths;
  columns.forEach(column => {
    column.wasFlexAdjusted = Boolean(adjustedFlexibleWidths && column.isShrinkable);
    column.fittingWidth = fittingWidths[column.index];
  });

  const { widths: shrunkWidths, shrinkAmounts } = fitWidthsToContainer(
    fittingWidths,
    shrinkableColumns,
    fitContainerWidth
  );
  const { widths: finalWidths, unsnapAmounts } = undoOverflowSnapping(
    shrunkWidths,
    readableUnsnappedWidths,
    columnSnapResults,
    fitContainerWidth
  );
  columns.forEach(column => {
    column.shrunkWidth = shrunkWidths[column.index];
    column.shrinkAmount = shrinkAmounts[column.index];
    column.finalWidth = finalWidths[column.index];
    column.unsnapAmount = unsnapAmounts[column.index];
  });

  columns.forEach(column => {
    const colElement = colgroup.children[column.index];

    const isCapped = column.cappedWidth !== column.naturalWidth;
    setDatasetFlag(colElement, 'columnWidthCapped', isCapped);
    setDatasetValues(colElement, {
      uncappedColumnWidth: column.naturalWidth,
      maxColumnWidth: column.widthCap.appliedCap,
      absoluteColumnWidthCap: column.widthCap.absoluteCap,
      relativeColumnWidthCap: column.widthCap.relativeCap,
      columnWidthRelaxationFactor: column.widthCap.relaxationFactor
    }, isCapped);

    setDatasetFlag(colElement, 'columnAtomicReadable', column.isAtomicReadable);

    const hasReadableMin = column.readableMinAmount > 0;
    setDatasetFlag(colElement, 'columnReadableMinApplied', hasReadableMin);
    setDatasetValues(colElement, {
      preReadableMinColumnWidth: column.cappedWidth,
      readableMinColumnWidth: ATOMIC_COLUMN_MIN_WIDTH_PX
    }, hasReadableMin);

    setDatasetFlag(colElement, 'columnShrinkable', column.isShrinkable);

    const wasShrunk = column.shrinkAmount > 0;
    setDatasetFlag(colElement, 'columnWidthShrunk', wasShrunk);
    setDatasetValues(colElement, {
      preShrinkColumnWidth: column.fittingWidth,
      columnShrinkAmount: column.shrinkAmount,
      minShrinkableColumnWidth: SHRINKABLE_COLUMN_MIN_WIDTH_PX
    }, wasShrunk);

    const wasUnsnapped = column.unsnapAmount > 0;
    setDatasetFlag(colElement, 'columnWidthUnsnapped', wasUnsnapped);
    setDatasetValues(colElement, {
      snappedColumnWidth: column.shrunkWidth,
      unsnappedColumnWidth: column.readableUnsnappedWidth,
      columnUnsnapSavings: column.unsnapAmount
    }, wasUnsnapped);

    setDatasetFlag(colElement, 'columnWidthFlexAdjusted', column.wasFlexAdjusted);
    setDatasetValues(colElement, {
      preFlexAdjustedColumnWidth: column.readableWidth
    }, column.wasFlexAdjusted);

    colElement.style.width = column.finalWidth + 'px';
  });

  const totalWidth = getWidthSum(finalWidths);
  tableElement.style.width = totalWidth + 'px';
  return totalWidth;
}

export default renderTable;
