const fs = require('fs-extra');
const path = require('path');

const FULL_BUILD_DIR = path.join('.canopy-processes', 'full-builds');
const FULL_BUILD_FILE = path.join(FULL_BUILD_DIR, String(process.pid));

function pidIsRunning(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;

  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === 'EPERM';
  }
}

function registerFullBuildProcess() {
  fs.ensureDirSync(FULL_BUILD_DIR);
  fs.writeFileSync(FULL_BUILD_FILE, '');

  let released = false;
  return function releaseFullBuildProcess() {
    if (released) return;
    released = true;
    fs.rmSync(FULL_BUILD_FILE, { force: true });
  };
}

function killActiveFullBuildProcesses() {
  if (!fs.existsSync(FULL_BUILD_DIR)) return;

  fs.readdirSync(FULL_BUILD_DIR).forEach(entry => {
    const pid = Number(entry);
    const processPath = path.join(FULL_BUILD_DIR, entry);

    if (!pidIsRunning(pid)) {
      fs.rmSync(processPath, { force: true });
      return;
    }

    try {
      process.kill(pid, 'SIGTERM');
    } catch (_error) {
      // Process may have exited after the liveness check.
    }
  });
}

module.exports = {
  registerFullBuildProcess,
  killActiveFullBuildProcesses
};
