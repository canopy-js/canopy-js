const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { AutoComplete } = require('enquirer');

function getBundledFzfPath() {
  const platform = os.platform();
  const arch = os.arch();

  const key =
    platform === 'darwin' && arch === 'x64' ? 'macos_amd64' :
    platform === 'darwin' && arch === 'arm64' ? 'macos_arm64' :
    platform === 'linux' && arch === 'x64' ? 'linux_amd64' :
    platform === 'linux' && arch === 'arm64' ? 'linux_arm64' :
    platform === 'win32' && arch === 'x64' ? 'windows_amd64' :
    platform === 'win32' && arch === 'arm64' ? 'windows_arm64' :
    null;

  if (!key) throw new Error(`Unsupported platform/arch: ${platform}/${arch}`);

  const binaryName = `fzf-${key}${platform === 'win32' ? '.exe' : ''}`;
  return path.join(__dirname, '../../vendor/fzf', binaryName);
}

function fzfSelect(choices = [], {
  allowCustomInput = true,
  multi = false,
  header = null
} = {}) {
  return new Promise(resolve => {
    const fzf = getBundledFzfPath();
    const args = [];

    if (allowCustomInput) {
      args.push('--expect=enter');
      args.push('--print-query');
    }
    if (multi) args.push('--multi');
    if (header) args.push('--header', header);

    const proc = spawn(fzf, args, { stdio: ['pipe', 'pipe', 'inherit'] });

    proc.stdin.write(choices.join('\n'));
    proc.stdin.end();

    let output = '';
    proc.stdout.on('data', data => output += data.toString());

    proc.on('close', () => {
      const lines = output.trim().split('\n');
      if (multi) {
        resolve(lines);
      } else {
        const final = lines[lines.length - 1];
        resolve([final]);
      }
    });
  });
}

function enquirerSelect(existingPaths) {
  const originalChoices = existingPaths.map(p => ({
    name: p,
    message: p,
    value: p
  }));

  const prompt = new AutoComplete({
    name: 'category',
    message: 'Please select or enter a category path:',
    limit: 10,
    initial: 0,
    theme: {
      separator: ' '
    },
    choices: originalChoices,
    suggest(input) {
      const filtered = originalChoices.filter(choice =>
        choice.message.toLowerCase().includes(input.toLowerCase())
      );

      const exactMatch = originalChoices.some(choice =>
        choice.message.toLowerCase() === input.toLowerCase()
      );

      return exactMatch ? filtered : [
        ...filtered,
        {
          name: input,
          message: `Create new: ${input}`,
          value: input
        }
      ];
    }
  });

  return prompt.run();
}

module.exports = {getBundledFzfPath, fzfSelect, enquirerSelect};
