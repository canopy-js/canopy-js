const EventEmitter = require('events');
const serve = require('./serve');

describe('server parent shutdown handling', () => {
  test('keeps the supervisor running after an unrelated unhandled rejection', () => {
    const processEvents = new EventEmitter();
    const shutdown = jest.fn();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      serve.registerShutdown({}, shutdown, processEvents);
      processEvents.emit('unhandledRejection', new Error('watcher race'));

      expect(shutdown).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('server continuing'));
    } finally {
      errorSpy.mockRestore();
    }
  });

  test('still shuts down for an actual termination signal', () => {
    const processEvents = new EventEmitter();
    const shutdown = jest.fn();

    serve.registerShutdown({}, shutdown, processEvents);
    processEvents.emit('SIGTERM');

    expect(shutdown).toHaveBeenCalledTimes(1);
  });
});
