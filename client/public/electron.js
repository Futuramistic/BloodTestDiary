const electron = require('electron');
const app = electron.app;
const session  = electron.session;
const globalShortcut = electron.globalShortcut;
const BrowserWindow = electron.BrowserWindow;

const { dialog } = require('electron')

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const jsonController = require(`${path.join(__dirname, '/lib/json-controller.js')}`);

const maxWindowWidth = 1400;
const maxWindowHeight = 800;

const maxSplashwWidth = 400;
const maxSplashHeight = 500;

let width = 0;
let height = 0;

let mainWindow;
let currentSession;
let ip;
let port;

app.on('ready', () => {
  // Register a 'CommandOrControl+X' shortcut listener.
 // const ret = globalShortcut.register('CommandOrControl+R', () => {
   // return;
  //});
});

function getWindowSize(axis) {
  if (axis === "width") {
    return (width*0.7 > maxWindowWidth) ? maxWindowWidth : width*0.7;
  } else if (axis === "height") {
    return (height*0.75 > maxWindowHeight) ? maxWindowHeight : height*0.75;
  }
  return null;
}

function getSplashSize(axis) {
  if (axis === "width") {
    return (width*0.15 > maxSplashwWidth) ? maxSplashwWidth : width*0.15;
  } else if (axis === "height") {
    return (height*0.4 > maxSplashHeight) ? maxSplashHeight : height*0.4;
  }
  return null;
}

function setScreenSize() {
  width = electron.screen.getPrimaryDisplay().workAreaSize.width;
  height = electron.screen.getPrimaryDisplay().workAreaSize.height;
}

function createWindows() {

  mainWindow = new BrowserWindow({width: getWindowSize("width"), height: getWindowSize("height"), backgroundColor: '#f4f9fd', frame: false, resizable: true, show: false, minWidth : 300,
  minHeight : 300});
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `${path.join(__dirname, '../build/index.html')}`);
  mainWindow.on('closed', () => mainWindow = null);


  splash = new BrowserWindow({width: getSplashSize("width"), height: getSplashSize("height"), backgroundColor: '#f4f9fd', frame: false, resizable: false});
  splash.loadFile(`${path.join(__dirname, '/loading.html')}`);

}

function getCoreCookies(callback){
    let newIp = undefined;
    let newPort = undefined;
    currentSession.cookies.get({url: "/"}, (err, cookies) => {
        console.log(cookies);
        for (let i = 0; i < cookies.length; ++i){
            let cookie = cookies[i];
            if (cookie.name === "ip"){
                newIp = cookie.value;
            }
            else if (cookie.name === "port"){
                newPort = cookie.value;
            }
        }
        callback(newIp, newPort)
    });
}

function safeExit(callback){
    getCoreCookies((newIp, newPort) => {
        if (newIp !== ip || newPort !== port){
            jsonController.writeServerConfigFile({ip: newIp, port: newPort});
        }
        callback();
    });
}

app.on('ready', () => {

  setScreenSize();
  createWindows();
  currentSession = mainWindow.webContents.session;
  let config = jsonController.getJSON(`${path.join(__dirname, '/server_connect_config.json')}`);
  ip = config.ip;
  port = config.port;
  currentSession.cookies.set({name: "ip", value: config.ip, url: "https://www.google.com", path: "/"}, err => {dialog.showMessageBox({ message: err})});
  currentSession.cookies.set({name: "port", value: config.port, url: "https://www.google.com", path: "/"}, err => {dialog.showMessageBox({ message: err})});
  mainWindow.once('ready-to-show', () => {
      splash.destroy();
      mainWindow.show();
      mainWindow.webContents.openDevTools()
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
      safeExit( () => app.quit())
  }
});
