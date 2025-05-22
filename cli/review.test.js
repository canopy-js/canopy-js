process.env.TZ = 'UTC';

const review = require('./review');
const path = require('path');
const stripAnsi = require('strip-ansi');

function shiftDate(base, days) {
  const shifted = new Date(base);
  shifted.setDate(shifted.getDate() + days);
  return shifted.toISOString();
}

const BASE_DATE = new Date('2025-01-01T00:00:00.000Z');

describe('review function', () => {
  let mockLog;
  beforeEach(() => {
    mockLog = jest.fn();
  });

  function makeExplFileData(filePath, contents, modTime) {
    return {
      [filePath]: {
        contents,
        isNew: true,
        modTime: new Date(modTime).getTime()
      }
    };
  }

  describe('file tracking and user edits outside review', () => {
    it('initializes tracking if dotfile does not exist and logs tracking message', async () => {
      const modTime = shiftDate(BASE_DATE, 10);
      const fakeNow = new Date(shiftDate(BASE_DATE, 15)).getTime(); // after modTime to verify we use modtime not now for last review

      const mockFs = {
        existsSync: jest.fn().mockImplementation(p => p === './topics'),
        readFileSync: jest.fn(),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({ list: true }, {
        fs: mockFs,
        path,
        getExplFileObjects: () => makeExplFileData('topics/test.expl', 'sample content', modTime),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const plainLog = stripAnsi(mockLog.mock.calls.flat().join('\n'));
      expect(plainLog).toMatch(/Tracking new file: topics\/test\.expl with review date/);

      const content = mockFs.writeFileSync.mock.calls[0][1];
      expect(content).toMatch(`topics/test.expl ${modTime} 0`);
    });

    it('adds file to dotfile if not already tracked', async () => {
      const modTime = shiftDate(BASE_DATE, 20);
      const fakeNow = new Date(modTime).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(''),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({ list: true }, {
        fs: mockFs,
        path,
        getExplFileObjects: () => makeExplFileData('topics/newfile.expl', 'new content', modTime),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[0][1];
      expect(content).toMatch(`topics/newfile.expl ${modTime} 0`);
    });

    it('ignores older modtime if dotfile date is newer', async () => {
      const older = shiftDate(BASE_DATE, 0);
      const newer = shiftDate(BASE_DATE, 5);
      const fakeNow = new Date(newer).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/test.expl ${newer} 2`),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({ list: true }, {
        fs: mockFs,
        path,
        getExplFileObjects: () => makeExplFileData('topics/test.expl', 'sample content', older),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[0][1];
      expect(content).toMatch(`topics/test.expl ${newer} 2`);
    });

    it('for user edit outside review, dotfile adopts newer modtime and resets iterations', async () => {
      const modTime = shiftDate(BASE_DATE, 30);
      const dotfileTime = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(modTime).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/test.expl ${dotfileTime} 2`),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({ list: true }, {
        fs: mockFs,
        path,
        getExplFileObjects: () => makeExplFileData('topics/test.expl', 'sample content', modTime),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[0][1];
      expect(content).toMatch(`topics/test.expl ${modTime} 0`);
    });
  });

  describe('review progression for due and overdue files', () => {
    it('does nothing if no files are due', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 0)).getTime(); // same day

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/notDue.expl ${lastReview} 0`),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({}, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/notDue.expl': {
            contents: 'not due',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('No reviews due at this time.'));

      expect(mockFs.writeFileSync.mock.calls[0][1]).toMatch(`topics/notDue.expl ${lastReview} 0`); // original value
    });

    it('for on-time review, increments iterations and updates last reviewed', async () => {
      const lastReview = shiftDate(BASE_DATE, -8); // last reviewed 8 days ago
      const fakeNow = new Date(BASE_DATE).getTime(); // now is Jan 1

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/onTime.expl ${lastReview} 2`),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({}, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/onTime.expl': {
            contents: 'on time',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const plainLog = stripAnsi(mockLog.mock.calls.flat().join('\n'));
      const expectedDue = shiftDate(BASE_DATE, 8).slice(5, 10).replace('-', '/') + '/25';
      expect(plainLog).toMatch(
        new RegExp(`topics/onTime\\.expl \\[last: 0 days\\] \\[iterations: 3\\] \\[due in: 8 days, ${expectedDue}\\]`)
      );

      const content = mockFs.writeFileSync.mock.calls[1][1];
      expect(content).toMatch(`topics/onTime.expl ${BASE_DATE.toISOString()} 3`);
    });

    it('for review within grace period, increments iterations and updates last reviewed', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 12)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/inGrace.expl ${lastReview} 3`),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({}, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/inGrace.expl': {
            contents: 'in grace',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[1][1];
      expect(content).toMatch(`topics/inGrace.expl ${shiftDate(BASE_DATE, 12)} 4`);
    });

    it('for edit during review, resets iterations to 0 and updates last reviewed', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const modTimeBefore = new Date(shiftDate(BASE_DATE, 0));
      const modTimeAfter = new Date(shiftDate(BASE_DATE, 5));
      const fakeNow = modTimeAfter.getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/file.expl ${lastReview} 2`),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      let callCount = 0;
      const getExplFileObjects = () => {
        callCount++;
        return {
          'topics/file.expl': {
            contents: callCount === 1 ? 'original content' : 'modified during review',
            isNew: false,
            modTime: callCount === 1 ? modTimeBefore.getTime() : modTimeAfter.getTime()
          }
        };
      };

      await review({}, {
        fs: mockFs,
        path,
        getExplFileObjects,
        bulk: async () => {},
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[1][1];
      expect(content).toMatch(`topics/file.expl ${shiftDate(BASE_DATE, 5)} 0`);
    });

    it('for slight overdue beyond grace, decrements iterations once', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 16)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/slightlyLate.expl ${lastReview} 3`),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({}, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/slightlyLate.expl': {
            contents: 'late',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[1][1];
      expect(content).toMatch(`topics/slightlyLate.expl ${shiftDate(BASE_DATE, 16)} 2`);
    });

    it('for extreme overdue, decrements iterations multiple times', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 40)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/veryLate.expl ${lastReview} 3`),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({}, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/veryLate.expl': {
            contents: 'very late',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[1][1];
      expect(content).toMatch(`topics/veryLate.expl ${shiftDate(BASE_DATE, 40)} 0`);
    });

    it('never decrements iterations below 0 even if very overdue', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 30)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/minFloor.expl ${lastReview} 1`),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({}, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/minFloor.expl': {
            contents: 'floor test',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[1][1];
      expect(content).toMatch(`topics/minFloor.expl ${shiftDate(BASE_DATE, 30)} 0`);
    });

    it('during review of one file, handles file additions, edits, and deletions correctly', async () => {
      const base = shiftDate(BASE_DATE, 0);
      const modTimeBefore = new Date(base);
      const modTimeAfter = new Date(shiftDate(BASE_DATE, 5));
      const fakeNow = modTimeAfter.getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(
          `topics/file1.expl ${base} 2\n` +
          `topics/file2.expl ${base} 2`
        ),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      let callCount = 0;
      const getExplFileObjects = () => {
        callCount++;
        if (callCount === 1) {
          return {
            'topics/file1.expl': {
              contents: 'original file1',
              isNew: false,
              modTime: modTimeBefore.getTime()
            },
            'topics/file2.expl': {
              contents: 'file2 present',
              isNew: false,
              modTime: modTimeBefore.getTime()
            }
          };
        } else {
          return {
            'topics/file1.expl': {
              contents: 'edited file1',
              isNew: false,
              modTime: modTimeAfter.getTime()
            },
            'topics/file3.expl': {
              contents: 'newly added file',
              isNew: true,
              modTime: modTimeAfter.getTime()
            }
          };
        }
      };

      await review({}, {
        fs: mockFs,
        path,
        getExplFileObjects,
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[1][1];
      const plainLog = stripAnsi(mockLog.mock.calls.flat().join('\n'));

      expect(content).toMatch(`topics/file1.expl ${shiftDate(BASE_DATE, 5)} 0`);
      expect(content).not.toMatch(/file2\.expl/);
      expect(content).toMatch(`topics/file3.expl ${shiftDate(BASE_DATE, 5)} 0`);
      expect(plainLog).toMatch(/EDITED:\s+topics\/file1\.expl/);
      expect(plainLog).toMatch(/DELETED:\s+topics\/file2\.expl/);
      expect(plainLog).toMatch(/NEW:\s+topics\/file3\.expl/);
    });

    it('during review, preserves tracking if no file changes occur', async () => {
    /* If no filesystem changes happen during a review, existing files stay intact and unchanged */
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 5)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(
          `topics/file1.expl ${lastReview} 2\n` +
          `topics/file2.expl ${lastReview} 2`
        ),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      const getExplFileObjects = () => ({
        'topics/file1.expl': {
          contents: 'file1 unchanged',
          isNew: false,
          modTime: new Date(lastReview).getTime()
        },
        'topics/file2.expl': {
          contents: 'file2 unchanged',
          isNew: false,
          modTime: new Date(lastReview).getTime()
        }
      });

      await review({}, {
        fs: mockFs,
        path,
        getExplFileObjects,
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[1][1];
      const plainLog = stripAnsi(mockLog.mock.calls.flat().join('\n'));

      expect(content).toMatch(`topics/file1.expl ${shiftDate(BASE_DATE, 5)} 3`);
      expect(content).toMatch(`topics/file2.expl ${shiftDate(BASE_DATE, 0)} 2`);
      expect(plainLog).not.toMatch(/NEW:/);
      expect(plainLog).not.toMatch(/EDITED:/);
      expect(plainLog).not.toMatch(/DELETED:/);
    });
  });

  describe('various options', () => {
    it('with --list as true or number, prints all or top N files and re-writes unchanged dotfile', async () => {
      const lastReview = shiftDate(BASE_DATE, -10);
      const fakeNow = new Date(BASE_DATE).getTime();

      const dotfileContent =
        `topics/a.expl ${shiftDate(BASE_DATE, -10)} 1\n` +
        `topics/b.expl ${shiftDate(BASE_DATE, -8)} 1\n` +
        `topics/c.expl ${shiftDate(BASE_DATE, -6)} 1\n`;

      const mockFs = {
        existsSync: jest.fn().mockImplementation(p =>
          p === './topics' ||
          p === './.canopy_review_data' ||
          p === './.canopy_review_data.backup'
        ),
        readFileSync: jest.fn().mockReturnValue(dotfileContent),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      const getExplFileObjects = () => ({
        'topics/a.expl': {
          contents: 'a',
          isNew: false,
          modTime: new Date(shiftDate(BASE_DATE, -10)).getTime()
        },
        'topics/b.expl': {
          contents: 'b',
          isNew: false,
          modTime: new Date(shiftDate(BASE_DATE, -8)).getTime()
        },
        'topics/c.expl': {
          contents: 'c',
          isNew: false,
          modTime: new Date(shiftDate(BASE_DATE, -6)).getTime()
        }
      });

      const logTrue = jest.fn();
      await review({ list: true }, {
        fs: mockFs,
        path,
        getExplFileObjects,
        now: () => fakeNow,
        log: logTrue
      });

      const outTrue = stripAnsi(logTrue.mock.calls.flat().join('\n'));
      expect(outTrue).toMatch(/topics\/a\.expl/);
      expect(outTrue).toMatch(/topics\/b\.expl/);
      expect(outTrue).toMatch(/topics\/c\.expl/);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        './.canopy_review_data',
        dotfileContent
      );

      const logTwo = jest.fn();
      await review({ list: 2 }, {
        fs: mockFs,
        path,
        getExplFileObjects,
        now: () => fakeNow,
        log: logTwo
      });

      const outTwo = stripAnsi(logTwo.mock.calls.flat().join('\n'));
      expect(outTwo).toMatch(/topics\/a\.expl/);
      expect(outTwo).toMatch(/topics\/b\.expl/);
      expect(outTwo).not.toMatch(/topics\/c\.expl/);
    });

    it('can can accept --all option as true or as integer for subset review', async () => {
      const lastReview = shiftDate(BASE_DATE, -10);
      const fakeNow = new Date(BASE_DATE).getTime(); // Jan 1

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn()
          .mockReturnValueOnce(
            `topics/one.expl ${lastReview} 2\n` +
            `topics/two.expl ${lastReview} 2\n` +
            `topics/three.expl ${lastReview} 2`
          )
          .mockReturnValueOnce(
            `topics/one.expl ${BASE_DATE.toISOString()} 3\n` +
            `topics/two.expl ${BASE_DATE.toISOString()} 3\n` +
            `topics/three.expl ${lastReview} 2`
          ),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      const getExplFileObjects = () => ({
        'topics/one.expl': {
          contents: '1',
          isNew: false,
          modTime: new Date(lastReview).getTime()
        },
        'topics/two.expl': {
          contents: '2',
          isNew: false,
          modTime: new Date(lastReview).getTime()
        },
        'topics/three.expl': {
          contents: '3',
          isNew: false,
          modTime: new Date(lastReview).getTime()
        }
      });

      const bulk = jest.fn();

      // First review: only 2 files
      await review({ all: 2 }, {
        fs: mockFs,
        path,
        getExplFileObjects,
        bulk,
        now: () => fakeNow,
        log: jest.fn()
      });

      // Second review: remaining file
      await review({ all: true }, {
        fs: mockFs,
        path,
        getExplFileObjects,
        bulk,
        now: () => fakeNow,
        log: jest.fn()
      });

      const content = mockFs.writeFileSync.mock.calls.at(-1)[1].trim().split('\n');

      expect(content).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/topics\/one\.expl .* 3/),
          expect.stringMatching(/topics\/two\.expl .* 3/),
          expect.stringMatching(/topics\/three\.expl .* 3/)
        ])
      );
    });

    it('creates backup before write and supports --undo option', async () => {
      const originalContent = 'topics/foo.expl 2025-01-01T00:00:00.000Z 1\n';
      const modifiedContent = 'topics/foo.expl 2025-01-10T00:00:00.000Z 2\n';

      const lastReviewTime = new Date('2025-01-01T00:00:00.000Z').getTime();
      const fakeNow = new Date('2025-01-10T00:00:00.000Z').getTime();

      const mockFs = {
        existsSync: jest.fn().mockImplementation((p) =>
          p === './topics' ||
          p === './.canopy_review_data' ||
          p === './.canopy_review_data.backup'
        ),
        readFileSync: jest.fn()
          .mockImplementationOnce(() => originalContent) // before review
          .mockImplementationOnce(() => originalContent) // maybe from backup
          .mockImplementationOnce(() => modifiedContent) // now current dotfile
          .mockImplementationOnce(() => originalContent), // backup used in undo
        copyFileSync: jest.fn(),
        writeFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      const filePath = 'topics/foo.expl';

      // Simulate review that updates the dotfile
      await review({}, {
        fs: mockFs,
        path,
        getExplFileObjects: jest
          .fn()
          .mockImplementationOnce(() => ({
            [filePath]: {
              contents: 'unchanged',
              isNew: false,
              modTime: lastReviewTime
            }
          }))
          .mockImplementationOnce(() => ({
            [filePath]: {
              contents: 'changed',
              isNew: false,
              modTime: lastReviewTime
            }
          })),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        './.canopy_review_data',
        './.canopy_review_data.backup'
      );

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        './.canopy_review_data',
        modifiedContent
      );

      mockLog.mockClear();
      mockFs.copyFileSync.mockClear();

      // Simulate undo
      await review({ undo: true }, {
        fs: mockFs,
        path,
        getExplFileObjects: jest.fn(),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const flatLog = stripAnsi(mockLog.mock.calls.flat().join('\n'));
      expect(flatLog).toMatch(/Undo complete/);
      expect(flatLog).toMatch(/topics\/foo\.expl \[last: \d+ days\] \[iterations: 1\]/);
    });

    it('with --touch, resets selected files and backs up original dotfile before overwrite', async () => {
      const lastReview = shiftDate(BASE_DATE, -20);
      const fakeNowISO = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(fakeNowISO).getTime();

      const originalDotfile = [
        `topics/one.expl ${lastReview} 2`,
        `topics/two.expl ${lastReview} 3`,
        `topics/three.expl ${lastReview} 1`
      ].join('\n');

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(originalDotfile),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      const getExplFileObjects = () => ({
        'topics/one.expl': {
          contents: '1',
          isNew: false,
          modTime: new Date(lastReview).getTime()
        },
        'topics/two.expl': {
          contents: '2',
          isNew: false,
          modTime: new Date(lastReview).getTime()
        },
        'topics/three.expl': {
          contents: '3',
          isNew: false,
          modTime: new Date(lastReview).getTime()
        }
      });

      const selected = ['topics/two.expl', 'topics/three.expl'];

      await review({ touch: true }, {
        fs: mockFs,
        path,
        getExplFileObjects,
        fzfSelect: jest.fn().mockResolvedValue(selected),
        now: () => fakeNow,
        log: jest.fn()
      });

      const updatedDotfile = mockFs.writeFileSync.mock.calls[0][1].trim().split('\n');

      expect(updatedDotfile).toEqual(
        expect.arrayContaining([
          `topics/one.expl ${lastReview} 2`,
          `topics/two.expl ${fakeNowISO} 0`,
          `topics/three.expl ${fakeNowISO} 0`
        ])
      );

      // Backup was created
      expect(mockFs.copyFileSync).toHaveBeenCalledWith(
        './.canopy_review_data',
        './.canopy_review_data.backup'
      );

      // Backup happened before overwriting the dotfile
      expect(mockFs.copyFileSync.mock.invocationCallOrder[0])
        .toBeLessThan(mockFs.writeFileSync.mock.invocationCallOrder[0]);
    });

    it('with --reset, replaces selected files in dotfile with versions from backup', async () => {
      const fakeNowISO = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(fakeNowISO).getTime();

      const originalDotfile = [
        `topics/one.expl ${shiftDate(BASE_DATE, -10)} 2`,
        `topics/two.expl ${shiftDate(BASE_DATE, -10)} 3`,
        `topics/three.expl ${shiftDate(BASE_DATE, -10)} 1`
      ].join('\n');

      const backupDotfile = [
        `topics/one.expl ${shiftDate(BASE_DATE, -20)} 1`,
        `topics/two.expl ${shiftDate(BASE_DATE, -15)} 2`,
        `topics/three.expl ${shiftDate(BASE_DATE, -10)} 1`
      ].join('\n');

      const mockFs = {
        existsSync: jest.fn().mockImplementation(p =>
          p === './topics' ||
          p === './.canopy_review_data' ||
          p === './.canopy_review_data.backup'
        ),
        readFileSync: jest.fn().mockImplementation(p => {
          if (p === './.canopy_review_data') return originalDotfile;
          if (p === './.canopy_review_data.backup') return backupDotfile;
        }),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      const selected = ['topics/one.expl', 'topics/two.expl'];

      const mockLog = jest.fn();

      await review({ reset: true }, {
        fs: mockFs,
        path,
        fzfSelect: jest.fn().mockResolvedValue(selected),
        getExplFileObjects: jest.fn().mockReturnValue({
           'topics/one.expl': { modTime: fakeNow },
           'topics/two.expl': { modTime: fakeNow },
           'topics/three.expl': { modTime: fakeNow }
         }),
        now: () => fakeNow,
        log: mockLog
      });

      const updated = mockFs.writeFileSync.mock.calls[0][1].trim().split('\n');

      // one.expl and two.expl should match the backup
      expect(updated).toEqual(
        expect.arrayContaining([
          `topics/one.expl ${shiftDate(BASE_DATE, -20)} 1`,
          `topics/two.expl ${shiftDate(BASE_DATE, -15)} 2`,
          `topics/three.expl ${shiftDate(BASE_DATE, -10)} 1` // untouched
        ])
      );

      // log output contains standard lines
      const flatLog = mockLog.mock.calls.flat().join('\n');
      expect(flatLog).toMatch(/topics\/one\.expl/);
      expect(flatLog).toMatch(/topics\/two\.expl/);
      expect(flatLog).not.toMatch(/topics\/three\.expl/);
    });

    it('with --select, only reviews files whose paths contain the substring', async () => {
      const lastReview = shiftDate(BASE_DATE, -10); // all files are due
      const fakeNow = new Date(BASE_DATE).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(
          `topics/math.expl ${lastReview} 2\n` +
          `topics/history.expl ${lastReview} 2\n` +
          `topics/science.expl ${lastReview} 2`
        ),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      const getExplFileObjects = () => ({
        'topics/math.expl': {
          contents: 'math',
          isNew: false,
          modTime: new Date(lastReview).getTime()
        },
        'topics/history.expl': {
          contents: 'history',
          isNew: false,
          modTime: new Date(lastReview).getTime()
        },
        'topics/science.expl': {
          contents: 'science',
          isNew: false,
          modTime: new Date(lastReview).getTime()
        }
      });

      await review({ all: true, select: ['math', 'science'] }, {
        fs: mockFs,
        path,
        getExplFileObjects,
        bulk: jest.fn(),
        now: () => fakeNow,
        log: jest.fn()
      });

      const content = mockFs.writeFileSync.mock.calls[1][1];
      const updated = content.split('\n').filter(Boolean);
      expect(updated).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/topics\/math\.expl .* 3/),
          expect.stringMatching(/topics\/science\.expl .* 3/)
        ])
      );
      expect(updated).not.toEqual(
        expect.arrayContaining([
          expect.stringMatching(/topics\/history\.expl .* 3/)
        ])
      );
    });

    it('excludes matching files from review using --exclude', async () => {
      const lastReview = shiftDate(BASE_DATE, -10);
      const fakeNow = new Date(BASE_DATE).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(
          `topics/keep.expl ${lastReview} 2\n` +
          `topics/exclude-me.expl ${lastReview} 2`
        ),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({ all: true, exclude: ['exclude-me'] }, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/keep.expl': {
            contents: 'keep',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          },
          'topics/exclude-me.expl': {
            contents: 'ignore this',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[1][1];
      expect(content).toMatch(/topics\/keep\.expl .* 3/);
      expect(content).toMatch(/topics\/exclude-me\.expl .* 2/); // unchanged
    });

    it('filters review list using --pick selection', async () => {
      const lastReview = shiftDate(BASE_DATE, -10);
      const fakeNow = new Date(BASE_DATE).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(
          `topics/one.expl ${lastReview} 2\n` +
          `topics/two.expl ${lastReview} 2`
        ),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      const selected = ['topics/two.expl'];

      await review({ all: true, pick: true }, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/one.expl': {
            contents: 'one',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          },
          'topics/two.expl': {
            contents: 'two',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog,
        fzfSelect: jest.fn().mockResolvedValue(selected)
      });

      const content = mockFs.writeFileSync.mock.calls[1][1];
      expect(content).toMatch(/topics\/two\.expl .* 3/);
      expect(content).toMatch(/topics\/one\.expl .* 2/); // still tracked, but not incremented
    });

    it('shows correct status summary in --status mode', async () => {
      const mockLog = jest.fn();
      const fakeNow = new Date('2025-01-15T00:00:00.000Z').getTime(); // Jan 15

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(
          [
            'topics/due.expl 2025-01-14T00:00:00.000Z 0',        // due now (1-day interval, 1 day ago)
            'topics/overdue.expl 2024-12-20T00:00:00.000Z 2',    // overdue (interval 4, grace 7, 26 days late)
            'topics/upnext.expl 2025-01-10T00:00:00.000Z 3',     // up next (due in 3)
            'topics/later.expl 2025-01-01T00:00:00.000Z 5'       // later (due in ~17)
          ].join('\n')
        ),
        writeFileSync: jest.fn(),
        copyFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      const getExplFileObjects = () => ({
        'topics/due.expl': {
          contents: 'due',
          isNew: false,
          modTime: new Date('2025-01-14T00:00:00.000Z').getTime()
        },
        'topics/overdue.expl': {
          contents: 'overdue',
          isNew: false,
          modTime: new Date('2024-12-20T00:00:00.000Z').getTime()
        },
        'topics/upnext.expl': {
          contents: 'upnext',
          isNew: false,
          modTime: new Date('2025-01-10T00:00:00.000Z').getTime()
        },
        'topics/later.expl': {
          contents: 'later',
          isNew: false,
          modTime: new Date('2025-01-01T00:00:00.000Z').getTime()
        }
      });

      await review({ status: true }, {
        fs: mockFs,
        path: require('path'),
        getExplFileObjects,
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const output = mockLog.mock.calls.flat().join(' ');
      expect(output).toMatch(/\[overdue: 1\]/);
      expect(output).toMatch(/\[due now: 1\]/);
      expect(output).toMatch(/\[up next: 1\]/);
      expect(output).toMatch(/\[later: 1\]/);
    });
  });
});
