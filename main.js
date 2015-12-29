var app = require('app'); // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.
var mdns = require('multicast-dns')();

const ipcMain = require('electron').ipcMain;

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    darkTheme: true
  });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  mainWindow.on('resize', function(){
    mainWindow.webContents.send('resize',mainWindow.getSize());
  });

  var minutes = 1,
    the_interval = minutes * 60 * 1000;
  setInterval(function() {
    console.log("I am doing my 1 minute check for new tingbots");
    updateDNS();
  }, the_interval);
  updateDNS();

  ipcMain.on('startTest', function(event, arg) {
    console.log("received");
    var subpy = require('child_process').spawn('vendor/tbtool', ['simulate','./test.py']);
    event.returnValue = "derp";
  });

  ipcMain.on('fileAdd', function(event,file){

  });


});

mdns.on('response', function(response) {
  console.log('got a response packet:', response);
});

function updateDNS(){
  mdns.query({
  questions:[{
    name: '_tingbot._tcp',
    type: 'SRV'
  }]
});

function setupTempFile(){

}
}
