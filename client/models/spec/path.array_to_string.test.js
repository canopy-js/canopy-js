import Topic from '../../../cli/shared/topic';
import Path from 'models/path';

jest.mock('../../helpers/getters', () => ({
  __esModule: true,
  canopyContainer: []
}));

test('Topic and subtopic', () => {
  const array = [[new Topic('Topic'), new Topic('Subtopic')]];
  const pathString = Path.arrayToString(array);
  expect(pathString).toEqual('/Topic#Subtopic');
});

test('Two topic subtopic pairs', () => {
  const array = [[new Topic('Topic'), new Topic('Subtopic')], [new Topic('Topic2'), new Topic('Subtopic2')]];
  const pathString = Path.arrayToString(array);
  expect(pathString).toEqual('/Topic#Subtopic/Topic2#Subtopic2');
});

test('Just Topic', () => {
  const array = [[new Topic('Topic')]];
  const pathString = Path.arrayToString(array);
  expect(pathString).toEqual('/Topic');
});

test('Topic Topic pair', () => {
  const array = [[new Topic('Topic'), new Topic('Topic')]];
  const pathString = Path.arrayToString(array);
  expect(pathString).toEqual('/Topic');
});

test('Just topic second pair', () => {
  const array = [[new Topic('Topic'), new Topic('Subtopic')], [new Topic('Topic2')]];
  const pathString = Path.arrayToString(array);
  expect(pathString).toEqual('/Topic#Subtopic/Topic2');
});
