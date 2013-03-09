(function() {
    'use strict';

    /**
     * Tag ID
     *
     * @type {String}
     * @constant
     */
    var VERSION_ID = "0.9.6";

    /**
     * User local copy of tap?
     *
     * @type {boolean}
     * @constant
     */
    var LOCAL = false;

    /**
     * URLs
     *
     * @type {Object}
     */
    var URL = {
        DOWNLOAD: {
            ZIP: 'https://github.com/aarongloege/jquery.tap/archive/' + VERSION_ID + '.zip',
            TAR: 'https://github.com/aarongloege/jquery.tap/archive/' + VERSION_ID + '.tar.gz'
        },
        SCRIPT: 'https://raw.github.com/aarongloege/jquery.tap/' + VERSION_ID + '/jquery.tap.js',
        LOCAL: '../jquery.tap.js'
    };

    window.APP = {

        /**
         * Get Download URL
         *
         * @param {String} type
         * @return {String}
         */
        getDownload: function(type) {
            var url = URL.DOWNLOAD.ZIP;
            if (type === 'tar') {
                url = URL.DOWNLOAD.TAR;
            }
            return url;
        },

        /**
         * Get Script URL
         *
         * @return {String}
         */
        getScript: function() {
            return LOCAL ? URL.LOCAL : URL.SCRIPT;
        },

        /**
         * Get version ID
         *
         * @return {String}
         */
        getVersion: function() {
            return VERSION_ID;
        },

        /**
         * Create script element
         *
         * @return {HTMLElement}
         */
        createScript: function() {
            return '<script src="' + APP.getScript() + '"></script>';
        },

        /**
         * Write script to page
         */
        appendScript: function() {
            document.write(APP.createScript());
        }

    };

}());