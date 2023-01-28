const { app, BrowserWindow, ipcMain } = require("electron");
const path = require('path')

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    minWidth: 640,
    width: 1280,
    minHeight: 480,
    height: 720,
    frame: false,
    icon: path.join(__dirname, '../build/icon.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.join(__dirname, 'preload.js')
    },
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  ipcMain.on('min', () => {
    mainWindow.minimize()
  })

  ipcMain.on('max', () => {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()
  })

  if (process.plaftorm == 'win32') app.setAsDefaultProtocolClient('jumpstart', process.execPath, [ resolve(process.argv[1]) ])
  else app.setAsDefaultProtocolClient('jumpstart', process.execPath)

  app.on('open-url', (e, url) => {
    e.preventDefault()
    mainWindow.webContents.send('open-url', url)
  })

  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) return app.quit()
  else {
    app.on('second-instance', (e, argv) => {
      if (process.platform == 'win32') {
        mainWindow.webContents.send('open-url', argv[argv.length - 1])
      }

      if (mainWindow) {
        if (mainWindow.isMinimized()) myWindow.restore()
        mainWindow.focus()
      }
    })
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})