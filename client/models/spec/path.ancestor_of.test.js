jest.clearAllMocks();
jest.mock('../../helpers/getters', () => ({
  __esModule: true,
  canopyContainer: [],
  defaultTopic: jest.fn(() => 'someDefaultTopic'),
  projectPathPrefix: jest.fn(() => 'someDefaultTopic'),
  hashUrls: jest.fn(() => 'someDefaultTopic')
}));

import Path from 'models/path';
import Topic from '../../../cli/shared/topic';

test('path is ancestor of child subtopic path via # boundary', () => {
  const parent = Path.for('/A/B');
  const child = Path.for('/A/B#C');
  expect(parent.ancestorOf(child)).toBe(true);
});

test('path is ancestor of deeper child subtopic path via # boundary', () => {
  const parent = Path.for('/A/B');
  const child = Path.for('/A/B#C/D');
  expect(parent.ancestorOf(child)).toBe(true);
});

test('path is ancestor of child path via / boundary', () => {
  const parent = Path.for('/A/B');
  const child = Path.for('/A/B/C');
  expect(parent.ancestorOf(child)).toBe(true);
});

test('escaped # stays in topic name', () => {
  const parent = Path.for('/A/B');
  const child = Path.for('/A/B%5C#C');
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
  expect(pathA.ancestorOf(pathB)).toBe(false);
  expect(pathB.ancestorOf(pathA)).toBe(false);
});
