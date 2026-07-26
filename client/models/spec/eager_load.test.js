import { uniqueValidEagerLoadParagraphs } from 'models/eager_load';

describe('uniqueValidEagerLoadParagraphs', () => {
  let warnSpy;

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  test('returns valid paragraph candidates', () => {
    const firstParagraph = { path: { string: '/First' } };
    const secondParagraph = { path: { string: '/Second' } };

    expect(uniqueValidEagerLoadParagraphs([firstParagraph, secondParagraph])).toEqual([
      firstParagraph,
      secondParagraph
    ]);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('deduplicates paragraphs by path', () => {
    const originalParagraph = { path: { string: '/Duplicate' } };
    const replacementParagraph = { path: { string: '/Duplicate' } };

    expect(uniqueValidEagerLoadParagraphs([originalParagraph, replacementParagraph])).toEqual([
      replacementParagraph
    ]);
  });

  test('silently ignores null and undefined candidates', () => {
    const paragraph = { path: { string: '/Valid' } };

    expect(uniqueValidEagerLoadParagraphs([null, undefined, paragraph])).toEqual([paragraph]);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  test('skips a truthy candidate without a path', () => {
    expect(uniqueValidEagerLoadParagraphs([{}])).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith('Skipping invalid eager-load paragraph candidate');
  });

  test('skips a candidate without path.string', () => {
    expect(uniqueValidEagerLoadParagraphs([{ path: {} }])).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith('Skipping invalid eager-load paragraph candidate');
  });

  test('continues processing valid candidates after an invalid candidate', () => {
    const paragraph = { path: { string: '/Valid' } };

    expect(uniqueValidEagerLoadParagraphs([{}, paragraph])).toEqual([paragraph]);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('Skipping invalid eager-load paragraph candidate');
  });
});
