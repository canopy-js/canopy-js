const fs = require('fs');

const iconBase = 'app/_assets/electron-icon';
const iconPng = `${iconBase}.png`;
const packagerConfig = {};

if (fs.existsSync(iconPng) || fs.existsSync(`${iconBase}.icns`)) {
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
        options: fs.existsSync(iconPng) ? { icon: iconPng } : {}
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ]
};
