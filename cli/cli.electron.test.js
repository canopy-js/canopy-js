describe('electron CLI options', () => {
  const originalArgv = process.argv;

  afterEach(() => {
    process.argv = originalArgv;
    jest.resetModules();
  });

  test('parses --portable and passes it to the Electron command', () => {
    const electron = jest.fn();
    process.argv = ['node', 'canopy', 'electron', '--portable', '--no-install'];

    jest.isolateModules(() => {
      jest.doMock('./electron', () => electron);
      require('./cli');
    });

    expect(electron).toHaveBeenCalledWith(expect.objectContaining({
      portable: true,
      install: false
    }));
  });
});
