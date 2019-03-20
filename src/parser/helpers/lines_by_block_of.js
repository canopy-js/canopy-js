import unitsOf from 'helpers/units_of';

function linesByBlockOf(string) {
  let lines = string.split(/\n/);
  let blocks = [];
  let footnoteLines = [];

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
    } else if (line.match(/^\s*(\S+\.|[+*-])(\s|$)/)) {
      if (lastBlock && lastBlock.type === 'list') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'list',
            lines: [line]
          }
        );
      }
    } else if (line.match(/^\|([^|\n]*\|)+/)) {
      if (lastBlock && lastBlock.type === 'table') {
        lastBlock.lines.push(line);
      } else {
        blocks.push(
          {
            type: 'table',
            lines: [line]
          }
        );
      }
    } else if (line.match(/^\s*\[\^[^\]]+]\:/)) {
      footnoteLines.push(line);
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

  if (footnoteLines.length > 0) {
    blocks.push(
      {
        type: 'footnote',
        lines: footnoteLines
      }
    );
  }

  return blocks;
}

export default linesByBlockOf;
