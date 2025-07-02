const path = require('path');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

let mainWindow;
let splash;

// Splash ekranını oluştur
function createSplash() {
  splash = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    transparent: true
  });

  splash.loadFile(path.join(__dirname, 'src', 'anim.html'));

  setTimeout(() => {
    splash.close();
    createWindow();
  }, 3000);
}

// Ana pencereyi oluştur
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));

  // Pencere kapatma olayı
  mainWindow.on('close', (e) => {
    console.log('Ana pencere kapatılıyor...');

    // Renderer process'te çalışan işlemleri temizle
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.executeJavaScript(`
        // Arka plan işlemleri temizleniyor
        if (window.backgroundInterval) clearInterval(window.backgroundInterval);
        if (window.backgroundTimeout) clearTimeout(window.backgroundTimeout);
        if (window.ipcRenderer) window.ipcRenderer.removeAllListeners();
        if (window.socket) window.socket.close();
      `);
    }

    // Ana pencereyi fiziksel olarak yok et
    mainWindow.removeAllListeners();
    mainWindow.destroy();
  });

  // Pencere kapandıktan sonra null yap
  mainWindow.on('closed', () => {
    mainWindow = null;
    console.log('Ana pencere tamamen kapandı.');
  });
}

// Uygulama hazır olduğunda başlat
app.whenReady().then(() => {
  createSplash();

  // Aktif olduğunda splash ekranı yeniden başlat
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createSplash();
  });

  // Tüm pencereler kapandığında uygulamayı sonlandır
  app.on('window-all-closed', () => {
    console.log('Tüm pencereler kapandı, uygulama sonlandırılıyor...');
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // Uygulama çıkış öncesi son temizlik
  app.on('before-quit', () => {
    console.log('Uygulama çıkış öncesi temizlik yapılıyor...');
    ipcMain.removeAllListeners(); // IPC dinleyicileri kaldır
  });

  // Uygulama çıkış tamamlandığında logla
  app.on('quit', () => {
    console.log('Uygulama tamamen kapandı.');
  });
});
