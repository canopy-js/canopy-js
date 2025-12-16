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

test('just topic', () => {
  const pathString = '/Topic';
  const array = Path.stringToArray(pathString);
  expect(array).toEqual([[Topic.fromMixedCase('Topic'), Topic.fromMixedCase('Topic')]]);
});

test('topic and subtopic', () => {
  const pathString = '/Topic#Subtopic';
  const array = Path.stringToArray(pathString);
  expect(array).toEqual([[Topic.fromMixedCase('Topic'), Topic.fromMixedCase('Subtopic')]]);
});

test('topic and subtopic and topic', () => {
  const pathString = '/Topic#Subtopic/Topic2';
  const array = Path.stringToArray(pathString);
  expect(array).toEqual([[Topic.fromMixedCase('Topic'), Topic.fromMixedCase('Subtopic')], [Topic.fromMixedCase('Topic2'), Topic.fromMixedCase('Topic2')]]);
});

test('two topics and subtopics', () => {
  const pathString = '/Topic#Subtopic/Topic2#Subtopic2';
  const array = Path.stringToArray(pathString);
  expect(array).toEqual([[Topic.fromMixedCase('Topic'), Topic.fromMixedCase('Subtopic')], [Topic.fromMixedCase('Topic2'), Topic.fromMixedCase('Subtopic2')]]);
});

test('lone subtopic', () => {
  const pathString = '/Topic#Subtopic/#Subtopic2';
  const array = Path.stringToArray(pathString);
  expect(array).toEqual(
    [
      [Topic.fromMixedCase('Topic'), Topic.fromMixedCase('Subtopic')],
      [Topic.fromMixedCase('Subtopic2'), Topic.fromMixedCase('Subtopic2')]
    ]
  );
});

test('empty segment', () => {
  const pathString = '/Topic#Subtopic/#';
  const array = Path.stringToArray(pathString);
  expect(array).toEqual([[Topic.fromMixedCase('Topic'), Topic.fromMixedCase('Subtopic')]]);
});

test('No initial subtopic', () => {
  const pathString = '/Topic/Topic2#Subtopic';
  const array = Path.stringToArray(pathString);
  expect(array).toEqual([[Topic.fromMixedCase('Topic'), Topic.fromMixedCase('Topic')], [Topic.fromMixedCase('Topic2'), Topic.fromMixedCase('Subtopic')]]);
});

test('Interpret fragment without topic as accidentally inserted slash', () => {
  const pathString = '/Topic/#Subtopic';
  const array = Path.stringToArray(pathString);
  expect(array).toEqual([[Topic.fromMixedCase('Topic'), Topic.fromMixedCase('Subtopic')]]);
});

test('Interpret fragment without topic after first as accidentally inserted slash', () => {
  const pathString = '/Topic/Subtopic1/#Subtopic2';
  const array = Path.stringToArray(pathString);
  expect(array).toEqual([[Topic.fromMixedCase('Topic'), Topic.fromMixedCase('Topic')], [Topic.fromMixedCase('Subtopic1'), Topic.fromMixedCase('Subtopic2')]]);
});

test('Real life example', () => {
  const pathString = 'Topic/#Subtopic1/Subtopic2';
  const array = Path.stringToArray(pathString);
  expect(array).toEqual([[Topic.fromMixedCase('Topic'), Topic.fromMixedCase('Subtopic1')], [Topic.fromMixedCase('Subtopic2'), Topic.fromMixedCase('Subtopic2')]]);
});
