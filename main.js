const { app, BrowserWindow, dialog } = require('electron');
const chokidar = require('chokidar');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

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

// ===== CONFIG =====
const API_BASE = "YOUR_API_URL"; // 🔥 replace
// ===================

// Global function called from UI
global.startUpload = async (code) => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });

  if (result.canceled) return;

  const folderPath = result.filePaths[0];
  console.log("Watching folder:", folderPath);

  watchFolder(folderPath, code);
};

function watchFolder(folderPath, code) {
  const watcher = chokidar.watch(folderPath, {
    ignored: /^\./,
    persistent: true
  });

  watcher.on('add', async (filePath) => {
    console.log("New file detected:", filePath);

    if (!filePath.match(/\.(jpg|jpeg|png)$/i)) return;

    try {
      await uploadFile(filePath, code);
    } catch (err) {
      console.error("Upload failed:", err.message);
    }
  });
}

async function uploadFile(filePath, code) {
  console.log("Uploading:", filePath);

  const fileName = path.basename(filePath);

  // Step 1: Call Lambda with code
  const res = await axios.post(`${API_BASE}/uploadLivePhoto`, {
    fileName: fileName,
    code: code
  });

  const uploadUrl = res.data.uploadUrl;

  // Step 2: Read file
  const fileData = fs.readFileSync(filePath);

  // Step 3: Upload to S3
  await axios.put(uploadUrl, fileData, {
    headers: {
      'Content-Type': 'image/jpeg'
    }
  });

  console.log("Uploaded:", fileName);
}