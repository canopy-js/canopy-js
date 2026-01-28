function stripLocationLines(text) {
  const explRefLineRegex = /^\s*topics\/[^:\n]+?\.expl:\d+(?::\d+)?\s*$/;
  const bulkRefLineRegex = /^\s*[^:\n]+\.bulk:\d+(?::\d+)?\s*$/;
  return String(text)
    .split('\n')
    .filter(line => !explRefLineRegex.test(line) && !bulkRefLineRegex.test(line))
    .join('\n');
}

function formatErrorWithFrames(message, frames = []) {
  const cleanedMessage = stripLocationLines(message)
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();
  if (!frames.length) return cleanedMessage;
  return `${cleanedMessage}\n\n${frames.join('\n\n')}\n`;
}

function renderContextFrame({
  sourceText,
  line,
  col = null,
  radius = 1,
  label = null,
  includeLabel = true
}) {
  if (!sourceText || !line || line < 1) return null;

  const lines = String(sourceText).split('\n');
  while (lines.length && lines[lines.length - 1] === '' && line < lines.length) {
    lines.pop();
  }
  const start = Math.max(0, line - 1 - radius);
  const end = Math.min(lines.length - 1, line - 1 + radius);
  const width = String(Math.max(end + 1, line)).length;
  const caret = col && col > 0 ? col : 1;

  const frame = [];
  for (let i = start; i <= end; i++) {
    const lineNumber = i + 1;
    const marker = lineNumber === line ? '>' : ' ';
    const text = lines[i] || '';
    frame.push(`${marker} ${String(lineNumber).padStart(width, ' ')} | ${text}`);
    if (lineNumber === line) {
      frame.push(`  ${' '.repeat(width)} | ${' '.repeat(Math.max(0, caret - 1))}^`);
    }
  }

  if (!includeLabel || !label) return frame.join('\n');
  return `${label}\n${frame.join('\n')}`;
}

module.exports = {
  stripLocationLines,
  formatErrorWithFrames,
  renderContextFrame
};
