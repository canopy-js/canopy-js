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
      const fakeNow = new Date(modTime).getTime();

      const mockFs = {
        existsSync: jest.fn().mockImplementation(p => p === './topics'),
        readFileSync: jest.fn(),
        writeFileSync: jest.fn(),
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

    it('in list mode, re-writes dotfile exactly when nothing has changed', async () => {
      // Setup: one file whose modTime equals the dotfile’s lastReviewed
      const lastReview = shiftDate(BASE_DATE, 0);
      const initialData = `topics/foo.expl ${lastReview} 2\n`;

      const fakeNow = new Date(shiftDate(BASE_DATE, 1)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockImplementation(p =>
          p === './topics' || p === './.canopy_review_data'
        ),
        readFileSync: jest.fn().mockReturnValue(initialData),
        writeFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({ list: true }, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/foo.expl': {
            contents: 'unchanged',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      // It should still re-write the dotfile, but with exactly the same contents
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        './.canopy_review_data',
        initialData
      );
    });

    it('does not modify dotfile if review is aborted by editor error', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 5)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/aborted.expl ${lastReview} 1`),
        writeFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({}, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/aborted.expl': {
            contents: 'pre-review',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn().mockRejectedValue(new Error('simulated editor failure')),
        now: () => fakeNow,
        log: mockLog
      });

      const plainLog = stripAnsi(mockLog.mock.calls.flat().join('\n'));
      expect(plainLog).toMatch(/Review aborted/);
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('review progression for due and overdue files', () => {
    it('does nothing no files are due', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 0)).getTime(); // same day

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/notDue.expl ${lastReview} 0`),
        writeFileSync: jest.fn(),
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
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });

    it('for on-time review, increments iterations and updates last reviewed', async () => {
      const lastReview = shiftDate(BASE_DATE, -8); // last reviewed 8 days ago
      const fakeNow = new Date(BASE_DATE).getTime(); // now is Jan 1

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/onTime.expl ${lastReview} 2`),
        writeFileSync: jest.fn(),
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

      const content = mockFs.writeFileSync.mock.calls[0][1];
      expect(content).toMatch(`topics/onTime.expl ${BASE_DATE.toISOString()} 3`);
    });

    it('for review within grace period, increments iterations and updates last reviewed', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 12)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/inGrace.expl ${lastReview} 3`),
        writeFileSync: jest.fn(),
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

      const content = mockFs.writeFileSync.mock.calls[0][1];
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

      const content = mockFs.writeFileSync.mock.calls[0][1];
      expect(content).toMatch(`topics/file.expl ${shiftDate(BASE_DATE, 5)} 0`);
    });

    it('for slight overdue beyond grace, decrements iterations once', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 16)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/slightlyLate.expl ${lastReview} 3`),
        writeFileSync: jest.fn(),
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

      const content = mockFs.writeFileSync.mock.calls[0][1];
      expect(content).toMatch(`topics/slightlyLate.expl ${shiftDate(BASE_DATE, 16)} 2`);
    });

    it('for extreme overdue, decrements iterations multiple times', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 40)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/veryLate.expl ${lastReview} 3`),
        writeFileSync: jest.fn(),
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

      const content = mockFs.writeFileSync.mock.calls[0][1];
      expect(content).toMatch(`topics/veryLate.expl ${shiftDate(BASE_DATE, 40)} 0`);
    });

    it('never decrements iterations below 0 even if very overdue', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 30)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/minFloor.expl ${lastReview} 1`),
        writeFileSync: jest.fn(),
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

      const content = mockFs.writeFileSync.mock.calls[0][1];
      expect(content).toMatch(`topics/minFloor.expl ${shiftDate(BASE_DATE, 30)} 0`);
    });

    it('with --all as a number, reviews only that many due files', async () => {
      const lastReview = shiftDate(BASE_DATE, -10);
      const fakeNow = new Date(BASE_DATE).getTime(); // now is Jan 1

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(
          `topics/one.expl ${lastReview} 2\n` +
          `topics/two.expl ${lastReview} 2\n` +
          `topics/three.expl ${lastReview} 2`
        ),
        writeFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({ all: 2 }, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
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
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[0][1];
      const updated = content.split('\n').filter(Boolean);
      expect(updated.length).toBeGreaterThanOrEqual(2);
      expect(updated).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/topics\/one\.expl .* 3/),
          expect.stringMatching(/topics\/two\.expl .* 3/)
        ])
      );
      expect(updated).not.toEqual(
        expect.arrayContaining([
          expect.stringMatching(/topics\/three\.expl .* 3/)
        ])
      );
    });
  });

  describe('handling live file changes during active review', () => {

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

      const content = mockFs.writeFileSync.mock.calls[0][1];
      const plainLog = stripAnsi(mockLog.mock.calls.flat().join('\n'));

      expect(content).toMatch(`topics/file1.expl ${shiftDate(BASE_DATE, 5)} 0`);
      expect(content).not.toMatch(/file2\.expl/);
      expect(content).toMatch(`topics/file3.expl ${shiftDate(BASE_DATE, 5)} 0`);
      expect(plainLog).toMatch(/EDITED:\s+topics\/file1\.expl/);
      expect(plainLog).toMatch(/DELETED:\s+topics\/file2\.expl/);
      expect(plainLog).toMatch(/NEW:\s+topics\/file3\.expl/);
    });

    it('for --all, reviews multiple due files', async () => {
      const lastReview = shiftDate(BASE_DATE, 0);
      const fakeNow = new Date(shiftDate(BASE_DATE, 5)).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(
          `topics/fileA.expl ${lastReview} 2\n` +
          `topics/fileB.expl ${lastReview} 2`
        ),
        writeFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({ all: true }, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/fileA.expl': {
            contents: 'A',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          },
          'topics/fileB.expl': {
            contents: 'B',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[0][1];
      expect(content).toMatch(`topics/fileA.expl ${shiftDate(BASE_DATE, 5)} 3`);
      expect(content).toMatch(`topics/fileB.expl ${shiftDate(BASE_DATE, 5)} 3`);
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

      const content = mockFs.writeFileSync.mock.calls[0][1];
      const plainLog = stripAnsi(mockLog.mock.calls.flat().join('\n'));

      expect(content).toMatch(`topics/file1.expl ${shiftDate(BASE_DATE, 5)} 3`);
      expect(content).toMatch(`topics/file2.expl ${shiftDate(BASE_DATE, 0)} 2`);
      expect(plainLog).not.toMatch(/NEW:/);
      expect(plainLog).not.toMatch(/EDITED:/);
      expect(plainLog).not.toMatch(/DELETED:/);
    });
  });
});
