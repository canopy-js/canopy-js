import parsePathString from './parse_path_string';

test('just topic', () => {
  let path = '/Topic'
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Topic']]);
});

test('topic and subtopic', () => {
  let path = '/Topic#Subtopic'
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic']]);
});

test('topic and subtopic and topic', () => {
  let path = '/Topic#Subtopic/Topic2'
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic'], ['Topic2', 'Topic2']]);
});

test('two topics and subtopics', () => {
  let path = '/Topic#Subtopic/Topic2#Subtopic2'
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic'], ['Topic2', 'Subtopic2']]);
});

test('lone subtopic', () => {
  let path = '/Topic#Subtopic/#Subtopic2'
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic'], ['Subtopic2', 'Subtopic2']]);
});

test('empty segment', () => {
  let path = '/Topic#Subtopic/#'
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic']]);
});

test('No initial subtopic', () => {
  let path = '/Topic/Topic2#Subtopic'
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Topic'], ['Topic2', 'Subtopic']]);
});

test('Interpret fragment without topic as accidentally inserted slash', () => {
  let path = '/Topic/#Subtopic'
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic']]);
});

test('Interpret fragment without topic after first as accidentally inserted slash', () => {
  let path = '/Topic/Subtopic1/#Subtopic2'
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Topic'], ['Subtopic1', 'Subtopic2']]);
});
