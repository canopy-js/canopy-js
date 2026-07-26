const { spawnSync } = require('child_process');

function commandFor(platform) {
  const commands = {
    win32: ['electron-builder', ['--win', 'portable', '--x64']],
    linux: ['electron-builder', ['--linux', 'AppImage']],
    darwin: ['electron-forge', ['package']]
  };
  return commands[platform];
}

function portable(platform = process.platform) {
  const selectedCommand = commandFor(platform);
  if (!selectedCommand) {
    throw new Error(`Portable Electron builds are not supported on ${platform}.`);
  }

  const [command, args] = selectedCommand;
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: platform === 'win32'
  });

  if (result.error) throw result.error;
  if (result.status) throw new Error(`${command} ${args.join(' ')} exited with status ${result.status}`);
}

if (require.main === module) portable();

module.exports = { commandFor, portable };
