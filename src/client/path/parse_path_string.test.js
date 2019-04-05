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

