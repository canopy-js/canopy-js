import Path from 'models/path';

test('Topic and subtopic', () => {
  const pathArray = [['Topic', 'Subtopic']];
  const pathString = Path.arrayToString(pathArray);
  expect(pathString).toEqual('/Topic#Subtopic');
});

test('Two topic subtopic pairs', () => {
  const pathArray = [['Topic', 'Subtopic'], ['Topic2', 'Subtopic2']];
  const pathString = Path.arrayToString(pathArray);
  expect(pathString).toEqual('/Topic#Subtopic/Topic2#Subtopic2');
});

test('Just Topic', () => {
  const pathArray = [['Topic']];
  const pathString = Path.arrayToString(pathArray);
  expect(pathString).toEqual('/Topic');
});

test('Topic Topic pair', () => {
  const pathArray = [['Topic', 'Topic']];
  const pathString = Path.arrayToString(pathArray);
  expect(pathString).toEqual('/Topic');
});

test('Just topic second pair', () => {
  const pathArray = [['Topic', 'Subtopic'], ['Topic2']];
  const pathString = Path.arrayToString(pathArray);
  expect(pathString).toEqual('/Topic#Subtopic/Topic2');
});
