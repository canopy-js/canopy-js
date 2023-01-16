function emptyScreen(w, h) {
  return (' '.repeat(w) + '\n').repeat(h).slice(0, -1);
}

function wrapWithTightBorder(content) {
  let contentLines = content.split('\n');
  let contentHeight = contentLines.length;
  let w = contentLines[0].length;
  let h = contentLines.length;

  let verticalInnerPadding = 1;
  let horizontalInnerPadding = 1;
  let maxDataWidth = contentLines.reduce((memo, value) => { return Math.max(memo, value.length); }, 0);
  let innerFrameWidth = maxDataWidth + horizontalInnerPadding * 2; // one space on either side of the widest line
  let output = '';

  output
    += '┌'
    + '─'.repeat(maxDataWidth + 4) // 2 because of two inner padding spaces
    + '┐'
    + '\n';

  for (let i = 0; i < contentHeight; i++) {
    let innerPaddingLeft = Math.round((innerFrameWidth - contentLines[i].length) / 2) + 1
    let innerPaddingRight = Math.floor((innerFrameWidth - contentLines[i].length) / 2) + 1

    output
      += '│'
      + ' '.repeat(innerPaddingLeft)
      + contentLines[i]
      + ' '.repeat(innerPaddingRight)
      + '│'
      + '\n';
  }

  output
    += '└'
    + '─'.repeat(maxDataWidth + 4) // 4 because of two inner padding spaces on each side
    + '┘';

  return output;
}

function withExplanatoryBoxPrepend(w, h, message, bottomContentRenderFunction) {
  let centeredMessage = '\n' + horizontallyCenter(w, wrapWithTightBorder(message));
  let output = centeredMessage;

  let messageHeight = centeredMessage.split('\n').length;
  let bottomContentFrameHeight = h - messageHeight;
  let bottomContent = bottomContentRenderFunction(w, bottomContentFrameHeight);

  output += bottomContent;

  return output;
}

function withExplanatoryBoxOverlay(w, h, message, bottomContentRenderFunction) {
  let centeredMessage = '\n' + horizontallyCenter(w, wrapWithTightBorder(message));
  let output = centeredMessage;

  let messageHeight = centeredMessage.split('\n').length;
  let bottomContentFrameHeight = h - messageHeight;
  let bottomContent = bottomContentRenderFunction(w, h);

  output += bottomContent.slice(messageHeight);

  return output;
}

function outputCenter(w, h, message) {
  let output = '';
  let messageHeight = message.split('\n').length;
  let verticalPaddingHeightAbove = Math.round((h / 2) - (messageHeight / 2));
  let verticalPaddingHeightBelow = Math.floor((h / 2) - (messageHeight / 2));

  for (let i = 0; i < verticalPaddingHeightAbove; i++) {
    output += "\n";
  }

  let lines = message.split('\n');
  let maxDataWidth = lines.reduce((memo, value) => { return Math.max(memo, value.length); }, 0);
  let horizontalPaddingWidth = (w / 2) - (maxDataWidth / 2);

  lines.forEach(data => {
    let paddingString = '';
    for (let i = 0; i < horizontalPaddingWidth; i++) {
      paddingString += ' ';
    }
    output += paddingString + data + "\n";
  });

  for (let i = 0; i < verticalPaddingHeightBelow; i++) {
    output += "\n";
  }

  output = output.slice(0, -1); // remove last newline

  return output;
}

function horizontallyCenter(w, content) {
  let contentLines = content.split('\n');
  let contentWidth = contentLines[0].length;
  let paddingRight = Math.round((w - contentWidth) / 2);
  let paddingLeft = Math.floor((w - contentWidth) / 2);

  return contentLines.map(line => ' '.repeat(paddingLeft) + line + ' '.repeat(paddingRight)).join('\n');
}

