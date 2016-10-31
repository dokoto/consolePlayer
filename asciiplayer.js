'use strict';


/**************************************************************************/
/******************* The actual code for moving pictures ******************/
/**************************************************************************/


// User settings
var width = 64; //32;
var height = 32; //16;
var skip = 3;
var clear = false;
var procedure = 'color'; // "ascii", "color", "rainbow", "blackandwhite"
var source = 'image'; // 'image', 'camera', 'video'
var asciiSigns = " ␣I░▒▓█"; // ASCII table, from brightest to darkest
var useCam = false;

// Projection for image translation
var canvas = document.createElement('canvas');
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

// Video playback
var mediafolder = 'http://10.80.80.126/';

var video = document.createElement('video');
video.width = width;
video.height = height;
video.autoplay = true;
video.muted = true;
video.loop = true;
video.src = mediafolder + 'Users/Public/Videos/Sample%20Videos/rick-orig.mp4';

// Camera Stream
var camera = document.createElement('video');
camera.width = width;
camera.height = height;
camera.autoplay = true;
camera.muted = true;

// Image source
var image = new window.Image();
image.width = width;
image.height = height;
image.src = mediafolder + 'Users/malfaros/TMP/avatarE454989.jpg';

// State variables
var lastDraw = 0;
var camUsed = false;

if (source === 'video' || source === 'camera') {
    window.setInterval(function() {
        console.clear();
    }, 3000);
}

// Stream options and handling
var constraint = {
    video: {
        mandatory: {
            maxWidth: width,
            maxHeight: height
        }
    }
};
var error = function(error) {
    console.error("%cVideo capture error: " + error.code, "background:#c93e3e; color:white; font-size:18px; padding:10px; font-weight:bold;");
};



var draw = function() {
    if (source === 'video' || source === 'camera') {
        window.requestAnimationFrame(draw);
    }
    // Framerate: requestAnimationFrame / (skip+1)
    // or in other words: how many frames will be skipped each time
    if (source !== 'image' && ++lastDraw < skip) return;
    else lastDraw = 0;

    // Cache and do changes in the beginning, otherwise they might change mid-process
    var w = width;
    var h = height;
    video.width = w;
    video.height = h;
    canvas.width = w;
    canvas.height = h;
    image.width = w;
    image.height = h;


    // Put chosen source on canvas
    switch (source) {
        case 'video':
            context.drawImage(video, 0, 0, w, h);
            renderImage(w, h);
            break;
        case 'camera':
            context.drawImage(camera, 0, 0, w, h);
            renderImage(w, h);
            break;
        case 'image':
            image.onload = function() {
                context.drawImage(image, 0, 0, w, h);
                renderImage(w, h);
            };
            break;
    }

};

function renderImage(w, h) {
    var pix = context.getImageData(0, 0, w, h).data;

    if (procedure === 'ascii') drawAscii(pix, w, h, asciiSigns);
    else if (procedure === 'color') drawColored(pix, w, h);
    else if (procedure === 'blackandwhite') drawBlackAndWhite(pix, w, h);
    else if (procedure === 'rainbow') drawRainbow(w, h);

    else backimg();
}

draw();



/*************************************************************/
/**** Colored pixel by replicating chars via text-shadow *****/
/*************************************************************/

function drawRainbow(cols, rows) {

    var text = "\n";
    var char = String.fromCharCode("0x2588"); // Full Block
    var styles = [];
    var gap = 8;

    for (var y = 0; y < rows; y++) {

        text += "%c" + char + "\n";

        var style = "color:transparent; text-shadow:";

        for (var x = 0; x < cols; x++) {
            var t = window.performance.now() / 1000;
            var t1 = Math.sin(t) * 0.5 + 0.5; // Oscillates between 0 and 1
            var t2 = Math.sin(t + 4000) * 0.25 + 0.75; // Alternative oscillation
            var cx = x / cols;
            var cy = y / rows;
            var hue = Math.round((cx * cx * t2 + cy * cy * t1) * 360);
            var sat = 100;
            var lig = 70;

            // text-shadow: [X]px 0 hsl(220, 100, 70) [seperate with comma, if not last]
            style += (x * gap) + "px 0 hsl(" + hue + "," + sat + "%," + lig + "%)";
            if (x < (cols - 1)) style += ", ";
        }

        styles.push(style);
    }

    // Text as first entry in array
    styles.unshift(text);
    if (clear) console.clear();
    console.log.apply(console, styles);
}



