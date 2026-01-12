const fs = require('fs');
const os = require('os');
const path = require('path');

const { writeHtmlError } = require('./fs-helpers');

describe('fs-helpers writeHtmlError', () => {
  test('keeps subtopic header and ellipsis in the context block', () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-error-html-'));

    try {
      process.chdir(tmpDir);

      const errorMessage = [
        'Error: Reference [[Nonexistent]] in subtopic [Wyoming, Subtopic A] mentions nonexistent topic or subtopic [Nonexistent].',
        'topics/Wyoming/Wyoming.expl:6:12',
        'Hisbonen.bulk:2530:12',
        '',
        '  3 | Subtopic A: Line one.',
        '   | ...',
        '  5 | Line three.',
        '> 6 | Line four with [[Nonexistent]].',
        '    |                ^',
        '  7 |'
      ].join('\n');

      writeHtmlError(new Error(errorMessage));

      const html = fs.readFileSync(path.join('build', 'index.html'), 'utf8');
      const messageBlock = html.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] || '';
      const contextBlock = html.match(/<pre[^>]*><code>([\s\S]*?)<\/code><\/pre>/)?.[1] || '';

      expect(messageBlock).not.toContain('Subtopic A: Line one.');
      expect(messageBlock).not.toContain('   | ...');
      expect(contextBlock).toContain('Subtopic A: Line one.');
      expect(contextBlock).toContain('   | ...');
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('wraps bracketed entities in code tags within the message block', () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-error-html-'));

    try {
      process.chdir(tmpDir);

      const errorMessage = [
        'Error: Subtopic [Foo, Bar] referenced in reference [[Baz#Qux|->]] does not exist.',
        'topics/Foo/Foo.expl:2:5',
        '',
        '> 2 | See [[Baz#Qux|->]].',
        '  |     ^'
      ].join('\n');

      writeHtmlError(new Error(errorMessage));

      const html = fs.readFileSync(path.join('build', 'index.html'), 'utf8');
      const messageBlock = html.match(/<p[^>]*>([\s\S]*?)<\/p>/)?.[1] || '';

      expect(messageBlock).toContain('<code>[Foo, Bar]</code>');
      expect(messageBlock).toContain('<code>[[Baz#Qux|-&gt;]]</code>');
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
