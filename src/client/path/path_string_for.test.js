import pathStringFor from './path_string_for';

test('Topic and subtopic', () => {
  var pathArray = [['Topic', 'Subtopic']]
  var pathString = pathStringFor(pathArray);
  expect(pathString).toEqual('Topic#Subtopic');
});

test('Two topic subtopic pairs', () => {
  var pathArray = [['Topic', 'Subtopic'], ['Topic2', 'Subtopic2']]
  var pathString = pathStringFor(pathArray);
  expect(pathString).toEqual('Topic#Subtopic/Topic2#Subtopic2');
});

test('Just Topic', () => {
  var pathArray = [['Topic']]
  var pathString = pathStringFor(pathArray);
  expect(pathString).toEqual('Topic');
});

test('Topic Topic pair', () => {
  var pathArray = [['Topic', 'Topic']]
  var pathString = pathStringFor(pathArray);
  expect(pathString).toEqual('Topic');
});

test('Just topic second pair', () => {
  var pathArray = [['Topic', 'Subtopic'], ['Topic2']]
  var pathString = pathStringFor(pathArray);
  expect(pathString).toEqual('Topic#Subtopic/Topic2');
});
