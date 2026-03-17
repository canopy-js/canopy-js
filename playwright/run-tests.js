const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const tempTestDirectories = [
  'prefix_test',
  'hash_urls_test',
  'hash_urls_and_prefix_test',
  'hash_urls_and_prefix_static_test'
];

function removeTempTestDirectories() {
  for (const directory of tempTestDirectories) {
    fs.rmSync(path.join(__dirname, directory), { recursive: true, force: true });
  }
}

function main() {
  const args = process.argv.slice(2);
  const playwrightArgs = ['playwright', 'test', ...args];
  const result = spawnSync('npx', playwrightArgs, { stdio: 'inherit' });

  removeTempTestDirectories();

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === 'number') {
    process.exit(result.status);
  }

  process.exit(1);
}

main();
