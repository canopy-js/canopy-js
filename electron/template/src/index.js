const { app, BrowserWindow, protocol, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const appResourcePathForFileUrl = require('./file_protocol_path');

if (require('electron-squirrel-startup')) {
  app.quit();
}

const appRoot = path.resolve(__dirname, '..', 'app');

function createWindow() {
  const iconPaths = ['electron-icon.ico', 'electron-icon.png']
    .map(fileName => path.join(appRoot, '_assets', fileName));
  const iconPath = iconPaths.find(candidate => fs.existsSync(candidate));
  const mainWindow = new BrowserWindow({
    icon: iconPath,
    width: 900,
    height: 1000,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  protocol.interceptFileProtocol('file', (request, callback) => {
    const url = decodeURIComponent(request.url);

    if (url.includes('/_canopy.js')) return callback({ path: path.join(appRoot, '_canopy.js') });
    if (url.includes('/_canopy.js.map')) return callback({ path: path.join(appRoot, '_canopy.js.map') });
    if (url.includes('/index.html')) return callback({ path: path.join(appRoot, 'index.html') });

    const appResourcePath = appResourcePathForFileUrl(request.url, appRoot);
    if (appResourcePath) return callback({ path: appResourcePath });

    return callback({ path: path.join(appRoot, 'index.html') });
  });

  mainWindow.webContents.setWindowOpenHandler(openHandler);
  mainWindow.webContents.once('did-finish-load', () => {
    mainWindow.maximize();
    mainWindow.show();
  });
  mainWindow.webContents.on('did-create-window', addWindowListeners);

  return mainWindow.loadFile(path.join(appRoot, 'index.html'));
}

function openHandler({ url }) {
  if (url.startsWith('file://')) {
    return {
      action: 'allow',
      outlivesOpener: true,
      overrideBrowserWindowOptions: { width: 900, height: 1000 }
    };
  }

  shell.openExternal(url);
  return { action: 'deny' };
}

function addWindowListeners(newWindow) {
  newWindow.once('ready-to-show', () => {
    newWindow.maximize();
    newWindow.webContents.setWindowOpenHandler(openHandler);
    newWindow.webContents.on('did-create-window', addWindowListeners);
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
