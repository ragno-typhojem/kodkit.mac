
const path = require('path');
const { app, BrowserWindow, Menu } = require('electron');
let mainWindow;
let splash;

function createSplash() {
  splash = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    alwaysOnTop: true,
    transparent: true
  });

  // Splash screen için src/anim.html dosyasını kullanıyoruz
  // Klasör yapınızda "src" içinde "anim.html" gördüm
  splash.loadFile(path.join(__dirname, 'src', 'anim.html'));

  // Splash ekranı 3 saniye boyunca gösterilecek
  setTimeout(() => {
    splash.close();
    createWindow();
  }, 3000);
}

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
  // Klasör yapınıza göre static içindeki index.html dosyasını yükleyebilirsiniz
  // veya scratch-gui içindeki bir HTML dosyasını
  mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));

  // Geliştirici araçlarını açmak isterseniz aşağıdaki satırı yorum olmaktan çıkarın
  // mainWindow.webContents.openDevTools();

  // Çarpı butonunun çalışması için
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createSplash();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createSplash();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
