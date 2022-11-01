let generateDataFile = require('./generate_data_file');
let { parseDataFile, compareChangesWithFileSystem } = require('./reconstruct_project_files');
let dedent = require('dedent-js');
let chalk = require('chalk');

describe('generateDataFile', function() {
  test('it generates data file', () => {
    let originalSelectedFilesContents = {
      'topics/A/B/C/Topic.expl':
        dedent`Topic: Hello world.

        Subtopic: Hello.\n`,
      'topics/A/B/C/Topic2.expl':
        dedent`Topic2: Hello world.

        Subtopic: Hello.\n`,
      'topics/A/B/C/Topic3.expl':
        dedent`Topic3: Hello world.

        Subtopic: Hello.\n`,
      'topics/A/B/Topic4.expl':
        dedent`Topic4: Hello world.

        Subtopic: Hello.\n`,
    };

    let filesByPath = {
      'topics/A/B/C': ['topics/A/B/C/Topic.expl', 'topics/A/B/C/Topic2.expl'],
      'topics/A/B': ['topics/A/B/Topic4.expl']
    };

    let dataFile = generateDataFile(filesByPath, originalSelectedFilesContents, {});

    expect(dataFile).toEqual(
      dedent`[A/B/C]

      * Topic: Hello world.

      Subtopic: Hello.


      * Topic2: Hello world.

      Subtopic: Hello.


      [A/B]

      * Topic4: Hello world.

      Subtopic: Hello.\n\n\n`);

  });
});

