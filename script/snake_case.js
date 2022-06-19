process.stdin.setEncoding('utf8');

process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    process.stdout.write(`topics/${chunk.replace(/ /g, '_').toLowerCase().trim()}.expl`);
  }
});