function wrapWithOuterBorder(w, h, existingContentRenderFunction) {
  let existingContent = existingContentRenderFunction(w - 2, h - 2);
  let linesOfExistingContent = existingContent.split('\n');

  let newOutput = '┌';
  for (let i = 0; i < w - 2; i++) { // -2 for each corner
    newOutput += '─';
  }
  newOutput += '┐\n';
  for (let i = 0; i < linesOfExistingContent.length; i++) {
    let additionalRightPadding = w - linesOfExistingContent[i].length - 2; // 2 for both border pipes
    newOutput += '│' + linesOfExistingContent[i] + ' '.repeat(additionalRightPadding) + '│';
  }
  newOutput += '└';
  for (let i = 0; i < w - 2; i++) { //-2 for each corner
    newOutput += '─';
  }
  newOutput += '┘';
  return newOutput;
}

function verticallyCenterSelectedRow(w, h, message, indexOfVerticallyCenteredRow) {
  let output = '';

  let messageLines = message.split('\n');
  let rowsAboveCenter = Math.round((h - 1) / 2);
  let indexOfFirstVisibleElement = Math.max(indexOfVerticallyCenteredRow - rowsAboveCenter, 0);

  let rowsBelowCenter = Math.floor((h - 1) / 2);
  let indexOfLastVisibleElement = Math.min(indexOfVerticallyCenteredRow + rowsBelowCenter, messageLines.length - 1);
  let indexAfterLastVisibleElement = indexOfLastVisibleElement + 1;

  let truncatedMessageLines = messageLines.slice(indexOfFirstVisibleElement, indexAfterLastVisibleElement);

  let totalNumberOfVisibleElements = truncatedMessageLines.length;
  let numberOfElementsAboveCenter = Math.min(indexOfVerticallyCenteredRow, rowsAboveCenter);
  let verticalPaddingNecessaryAbove = rowsAboveCenter - numberOfElementsAboveCenter;

  let numberOfElementsBelowCenter = totalNumberOfVisibleElements - numberOfElementsAboveCenter - 1;
  let verticalPaddingNecessaryBelow = rowsBelowCenter - numberOfElementsBelowCenter;

  for (let i = 0; i < verticalPaddingNecessaryAbove; i++) {
    output += '\n';
  }

  let maxDataWidth = messageLines.reduce((memo, value) => { return Math.max(memo, value.length); }, 0);
  let horizontalPaddingWidth = Math.round((w / 2) - (maxDataWidth / 2));

  truncatedMessageLines.forEach(data => {
    let paddingString = '';
    for (let i = 0; i < horizontalPaddingWidth; i++) {
      paddingString += ' ';
    }
    output += paddingString + data + "\n";
  });

  for (let i = 0; i < verticalPaddingNecessaryBelow; i++) {
    output += "\n";
  }

  output = output.slice(0, -1); // remove last newline

  return output;
}

function splitScreen(w, h, rendererOne, rendererTwo) {
  let frameOneWidth = Math.round((w - 1) / 2); // -1 because of bar down middle
  let frameTwoWidth = Math.floor((w - 1) / 2);

  let frameOneLines = rendererOne(frameOneWidth, h).split('\n');
  let frameTwoLines = rendererTwo(frameTwoWidth, h).split('\n');

  let output = '';

  for (let i = 0; i < h; i++) {
    let frameOneLineContent = frameOneLines[i] || '';
    let frameTwoLineContent = frameTwoLines[i] || '';
    let frameOneRightPadding = frameOneWidth - frameOneLineContent.length;
    let frameTwoRightPadding = frameTwoWidth - frameTwoLineContent.length;

    output
      += frameOneLineContent
      + ' '.repeat(frameOneRightPadding)
      + '│'
      + frameTwoLineContent
      + ' '.repeat(frameTwoRightPadding)
      + "\n";
  }

  output = output.slice(0,-1);

  return output;
}

module.exports = {
  emptyScreen,
  wrapWithTightBorder,
  withExplanatoryBoxPrepend,
  withExplanatoryBoxOverlay,
  horizontallyCenter,
  outputCenter,
  wrapWithOuterBorder,
  verticallyCenterSelectedRow,
  splitScreen
}
