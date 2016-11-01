/*jshint esversion: 6*/

module.exports = {
    convBoolean: function(options, key, defaultValue) {
        'use strict';
        
        if (typeof options(key) === 'boolean') {
            return options(key);
        } else {
            var stringBoolean = options(key);
            if (stringBoolean) {
                if (stringBoolean === 'true') {
                    return true;
                } else if (stringBoolean === 'false') {
                    return false;
                } else {
                    return defaultValue;
                }
            } else {
                return defaultValue;
            }
        }
    }
};
