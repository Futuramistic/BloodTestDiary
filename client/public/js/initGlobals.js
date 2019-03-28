var electron  = require('electron');
var serverHost = electron.remote.getGlobal("sharedObj").ip
var serverPort = electron.remote.getGlobal("sharedObj").port