describe('parseDataFile', function() {

  test('it parses data file with double newline after path', () => {
    let dataFile = dedent`[A/B/C]

    * Topic: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    expect(filesToWrite).toEqual({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n"
    });

    expect(directoriesToEnsure).toEqual(['topics/A/B/C']);
  });

  test('it parses data file with single newline after path', () => {
    let dataFile = dedent`[A/B/C]
    * Topic: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    expect(filesToWrite).toEqual({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n"
    });

    expect(directoriesToEnsure).toEqual(['topics/A/B/C']);
  });

  test('it parses data file omitting initial asterisk', () => {
    let dataFile = dedent`[A/B/C]
    Topic: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    expect(filesToWrite).toEqual({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n"
    });

    expect(directoriesToEnsure).toEqual(['topics/A/B/C']);
  });

  test('it parses data file with multiple files', () => {
    let dataFile = dedent`[A/B/C]
    * Topic1: Paragraph.

    * Topic2: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    expect(filesToWrite).toEqual({
      'topics/A/B/C/Topic1.expl': "Topic1: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n"
    });

    expect(directoriesToEnsure).toEqual(['topics/A/B/C']);
  });

  test('it parses data file with multiple files and irregular spacing', () => {
    let dataFile = dedent`[A/B/C]



    * Topic1: Paragraph.
    * Topic2: Paragraph.








    * Topic3: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    expect(filesToWrite).toEqual({
      'topics/A/B/C/Topic1.expl': "Topic1: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/C/Topic3.expl': "Topic3: Paragraph.\n"
    });

    expect(directoriesToEnsure).toEqual(['topics/A/B/C']);
  });

  test('it parses data file with category notes', () => {
    let dataFile = dedent`[A/B/C]
    * Topic1: Paragraph.

    * Topic2: Paragraph.

    * This one has no key.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    expect(filesToWrite).toEqual({
      'topics/A/B/C/Topic1.expl': "Topic1: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/C/C.expl': 'This one has no key.\n'
    });

    expect(directoriesToEnsure).toEqual(['topics/A/B/C']);
  });

  test('it concatinates multiple category notes', () => {
    let dataFile = dedent`[A/B/C]
    * Topic1: Paragraph.

    * This one has no key.

    * Topic2: Paragraph.

    * This one also has no key.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    expect(filesToWrite).toEqual({
      'topics/A/B/C/Topic1.expl': "Topic1: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/C/C.expl': "This one has no key.\n\nThis one also has no key.\n"
    });

    expect(directoriesToEnsure).toEqual(['topics/A/B/C']);
  });

  test('it parses data file with multiple files in multiple directories', () => {
    let dataFile = dedent`[A/B/C]
    * Topic1: Paragraph.

    [A/D]

    * Topic2: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    expect(filesToWrite).toEqual({
      'topics/A/B/C/Topic1.expl': "Topic1: Paragraph.\n",
      'topics/A/D/Topic2.expl': "Topic2: Paragraph.\n"
    });

    expect(directoriesToEnsure).toEqual(['topics/A/B/C', 'topics/A/D']);
  });

  test('it throws for empty path', () => {
    let dataFile = dedent`[]

    * Topic: Paragraph.\n`;

    expect(() => parseDataFile(dataFile)).toThrow('Invalid directory path: "[]"');
  });

  test('it throws for slash-initial path', () => {
    let dataFile = dedent`[/A/B/C]

    * Topic: Paragraph.\n\n`;

    expect(() => parseDataFile(dataFile)).toThrow('Invalid directory path: "[/A/B/C]"');
  });

  test('it throws for slash-final path', () => {
    let dataFile = dedent`[A/B/C/]

    * Topic: Paragraph.\n`;

    expect(() => parseDataFile(dataFile)).toThrow('Invalid directory path: "[A/B/C/]"');
  });

  test('it parses data file with atypical keys', () => {
    let dataFile = dedent`[A/B/C]
    * Topic1? Paragraph.

    * Topic\\: two: Paragraph.

    * Topic #4: Hello world.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    expect(filesToWrite).toEqual({
      'topics/A/B/C/Topic1?.expl': "Topic1? Paragraph.\n",
      'topics/A/B/C/Topic:_two.expl': "Topic\\: two: Paragraph.\n",
      'topics/A/B/C/Topic_%234.expl': "Topic #4: Hello world.\n"
    });
  });
});

describe('compareChangesWithFileSystem', function() {
  test('it creates files and directories', () => {
    let originalSelectedFilesContents = {};

    let originallySelectedFiles = []; // we didn't load A/B/C/Topic.expl, so it shouldn't get overwritten

    let allFileAndDirectoryPaths = [];

    let dataFile = dedent`[A/B/C]

    * Topic: Hello world.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete,
      directoriesToDelete
    } = compareChangesWithFileSystem({
      filesToWrite,
      directoriesToEnsure,
      originallySelectedFiles,
      originalSelectedFilesContents,
      allFileAndDirectoryPaths
    });

    expect(messages).toEqual([
      chalk.green('Created directory: topics/A'),
      chalk.green('Created directory: topics/A/B'),
      chalk.green('Created directory: topics/A/B/C'),
      chalk.green('Created file: topics/A/B/C/Topic.expl'),
    ]);

    expect(filesToWriteFinal).toEqual({
      'topics/A/B/C/Topic.expl': `Topic: Hello world.\n`
    });

    expect(pathsToDelete).toEqual([]);
    expect(directoriesToDelete).toEqual([]);
  });

  test('it identifies when to append to files', () => {
    let originalSelectedFilesContents = {
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.'
    };

    let originallySelectedFiles = []; // we didn't load A/B/C/Topic.expl, so it shouldn't get overwritten

    let allFileAndDirectoryPaths = [
      'topics/A/B/C/Topic.expl',
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ];

    let dataFile = dedent`[A/B/C]

    * Topic: New data.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete,
      directoriesToDelete
    } = compareChangesWithFileSystem({
      filesToWrite,
      directoriesToEnsure,
      originallySelectedFiles,
      originalSelectedFilesContents,
      allFileAndDirectoryPaths
    });

    expect(messages).toEqual([chalk.yellow('Appended to file: topics/A/B/C/Topic.expl')]);

    expect(filesToWriteFinal).toEqual({
      'topics/A/B/C/Topic.expl': dedent`Topic: Preexisting data.

      Topic: New data.\n\n`
    });

    expect(pathsToDelete).toEqual([]);
    expect(directoriesToDelete).toEqual([]);
  });

  test('it identifies when to overwrite to files', () => {

    let originalSelectedFilesContents = {
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    };

    let originallySelectedFiles = ['topics/A/B/C/Topic.expl']; // we loaded A/B/C/Topic.expl, so it should get overwritten

    let allFileAndDirectoryPaths = [
      'topics/A/B/C/Topic.expl',
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ];

    let dataFile = dedent`[A/B/C]

    * Topic: New data.\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete,
      directoriesToDelete
    } = compareChangesWithFileSystem({
      filesToWrite,
      directoriesToEnsure,
      originallySelectedFiles,
      originalSelectedFilesContents,
      allFileAndDirectoryPaths
    });

    expect(messages).toEqual([chalk.green('Overwrote file: topics/A/B/C/Topic.expl')]);

    expect(filesToWriteFinal).toEqual({
      'topics/A/B/C/Topic.expl': `Topic: New data.\n`
    });

    expect(pathsToDelete).toEqual([]);
    expect(directoriesToDelete).toEqual([]);
  });

  test('it deletes files that were loaded and then removed from the data file', () => {

    let originalSelectedFilesContents = {
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    };

    let originallySelectedFiles = ['topics/A/B/C/Topic.expl']; // we loaded A/B/C/Topic.expl, so it should get deleted

    let allFileAndDirectoryPaths = [
      'topics/A/B/C/Topic.expl',
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ];

    let dataFile = '';

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete,
      directoriesToDelete
    } = compareChangesWithFileSystem({
      filesToWrite,
      directoriesToEnsure,
      originallySelectedFiles,
      originalSelectedFilesContents,
      allFileAndDirectoryPaths
    });

    expect(messages).toEqual([
      chalk.red('Deleted file: topics/A/B/C/Topic.expl'),
      chalk.red('Deleted directory: topics/A/B/C'),
      chalk.red('Deleted directory: topics/A/B'),
      chalk.red('Deleted directory: topics/A')
    ]);

    expect(filesToWriteFinal).toEqual({});

    expect(pathsToDelete).toEqual(['topics/A/B/C/Topic.expl']);
    expect(directoriesToDelete).toEqual([
      "topics/A/B/C",
      "topics/A/B",
      "topics/A",
    ]);
  });

  test('it deletes files when there is only a path', () => {

    let originalSelectedFilesContents = {
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    };

    let originallySelectedFiles = ['topics/A/B/C/Topic.expl']; // we loaded A/B/C/Topic.expl, so it should get deleted

    let allFileAndDirectoryPaths = [
      'topics/A/B/C/Topic.expl',
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ];

    let dataFile = '[A/B/C]';

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete,
      directoriesToDelete
    } = compareChangesWithFileSystem({
      filesToWrite,
      directoriesToEnsure,
      originallySelectedFiles,
      originalSelectedFilesContents,
      allFileAndDirectoryPaths
    });

    expect(messages).toEqual([
      chalk.red('Deleted file: topics/A/B/C/Topic.expl'),
      chalk.red('Deleted directory: topics/A/B/C'),
      chalk.red('Deleted directory: topics/A/B'),
      chalk.red('Deleted directory: topics/A')
    ]);

    expect(filesToWriteFinal).toEqual({});

    expect(pathsToDelete).toEqual(['topics/A/B/C/Topic.expl']);
    expect(directoriesToDelete).toEqual([
      "topics/A/B/C",
      "topics/A/B",
      "topics/A",
    ]);
  });


  test('it deletes files that were selected and then removed from data file', () => {

    let originalSelectedFilesContents = {
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n"
    };

    let originallySelectedFiles = ['topics/A/B/C/Topic.expl', 'topics/A/B/C/Topic2.expl'];

    let allFileAndDirectoryPaths = [
      'topics/A/B/C/Topic.expl',
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ];

    let dataFile = dedent`[A/B/C]

    Topic: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete,
      directoriesToDelete
    } = compareChangesWithFileSystem({
      filesToWrite,
      directoriesToEnsure,
      originallySelectedFiles,
      originalSelectedFilesContents,
      allFileAndDirectoryPaths
    });

    expect(filesToWriteFinal).toEqual({});

    expect(messages).toEqual([chalk.red('Deleted file: topics/A/B/C/Topic2.expl')]);

    expect(pathsToDelete).toEqual(['topics/A/B/C/Topic2.expl']);
    expect(directoriesToDelete).toEqual([]);
  });

  test('it deletes directories that become unused', () => {

    let originalSelectedFilesContents = {
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/D/Topic2.expl': "Topic2: Paragraph.\n"
    };

    let originallySelectedFiles = ['topics/A/B/C/Topic.expl', 'topics/A/B/D/Topic2.expl'];

    let allFileAndDirectoryPaths = [
      'topics/A/B/C/Topic.expl',
      'topics/A/B/C',
      'topics/A/B/D/Topic2.expl',
      'topics/A/B/D',
      'topics/A/B',
      'topics/A'
    ];

    let dataFile = dedent`[A/B/C]

    Topic: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete,
      directoriesToDelete
    } = compareChangesWithFileSystem({
      filesToWrite,
      directoriesToEnsure,
      originallySelectedFiles,
      originalSelectedFilesContents,
      allFileAndDirectoryPaths
    });

    expect(filesToWriteFinal).toEqual({});

    expect(pathsToDelete).toEqual(['topics/A/B/D/Topic2.expl']);
    expect(directoriesToDelete).toEqual(['topics/A/B/D']);

    expect(messages).toEqual([
      chalk.red('Deleted file: topics/A/B/D/Topic2.expl'),
      chalk.red('Deleted directory: topics/A/B/D')
    ]);

  });

  test('it deletes directories that become unused, even if two files are being deleted from that directory', () => {
    // This is a more complicated case because we want to make sure we aren't looking at
    // each file and not deleting the directory because the other file still exists, when both are getting deleted

    let originalSelectedFilesContents = {
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/D/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/D/Topic3.expl': "Topic3: Paragraph.\n"
    };

    let originallySelectedFiles = ['topics/A/B/C/Topic.expl', 'topics/A/B/D/Topic2.expl', 'topics/A/B/D/Topic3.expl'];

    let allFileAndDirectoryPaths = [
      'topics/A/B/C/Topic.expl',
      'topics/A/B/C',
      'topics/A/B/D/Topic2.expl',
      'topics/A/B/D/Topic3.expl',
      'topics/A/B/D',
      'topics/A/B',
      'topics/A'
    ];

    let dataFile = dedent`[A/B/C]

    Topic: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete,
      directoriesToDelete
    } = compareChangesWithFileSystem({
      filesToWrite,
      directoriesToEnsure,
      originallySelectedFiles,
      originalSelectedFilesContents,
      allFileAndDirectoryPaths
    });

    expect(filesToWriteFinal).toEqual({});

    expect(pathsToDelete).toEqual(['topics/A/B/D/Topic2.expl', 'topics/A/B/D/Topic3.expl']);
    expect(directoriesToDelete).toEqual(['topics/A/B/D']);

    expect(messages).toEqual([
      chalk.red('Deleted file: topics/A/B/D/Topic2.expl'),
      chalk.red('Deleted file: topics/A/B/D/Topic3.expl'),
      chalk.red('Deleted directory: topics/A/B/D')
    ]);
  });

  test('it deletes directories that become unused, even if two levels of directory are being deleted', () => {
    // This is a more complicated case because we want to make sure we aren't looking at
    // the inner directory and using it as a reason not to delete the outer directory when both need to be deleted

    let originalSelectedFilesContents = {
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/D/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/D/E/Topic3.expl': "Topic3: Paragraph.\n"
    };

    let originallySelectedFiles = ['topics/A/B/C/Topic.expl', 'topics/A/B/D/Topic2.expl', 'topics/A/B/D/E/Topic3.expl'];

    let allFileAndDirectoryPaths = [
      'topics/A/B/C/Topic.expl',
      'topics/A/B/C',
      'topics/A/B/D/Topic2.expl',
      'topics/A/B/D/E/Topic3.expl',
      'topics/A/B/D/E',
      'topics/A/B/D',
      'topics/A/B',
      'topics/A'
    ];

    let dataFile = dedent`[A/B/C]

    Topic: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete,
      directoriesToDelete
    } = compareChangesWithFileSystem({
      filesToWrite,
      directoriesToEnsure,
      originallySelectedFiles,
      originalSelectedFilesContents,
      allFileAndDirectoryPaths
    });

    expect(filesToWriteFinal).toEqual({});
    expect(pathsToDelete).toEqual([
      'topics/A/B/D/Topic2.expl',
      'topics/A/B/D/E/Topic3.expl'
    ]);
    expect(directoriesToDelete).toEqual([
      'topics/A/B/D/E',
      'topics/A/B/D'
    ]);

    expect(messages).toEqual([
      chalk.red('Deleted file: topics/A/B/D/E/Topic3.expl'),
      chalk.red('Deleted directory: topics/A/B/D/E'),
      chalk.red('Deleted file: topics/A/B/D/Topic2.expl'),
      chalk.red('Deleted directory: topics/A/B/D')
    ]);
  });

  test('it does\'nt delete a directory that was emptied and then filled in the same session', () => {

    let originalSelectedFilesContents = {
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
    };

    let originallySelectedFiles = ['topics/A/B/C/Topic.expl'];

    let allFileAndDirectoryPaths = [
      'topics/A/B/C/Topic.expl',
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ];

    let dataFile = dedent`[A/B/C/D]

    Topic: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete,
      directoriesToDelete
    } = compareChangesWithFileSystem({
      filesToWrite,
      directoriesToEnsure,
      originallySelectedFiles,
      originalSelectedFilesContents,
      allFileAndDirectoryPaths
    });

    expect(filesToWriteFinal).toEqual({
      'topics/A/B/C/D/Topic.expl': 'Topic: Paragraph.\n'
    });

    expect(pathsToDelete).toEqual(['topics/A/B/C/Topic.expl']);

    // We should recognize that even though topics/A/B/C looks empty because we deleted the last thing in it,
    // because this session is adding topics/A/B/C/D/Topic.expl, it isn't empty and shouldn't be deleted
    expect(directoriesToDelete).toEqual([]);

    expect(messages).toEqual([
      chalk.red('Deleted file: topics/A/B/C/Topic.expl'),
      chalk.green('Created directory: topics/A/B/C/D'),
      chalk.green('Created file: topics/A/B/C/D/Topic.expl')
    ]);
  });
});
