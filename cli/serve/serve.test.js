const serve = require('./serve');

describe('manual server restart', () => {
  test('retries a stopped server after a fatal listen error', () => {
    const state = {
      child: null,
      fatalListenError: true,
      shuttingDown: false
    };
    const ensureServerState = jest.fn();

    expect(serve.restartIfNotPresent(state, ensureServerState)).toBe(true);
    expect(state.fatalListenError).toBe(false);
    expect(ensureServerState).toHaveBeenCalledTimes(1);
  });

  test('leaves a present server alone', () => {
    const state = {
      child: {},
      fatalListenError: false,
      shuttingDown: false
    };
    const ensureServerState = jest.fn();

    expect(serve.restartIfNotPresent(state, ensureServerState)).toBe(false);
    expect(ensureServerState).not.toHaveBeenCalled();
  });
});
