'use strict';


/**************************************************************************/
/******************* The actual code for moving pictures ******************/
/**************************************************************************/

let defaults = {
    width: 64, //32;
    height: 32, //16;
    skip: 3,
    clear: false,
    procedure: 'color', // "ascii", "color", "rainbow", "blackandwhite"
    source: 'image', // 'image', 'camera', 'video'
    asciiSigns: " ␣I░▒▓█", // ASCII table, from brightest to darkest
    useCam: false,
    host: 'http://10.80.80.126/',
    lastDraw: 0
};

class ConsolePlayer {
    constructor(options) {
        this.options = options || defaults;
        this.canvas = null;
        this.source = null;
        this.context = null;
        this.constraint = {
            video: {
                mandatory: {
                    maxWidth: this.options.width,
                    maxHeight: this.options.height
                }
            }
        };
    }

    play() {
        this._draw();
    }

    _setSource() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.context = this.canvas.getContext('2d');
        if (this.options.source === 'video' || this.options.source === 'camera') {
            window.setInterval(function() {
                console.clear();
            }, 3000);
        }
    }

    _setVideoSource() {
        this.source = document.createElement('video');
        this.source.width = this.options.width;
        this.source.height = this.options.height;
        this.source.autoplay = true;
        this.source.muted = true;
        this.source.loop = true;
        this.source.src = this.options.host + 'Users/Public/Videos/Sample%20Videos/rick-orig.mp4';
    }

    _setCameraSource() {
        this.source = document.createElement('video');
        this.source.width = this.options.width;
        this.source.height = this.options.height;
        this.source.autoplay = true;
        this.source.muted = true;
    }

    _setImageSource() {
        this.source = new window.Image();
        this.source.width = this.options.width;
        this.source.height = this.options.height;
        this.source.src = this.options.host + 'Users/malfaros/TMP/avatarE454989.jpg';
    }

    _error(error) {
        console.error("%cVideo capture error: " + error.code, "background:#c93e3e; color:white; font-size:18px; padding:10px; font-weight:bold;");
    }


    _draw() {
        if (this.source === 'video' || this.source === 'camera') {
            window.requestAnimationFrame(this._draw);
        }
        // Framerate: requestAnimationFrame / (skip+1)
        // or in other words: how many frames will be skipped each time
        if (this.source !== 'image' && ++this.lastDraw < this.options.skip) {
            return;
        }
        else {
            this.options.lastDraw = 0;
        }

        // Cache and do changes in the beginning, otherwise they might change mid-process
        this.source.width = this.options.width;
        this.source.height = this.options.height;

        // Put chosen source on canvas
        switch (this.options.source) {
            case 'video':
                this.context.drawImage(this.source, 0, 0, this.options.width, this.options.height);
                this._renderImage(this.options.width, this.options.height);
                break;
            case 'camera':
                this.context.drawImage(this.source, 0, 0, this.options.width, this.options.height);
                this._renderImage(this.options.width, this.options.height);
                break;
            case 'image':
                this.source.onload = function() {
                    this.context.drawImage(this.source, 0, 0, this.options.width, this.options.height);
                    this._renderImage(this.options.width, this.options.height);
                };
                break;
        }

    }

    _renderImage(w, h) {
        let pix = context.getImageData(0, 0, w, h).data;

        if (procedure === 'ascii') drawAscii(pix, w, h, asciiSigns);
        else if (procedure === 'color') drawColored(pix, w, h);
        else if (procedure === 'blackandwhite') drawBlackAndWhite(pix, w, h);
        else if (procedure === 'rainbow') drawRainbow(w, h);

        else backimg();
    }

    _drawRainbow(cols, rows) {

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



    _drawAscii(pix, w, h, signs) {

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


    _drawColored(pix, w, h) {

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

    _desaturate(r, g, b) {
        var intensity = 0.3 * r + 0.59 * g + 0.11 * b;
        var k = 1;
        r = Math.floor(intensity * k + r * (1 - k));
        g = Math.floor(intensity * k + g * (1 - k));
        b = Math.floor(intensity * k + b * (1 - k));
        return [r, g, b];
    }

    _drawBlackAndWhite(pix, w, h) {

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

    _backimg() {
        var url = canvas.toDataURL();
        console.log("%c   ", "font-size:200px; background-image:url(" + url + "); background-size:contain; background-repeat:no-repeat; background-position:center");
    }


    _getStream(video) {
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
}

module.exports = ConsolePlayer;
