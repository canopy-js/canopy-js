import { getCombinedBoundingRect } from 'render/helpers';
import { writeSnapDebug, writeTableDebug } from 'render/token_elements/render_table_debug';

// How strict snapping is for width
const WIDTH_BASE_SIMILARITY_PERCENT = 15;   // baseline strictness
const WIDTH_SIZE_SENSITIVITY = 3000;        // more tolerance for small table max widths

const OVERFLOW_HORIZONTAL_CELL_PADDING_PX = 15;

// How strict snapping is for row height -- currently disabled
// const HEIGHT_BASE_SIMILARITY_PERCENT = 15;  // baseline strictness
// const HEIGHT_SIZE_SENSITIVITY = 2500;       // more tolerance for small heights

function renderTable(token, renderContext, renderTokenElements) {
  const tableElement = buildTableDOM(token, renderContext, renderTokenElements);
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
  let { measurements, snapPlan, totalWidth } = runTableWidthPass(tableElement);
  const containerWidth = tableElement.parentElement?.getBoundingClientRect?.().width;

  if (
    isFinite(containerWidth) &&
    containerWidth > 0 &&
    isFinite(totalWidth) &&
    totalWidth > containerWidth
  ) {
    ({ measurements, snapPlan, totalWidth } = runTableWidthPass(tableElement, {
      forcedHorizontalPadding: OVERFLOW_HORIZONTAL_CELL_PADDING_PX
    }));
  }

  return { measurements, snapPlan, totalWidth, containerWidth };
}

function runTableWidthPass(tableElement, { forcedHorizontalPadding } = {}) {
  clearCellWidths(tableElement);
  removeColgroup(tableElement);
  setTableLayoutForMeasure(tableElement);
  if (isFinite(forcedHorizontalPadding) && forcedHorizontalPadding >= 0) {
    setTableHorizontalPadding(tableElement, forcedHorizontalPadding);
  }
  const measurements = measureTable(tableElement);
  const snapPlan = computeSnapPlan(measurements);
  const totalWidth = applyColumnGroupWidths(tableElement, measurements, snapPlan);
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

function getChildElements(element) {
  return Array.from(element.children || []);
}

function getCellMeta(cell, tableElement) {
  const { columnSpan, rowspan } = getCellSpan(cell);
  const isRowHeader = isRowHeaderCell(cell);
  const isColumnHeader = isColumnHeaderCell(cell, tableElement);

  return {
    columnSpan,
    rowspan,
    hasChildElements: getChildElements(cell).length > 0,
    isRowHeader,
    isColumnHeader,
    excludeFromBaseline: isRowHeader || isColumnHeader
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

  const widthCandidates = [contentWidth, rangeWidth, scrollWidth]
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

    const {
      columnSpan,
      rowspan,
      excludeFromBaseline
    } = getCellMeta(cell, tableElement);
    const { measuredContentWidth, measuredContentHeight } = measureCellContent(cell, { useChildNodes: true });
    const { boxWidth } = measureCellBox(cell);

    const measuredUnitContentWidth = measuredContentWidth / columnSpan;
    if (!excludeFromBaseline && isFinite(measuredUnitContentWidth) && measuredUnitContentWidth > 0) {
      if (measuredUnitContentWidth < sizes.minContentWidth) sizes.minContentWidth = measuredUnitContentWidth;
      if (measuredUnitContentWidth > sizes.maxContentWidth) sizes.maxContentWidth = measuredUnitContentWidth;
    }

    if (!rowspan && !excludeFromBaseline && isFinite(measuredContentHeight) && measuredContentHeight > 0) {
      if (measuredContentHeight < sizes.minContentHeight) sizes.minContentHeight = measuredContentHeight;
      if (measuredContentHeight > sizes.maxContentHeight) sizes.maxContentHeight = measuredContentHeight;
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

function applyColumnGroupWidths(tableElement, { columnSizes }, snapPlan) {
  const { columnSnapResults } = snapPlan;
  const logicalColumnCount = getLogicalColumnCount([...tableElement.rows]);
  const columnCount = Math.max(columnSizes.length, logicalColumnCount);
  tableElement.dataset.logicalColumnCount = String(logicalColumnCount);
  tableElement.dataset.appliedColumnCount = String(columnCount);
  const colgroup = ensureColgroup(tableElement, columnCount);
  const observedWidths = getObservedColumnBoxWidths(tableElement, columnCount);
  const observedScrollWidths = getObservedColumnScrollWidths(tableElement, columnCount);

  let widths = Array.from({ length: columnCount }, (_, index) => {
    const column = columnSizes[index];
    const snapResult = columnSnapResults[index];
    const observedWidth = observedWidths[index];
    const observedScrollWidth = observedScrollWidths[index];
    return resolveAppliedColumnWidth({
      column,
      snapResult,
      observedWidth,
      observedScrollWidth
    });
  });

  const validWidths = widths.filter(width => isFinite(width) && width > 0);
  const averageWidth = validWidths.length
    ? validWidths.reduce((sum, width) => sum + width, 0) / validWidths.length
    : 120;

  widths = widths.map(width => (isFinite(width) && width > 0 ? width : averageWidth));

  const finalWidths = widths;

  finalWidths.forEach((width, index) => {
    colgroup.children[index].style.width = width + 'px';
  });

  const totalWidth = finalWidths.reduce((sum, width) => sum + width, 0);
  tableElement.style.width = totalWidth + 'px';
  return totalWidth;
}

export default renderTable;
