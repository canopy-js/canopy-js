let generateDataFile = require('./generate_data_file');
let { parseDataFile, compareChangesWithFileSystem } = require('./reconstruct_project_files');
let dedent = require('dedent-js');

describe('generateDataFile', function() {
  test('it generates data file', () => {
    let fileSystemData = {
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
    }

    let dataFile = generateDataFile(filesByPath, fileSystemData, {});

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
})

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
      'topics/A/B/C/C.expl': 'This one has no key.'
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
      'topics/A/B/C/C.expl': "This one has no key.\n\nThis one also has no key."
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
});

describe('compareChangesWithFileSystem', function() {

  test('it identifies when to append to files', () => {
    let dataFile = dedent`[A/B/C]

    * Topic: New data.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let fileSystemData = {
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.'
    };

    let originalFileList = []; // we didn't load A/B/C/Topic.expl, so it shouldn't get overwritten

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete
    } = compareChangesWithFileSystem(filesToWrite, directoriesToEnsure, originalFileList, fileSystemData);

    expect(messages).toEqual(['Appended to file: topics/A/B/C/Topic.expl']);

    expect(filesToWriteFinal).toEqual({
      'topics/A/B/C/Topic.expl': dedent`Topic: Preexisting data.

      Topic: New data.\n\n`
    });

    expect(pathsToDelete).toEqual([]);
  });

  test('it identifies when to overwrite to files', () => {
    let dataFile = dedent`[A/B/C]

    * Topic: New data.\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let fileSystemData = {
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    };

    let originalFileList = ['topics/A/B/C/Topic.expl']; // we loaded A/B/C/Topic.expl, so it should get overwritten

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete
    } = compareChangesWithFileSystem(filesToWrite, directoriesToEnsure, originalFileList, fileSystemData);

    expect(messages).toEqual(['Wrote to file: topics/A/B/C/Topic.expl']);

    expect(filesToWriteFinal).toEqual({
      'topics/A/B/C/Topic.expl': `Topic: New data.\n`
    });

    expect(pathsToDelete).toEqual([]);
  });

  test('it identifies when to delete to files', () => {
    let dataFile = '';

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let fileSystemData = {
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.'
    };

    let originalFileList = ['topics/A/B/C/Topic.expl']; // we loaded A/B/C/Topic.expl, so it should get deleted

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete
    } = compareChangesWithFileSystem(filesToWrite, directoriesToEnsure, originalFileList, fileSystemData);

    expect(messages).toEqual(['Deleted file: topics/A/B/C/Topic.expl']);

    expect(filesToWriteFinal).toEqual({});

    expect(pathsToDelete).toEqual(['topics/A/B/C/Topic.expl']);
  });

  test('it deletes files when there is only a path', () => {
    let dataFile = '[A/B/C]';

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let fileSystemData = {
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.'
    };

    let originalFileList = ['topics/A/B/C/Topic.expl']; // we loaded A/B/C/Topic.expl, so it should get deleted

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete
    } = compareChangesWithFileSystem(filesToWrite, directoriesToEnsure, originalFileList, fileSystemData);

    expect(messages).toEqual(['Deleted file: topics/A/B/C/Topic.expl']);

    expect(filesToWriteFinal).toEqual({});

    expect(pathsToDelete).toEqual(['topics/A/B/C/Topic.expl']);
  });


  test('it identifies when to delete to files and keep others', () => {
    let dataFile = dedent`[A/B/C]

    Topic: Paragraph.\n\n`;

    let { filesToWrite, directoriesToEnsure } = parseDataFile(dataFile);

    let fileSystemData = {
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n"
    };

    let originalFileList = ['topics/A/B/C/Topic.expl', 'topics/A/B/C/Topic2.expl'];

    let {
      messages,
      filesToWriteFinal,
      pathsToDelete
    } = compareChangesWithFileSystem(filesToWrite, directoriesToEnsure, originalFileList, fileSystemData);

    expect(filesToWriteFinal).toEqual({});

    expect(messages).toEqual(['Deleted file: topics/A/B/C/Topic2.expl']);

    expect(pathsToDelete).toEqual(['topics/A/B/C/Topic2.expl']);
  });
});
