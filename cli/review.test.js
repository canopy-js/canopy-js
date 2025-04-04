const review = require('./review');
const path = require('path');

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

  it('applies logarithmic decay: higher levels penalized less for same delay, with floor at 0', async () => {
    const lastReview = shiftDate(BASE_DATE, 0);
    const daysLate = 20;
    const dueDate = shiftDate(BASE_DATE, daysLate);
    const fakeNow = new Date(dueDate).getTime();

    /*
      ┌────────────┬────────────┬──────────┬────────────┬─────────────────────────────────────────────────────┬────────────┐
      │ File       │ Iterations │ Interval │ Days Late  │ Decay breakdown                                     │ Final Iter │
      ├────────────┼────────────┼──────────┼────────────┼─────────────────────────────────────────────────────┼────────────┤
      │ fileA.expl │     4      │   16     │    20      │ grace 16 → overdue 4 → -1 (band 16)                 │     3      │
      │ fileB.expl │     3      │    8     │    20      │ grace 8 → overdue 12 → -1 (8), -1 (4)               │     1      │
      │ fileC.expl │     2      │    4     │    20      │ grace 4 → overdue 16 → -1 (4), -1 (2), -1 (1)       │     0      │
      └────────────┴────────────┴──────────┴────────────┴─────────────────────────────────────────────────────┴────────────┘
    */

    const mockFs = {
      existsSync: jest.fn().mockReturnValue(true),
      readFileSync: jest.fn().mockReturnValue(
        `topics/fileA.expl ${lastReview} 4\n` +
        `topics/fileB.expl ${lastReview} 3\n` +
        `topics/fileC.expl ${lastReview} 2`
      ),
      writeFileSync: jest.fn(),
      statSync: jest.fn(),
      utimesSync: jest.fn()
    };

    await review({ all: true }, {
      fs: mockFs,
      path,
      getExplFileObjects: () => ({
        'topics/fileA.expl': { contents: 'A', isNew: false, modTime: new Date(lastReview).getTime() },
        'topics/fileB.expl': { contents: 'B', isNew: false, modTime: new Date(lastReview).getTime() },
        'topics/fileC.expl': { contents: 'C', isNew: false, modTime: new Date(lastReview).getTime() }
      }),
      bulk: jest.fn(),
      now: () => fakeNow,
      log: mockLog
    });

    const updated = mockFs.writeFileSync.mock.calls[0][1];
    expect(updated).toMatch(`topics/fileA.expl ${dueDate} 3`);
    expect(updated).toMatch(`topics/fileB.expl ${dueDate} 1`);
    expect(updated).toMatch(`topics/fileC.expl ${dueDate} 0`);
  });

  it('applies logarithmic decay: penalty increases faster the more overdue it gets', async () => {
    const lastReview = shiftDate(BASE_DATE, 0);

    /*
      Decay model for n = 4 → interval = 16 → grace = 32
      ┌────────────┬──────────────┬──────────────────────────────────────────────┬────────────┐
      │ daysLate   │ overdue by   │ decay breakdown                              │ Final Iter │
      ├────────────┼──────────────┼──────────────────────────────────────────────┼────────────┤
      │ 36         │ 4            │ 4 into first band (16) = -1                  │     3      │
      │ 52         │ 20           │ -1 (16), -1 (4 of 8) = -2                    │     2      │
      │ 60         │ 28           │ -1 (16), -1 (8), -1 (4 of 4) = -3            │     1      │
      └────────────┴──────────────┴──────────────────────────────────────────────┴────────────┘
    */

    const testCases = [
      { daysLate: 36, expectedLevel: 3 },
      { daysLate: 52, expectedLevel: 2 },
      { daysLate: 60, expectedLevel: 1 }
    ];

    for (const { daysLate, expectedLevel } of testCases) {
      const nowDate = shiftDate(BASE_DATE, daysLate);
      const fakeNow = new Date(nowDate).getTime();

      const mockFs = {
        existsSync: jest.fn().mockReturnValue(true),
        readFileSync: jest.fn().mockReturnValue(`topics/file.expl ${lastReview} 4`),
        writeFileSync: jest.fn(),
        statSync: jest.fn(),
        utimesSync: jest.fn()
      };

      await review({ all: true }, {
        fs: mockFs,
        path,
        getExplFileObjects: () => ({
          'topics/file.expl': {
            contents: 'test',
            isNew: false,
            modTime: new Date(lastReview).getTime()
          }
        }),
        bulk: jest.fn(),
        now: () => fakeNow,
        log: mockLog
      });

      const content = mockFs.writeFileSync.mock.calls[0][1];
      expect(content).toMatch(`topics/file.expl ${nowDate} ${expectedLevel}`);
    }
  });
});
