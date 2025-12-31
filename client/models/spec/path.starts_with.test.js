jest.clearAllMocks();
jest.mock('../../helpers/getters', () => ({
  __esModule: true,
  canopyContainer: [],
  defaultTopic: jest.fn(() => 'someDefaultTopic'),
  projectPathPrefix: jest.fn(() => ''),
  hashUrls: jest.fn(() => false)
}));

import Path from 'models/path';

describe('Path.startsWith / startsWithSegments', () => {
  test('exact match counts as startsWith', () => {
    const a = Path.for('/A/B#C');
    expect(a.startsWith(Path.for('/A/B#C'))).toBe(true);
    expect(a.startsWithSegments(Path.for('/A/B#C'))).toBe(true);
  });

  test('topic-level prefix matches subtopic child', () => {
    expect(Path.for('/A/B#C').startsWith(Path.for('/A/B'))).toBe(true);
  });

  test('segment prefix requires full segment equality', () => {
    expect(Path.for('/A/B#C').startsWithSegments(Path.for('/A/B'))).toBe(false);
  });

  test('false when prefix longer', () => {
    expect(Path.for('/A/B').startsWith(Path.for('/A/B/C'))).toBe(false);
    expect(Path.for('/A/B').startsWithSegments(Path.for('/A/B/C'))).toBe(false);
  });

  test('divergent subtopic fails startsWithSegments', () => {
    expect(Path.for('/A/B#C').startsWithSegments(Path.for('/A/B#D'))).toBe(false);
  });
});
