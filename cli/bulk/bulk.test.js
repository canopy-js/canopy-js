let FileSystemManager = require('./file_system_manager');
let BulkFileGenerator = require('./bulk_file_generator');
let BulkFileParser = require('./bulk_file_parser');
let FileSystemChangeCalculator = require('./file_system_change_calculator');
let FileSet = require('./file_set');
let dedent = require('dedent-js');
let chalk = require('chalk');

describe('BulkFileGenerator', function() {
  test('it generates data file, alphabetizing topic files and directories, but hoisting default topic', () => {
    let originalSelectedFilesByContents = {
      'topics/A/B/C/Topic.expl':
        dedent`Topic: Hello world.

        Subtopic: Hello.` + '\n',
      'topics/A/B/C/Topic2.expl':
        dedent`Topic2: Hello world.

        Subtopic: Hello.` + '\n',

      'topics/A/B/Topic3.expl':
        dedent`Topic3: Hello world.

        Subtopic: Hello.` + '\n',
      'topics/C/D/Topic4.expl':
        dedent`Topic4: Hello world.

        Subtopic: Hello.` + '\n',
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/A/B/C/Topic.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[A/B/C]

      ** Topic: Hello world.

      Subtopic: Hello.

      * Topic2: Hello world.

      Subtopic: Hello.


      [A/B]

      * Topic3: Hello world.

      Subtopic: Hello.


      [C/D]

      * Topic4: Hello world.

      Subtopic: Hello.` + '\n\n');

  });

  test('it generates data file with special characters', () => {
    let originalSelectedFilesByContents = {
      'topics/A/B/C/#3/Topic_#4.expl':
        dedent`Topic #4: Hello world.

        Subtopic: Hello.` + '\n',
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/A/B/C/Topic.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[A/B/C/#3]

      * Topic #4: Hello world.

      Subtopic: Hello.` + '\n\n');

  });

  test('it puts the default category first', () => {
    let originalSelectedFilesByContents = {
      'topics/A/B/C/Topic.expl': 'Topic: Hello world.\n',
      'topics/A/Topic2.expl': 'Topic2: Hello world.\n'
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/A/B/C/Topic.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[A/B/C]

      ** Topic: Hello world.


      [A]

      * Topic2: Hello world.` + '\n\n');

  });

  test('it pins the file with the shortest name after removing intermediary directory names, even if raw name is longer', () => {
    let originalSelectedFilesByContents = {
      'topics/Literature/Shakespeare/Hamlet/Shakespeare\'s_Hamlet.expl': 'Shakespeare\'s Hamlet: Long but better match.\n',
      'topics/Literature/Shakespeare/Hamlet/Hamlet_Act_I.expl': 'Hamlet Act I: Shorter but worse match.\n',
      'topics/Literature/Shakespeare/Hamlet/Notes.expl': 'Notes: Short but not overlapping enclosing folder.\n',
      'topics/Literature/Literature.expl': 'Literature: Default topic.\n'
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/Literature/Literature.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[Literature]

      ** Literature: Default topic.


      [Literature/Shakespeare/Hamlet]

      * Shakespeare's Hamlet: Long but better match.

      * Hamlet Act I: Shorter but worse match.

      * Notes: Short but not overlapping enclosing folder.` + '\n\n');
  });

  test('it puts the inbox category last', () => {
    let originalSelectedFilesByContents = {
      'topics/X/Topic.expl': 'Topic: Hello world.\n',
      'topics/X/Y/Z/Topic2.expl': 'Topic2: Hello world.\n',
      'topics/Inbox/Inbox.expl': 'Inbox notes.\n',
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/A/B/C/Topic.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[X]

      * Topic: Hello world.


      [X/Y/Z]

      * Topic2: Hello world.


      [Inbox]

      Inbox notes.` + '\n\n');

  });

  test('it ignores files with other extensions', () => {
    let originalSelectedFilesByContents = {
      'topics/X/Topic.expl': 'Topic: Hello world.\n',
      'topics/X/Readme.md': 'Hello world.\n'
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/A/B/C/Topic.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[X]

      * Topic: Hello world.` + '\n\n');

  });

  test('it ignores files with other paths in the root topics directory', () => {
    let originalSelectedFilesByContents = {
      'topics/X/Topic.expl': 'Topic: Hello world.\n',
      'topics/Readme.md': 'Hello world.\n'
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/A/B/C/Topic.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[X]

      * Topic: Hello world.` + '\n\n');

  });

  test('it suggests renaming expl files in the root topics directory', () => {
    let originalSelectedFilesByContents = {
      'topics/Topic.expl': 'Topic: Hello world.\n'
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/A/B/C/Topic.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[PLEASE ADD CATEGORY]

      * Topic: Hello world.` + '\n\n');

  });

  test("it normalizes extra spacing between subtopics", () => {
    let originalSelectedFilesByContents = {
      'topics/A/B/C/C.expl': dedent`C: Hello world.



      Subtopic: XYZ.
      ` + '\n'
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/A/B/C/C.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[A/B/C]

      ** C: Hello world.

      Subtopic: XYZ.
      ` + '\n\n'
    )
  });

  test('it lets you use # as a category name', () => {
    let originalSelectedFilesByContents = {
      'topics/A/B/C/#/Topic.expl':
        dedent`Topic: Hello world.

        Subtopic: Hello.` + '\n'
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/A/B/C/#/Topic.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[A/B/C/#]

      ** Topic: Hello world.

      Subtopic: Hello.` + '\n\n');
  });
});

