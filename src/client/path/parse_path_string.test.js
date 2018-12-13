import parsePathString from './parse_path_string';

test('just topic', () => {
  var path = '/Topic'
  var pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Topic']]);
});

test('topic and subtopic', () => {
  var path = '/Topic#Subtopic'
  var pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic']]);
});

test('topic and subtopic and topic', () => {
  var path = '/Topic#Subtopic/Topic2'
  var pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic'], ['Topic2', 'Topic2']]);
});

test('two topics and subtopics', () => {
  var path = '/Topic#Subtopic/Topic2#Subtopic2'
  var pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic'], ['Topic2', 'Subtopic2']]);
});

test('lone subtopic', () => {
  var path = '/Topic#Subtopic/#Subtopic2'
  var pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic'], ['Subtopic2', 'Subtopic2']]);
});

test('empty segment', () => {
  var path = '/Topic#Subtopic/#'
  var pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic']]);
});

test('No initial subtopic', () => {
  var path = '/Topic/Topic2#Subtopic'
  var pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Topic'], ['Topic2', 'Subtopic']]);
});
