function writeSnapDebug(tableElement, { rows, columnSizes, sizes }, snapPlan, helpers) {
  const { snapTargets, columnTargets, columnDebugAttempts, columnSnapResults } = snapPlan;
  const { getCellMeta, isBoldOnlyCell, measureCellContent, getRangeBoundingRect } = helpers;

  rows.forEach(row => {
    let colIndex = 0;
    [...row.cells].forEach(cell => {
      const { columnSpan, hasChildElements } = getCellMeta(cell, tableElement);
      const columnStartIndex = colIndex;
      colIndex += columnSpan;
      cell.dataset.isBoldOnlyCell = isBoldOnlyCell(cell) ? 'true' : 'false';

      if (cell.childNodes.length === 0) return;
      if (!hasChildElements) return;

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

export { writeSnapDebug, writeTableDebug };
