const fs = require('fs');
const os = require('os');
const path = require('path');

const translateWatchErrorToBulk = require('./translate_watch_error_to_bulk');

function writeFileSyncEnsuringDir(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf8');
}

test('it appends bulk refs for multiple expl references (with and without columns)', () => {
  const originalCwd = process.cwd();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-translate-'));

  try {
    process.chdir(tmpDir);

    writeFileSyncEnsuringDir(
      'topics/Foo/Foo.expl',
      [
        'Foo: Root paragraph',
        'Line 2',
        'Line 3',
        'Line 4'
      ].join('\n') + '\n'
    );

    writeFileSyncEnsuringDir(
      'Foo.bulk',
      [
        '[Foo]',
        '',
        '* Foo: Root paragraph',
        'Line 2',
        'Line 3',
        'Line 4',
        ''
      ].join('\n')
    );

    const error = new Error(
      [
        'Error: Something went wrong',
        'topics/Foo/Foo.expl:1',
        'Another location:',
        'topics/Foo/Foo.expl:3:2'
      ].join('\n')
    );

    const translated = translateWatchErrorToBulk(error, { sync: true, bulkFileName: 'Foo.bulk' });

    expect(translated.message).toEqual(
      expect.stringContaining('topics/Foo/Foo.expl:1\nFoo.bulk:3')
    );
    expect(translated.message).toEqual(
      expect.stringContaining('topics/Foo/Foo.expl:3:2\nFoo.bulk:5:2')
    );
  } finally {
    process.chdir(originalCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

