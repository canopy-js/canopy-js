jest.clearAllMocks();
jest.mock('../../helpers/getters', () => ({
  __esModule: true,
  canopyContainer: [],
  defaultTopic: jest.fn(() => 'someDefaultTopic'),
  projectPathPrefix: jest.fn(() => ''),
  hashUrls: jest.fn(() => false)
}));

import Path from 'models/path';

function setParent(child, parent) {
  Object.defineProperty(child, 'parentPath', {
    get: () => parent,
    configurable: true
  });
}

describe('Path.initialLexicalOverlap', () => {
  test('diverging subtopic returns topic boundary', () => {
    const overlap = Path.for('/A/B#C').initialLexicalOverlap(Path.for('/A/B#D'));
    expect(overlap?.string).toBe('/A/B');
  });

  test('identical paths return full path', () => {
    const overlap = Path.for('/A/B#C').initialLexicalOverlap(Path.for('/A/B#C'));
    expect(overlap?.string).toBe('/A/B#C');
  });

  test('non-overlapping paths returns null', () => {
    const overlap = Path.for('/A/B').initialLexicalOverlap(Path.for('/C/D'));
    expect(overlap).toBeNull();
  });

  test('diverging topic within later segment returns shared prefix', () => {
    const overlap = Path.for('/A/B/C').initialLexicalOverlap(Path.for('/A/B/D'));
    expect(overlap?.string).toBe('/A/B');
  });

  test('shorter path returns full shorter path when it is a prefix', () => {
    const overlap = Path.for('/A/B').initialLexicalOverlap(Path.for('/A/B/C'));
    expect(overlap?.string).toBe('/A/B');
  });

  test('diverging subtopic after shared segments returns last shared segment', () => {
    const overlap = Path.for('/A/B#C/D').initialLexicalOverlap(Path.for('/A/B#C/E'));
    expect(overlap?.string).toBe('/A/B#C');
  });

  test('differing topic after diverging subtopic returns prior topic', () => {
    const overlap = Path.for('/A/B#C/E').initialLexicalOverlap(Path.for('/A/B#D/F'));
    expect(overlap?.string).toBe('/A/B');
  });
});

describe('Path.initialOverlap', () => {
  test('returns full path when equal', () => {
    const overlap = Path.for('/A/B#C').initialOverlap(Path.for('/A/B#C'));
    expect(overlap?.string).toBe('/A/B#C');
  });

  test('returns null when first segments differ', () => {
    const overlap = Path.for('/A/B').initialOverlap(Path.for('/C/D'));
    expect(overlap).toBeNull();
  });

  test('returns shorter path when it is a prefix', () => {
    const overlap = Path.for('/A/B').initialOverlap(Path.for('/A/B/C'));
    expect(overlap?.string).toBe('/A/B');
  });

  test('uses lexical overlap for sibling topics', () => {
    const overlap = Path.for('/A/B/C').initialOverlap(Path.for('/A/B/D'));
    expect(overlap?.string).toBe('/A/B');
  });

  test('uses lexical overlap for topic#topic vs topic#subtopic', () => {
    const overlap = Path.for('/A/B/C').initialOverlap(Path.for('/A/B/C#D'));
    expect(overlap?.string).toBe('/A/B/C');
  });

  test('prefers shared subtopic parent before lexical overlap', () => {
    const sharedSubtopicParent = Path.for('/United_States#NYC');
    const manhattan = Path.for('/United_States#Manhattan');
    const longIsland = Path.for('/United_States#Long_Island');

    setParent(manhattan, sharedSubtopicParent);
    setParent(longIsland, sharedSubtopicParent);

    expect(manhattan.initialOverlap(longIsland).string).toBe('/United_States#NYC');
  });

  test('uses shared lexical parent when leaf segment is single-topic', () => {
    const root = Path.for('/A/B');
    const parent = Path.for('/A/B#C');
    const leaf = Path.for('/A/B#D/E');
    const truncated = Path.for('/A/B#D');
    const sibling = Path.for('/A/B#F');

    setParent(parent, root);
    setParent(leaf, parent);
    setParent(truncated, parent);
    setParent(sibling, parent);
    const originalSlice = leaf.slice.bind(leaf);
    leaf.slice = (...args) => (args[0] === 0 && args[1] === 2 ? truncated : originalSlice(...args));
    const originalSiblingSlice = sibling.slice.bind(sibling);
    sibling.slice = (...args) => (args[0] === 0 && args[1] === 2 ? sibling : originalSiblingSlice(...args));

    expect(leaf.initialOverlap(sibling).string).toBe('/A/B#C');
  });
});
