import unitsOf from 'helpers/units_of';

function blocksOfParagraph(string) {
  let lines = string.split(/\n/);
  let blocks = [];

  lines.forEach((line) => {
    let lastBlock = blocks[blocks.length - 1];

    if (line.match(/^\s*#/)) {
      if (lastBlock && lastBlock.type === 'code') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'code',
            lines: [line]
          }
        );
      }
    } else if (line.match(/^\s*>/)) {
      if (lastBlock && lastBlock.type === 'quote') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'quote',
            lines: [line]
          }
        );
      }
    } else if (line.match(/^\s*\S+\.(\s|$)/)) {
      if (lastBlock && lastBlock.type === 'outline') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'outline',
            lines: [line]
          }
        );
      }
    } else {
      if (lastBlock && lastBlock.type === 'text') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'text',
            lines: [line]
          }
        );
      }
    }
  });

  return blocks;
}

export default blocksOfParagraph;
