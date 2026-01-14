jest.clearAllMocks();
jest.mock('../../helpers/getters', () => ({
  __esModule: true,
  canopyContainer: [],
  defaultTopic: jest.fn(() => 'someDefaultTopic'),
  projectPathPrefix: jest.fn(() => ''),
  hashUrls: jest.fn(() => false)
}));

import Path from 'models/path';
import Topic from '../../../cli/shared/topic';

// Helper to stub parentPath on specific instances.
function setParent(child, parent) {
  Object.defineProperty(child, 'parentPath', {
    get: () => parent,
    configurable: true
  });
}

function setParagraph(path) {
  Object.defineProperty(path, 'paragraph', {
    get: () => ({}),
    configurable: true
  });
}

describe('Path.ancestorOf', () => {
  test('ancestor across segments', () => {
    expect(Path.for('/A/B').ancestorOf(Path.for('/A/B/C'))).toBe(true);
  });

  test('ancestor across subtopics', () => {
    expect(Path.for('/A/B').ancestorOf(Path.for('/A/B#C'))).toBe(true);
  });

  test('ancestor across deeper subtopics', () => {
    expect(Path.for('/A/B').ancestorOf(Path.for('/A/B#C/D'))).toBe(true);
  });

  test('escaped # stays in topic name', () => {
    const parent = Path.for('/A/B');
    const child = Path.for('/A/B%5C#C');
    setParagraph(parent);
    setParagraph(child);
    expect(parent.ancestorOf(child)).toBe(false);
  });

  test('escaped backslash before subtopic boundary still allows match', () => {
    const A = Topic.fromMixedCase('A');
    const B = Topic.fromMixedCase('B\\');
    const C = Topic.fromMixedCase('C');
    const parent = Path.for([[A, A], [B, B]]);
    const child = Path.for([[A, A], [B, C]]);
    expect(child.string.startsWith(`${parent.string}#`)).toBe(true);
    expect(parent.ancestorOf(child)).toBe(true);
  });

  test('unrelated paths are not ancestors', () => {
    const pathA = Path.for('/A/B');
    const pathB = Path.for('/C/D');
    setParagraph(pathA);
    setParagraph(pathB);
    expect(pathA.ancestorOf(pathB)).toBe(false);
    expect(pathB.ancestorOf(pathA)).toBe(false);
  });

  test('diverging topics at same index short-circuit without DOM', () => {
    const left = Path.for('/A#B/C');
    const right = Path.for('/A#C/E');

    expect(left.ancestorOf(right)).toBe(false);
    expect(right.ancestorOf(left)).toBe(false);
  });

  test('shared subtopic parent is detected as ancestor', () => {
    const sharedSubtopicParent = Path.for('/United_States#NYC');
    const manhattan = Path.for('/United_States#Manhattan');
    const longIsland = Path.for('/United_States#Long_Island');
    setParagraph(sharedSubtopicParent);
    setParagraph(manhattan);
    setParagraph(longIsland);

    const sliceStubs = [
      {
        thisPath: manhattan.string,
        args: [0, 1],
        result: Path.for('/United_States#Manhattan')
      },
      {
        thisPath: longIsland.string,
        args: [0, 1],
        result: Path.for('/United_States#Long_Island')
      }
    ];

    sliceStubs.forEach(({ result }) => setParent(result, sharedSubtopicParent));

    const originalSlice = Path.prototype.slice;
    const sliceSpy = jest.spyOn(Path.prototype, 'slice').mockImplementation(function (...args) {
      const match = sliceStubs.find((stub) =>
        this.string === stub.thisPath &&
        args[0] === stub.args[0] &&
        args[1] === stub.args[1]
      );
      return match ? match.result : originalSlice.apply(this, args);
    });

    expect(sharedSubtopicParent.ancestorOf(manhattan)).toBe(true);
    expect(sharedSubtopicParent.ancestorOf(longIsland)).toBe(true);
    expect(manhattan.ancestorOf(longIsland)).toBe(false);

    sliceSpy.mockRestore();
  });

  test('Does not need parentPath stubbing for lexical ancestor even with deep child', () => {
    const root = Path.for('/A');
    const grandchild = Path.for('/A/B/C#D');

    expect(root.ancestorOf(grandchild)).toBe(true);
  });
});
