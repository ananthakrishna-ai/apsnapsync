const { app, BrowserWindow, dialog } = require('electron');
const chokidar = require('chokidar');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// ===== Folder Selection =====
async function selectFolder() {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (result.canceled) return;

  const folderPath = result.filePaths[0];
  console.log("Watching folder:", folderPath);

  startWatching(folderPath);
}

// ===== Folder Watcher =====
function startWatching(folderPath) {
  const watcher = chokidar.watch(folderPath, {
    ignored: /^\./,
    persistent: true
  });

  watcher.on('add', (filePath) => {
    console.log("New file detected:", filePath);
  });
}

global.selectFolder = selectFolder;