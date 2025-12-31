jest.clearAllMocks();
jest.mock('../../helpers/getters', () => ({
  __esModule: true,
  canopyContainer: [],
  defaultTopic: jest.fn(() => 'someDefaultTopic'),
  projectPathPrefix: jest.fn(() => ''),
  hashUrls: jest.fn(() => false)
}));

import Path from 'models/path';

describe('Path.reduce', () => {
  test('no cycle returns self', () => {
    expect(Path.for('/A/B').reduce().string).toBe('/A/B');
  });

  test('collapses back to first repeated topic', () => {
    expect(Path.for('/A/B/C/A').reduce().string).toBe('/A');
  });

  test('removes repeated portion and keeps tail', () => {
    expect(Path.for('/A/B/C/D/E/A/B/C/E').reduce().string).toBe('/A/B/C/E');
  });

  test('handles mixed segments', () => {
    expect(Path.for('/A/B#C/A/B#D/E').reduce().string).toBe('/A/B#D/E');
  });
});