/*************************************************************/
/********************* Video via ASCII ***********************/
/*************************************************************/

function drawAscii(pix, w, h, signs) {

    var text = "\n";
    if (signs === '') signs = "X";

    for (var y = 0; y < h; y++) {

        for (var i = y * (4 * w); i < y * (4 * w) + (4 * w); i += 4) {
            var r = pix[i];
            var g = pix[i + 1];
            var b = pix[i + 2];

            // Luminance calculated from RGB
            var lum = 0.2126 * r + 0.7152 * b + 0.0722 * g;

            var step = 255 / (signs.length - 1); // Ex: 255/6 = 42.5
            var index = Math.floor((signs.length - 1) - lum / step);

            // Twice the sign to compensate its vertical nature
            text += signs[index] + signs[index];

        }

        text += "\n";

    }

    if (clear) console.clear();
    console.log(text);

}



/*************************************************************/
/****** Colored pixel via background-color from video ********/
/*************************************************************/

function drawColored(pix, w, h) {

    var blocks = "\n";
    var styles = [];
    var char = String.fromCharCode("0x3000"); // Big Space

    for (var y = 0; y < h; y++) {

        for (var x = y * (4 * w); x < y * (4 * w) + (4 * w); x += 4) {
            var r = pix[x];
            var g = pix[x + 1];
            var b = pix[x + 2];

            styles.push("background-color: rgb(" + r + "," + g + "," + b + ");");

            blocks += "%c" + char;
        }

        blocks += "\n";

    }

    styles.unshift(blocks);
    if (clear) console.clear();
    console.log.apply(console, styles);

}

function desaturate(r, g, b) {
    var intensity = 0.3 * r + 0.59 * g + 0.11 * b;
    var k = 1;
    r = Math.floor(intensity * k + r * (1 - k));
    g = Math.floor(intensity * k + g * (1 - k));
    b = Math.floor(intensity * k + b * (1 - k));
    return [r, g, b];
}

function drawBlackAndWhite(pix, w, h) {

    var blocks = "\n";
    var styles = [];
    var char = String.fromCharCode("0x3000"); // Big Space

    for (var y = 0; y < h; y++) {

        for (var x = y * (4 * w); x < y * (4 * w) + (4 * w); x += 4) {
            var r = pix[x];
            var g = pix[x + 1];
            var b = pix[x + 2];
            var baw = desaturate(r, g, b);

            styles.push("background-color: rgb(" + baw[0] + "," + baw[1] + "," + baw[2] + ")");

            blocks += "%c" + char;
        }

        blocks += "\n";

    }

    styles.unshift(blocks);
    if (clear) console.clear();
    console.log.apply(console, styles);

}

function backimg() {
    var url = canvas.toDataURL();
    console.log("%c   ", "font-size:200px; background-image:url(" + url + "); background-size:contain; background-repeat:no-repeat; background-position:center");
}

// Get camera stream
function getStream(video) {
    if (window.navigator.getUserMedia) {
        window.navigator.getUserMedia(constraint, function(stream) {
            video.src = stream;
        }, error);
    } else if (window.navigator.webkitGetUserMedia) {
        window.navigator.webkitGetUserMedia(constraint, function(stream) {
            video.src = window.URL.createObjectURL(stream);
        }, error);
    } else if (window.navigator.mozGetUserMedia) {
        window.navigator.mozGetUserMedia(constraint, function(stream) {
            video.src = window.URL.createObjectURL(stream);
        }, error);
    }
}
