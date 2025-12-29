jest.clearAllMocks();
jest.mock('../../helpers/getters', () => ({
  __esModule: true,
  canopyContainer: [],
  defaultTopic: jest.fn(() => 'someDefaultTopic'),
  projectPathPrefix: jest.fn(() => 'someDefaultTopic'),
  hashUrls: jest.fn(() => 'someDefaultTopic')
}));

import Path from 'models/path';

describe('Path.reduce', () => {
  test('returns same path when no cycle', () => {
    const path = Path.for('/A/B/C');
    expect(path.reduce().string).toBe('/A/B/C');
  });

  test('collapses simple cycle to root occurrence', () => {
    const path = Path.for('/A/B/C/A');
    expect(path.reduce().string).toBe('/A');
  });

  test('removes repeated portion and appends new tail', () => {
    const path = Path.for('/A/B/C/D/E/A/B/C/E');
    expect(path.reduce().string).toBe('/A/B/C/E');
  });

  test('handles cycles within mixed topic/subtopic segments', () => {
    const path = Path.for('/A/B#C/A/B#D/E');
    expect(path.reduce().string).toBe('/A/B#D/E');
  });
});