describe('BulkFileParser', function() {
  test('it parses normal data file', () => {
    let bulkFileString = dedent`[A/B/C]

    * Topic: Paragraph.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it only splits on asterisks that are at the start of a block', () => {
    let bulkFileString = dedent`[A/B/C]
    * Topic: Paragraph.
    * Topic: Paragraph.
    
    * Topic2: Paragraph.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n* Topic: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });


  test('it parses data file with single newline after path', () => {
    let bulkFileString = dedent`[A/B/C]
    * Topic: Paragraph.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it parses data file with references', () => {
    // We're worried the parser will see [[link]] as being a kind of category path like [A/B/C] and end the section there.

    let bulkFileString = dedent`[A/B/C]

    * Topic: Paragraph. Here is a [[link]], and here is a [square bracket].

    Link: Hello world!` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph. Here is a [[link]], and here is a [square bracket].\n\nLink: Hello world!\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('a data file that omits initial asterisk becomes category notes', () => {
    let bulkFileString = dedent`[A/B/C]
    Topic: Paragraph.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/C.expl': "Topic\\: Paragraph.\n" // we escape the colon so bulk doesn't later think it's a topic
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('a first note with an escaped question mark does not get double escaped', () => {
    let bulkFileString = dedent`[A/B/C]
    This is a note beginning with a question mark that may get misrecognized as a topic\\?` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      "topics/A/B/C/C.expl": "This is a note beginning with a question mark that may get misrecognized as a topic\\?\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('a first note with a space-terminated colon is escaped', () => {
    let bulkFileString = dedent`[A/B/C]
    This is a note beginning with a colon mark that may get misrecognized as a topic:` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      "topics/A/B/C/C.expl": "This is a note beginning with a colon mark that may get misrecognized as a topic\\:\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('a first note with a non-space-terminated colon is not escaped', () => {
    let bulkFileString = dedent`[A/B/C]
    This is a note beginning with a colon mark that may get misrecognized as a topic:abc` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      "topics/A/B/C/C.expl": "This is a note beginning with a colon mark that may get misrecognized as a topic:abc\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it parses data file with multiple files', () => {
    let bulkFileString = dedent`[A/B/C]
    * Topic1: Paragraph.

    * Topic2: Paragraph.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic1.expl': "Topic1: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it parses data file with multiple files and irregular spacing', () => {
    let bulkFileString = dedent`[A/B/C]



    * Topic1: Paragraph.

    * Topic2: Paragraph.


    Subtopic: Paragraph.





    * Topic3: Paragraph.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic1.expl': "Topic1: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n\nSubtopic: Paragraph.\n", // normalizes spacing between subtopics
      'topics/A/B/C/Topic3.expl': "Topic3: Paragraph.\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it parses data file with asterisk-initial category notes', () => {
    let bulkFileString = dedent`[A/B/C]
    * Topic1: Paragraph.

    * Topic2: Paragraph.

    * This one has no key.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic1.expl': "Topic1: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/C/C.expl': "This one has no key.\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it concatinates multiple category notes', () => {
    let bulkFileString = dedent`[A/B/C]
    * Topic1: Paragraph.

    * This one has no key.

    * Topic2: Paragraph.

    * This one also has no key.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic1.expl': "Topic1: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/C/C.expl': "This one has no key.\n\nThis one also has no key.\n",
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it concatinates category notes to category topic', () => {
    let bulkFileString = dedent`[A/B/C]
    * C: Paragraph.

    * This one has no key.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/C.expl': "C: Paragraph.\n\nThis one has no key.\n",
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it concatinates files for the same category listed twice', () => {
    let bulkFileString = dedent`[A/B/C]
    * Topic1: Paragraph.

    * Note 1.

    [A/B/C]

    * Topic2: Paragraph.

    * Note 2.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic1.expl': "Topic1: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/C/C.expl': "Note 1.\n\nNote 2.\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });


  test('it parses data file with multiple files in multiple directories', () => {
    let bulkFileString = dedent`[A/B/C]
    * Topic1: Paragraph.

    [A/D]

    * Topic2: Paragraph.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic1.expl': "Topic1: Paragraph.\n",
      'topics/A/D/Topic2.expl': "Topic2: Paragraph.\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A',
      'topics/A/D'
    ]);
  });

  test('it throws for empty path', () => {
    let bulkFileString = dedent`[]`;

    let bulkFileParser = new BulkFileParser(bulkFileString);

    expect(() => bulkFileParser.generateFileSet()).toThrow(
      'Malformed Canopy bulk file: []'
    );
  });

  test('it removes slash from slash-initial path', () => {
    let bulkFileString = dedent`[/A/B/C]

    * Topic: Paragraph.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it removes slash from slash-final path', () => {
    let bulkFileString = dedent`[A/B/C/]

    * Topic: Paragraph.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n"
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it parses data file with atypical keys', () => {
    let bulkFileString = dedent`[A/B/C]
    * Topic1? Paragraph.

    * Topic\\: two: Paragraph.

    * Topic #4: Hello world.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic1%3F.expl': 'Topic1? Paragraph.\n',
      'topics/A/B/C/Topic%3A_two.expl': 'Topic\\: two: Paragraph.\n',
      'topics/A/B/C/Topic_#4.expl': 'Topic #4: Hello world.\n'
    });
  });

  test('it adds id suffix for similar notes', () => {
    let bulkFileString = dedent`[A/B/C]
    * This is a note.

    * This is a note.

    * This is a unique note.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      "topics/A/B/C/C.expl": "This is a note.\n\nThis is a note.\n\nThis is a unique note.\n",
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it adds empty note files to category note file', () => {
    let bulkFileString = dedent`[A/B/C]
    *

    *

    * This is a note.

    * This is a unique note.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      "topics/A/B/C/C.expl": "\n\n\n\nThis is a note.\n\nThis is a unique note.\n",
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });

  test('it lets you have # as a category name without escaping', () => {
    let bulkFileString = dedent`[A/B/C/#]
    * This is a note.` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      "topics/A/B/C/#/#.expl": "This is a note.\n",
    });

    expect(newFileSet.directoryPaths).toEqual([
      'topics/A/B/C/#',
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
  });
});

describe('FileSystemChangeCalculator', function() {
  test('it creates files and directories', () => {
    let originalSelectionFileSet = new FileSet({});
    let newBulkFileString = dedent`[A/B/C]

    * Topic: Hello world.` + '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({});

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([]);
    expect(fileSystemChange.directoryDeletions).toEqual([]);
    expect(fileSystemChange.fileCreations).toEqual([ [ 'topics/A/B/C/Topic.expl', 'Topic: Hello world.\n' ] ]);
    expect(fileSystemChange.fileAppendings).toEqual([]);
    expect(fileSystemChange.directoryCreations).toEqual([ 'topics/A/B/C', 'topics/A/B', 'topics/A' ]);

    expect(fileSystemChange.messages).toEqual([
      chalk.green('Created directory: topics/A'),
      chalk.green('Created directory: topics/A/B'),
      chalk.green('Created directory: topics/A/B/C'),
      chalk.green('Created file: topics/A/B/C/Topic.expl'),
    ]);
  });

  test('it identifies when to append to files', () => {
    let originalSelectionFileSet = new FileSet({}); // the file wasn't loaded, so it's absence isn't a deletion
    let newBulkFileString = dedent`[A/B/C]

    * Topic: New data.` + '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    });

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([]);
    expect(fileSystemChange.directoryDeletions).toEqual([]);
    expect(fileSystemChange.fileCreations).toEqual([]);
    expect(fileSystemChange.directoryCreations).toEqual([]);

    expect(fileSystemChange.fileAppendings).toEqual([[
      'topics/A/B/C/Topic.expl',
      `Topic: Preexisting data.\n\n` +
      `Topic: New data.\n`
    ]]);

    expect(fileSystemChange.messages).toEqual([
      chalk.yellow('Appended to file: topics/A/B/C/Topic.expl')
    ]);
  });

  test('it identifies when to update files', () => {
    let originalSelectionFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    });

    let newBulkFileString = dedent`[A/B/C]

    * Topic: New data.` + '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    });

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([]);
    expect(fileSystemChange.directoryDeletions).toEqual([]);
    expect(fileSystemChange.fileCreations).toEqual([[
      'topics/A/B/C/Topic.expl',
      'Topic: New data.\n'
    ]]);
    expect(fileSystemChange.directoryCreations).toEqual([]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([
      chalk.green('Updated file: topics/A/B/C/Topic.expl')
    ]);
  });

  test('it slugifies special characters', () => {
    let originalSelectionFileSet = new FileSet({});

    let newBulkFileString = dedent`[A/B/C/#3]

    * 100% Juice: New data.` + '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({});

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([]);
    expect(fileSystemChange.directoryDeletions).toEqual([]);
    expect(fileSystemChange.fileCreations).toEqual([[
      'topics/A/B/C/#3/100%25_Juice.expl', // we no longer encode # or % for file names, only URLs
      '100% Juice: New data.\n'
    ]]);
    expect(fileSystemChange.directoryCreations).toEqual([
      'topics/A/B/C/#3',
      'topics/A/B/C',
      'topics/A/B',
      'topics/A'
    ]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([
      chalk.green('Created directory: topics/A'),
      chalk.green('Created directory: topics/A/B'),
      chalk.green('Created directory: topics/A/B/C'),
      chalk.green('Created directory: topics/A/B/C/#3'),
      chalk.green('Created file: topics/A/B/C/#3/100%25_Juice.expl'),
    ]);
  });

  test('it identifies no-op', () => {
    let originalSelectionFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    });

    let newBulkFileString = dedent`[A/B/C]

    * Topic: Preexisting data.` + '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    });

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([]);
    expect(fileSystemChange.directoryDeletions).toEqual([]);
    expect(fileSystemChange.fileCreations).toEqual([]);
    expect(fileSystemChange.directoryCreations).toEqual([]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([]);
  });

  test('it deletes files that were loaded and then removed from the data file', () => {
    let originalSelectionFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    });
    let newBulkFileString = '';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    });

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([
      'topics/A/B/C/Topic.expl'
    ]);
    expect(fileSystemChange.directoryDeletions).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A',
    ]);
    expect(fileSystemChange.fileCreations).toEqual([]);
    expect(fileSystemChange.directoryCreations).toEqual([]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([
      chalk.red('Deleted file: topics/A/B/C/Topic.expl'),
      chalk.red('Deleted directory: topics/A/B/C'),
      chalk.red('Deleted directory: topics/A/B'),
      chalk.red('Deleted directory: topics/A')
    ]);
  });

  test('it deletes files when there is only a path', () => {
    let originalSelectionFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    });
    let newBulkFileString = '[A/B/C]';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': 'Topic: Preexisting data.\n'
    });

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([
      'topics/A/B/C/Topic.expl'
    ]);
    expect(fileSystemChange.directoryDeletions).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A',
    ]);
    expect(fileSystemChange.fileCreations).toEqual([]);
    expect(fileSystemChange.directoryCreations).toEqual([]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([
      chalk.red('Deleted file: topics/A/B/C/Topic.expl'),
      chalk.red('Deleted directory: topics/A/B/C'),
      chalk.red('Deleted directory: topics/A/B'),
      chalk.red('Deleted directory: topics/A')
    ]);
  });


  test('it deletes files that were selected and then removed from data file', () => {
    let originalSelectionFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n"
    });
    let newBulkFileString = dedent`[A/B/C]

    * Topic: Paragraph.` + '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/C/Topic2.expl': "Topic2: Paragraph.\n"
    });

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([
      'topics/A/B/C/Topic2.expl'
    ]);
    expect(fileSystemChange.directoryDeletions).toEqual([]);
    expect(fileSystemChange.fileCreations).toEqual([]);
    expect(fileSystemChange.directoryCreations).toEqual([]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([
      chalk.red('Deleted file: topics/A/B/C/Topic2.expl')
    ]);
  });

  test('it deletes directories that become unused', () => {
    let originalSelectionFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/D/Topic2.expl': "Topic2: Paragraph.\n"
    });
    let newBulkFileString = dedent`[A/B/C]

    * Topic: Paragraph.`; + '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/D/Topic2.expl': "Topic2: Paragraph.\n"
    });

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([
      'topics/A/B/D/Topic2.expl'
    ]);
    expect(fileSystemChange.directoryDeletions).toEqual([
      'topics/A/B/D'
    ]);
    expect(fileSystemChange.fileCreations).toEqual([]);
    expect(fileSystemChange.directoryCreations).toEqual([]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([
      chalk.red('Deleted file: topics/A/B/D/Topic2.expl'),
      chalk.red('Deleted directory: topics/A/B/D')
    ]);
  });

  test('it deletes directories that become unused, even if two files are being deleted from that directory', () => {
    // This is a more complicated case because we want to make sure we aren't looking at
    // each file and not deleting the directory because the other file still exists, when both are getting deleted

    let originalSelectionFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/D/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/D/Topic3.expl': "Topic3: Paragraph.\n"
    });
    let newBulkFileString = dedent`[A/B/C]

    * Topic: Paragraph.`; + '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/D/Topic2.expl': "Topic2: Paragraph.\n"
    });

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([
      'topics/A/B/D/Topic2.expl',
      'topics/A/B/D/Topic3.expl'
    ]);
    expect(fileSystemChange.directoryDeletions).toEqual([
      'topics/A/B/D'
    ]);
    expect(fileSystemChange.fileCreations).toEqual([]);
    expect(fileSystemChange.directoryCreations).toEqual([]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([
      chalk.red('Deleted file: topics/A/B/D/Topic2.expl'),
      chalk.red('Deleted file: topics/A/B/D/Topic3.expl'),
      chalk.red('Deleted directory: topics/A/B/D')
    ]);
  });

  test('it does not delete directories that still contain non-expl files', () => {
    let originalSelectionFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/D/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/C/README.md': "Hello world.\n",
    });
    let newBulkFileString = '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/C/README.md': "Hello world.\n"
    });

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([
      'topics/A/B/C/Topic.expl',
      'topics/A/B/D/Topic2.expl'
    ]);
    expect(fileSystemChange.directoryDeletions).toEqual([
      'topics/A/B/D',
    ]);
    expect(fileSystemChange.fileCreations).toEqual([]);
    expect(fileSystemChange.directoryCreations).toEqual([]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([
      chalk.red('Deleted file: topics/A/B/C/Topic.expl'),
      chalk.red('Deleted file: topics/A/B/D/Topic2.expl'),
      chalk.red('Deleted directory: topics/A/B/D'),
    ]);
  });

  test('it deletes directories that become unused, even if two levels of directory are being deleted', () => {
    // This is a more complicated case because we want to make sure we aren't looking at
    // the inner directory and using it as a reason not to delete the outer directory when both need to be deleted

    let originalSelectionFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/D/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/D/E/Topic3.expl': "Topic3: Paragraph.\n"
    });
    let newBulkFileString = dedent`[A/B/C]

    * Topic: Paragraph.`; + '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
      'topics/A/B/D/Topic2.expl': "Topic2: Paragraph.\n",
      'topics/A/B/D/E/Topic3.expl': "Topic3: Paragraph.\n"
    });

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([
      'topics/A/B/D/Topic2.expl',
      'topics/A/B/D/E/Topic3.expl'
    ]);
    expect(fileSystemChange.directoryDeletions).toEqual([
      'topics/A/B/D',
      'topics/A/B/D/E'
    ]);
    expect(fileSystemChange.fileCreations).toEqual([]);
    expect(fileSystemChange.directoryCreations).toEqual([]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([
      chalk.red('Deleted file: topics/A/B/D/E/Topic3.expl'),
      chalk.red('Deleted directory: topics/A/B/D/E'),
      chalk.red('Deleted file: topics/A/B/D/Topic2.expl'),
      chalk.red('Deleted directory: topics/A/B/D'),
    ]);
  });

  test("it doesn't delete a directory that was emptied and then filled in the same session", () => {
    // We're worried that the system will notice that after the deletion of A/B/C/Topic.expl
    // the folder A/B/C is empty vis a vis the existing files and will mark it for deletion before
    // seeing that the same session is adding a new subdirectory to that folder so it is needed

    let originalSelectionFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
    });
    let newBulkFileString = dedent`[A/B/C/D]

    * Topic: Paragraph.`; + '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n",
    });

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([
      'topics/A/B/C/Topic.expl',
    ]);
    expect(fileSystemChange.directoryDeletions).toEqual([]);
    expect(fileSystemChange.fileCreations).toEqual([[
      'topics/A/B/C/D/Topic.expl',
      'Topic: Paragraph.\n'
    ]]);
    expect(fileSystemChange.directoryCreations).toEqual([
      'topics/A/B/C/D'
    ]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([
      chalk.red('Deleted file: topics/A/B/C/Topic.expl'),
      chalk.green('Created directory: topics/A/B/C/D'),
      chalk.green('Created file: topics/A/B/C/D/Topic.expl')
    ]);
  });

  test("it properly alphabetizes additions", () => {
    // We're worried that the system will notice that after the deletion of A/B/C/Topic.expl
    // the folder A/B/C is empty vis a vis the existing files and will mark it for deletion before
    // seeing that the same session is adding a new subdirectory to that folder so it is needed

    let originalSelectionFileSet = new FileSet({});
    let newBulkFileString = dedent`[A/B/C]

    * Topic2: Paragraph.

    * Topic: Paragraph.

    [A/B/C/D]

    * Topic3: Paragraph.`; + '\n';
    let bulkFileParser = new BulkFileParser(newBulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();
    let allDiskFileSet = new FileSet({});

    let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
    let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

    expect(fileSystemChange.fileDeletions).toEqual([]);
    expect(fileSystemChange.directoryDeletions).toEqual([]);
    expect(fileSystemChange.fileCreations).toEqual([
      [
        'topics/A/B/C/Topic2.expl',
        'Topic2: Paragraph.\n'
      ],
      [
        'topics/A/B/C/Topic.expl',
        'Topic: Paragraph.\n'
      ],
      [
        'topics/A/B/C/D/Topic3.expl',
        'Topic3: Paragraph.\n'
      ]
    ]);
    expect(fileSystemChange.directoryCreations).toEqual([
      'topics/A/B/C',
      'topics/A/B',
      'topics/A',
      'topics/A/B/C/D',
    ]);
    expect(fileSystemChange.fileAppendings).toEqual([]);

    expect(fileSystemChange.messages).toEqual([
      chalk.green('Created directory: topics/A'),
      chalk.green('Created directory: topics/A/B'),
      chalk.green('Created directory: topics/A/B/C'),
      chalk.green('Created file: topics/A/B/C/Topic.expl'),
      chalk.green('Created file: topics/A/B/C/Topic2.expl'),
      chalk.green('Created directory: topics/A/B/C/D'),
      chalk.green('Created file: topics/A/B/C/D/Topic3.expl')
    ]);
  });
});
