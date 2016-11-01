'use strict';

const ConsolePlayer = require('./consoleplayer.js');

let options = {
    width: 32, //32;
    height: 16, //16;
    clear: true,
    procedure: 'color', // "ascii", "color", "rainbow", "blackandwhite"
    source: 'video', // 'image', 'camera', 'video'
    //url: 'http://localhost/administrador/Tmp/car-20120827-85.mp4',
    url: 'http://yt-dash-mse-test.commondatastorage.googleapis.com/media/car-20120827-85.mp4'
};

let cp = new ConsolePlayer(options);
cp.play();
