import parsePathString from './parse_path_string';

test('just topic', () => {
  let path = '/Topic';
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Topic']]);
});

test('topic and subtopic', () => {
  let path = '/Topic#Subtopic';
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic']]);
});

test('topic and subtopic and topic', () => {
  let path = '/Topic#Subtopic/Topic2';
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic'], ['Topic2', 'Topic2']]);
});

test('two topics and subtopics', () => {
  let path = '/Topic#Subtopic/Topic2#Subtopic2';
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic'], ['Topic2', 'Subtopic2']]);
});

test('lone subtopic', () => {
  let path = '/Topic#Subtopic/#Subtopic2';
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic'], ['Subtopic2', 'Subtopic2']]);
});

test('empty segment', () => {
  let path = '/Topic#Subtopic/#'
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic']]);
});

test('No initial subtopic', () => {
  let path = '/Topic/Topic2#Subtopic';
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Topic'], ['Topic2', 'Subtopic']]);
});

test('Interpret fragment without topic as accidentally inserted slash', () => {
  let path = '/Topic/#Subtopic';
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Subtopic']]);
});

test('Interpret fragment without topic after first as accidentally inserted slash', () => {
  let path = '/Topic/Subtopic1/#Subtopic2';
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Topic', 'Topic'], ['Subtopic1', 'Subtopic2']]);
});

test('Real life example', () => {
  let path = 'Cheshbonot/#The_markdown_examples/Halacha';
  let pathArray = parsePathString(path);
  expect(pathArray).toEqual([['Cheshbonot', 'The markdown examples'], ['Halacha', 'Halacha']]);
});

///////////////////////

import pathStringFor from './path_string_for';

test('Topic and subtopic', () => {
  let pathArray = [['Topic', 'Subtopic']]
  let pathString = pathStringFor(pathArray);
  expect(pathString).toEqual('/Topic#Subtopic');
});

test('Two topic subtopic pairs', () => {
  let pathArray = [['Topic', 'Subtopic'], ['Topic2', 'Subtopic2']]
  let pathString = pathStringFor(pathArray);
  expect(pathString).toEqual('/Topic#Subtopic/Topic2#Subtopic2');
});

test('Just Topic', () => {
  let pathArray = [['Topic']]
  let pathString = pathStringFor(pathArray);
  expect(pathString).toEqual('/Topic');
});

test('Topic Topic pair', () => {
  let pathArray = [['Topic', 'Topic']]
  let pathString = pathStringFor(pathArray);
  expect(pathString).toEqual('/Topic');
});

test('Just topic second pair', () => {
  let pathArray = [['Topic', 'Subtopic'], ['Topic2']]
  let pathString = pathStringFor(pathArray);
  expect(pathString).toEqual('/Topic#Subtopic/Topic2');
});

