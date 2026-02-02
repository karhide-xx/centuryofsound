const { app, BrowserWindow, Menu, protocol } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false  // Allow loading local files
    },
    icon: path.join(__dirname, 'img/icon.png')
  });

  // Load the index.html file
  mainWindow.loadFile('index.html');

  // Track all navigation attempts
  mainWindow.webContents.on('will-navigate', (event, url) => {
    console.log('!!! Navigation attempt to:', url);
    event.preventDefault();
  });

  mainWindow.webContents.on('did-start-navigation', (event, url) => {
    console.log('!!! Navigation started to:', url);
  });

  // Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    console.log('!!! Window open prevented');
    return { action: 'deny' };
  });

  // Track page lifecycle
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('*** Page finished loading');
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('*** DOM is ready');
  });

  // Open DevTools to see errors
  mainWindow.webContents.openDevTools();

  // Log any console errors
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    if (level >= 2) { // 2 = warning, 3 = error
      console.log(`Console [${level}]: ${message} at ${sourceId}:${line}`);
    }
  });

  // Prevent window from closing on navigation errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('!!! Failed to load:', errorCode, errorDescription, validatedURL);
  });

  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/karhide-xx/centuryofsound');
          }
        }
      ]
    }
  ];

  // On macOS, add the app name to the menu
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Open DevTools in development mode
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Register a custom protocol for loading local files
  protocol.registerFileProtocol('file', (request, callback) => {
    const pathname = decodeURI(request.url.replace('file:///', ''));
    callback(pathname);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
