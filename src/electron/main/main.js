const { app, BrowserWindow, session, screen } = require("electron");
const path = require("path");

const createWindow = () => {
  // Get the primary screen size
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Determine the initial window size (at least 1920x1080)
  const initialWidth = Math.max(1620, width);
  const initialHeight = Math.max(980, height);

  const win = new BrowserWindow({
    width: initialWidth,
    height: initialHeight,
    minWidth: 1620, // Enforce a minimum width of 1920px
    minHeight: 960, // Enforce a minimum height of 1080px
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // win.webContents.openDevTools(); // Optional for development
  win.loadFile(path.join(__dirname, "../renderer/index.html"));
};

app.whenReady().then(() => {
  createWindow();

  // Set Content Security Policy headers
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none'; img-src 'self' data: https://*.google.com https://*.gstatic.com; connect-src 'self' https://*.firebaseio.com https://*.firebase.com https://*.googleapis.com https://*.gstatic.com https://firestore.googleapis.com;",
        ],
      },
    });
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
