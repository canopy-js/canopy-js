let FileSystemManager = require('./file_system_manager');
let bulk = require('./bulk');
let BulkFileGenerator = require('./bulk_file_generator');
let BulkFileParser = require('./bulk_file_parser');
let FileSystemChangeCalculator = require('./file_system_change_calculator');
let FileSet = require('./file_set');
let dedent = require('dedent-js');
let chalk = require('chalk');
let fs = require('fs');
let os = require('os');
let path = require('path');
const translateWatchErrorToBulk = require('./translate_watch_error_to_bulk');

function writeFileSyncEnsuringDir(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, 'utf8');
}

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

  test('we pin file most overlapping category path, prefering closer directories', () => {
    // Both candidate filenames contain "Hamlet" contiguously → tie at deepest level:
    //   "Shakespeare's Hamlet" vs "Hamlet" → overlap 6 ("HAMLET")
    //   "Hamlet Act I"         vs "Hamlet" → overlap 6 ("HAMLET")
    // Tie-break one level up at "Shakespeare":
    //   "Shakespeare's Hamlet" vs "Shakespeare" → overlap 11 ("SHAKESPEARE")
    //   "Hamlet Act I"         vs "Shakespeare" → overlap 1  (at best, single-letter)
    // So the new implementation correctly prefers Shakespeare's_Hamlet.
    let originalSelectedFilesByContents = {
      "topics/Literature/Shakespeare/Hamlet/Shakespeare's_Hamlet.expl": "Shakespeare's Hamlet: Long but better match.\n",
      "topics/Literature/Shakespeare/Hamlet/Hamlet_Act_I.expl": "Hamlet Act I: Shorter but worse match.\n",
      "topics/Literature/Shakespeare/Hamlet/Notes.expl": "Notes: Short but not overlapping enclosing folder.\n",
      "topics/Literature/Literature.expl": "Literature: Default topic.\n"
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, "topics/Literature/Literature.expl");
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[Literature]

      ** Literature: Default topic.


      [Literature/Shakespeare/Hamlet]

      * Shakespeare's Hamlet: Long but better match.

      * Hamlet Act I: Shorter but worse match.

      * Notes: Short but not overlapping enclosing folder.` + '\n\n'
    );
  });

  test('it ignores overlap with shared parent directories when choosing pinned file', () => {
    // Regression: the comparator used to consider overlaps against shared parent dirs (e.g. "Binyanim").
    // Longer filenames could accidentally match a 2-letter substring there and "win" over the shorter topic.
    // We now skip shared-dir overlap so the shorter topic is correctly pinned.
    let originalSelectedFilesByContents = {
      'topics/Dikduk/Hebrew/Binyanim/Paal/Tenses/Past/Paal_Past_Tense_for_regular_shorushim.expl': 'Paal Past Tense for regular shorushim: Long.\n',
      'topics/Dikduk/Hebrew/Binyanim/Paal/Tenses/Past/Paal_Past_Tense.expl': 'Paal Past Tense: Short.\n',
      'topics/Dikduk/Dikduk.expl': 'Dikduk: Default.\n'
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/Dikduk/Dikduk.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[Dikduk]

      ** Dikduk: Default.


      [Dikduk/Hebrew/Binyanim/Paal/Tenses/Past]

      * Paal Past Tense: Short.

      * Paal Past Tense for regular shorushim: Long.` + '\n\n'
    );
  });

  test('it penalizes extra topic letters not found in the category path when overlap ties', () => {
    let originalSelectedFilesByContents = {
      'topics/AA/BB/CC/CCD.expl': 'CCD: Fewer extra letters.\n',
      'topics/AA/BB/CC/CCEFG.expl': 'CCEFG: More extra letters.\n',
      'topics/AA/AA.expl': 'AA: Default.\n'
    };

    let fileSet = new FileSet(originalSelectedFilesByContents);
    let bulkFileGenerator = new BulkFileGenerator(fileSet, 'topics/AA/AA.expl');
    let dataFile = bulkFileGenerator.generateBulkFile();

    expect(dataFile).toEqual(
      dedent`[AA]

      ** AA: Default.


      [AA/BB/CC]

      * CCD: Fewer extra letters.

      * CCEFG: More extra letters.` + '\n\n'
    );
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

describe('translateWatchErrorToBulk', () => {
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

  test('it resolves bulk refs using category and subtopic headers', () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-translate-'));

    try {
      process.chdir(tmpDir);

      writeFileSyncEnsuringDir(
        'topics/A/B/Topic.expl',
        [
          'Topic: Root paragraph',
          '',
          'Sub1:',
          'Sub1 line 1',
          'Sub1 line 2',
          '',
          'Sub2:',
          'Sub2 line 1',
          'Sub2 line 2'
        ].join('\n') + '\n'
      );

      writeFileSyncEnsuringDir(
        'Foo.bulk',
        [
          '[Other]',
          '',
          '* Topic: Root paragraph',
          'Sub2:',
          'Sub2 line 1',
          '',
          '[A/B]',
          '',
          '* Topic: Root paragraph',
          '',
          'Sub1:',
          'Sub1 line 1',
          'Sub1 line 2',
          '',
          'Sub2:',
          'Sub2 line 1',
          'Sub2 line 2',
          ''
        ].join('\n')
      );

      const error = new Error(
        [
          'Error: Something went wrong',
          'topics/A/B/Topic.expl:8:5'
        ].join('\n')
      );

      const translated = translateWatchErrorToBulk(error, { sync: true, bulkFileName: 'Foo.bulk' });

      expect(translated.message).toEqual(
        expect.stringContaining('topics/A/B/Topic.expl:8:5\nFoo.bulk:16:5')
      );
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('it appends a diagnostic when a topic header cannot be found in bulk', () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-translate-'));

    try {
      process.chdir(tmpDir);

      writeFileSyncEnsuringDir(
        'topics/A/B/Topic.expl',
        [
          'Topic: Root paragraph',
          'Line 2'
        ].join('\n') + '\n'
      );

      writeFileSyncEnsuringDir(
        'Foo.bulk',
        [
          '[A/B]',
          '',
          '* Different Topic: Root paragraph',
          'Line 2',
          ''
        ].join('\n')
      );

      const error = new Error(
        [
          'Error: Something went wrong',
          'topics/A/B/Topic.expl:1:1'
        ].join('\n')
      );

      const translated = translateWatchErrorToBulk(error, { sync: true, bulkFileName: 'Foo.bulk' });

      expect(translated.message).toEqual(
        expect.stringContaining('Bulk translation skipped: topic header "* Topic" not found under [A/B] in Foo.bulk')
      );
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('BulkFileParser', function() {
  test('it includes bulk file line refs for duplicate topics', () => {
    const bulkFileString = dedent`[A/B]

    * Topic: Paragraph.

    * Topic: Paragraph.
    ` + '\n';

    const bulkFileParser = new BulkFileParser(bulkFileString, 'Foo.bulk');
    expect(() => bulkFileParser.generateFileSet()).toThrow('Foo.bulk:3');
    expect(() => bulkFileParser.generateFileSet()).toThrow('Foo.bulk:5');
    expect(() => bulkFileParser.generateFileSet()).toThrow('> 3 | * Topic: Paragraph.');
    expect(() => bulkFileParser.generateFileSet()).toThrow('> 5 | * Topic: Paragraph.');
  });

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

  test('category headers require a preceding blank line', () => {
    let bulkFileString = dedent`[A/B/C]
    * Topic: Paragraph.
    [X/Y/Z]` + '\n';

    let bulkFileParser = new BulkFileParser(bulkFileString);
    let { newFileSet } = bulkFileParser.generateFileSet();

    expect(newFileSet.fileContentsByPath).toEqual({
      'topics/A/B/C/Topic.expl': "Topic: Paragraph.\n[X/Y/Z]\n"
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

describe('bulk', function() {
  test('finish without selection file overwrites bulk-file disk matches without deleting omitted disk files', async () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-bulk-'));

    try {
      process.chdir(tmpDir);
      writeFileSyncEnsuringDir('topics/A/A.expl', 'A: Old data.\n');
      writeFileSyncEnsuringDir('topics/B/B.expl', 'B: Omitted disk file.\n');
      fs.writeFileSync('canopy_default_topic', 'topics/A/A.expl\n');
      fs.writeFileSync('canopy_bulk_file.bulk', '[A]\n\n* A: New data.\n');

      await bulk([], {
        finish: true,
        bulkFileName: 'canopy_bulk_file.bulk',
        logging: false,
        noBackup: true
      });

      expect(fs.readFileSync('topics/A/A.expl', 'utf8')).toBe('A: New data.\n');
      expect(fs.readFileSync('topics/B/B.expl', 'utf8')).toBe('B: Omitted disk file.\n');
      expect(fs.existsSync('canopy_bulk_file.bulk')).toBe(false);
      expect(fs.existsSync('.canopy_bulk_original_selection')).toBe(false);
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('finish with --all treats every topic file as selected and deletes omitted disk files', async () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-bulk-'));

    try {
      process.chdir(tmpDir);
      writeFileSyncEnsuringDir('topics/A/A.expl', 'A: Old data.\n');
      writeFileSyncEnsuringDir('topics/B/B.expl', 'B: Omitted disk file.\n');
      fs.writeFileSync('canopy_default_topic', 'topics/A/A.expl\n');
      fs.writeFileSync('canopy_bulk_file.bulk', '[A]\n\n* A: New data.\n');

      await bulk([], {
        finish: true,
        all: true,
        bulkFileName: 'canopy_bulk_file.bulk',
        logging: false,
        noBackup: true
      });

      expect(fs.readFileSync('topics/A/A.expl', 'utf8')).toBe('A: New data.\n');
      expect(fs.existsSync('topics/B/B.expl')).toBe(false);
      expect(fs.existsSync('canopy_bulk_file.bulk')).toBe(false);
      expect(fs.existsSync('.canopy_bulk_original_selection')).toBe(false);
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('finish with a recursive directory selector deletes omitted files only within the selected directory', async () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-bulk-'));

    try {
      process.chdir(tmpDir);
      writeFileSyncEnsuringDir('topics/A/Keep.expl', 'Keep: Old data.\n');
      writeFileSyncEnsuringDir('topics/A/Delete.expl', 'Delete: Omitted selected file.\n');
      writeFileSyncEnsuringDir('topics/A/Nested/Delete_nested.expl', 'Delete nested: Omitted selected file.\n');
      writeFileSyncEnsuringDir('topics/B/Outside.expl', 'Outside: Omitted unselected file.\n');
      fs.writeFileSync('canopy_default_topic', 'topics/A/Keep.expl\n');
      fs.writeFileSync('canopy_bulk_file.bulk', '[A]\n\n* Keep: New data.\n');

      await bulk(['topics/A'], {
        finish: true,
        recursive: true,
        bulkFileName: 'canopy_bulk_file.bulk',
        logging: false,
        noBackup: true
      });

      expect(fs.readFileSync('topics/A/Keep.expl', 'utf8')).toBe('Keep: New data.\n');
      expect(fs.existsSync('topics/A/Delete.expl')).toBe(false);
      expect(fs.existsSync('topics/A/Nested/Delete_nested.expl')).toBe(false);
      expect(fs.readFileSync('topics/B/Outside.expl', 'utf8')).toBe('Outside: Omitted unselected file.\n');
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe('FileSystemManager', function() {
  test('it treats fallback files as the original selection when no selection file exists', () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-bulk-fs-'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      process.chdir(tmpDir);
      writeFileSyncEnsuringDir('topics/A/A.expl', 'A: Existing topic.\n');
      writeFileSyncEnsuringDir('topics/B/B.expl', 'B: Existing topic.\n');

      const fileSystemManager = new FileSystemManager();
      const fileSet = fileSystemManager.loadOriginalSelectionFileSet(
        {},
        ['topics/A/A.expl', 'topics/B/B.expl']
      );

      expect(fileSet.fileContentsByPath).toEqual({
        'topics/A/A.expl': 'A: Existing topic.\n',
        'topics/B/B.expl': 'B: Existing topic.\n'
      });
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      errorSpy.mockRestore();
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('it discards bulk backups older than sixty days when writing a backup', () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-bulk-fs-'));

    try {
      process.chdir(tmpDir);
      fs.mkdirSync('.canopy_bulk_backups');
      fs.writeFileSync('.canopy_bulk_backups/canopy_bulk_file.bulk-old', 'old');
      fs.writeFileSync('.canopy_bulk_backups/canopy_bulk_file.bulk-recent', 'recent');
      const now = Date.now();
      const oldDate = new Date(now - (61 * 24 * 60 * 60 * 1000));
      const recentDate = new Date(now - (59 * 24 * 60 * 60 * 1000));
      fs.utimesSync('.canopy_bulk_backups/canopy_bulk_file.bulk-old', oldDate, oldDate);
      fs.utimesSync('.canopy_bulk_backups/canopy_bulk_file.bulk-recent', recentDate, recentDate);

      const fileSystemManager = new FileSystemManager();
      fileSystemManager.backupBulkFile('canopy_bulk_file.bulk', 'new');

      const backups = fs.readdirSync('.canopy_bulk_backups');
      expect(backups).not.toContain('canopy_bulk_file.bulk-old');
      expect(backups).toContain('canopy_bulk_file.bulk-recent');
      expect(backups.length).toBe(2);
    } finally {
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('it keeps multiple bulk backups written in the same second', () => {
    const originalCwd = process.cwd();
    const RealDate = Date;
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-bulk-fs-'));

    try {
      process.chdir(tmpDir);
      const fixedDate = new RealDate('2026-06-14T12:00:00Z');
      global.Date = class extends RealDate {
        constructor(...args) {
          if (args.length) return super(...args);
          return fixedDate;
        }

        static now() {
          return fixedDate.getTime();
        }
      };

      const fileSystemManager = new FileSystemManager();
      fileSystemManager.backupBulkFile('canopy_bulk_file.bulk', 'first');
      fileSystemManager.backupBulkFile('canopy_bulk_file.bulk', 'second');

      const backups = fs.readdirSync('.canopy_bulk_backups').sort();
      expect(backups).toHaveLength(2);
      expect(backups[0]).toMatch(/^canopy_bulk_file\.bulk-\d{14}$/);
      expect(backups[1]).toBe(`${backups[0]}-2`);
      expect(fs.readFileSync(path.join('.canopy_bulk_backups', backups[0]), 'utf8')).toBe('first');
      expect(fs.readFileSync(path.join('.canopy_bulk_backups', backups[1]), 'utf8')).toBe('second');
    } finally {
      global.Date = RealDate;
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('it does not rewrite canopy_default_topic when the default path is unchanged', () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-bulk-fs-'));
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    try {
      process.chdir(tmpDir);
      writeFileSyncEnsuringDir('topics/A/A.expl', 'A: Existing topic.\n');
      fs.writeFileSync('canopy_default_topic', 'topics/A/A.expl\n');

      const originalMtime = fs.statSync('canopy_default_topic').mtimeMs;
      const fileSystemManager = new FileSystemManager();

      fileSystemManager.persistDefaultTopicPath('topics/A/A.expl', 'A');

      expect(fs.readFileSync('canopy_default_topic', 'utf8')).toBe('topics/A/A.expl\n');
      expect(fs.statSync('canopy_default_topic').mtimeMs).toBe(originalMtime);
      expect(logSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('it switches default topic after writes and deletions', () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-bulk-fs-'));
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      process.chdir(tmpDir);
      writeFileSyncEnsuringDir('topics/Old/Old.expl', 'Old: Existing topic.\n');
      fs.writeFileSync('canopy_default_topic', 'topics/Old/Old.expl\n');

      const fileSystemManager = new FileSystemManager();
      const persistDefaultTopicPath = fileSystemManager.persistDefaultTopicPath.bind(fileSystemManager);
      fileSystemManager.persistDefaultTopicPath = (defaultTopicPath, defaultTopicKey) => {
        expect(fs.existsSync('topics/New/New.expl')).toBe(true);
        expect(fs.existsSync('topics/Old/Old.expl')).toBe(false);
        persistDefaultTopicPath(defaultTopicPath, defaultTopicKey);
      };

      let originalSelectionFileSet = new FileSet({
        'topics/Old/Old.expl': 'Old: Existing topic.\n'
      });
      let newFileSet = new FileSet({
        'topics/New/New.expl': 'New: Replacement topic.\n'
      });
      let allDiskFileSet = new FileSet({
        'topics/Old/Old.expl': 'Old: Existing topic.\n'
      });
      let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
      let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

      fileSystemManager.execute(fileSystemChange, false, {
        defaultTopicPath: 'topics/New/New.expl',
        defaultTopicKey: 'New'
      });

      expect(fs.existsSync('topics/New/New.expl')).toBe(true);
      expect(fs.existsSync('topics/Old/Old.expl')).toBe(false);
      expect(fs.readFileSync('canopy_default_topic', 'utf8')).toBe('topics/New/New.expl\n');
    } finally {
      logSpy.mockRestore();
      errorSpy.mockRestore();
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('it refuses to write canopy_default_topic before the default topic exists', () => {
    const originalCwd = process.cwd();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'canopy-bulk-fs-'));
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    try {
      process.chdir(tmpDir);
      writeFileSyncEnsuringDir('topics/Old/Old.expl', 'Old: Existing topic.\n');
      fs.writeFileSync('canopy_default_topic', 'topics/Old/Old.expl\n');

      const fileSystemManager = new FileSystemManager();
      let originalSelectionFileSet = new FileSet({
        'topics/Old/Old.expl': 'Old: Existing topic.\n'
      });
      let newFileSet = new FileSet({});
      let allDiskFileSet = new FileSet({
        'topics/Old/Old.expl': 'Old: Existing topic.\n'
      });
      let fileSystemChangeCalculator = new FileSystemChangeCalculator(newFileSet, originalSelectionFileSet, allDiskFileSet);
      let fileSystemChange = fileSystemChangeCalculator.calculateFileSystemChange();

      expect(() => fileSystemManager.execute(fileSystemChange, false, {
        defaultTopicPath: 'topics/New/New.expl',
        defaultTopicKey: 'New'
      })).toThrow('Error: Cannot write canopy_default_topic because default topic file does not exist yet: topics/New/New.expl');

      expect(fs.readFileSync('canopy_default_topic', 'utf8')).toBe('topics/Old/Old.expl\n');
    } finally {
      logSpy.mockRestore();
      process.chdir(originalCwd);
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
