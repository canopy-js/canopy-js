const fs = require('fs');
const packageJson = require('./package.json');

const iconBase = 'app/_assets/electron-icon';
const iconPng = `${iconBase}.png`;
const iconIco = `${iconBase}.ico`;
const executableName = packageJson.executableName || packageJson.name;
const packagerConfig = { executableName };

if (fs.existsSync(iconPng) || fs.existsSync(iconIco) || fs.existsSync(`${iconBase}.icns`)) {
  packagerConfig.icon = iconBase;
}

module.exports = {
  packagerConfig,
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {}
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          bin: executableName,
          ...(fs.existsSync(iconPng) ? { icon: iconPng } : {})
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: { bin: executableName }
      }
    }
  ]
};
