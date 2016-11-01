'use strict';

//http://techslides.com/demos/sample-videos/small.mp4


let defaults = {
    width: 64, //32;
    height: 32, //16;
    skip: 3,
    clear: false,
    procedure: 'color', // "ascii", "color", "rainbow", "blackandwhite"
    source: 'image', // 'image', 'camera', 'video'
    asciiSigns: " ␣I░▒▓█", // ASCII table, from brightest to darkest
    useCam: false,
    url: 'http://localhost/',
    lastDraw: 0
};

class ConsolePlayer {
    constructor(options) {
        this._mergeOptions(options, defaults);
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
        this._setSource();
        this._draw();
    }

    _mergeOptions(options, defaults) {
        this.options = {};
        for (let item in defaults) {
            this.options[item] = options[item] || defaults[item];
        }
    }

    _cleanCosole() {
      console.clear();
    }

    _setSource() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.options.width;
        this.canvas.height = this.options.height;
        this.context = this.canvas.getContext('2d');
        if (this.options.clear && (this.options.source === 'video' || this.options.source === 'camera')) {
            window.setInterval(this._cleanCosole, 3000);
        }
        switch (this.options.source) {
            case 'video':
                this._setVideoSource();
                break;
            case 'camera':
                this._setCameraSource();
                break;
            case 'image':
                this._setImageSource();
                break;
        }
    }

    _setVideoSource() {
        this.source = document.createElement('video');
        this.source.width = this.options.width;
        this.source.height = this.options.height;
        this.source.autoplay = true;
        this.source.muted = true;
        this.source.loop = true;
        this.source.src = this.options.url;
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
        this.source.src = this.options.url;
    }

    _error(error) {
        console.error("%cVideo capture error: " + error.code, "background:#c93e3e; color:white; font-size:18px; padding:10px; font-weight:bold;");
    }


    _draw() {
        if (this.options.source === 'video' || this.options.source === 'camera') {
            window.requestAnimationFrame(this._draw.bind(this));
        }
        // Framerate: requestAnimationFrame / (skip+1)
        // or in other words: how many frames will be skipped each time
        if (this.options.source !== 'image' && ++this.options.lastDraw < this.options.skip) {
            return;
        } else {
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
        let pix = this.context.getImageData(0, 0, w, h).data;

        if (this.options.procedure === 'ascii') {
            this._drawAscii(pix, w, h, this.options.asciiSigns);
        } else if (this.options.procedure === 'color') {
            this._drawColored(pix, w, h);
        } else if (this.options.procedure === 'blackandwhite') {
            this._drawBlackAndWhite(pix, w, h);
        } else if (this.options.procedure === 'rainbow') {
            this._drawRainbow(w, h);
        } else {
            this._backimg();
        }
    }

    _drawRainbow(cols, rows) {

        let text = "\n";
        let char = String.fromCharCode("0x2588"); // Full Block
        let styles = [];
        let gap = 8;
        let style, t, t1, t2, cx, cy, hue, sat, lig;

        for (let y = 0; y < rows; y++) {

            text += "%c" + char + "\n";
            style = "color:transparent; text-shadow:";

            for (let x = 0; x < cols; x++) {
                t = window.performance.now() / 1000;
                t1 = Math.sin(t) * 0.5 + 0.5; // Oscillates between 0 and 1
                t2 = Math.sin(t + 4000) * 0.25 + 0.75; // Alternative oscillation
                cx = x / cols;
                cy = y / rows;
                hue = Math.round((cx * cx * t2 + cy * cy * t1) * 360);
                sat = 100;
                lig = 70;

                // text-shadow: [X]px 0 hsl(220, 100, 70) [seperate with comma, if not last]
                style += (x * gap) + "px 0 hsl(" + hue + "," + sat + "%," + lig + "%)";
                if (x < (cols - 1)) {
                    style += ", ";
                }
            }

            styles.push(style);
        }

        // Text as first entry in array
        styles.unshift(text);
        console.log.apply(console, styles);
    }



    _drawAscii(pix, w, h, signs) {

        let text = "\n",
            lum, step, index;
        if (signs === '') {
            signs = "X";
        }

        for (let y = 0; y < h; y++) {

            for (let i = y * (4 * w); i < y * (4 * w) + (4 * w); i += 4) {
                // Luminance calculated from RGB
                lum = 0.2126 * pix[i] + 0.7152 * pix[i + 1] + 0.0722 * pix[i + 2];
                step = 255 / (signs.length - 1); // Ex: 255/6 = 42.5
                index = Math.floor((signs.length - 1) - lum / step);

                // Twice the sign to compensate its vertical nature
                text += signs[index] + signs[index];

            }

            text += "\n";

        }

        console.log(text);

    }


    _drawColored(pix, w, h) {

        let blocks = "\n";
        let styles = [];
        let char = String.fromCharCode("0x3000"); // Big Space

        for (let y = 0; y < h; y++) {

            for (let x = y * (4 * w); x < y * (4 * w) + (4 * w); x += 4) {
                styles.push("background-color: rgb(" + pix[x] + "," + pix[x + 1] + "," + pix[x + 2] + ");");

                blocks += "%c" + char;
            }

            blocks += "\n";

        }

        styles.unshift(blocks);
        console.log.apply(console, styles);

    }

    _desaturate(r, g, b) {
        let intensity = 0.3 * r + 0.59 * g + 0.11 * b;
        let k = 1;
        r = Math.floor(intensity * k + r * (1 - k));
        g = Math.floor(intensity * k + g * (1 - k));
        b = Math.floor(intensity * k + b * (1 - k));
        return [r, g, b];
    }

    _drawBlackAndWhite(pix, w, h) {

        let blocks = "\n",
            baw;
        let styles = [];
        let char = String.fromCharCode("0x3000"); // Big Space

        for (let y = 0; y < h; y++) {

            for (let x = y * (4 * w); x < y * (4 * w) + (4 * w); x += 4) {
                baw = this._desaturate(pix[x], pix[x + 1], pix[x + 2]);
                styles.push("background-color: rgb(" + baw[0] + "," + baw[1] + "," + baw[2] + ")");
                blocks += "%c" + char;
            }

            blocks += "\n";

        }

        styles.unshift(blocks);
        if (this.options.clear) {
            console.clear();
        }
        console.log.apply(console, styles);

    }

    _backimg() {
        let url = this.canvas.toDataURL();
        console.log("%c   ", "font-size:200px; background-image:url(" + url + "); background-size:contain; background-repeat:no-repeat; background-position:center");
    }


    _getStream(video) {
        if (window.navigator.getUserMedia) {
            window.navigator.getUserMedia(this.constraint, function(stream) {
                video.src = stream;
            }, this._error);
        } else if (window.navigator.webkitGetUserMedia) {
            window.navigator.webkitGetUserMedia(this.constraint, function(stream) {
                video.src = window.URL.createObjectURL(stream);
            }, this._error);
        } else if (window.navigator.mozGetUserMedia) {
            window.navigator.mozGetUserMedia(this.constraint, function(stream) {
                video.src = window.URL.createObjectURL(stream);
            }, this._error);
        }
    }
}


module.exports = ConsolePlayer;
