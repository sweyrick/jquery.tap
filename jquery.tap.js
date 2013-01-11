(function(document, $) {
    'use strict';

    /**
     * Max tap duration
     *
     * @type {Number}
     * @constant
     */
    var MAX_DURATION = 300;

    /**
     * Max touch move
     *
     * @type {Number}
     * @constant
     */
    var MAX_MOVE = 10;

    /**
     * Event namespace
     *
     * @type {String}
     * @constant
     */
    var HELPER_NAMESPACE = '.tap-helper';

    /**
     * Event name
     *
     * @type {String}
     * @constant
     */
    var EVENT = 'tap';

    /**
     * Event variables to pass
     *
     * @type {Array}
     * @constant
     */
    var EVENT_VARIABLES = [
        'clientX',
        'clientY',
        'screenX',
        'screenY',
        'pageX',
        'pageY'
    ];

    /**
     * Create tap event with data from touchEnd event
     *
     * @param {Event} e
     * @param {Object} data
     * @return {jQuery.Event}
     * @private
     */
    var _createTapEvent = function(e, data) {
        var i = 0;
        var length = EVENT_VARIABLES.length;
        var touch = e.originalEvent.changedTouches[0];

        var event = $.Event(EVENT, e);
        event.type = EVENT;
        event.data = data;

        for (; i < length; i++) {
            event[EVENT_VARIABLES[i]] = touch[EVENT_VARIABLES[i]];
        }

        return event;
    };

    /**
     * Tap
     * @class
     * @name Tap
     *
     * @param {jQuery} $target
     * @param {String} selector
     * @param {Object} data
     * @constructor
     */
    function Tap($target, selector, data) {

        /**
         * Target element
         *
         * @name Tap#$target
         * @type {jQuery}
         */
        this.$target = $target;

        /**
         * Event selector
         *
         * @name Tap#selector
         * @type {String}
         */
        this.selector = selector || '';

        /**
         * Data to pass to event trigger
         *
         * @name Tap#data
         * @type {Object}
         */
        this.data = data;

        /**
         * Has touch moved past threshold?
         *
         * @name Tap#moved
         * @type {Boolean}
         */
        this.moved = false;

        /**
         * X position of touch on touchstart
         *
         * @name Tap#startX
         * @type {Number}
         */
        this.startX = 0;

        /**
         * Y position of touch on touchstart
         *
         * @name Tap#startY
         * @type {Number}
         */
        this.startY = 0;

        /**
         * time of touch on touchstart
         *
         * @name Tap#startTime
         * @type {Number}
         */
        this.startTime = 0;

        this
            .setupHandlers()
            .reset()
            .enable();
    }

    Tap.prototype = {

        /**
         * Setup event handlers
         *
         * @return {Tap}
         */
        setupHandlers: function() {

            /**
             * _onTouchStart handler
             *
             * @name Tap#onTouchStart
             * @type {Function}
             */
            this.onTouchStart = this._onTouchStart.bind(this);

            /**
             * _onTouchMove handler
             *
             * @name Tap#onTouchMove
             * @type {Function}
             */
            this.onTouchMove = this._onTouchMove.bind(this);

            /**
             * _onTouchEnd handler
             *
             * @name Tap#onTouchEnd
             * @type {Function}
             */
            this.onTouchEnd = this._onTouchEnd.bind(this);

            /**
             * _onTouchCancel handler
             *
             * @name Tap#onTouchCancel
             * @type {Function}
             */
            this.onTouchCancel = this._onTouchCancel.bind(this);

            return this;
        },

        /**
         * Start listening for touchstart
         *
         * @return {Tap}
         */
        enable: function() {
            this.$target.on('touchstart' + HELPER_NAMESPACE, this.selector, this.onTouchStart);
            return this;
        },

        /**
         * Stop listening for touchstart
         *
         * @return {Tap}
         */
        disable: function() {
            this.$target.off('touchstart' + HELPER_NAMESPACE, this.selector, this.onTouchStart);
            return this;
        },

        /**
         * Reset values
         *
         * @return {Tap}
         */
        reset: function() {
            //reset state
            this.moved = false;
            this.startX = 0;
            this.startY = 0;
            this.startTime = 0;

            return this;
        },

        /**
         * Save touch position and start listening to touchmove and touchend
         *
         * @param {jQuery.Event} e
         * @private
         */
        _onTouchStart: function (e) {

            /**
             * Target element
             *
             * @name Tap#$element
             * @type {HTMLElement}
             */
            this.$element = $(e.target);

            this.moved = false;
            this.startX = e.originalEvent.touches[0].clientX;
            this.startY = e.originalEvent.touches[0].clientY;
            this.startTime = Date.now();

            this.$target
                .on('touchmove' + HELPER_NAMESPACE, this.selector, this.onTouchMove)
                .on('touchend' + HELPER_NAMESPACE, this.selector, this.onTouchEnd)
                .on('touchcancel' + HELPER_NAMESPACE, this.selector, this.onTouchCancel);
        },

        /**
         * Determine if touch has moved too far to be considered a tap
         *
         * @param {jQuery.Event} e
         * @private
         */
        _onTouchMove: function (e) {
            var x = e.originalEvent.touches[0].clientX;
            var y = e.originalEvent.touches[0].clientY;

            //if finger moves more than 10px flag to cancel
            if (Math.abs(x - this.startX) > MAX_MOVE || Math.abs(y - this.startY) > MAX_MOVE) {
                this.moved = true;
            }
        },

        /**
         * Determine if a valid tap event and trigger tap
         *
         * @param {jQuery.Event} e
         * @private
         */
        _onTouchEnd: function (e) {
            var tag = e.target.tagName;

            //only preventDefault on elements that are not form inputs
            if (tag !== 'SELECT' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
                e.preventDefault();
            }

            if (!this.moved && Date.now() - this.startTime < MAX_DURATION) {
                this.$element.trigger(_createTapEvent(e, this.data));
            }

            this.onTouchCancel();
        },

        /**
         * Remove touchmove, touchend, and touchcancel events
         * @private
         */
        _onTouchCancel: function () {
            this
                .reset()
                .$target
                .off('touchmove' + HELPER_NAMESPACE, this.selector, this.onTouchMove)
                .off('touchend' + HELPER_NAMESPACE, this.selector, this.onTouchEnd)
                .off('touchcancel' + HELPER_NAMESPACE, this.selector, this.onTouchCancel);
        }
    };

    /**
     * Create new special tap event
     *
     * @type {Object}
     */
    $.event.special[EVENT] = {

        /**
         * Create new tap object and bind touchstart event
         *
         * @param {Object} handleObj
         */
        add: function(handleObj) {
            new Tap($(this), handleObj.selector, handleObj.data);
        },

        /**
         * Remove all Tap events
         *
         * @param {Object} handleObj
         */
        remove: function(handleObj) {
            $(this).off(HELPER_NAMESPACE, handleObj.selector);
        }
    };

    return $;

}(document, jQuery));