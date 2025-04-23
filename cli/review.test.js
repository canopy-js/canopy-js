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

  it('increments iterations and resets review date if user views file without editing', async () => {
    const modTime = shiftDate(BASE_DATE, 0);
    const dotfileTime = modTime;
    const fakeNow = new Date(shiftDate(BASE_DATE, 1)).getTime();

    const mockFs = {
      existsSync: jest.fn().mockReturnValue(true),
      readFileSync: jest.fn().mockReturnValue(`topics/test.expl ${dotfileTime} 2`),
      writeFileSync: jest.fn(),
      statSync: jest.fn(),
      utimesSync: jest.fn()
    };

    await review({}, {
      fs: mockFs,
      path,
      getExplFileObjects: () => makeExplFileData('topics/test.expl', 'sample content', modTime),
      bulk: jest.fn(),
      now: () => fakeNow,
      log: mockLog
    });

    const content = mockFs.writeFileSync.mock.calls[0][1];
    expect(content).toMatch(`topics/test.expl ${shiftDate(BASE_DATE, 1)} 3`);
  });

  it('resets iterations to 0 if file is edited during review', async () => {
    const lastReview = shiftDate(BASE_DATE, 0);
    const modTimeBefore = new Date(shiftDate(BASE_DATE, 0));
    const modTimeAfter = new Date(shiftDate(BASE_DATE, 1));
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
    expect(content).toMatch(`topics/file.expl ${shiftDate(BASE_DATE, 1)} 0`);
  });

  it('resets iterations to 0 if user edits file independently', async () => {
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

  it('initializes tracking if dotfile does not exist', async () => {
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

  it('ignores older mod time if dotfile date is newer', async () => {
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

  it('handles adds, edits, and deletions during review and logs correctly', async () => {
    const base = shiftDate(BASE_DATE, 0);
    const modTimeBefore = new Date(base);
    const modTimeAfter = new Date(shiftDate(BASE_DATE, 1));
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
        // Simulate: file1 modified, file2 deleted, file3 added
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

    // Check metadata updates
    expect(content).toMatch(`topics/file1.expl ${shiftDate(BASE_DATE, 1)} 0`); // edited → reset
    expect(content).not.toMatch(/file2\.expl/); // deleted
    expect(content).toMatch(`topics/file3.expl ${shiftDate(BASE_DATE, 1)} 0`); // new file added

    // Check plain log output
    expect(plainLog).toMatch(/CHANGED:\s+topics\/file1\.expl/);
    expect(plainLog).toMatch(/DELETED:\s+topics\/file2\.expl/);
    expect(plainLog).toMatch(/NEW:\s+topics\/file3\.expl/);
  });

  it('increments iterations if review is on time', async () => {
    const lastReview = shiftDate(BASE_DATE, 0);
    const fakeNow = new Date(shiftDate(BASE_DATE, 3)).getTime(); // interval = 4, grace = 7 → 3 is within

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

    const content = mockFs.writeFileSync.mock.calls[0][1];
    expect(content).toMatch(`topics/onTime.expl ${shiftDate(BASE_DATE, 3)} 3`);
  });

  it('increments iterations if review is within grace', async () => {
    const lastReview = shiftDate(BASE_DATE, 0);
    const fakeNow = new Date(shiftDate(BASE_DATE, 12)).getTime(); // interval = 8, grace = 7 → total window = 15

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

  it('decrements iterations once when overdue immediately after grace', async () => {
    const lastReview = shiftDate(BASE_DATE, 0);
    const fakeNow = new Date(shiftDate(BASE_DATE, 16)).getTime();
    // iterations = 3 → interval = 8, grace = 7 → grace ends at day 7
    // day 16 = overdue by 9 → penalty = floor(9 / 8) = 1 → drop from 3 to 2

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

  it('decrements multiple levels when far overdue', async () => {
    const lastReview = shiftDate(BASE_DATE, 0);
    const fakeNow = new Date(shiftDate(BASE_DATE, 40)).getTime(); // interval = 8, grace = 7 → overdue = 25 → -3

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

  it('never decrements below 0', async () => {
    const lastReview = shiftDate(BASE_DATE, 0);
    const fakeNow = new Date(shiftDate(BASE_DATE, 30)).getTime(); // interval = 2, grace = 7 → overdue = 21

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
});
