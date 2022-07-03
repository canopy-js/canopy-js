import Path from 'models/path';
jest.mock('../../helpers/getters', () => ({
  __esModule: true,
  canopyContainer: []
}));

test('just topic', () => {
  const pathString = '/Topic';
  const pathArray = Path.stringToArray(pathString);
  expect(pathArray).toEqual([['Topic', 'Topic']]);
});

test('topic and subtopic', () => {
  const pathString = '/Topic#Subtopic';
  const pathArray = Path.stringToArray(pathString);
  expect(pathArray).toEqual([['Topic', 'Subtopic']]);
});

test('topic and subtopic and topic', () => {
  const pathString = '/Topic#Subtopic/Topic2';
  const pathArray = Path.stringToArray(pathString);
  expect(pathArray).toEqual([['Topic', 'Subtopic'], ['Topic2', 'Topic2']]);
});

test('two topics and subtopics', () => {
  const pathString = '/Topic#Subtopic/Topic2#Subtopic2';
  const pathArray = Path.stringToArray(pathString);
  expect(pathArray).toEqual([['Topic', 'Subtopic'], ['Topic2', 'Subtopic2']]);
});

test('lone subtopic', () => {
  const pathString = '/Topic#Subtopic/#Subtopic2';
  const pathArray = Path.stringToArray(pathString);
  expect(pathArray).toEqual(
    [
      ['Topic', 'Subtopic'],
      ['Subtopic2', 'Subtopic2']
    ]
  );
});

test('empty segment', () => {
  const pathString = '/Topic#Subtopic/#';
  const pathArray = Path.stringToArray(pathString);
  expect(pathArray).toEqual([['Topic', 'Subtopic']]);
});

test('No initial subtopic', () => {
  const pathString = '/Topic/Topic2#Subtopic';
  const pathArray = Path.stringToArray(pathString);
  expect(pathArray).toEqual([['Topic', 'Topic'], ['Topic2', 'Subtopic']]);
});

test('Interpret fragment without topic as accidentally inserted slash', () => {
  const pathString = '/Topic/#Subtopic';
  const pathArray = Path.stringToArray(pathString);
  expect(pathArray).toEqual([['Topic', 'Subtopic']]);
});

test('Interpret fragment without topic after first as accidentally inserted slash', () => {
  const pathString = '/Topic/Subtopic1/#Subtopic2';
  const pathArray = Path.stringToArray(pathString);
  expect(pathArray).toEqual([['Topic', 'Topic'], ['Subtopic1', 'Subtopic2']]);
});

test('Real life example', () => {
  const pathString = 'Topic/#Subtopic1/Subtopic2';
  const pathArray = Path.stringToArray(pathString);
  expect(pathArray).toEqual([['Topic', 'Subtopic1'], ['Subtopic2', 'Subtopic2']]);
});
