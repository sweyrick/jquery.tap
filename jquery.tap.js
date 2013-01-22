(function(document, $) {
    'use strict';

    /**
     * Flag to determine if touch is supported
     *
     * @type {Boolean}
     * @constant
     */
    $.support.touch = (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);

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
    var HELPER_NAMESPACE = '.__tap-helper';

    /**
     * Event name
     *
     * @type {String}
     * @constant
     */
    var EVENT_NAME = 'tap';

    /**
     * Unique ID used to generate unique helper namespaces
     *
     * @type {Number}
     * @static
     */
    var ID = 0;

    /**
     * Event variables to copy to touches
     *
     * @type {Array}
     * @constant
     */
    var EVENT_VARIABLES = 'clientX clientY screenX screenY pageX pageY'.split(' ');

    /**
     * @type {Mouse}
     */
    var Mouse = (function() {

        /**
         * Mouse tap event
         *
         * @name Mouse
         * @class
         * @constructor
         *
         * @param {jQuery} $target
         * @param {Object} handleObj
         */
        var Mouse = function($target, handleObj) {
            if ($target !== undefined) {
                this.init($target, handleObj);
            }
        };

        var proto = Mouse.prototype;

        /**
         * @param {jQuery} $target
         * @param {Object} handleObj
         * @return {Mouse}
         */
        proto.init = function($target, handleObj) {

            /**
             * Target element
             *
             * @name Mouse#$target
             * @type {jQuery}
             */
            this.$target = $target;

            /**
             * Event selector
             *
             * @name Mouse#selector
             * @type {String}
             */
            this.selector = handleObj.selector;

            /**
             * Data to pass to event trigger
             *
             * @name Mouse#data
             * @type {Object}
             */
            this.data = handleObj.data;

            /**
             * Helper events namespace
             *
             * @name Mouse#namespace
             * @type {String}
             */
            this.namespace = HELPER_NAMESPACE + ID++;

            /**
             * X position of touch on touchstart
             *
             * @name Mouse#startX
             * @type {Number}
             */
            this.startX = 0;

            /**
             * Y position of touch on touchstart
             *
             * @name Mouse#startY
             * @type {Number}
             */
            this.startY = 0;

            /**
             * Flag to determine if touch is being tracked
             *
             * @name Mouse#isTracking
             * @type {Boolean}
             */
            this.isTracking = false;

            return this
                .setupHandlers()
                .reset()
                .enable();
        };

        /**
         * Setup event handlers
         *
         * @return {Mouse}
         */
        proto.setupHandlers = function() {

            /**
             * onDown handler
             *
             * @name Mouse#onDown
             * @type {Function}
             */
            this.onDown = $.proxy(this._onDown, this);

            /**
             * onMove handler
             *
             * @name Mouse#onMove
             * @type {Function}
             */
            this.onMove = $.proxy(this._onMove, this);

            /**
             * onUp handler
             *
             * @name Mouse#onUp
             * @type {Function}
             */
            this.onUp = $.proxy(this._onUp, this);

            /**
             * onCancel handler
             *
             * @name Mouse#onCancel
             * @type {Function}
             */
            this.onCancel = $.proxy(this._onCancel, this);

            return this;
        };

        /**
         * Start listening for mousedown
         *
         * @return {Mouse}
         */
        proto.enable = function() {
            this.$target.on('mousedown' + this.namespace, this.selector, this.onDown);
            return this;
        };

        /**
         * Stop listening for mousedown
         *
         * @return {Mouse}
         */
        proto.disable = function() {
            this.$target.off('mousedown' + this.namespace, this.selector, this.onDown);
            return this;
        };

        /**
         * Reset values
         *
         * @return {Mouse}
         */
        proto.reset = function() {
            //reset state
            this.startX = 0;
            this.startY = 0;
            this.isTracking = false;

            return this;
        };

        /**
         * Destroy Tap object
         *
         * @return {Mouse}
         */
        proto.destroy = function() {
            this.onCancel();
            return this.disable();
        };

        /**
         * Get X and Y coordinates
         *
         * @param {jQuery.Event} e
         * @return {Array}
         */
        proto.getCoordinates = function(e) {
            return [e.clientX, e.clientY];
        };

        /**
         * Log start position and time
         * Add event listeners
         *
         * @param {jQuery.Event} e
         * @private
         */
        proto._onDown = function(e) {
            // do not bind event listeners again if already bound
            if (this.isTracking) {
                return;
            }

            this.isTracking = true;

            var coords = this.getCoordinates(e);

            this.startX = coords[0];
            this.startY = coords[1];

            this.$target
                .on('mousemove' + this.namespace, this.onMove)
                .on('click' + this.namespace, this.selector, this.onUp);
        };

        /**
         * Determine if mouse has moved too much
         *
         * @param {jQuery.Event} e
         * @private
         */
        proto._onMove = function(e) {
            var coords = this.getCoordinates(e);

            if (Math.abs(coords[0] - this.startX) > MAX_MOVE || Math.abs(coords[1] - this.startY) > MAX_MOVE) {
                this.onCancel();
            }
        };

        /**
         * If this is not a manual jQuery.trigger, then trigger the tap event for desktop clicks
         *
         * @param {jQuery.Event} e
         * @private
         */
        proto._onUp = function(e) {
            if (!e.isTrigger && !e.originalEvent.triggeredTap) {
                // Make sure any parents also emulating a tap event do not also fire tap.
                // Triggering the tap event below will bubble the event anyway.
                e.originalEvent.triggeredTap = true;
                e.type = 'tap';
                e.data = this.data;
                this.$target.trigger(e);
            }

            this.onCancel();
        };

        /**
         * Remove all events and reset parameters
         *
         * @param {jQuery.Event} e
         * @private
         */
        proto._onCancel = function (e) {
            this.reset();
            this.$target
                .off('mousemove' + this.namespace, this.onMove)
                .off('click' + this.namespace, this.selector, this.onUp);
        };

        return Mouse;

    }());

    /**
     * @type {Tap}
     */
    var Tap = (function(Mouse) {

        /**
         * Create tap event with data from touchEnd event
         *
         * @param {jQuery.Event} e
         * @param {Object} data
         * @return {jQuery.Event}
         * @private
         */
        var _createTapEvent = function(e, data) {
            var i = 0;
            var length = EVENT_VARIABLES.length;
            var touch = e.originalEvent.changedTouches[0];

            var event = $.Event(EVENT_NAME, e);
            event.type = EVENT_NAME;
            event.data = data;

            for (; i < length; i++) {
                event[EVENT_VARIABLES[i]] = touch[EVENT_VARIABLES[i]];
            }

            return event;
        };

        /**
         * Tap Class that will use touch/click events to trigger a tap event
         *
         * @class
         * @name Tap
         * @constructor
         *
         * @param {jQuery} $target
         * @param {Object} handleObj
         */
        var Tap = function($target, handleObj) {
            if ($target !== undefined) {
                this.init($target, handleObj);
            }
        };

        var proto = Tap.prototype = new Mouse();
        proto.constructor = Tap;

        var base = Mouse.prototype;

        /**
         * @param {jQuery} $target
         * @param {Object} handleObj
         * @return {Tap}
         */
        proto.init = function($target, handleObj) {

            /**
             * Number of touches
             *
             * @name Tap#touchStartCount
             * @type {Number}
             */
            this.touchStartCount = 0;

            return base.init.call(this, $target, handleObj);
        };

        /**
         * Start listening for touchstart
         *
         * @return {Tap}
         */
        proto.enable = function() {
            this.$target.on('touchstart' + this.namespace, this.selector, this.onDown);
            return this;
        };

        /**
         * Stop listening for touchstart
         *
         * @return {Tap}
         */
        proto.disable = function() {
            this.$target.off('touchstart' + this.namespace, this.selector, this.onDown);
            return this;
        };

        /**
         * Reset values
         *
         * @return {Tap}
         */
        proto.reset = function() {
            this.touchStartCount = 0;
            return base.reset.call(this);
        };

        /**
         * Get X and Y coordinates
         *
         * @param {jQuery.Event} e
         * @return {Array}
         */
        proto.getCoordinates = function(e) {
            return [e.originalEvent.touches[0].clientX, e.originalEvent.touches[0].clientY];
        };

        /**
         * Save touch position and start listening to touchmove and touchend
         *
         * @param {jQuery.Event} e
         * @private
         */
        proto._onDown = function (e) {
            this.touchStartCount = e.originalEvent.touches.length;

            // do not bind event listeners again if already bound
            if (this.isTracking) {
                return;
            }

            this.isTracking = true;

            this.startX = e.originalEvent.touches[0].clientX;
            this.startY = e.originalEvent.touches[0].clientY;

            this.$target
                .on('touchmove' + this.namespace, this.selector, this.onMove)
                .on('touchend' + this.namespace, this.selector, this.onUp)
                .on('touchcancel' + this.namespace, this.selector, this.onCancel);
        };

        /**
         * Determine if a valid tap event and trigger tap
         *
         * @param {jQuery.Event} e
         * @private
         */
        proto._onUp = function (e) {
            if (
                !this.touchStartCount ||
                e.originalEvent.touches.length > 0 ||
                this.touchStartCount > 1
            ) {
                return;
            }

            if (!e.originalEvent.triggeredTap) {
                // Make sure any parents also emulating a tap event do not also fire tap.
                // Triggering the tap event below will bubble the event anyway.
                e.originalEvent.triggeredTap = true;
                this.$target.trigger(_createTapEvent(e, this.data));
            }

            this.onCancel();
        };

        /**
         * Remove all events and reset parameters
         *
         * @param {jQuery.Event} e
         * @private
         */
        proto._onCancel = function (e) {
            this.reset();
            this.$target
                .off('touchmove' + this.namespace, this.selector, this.onMove)
                .off('touchend' + this.namespace, this.selector, this.onUp)
                .off('touchcancel' + this.namespace, this.selector, this.onCancel);
        };

        return Tap;

    }(Mouse));

    /**
     * Create new special tap event
     *
     * @type {Object}
     */
    $.event.special[EVENT_NAME] = {

        /**
         * Create new tap object to handle triggering tap when appropriate
         *
         * @param {Object} handleObj
         */
        add: function(handleObj) {
            var type = $.support.touch ? Tap : Mouse;
            handleObj.tap = new type($(this), handleObj);
        },

        /**
         * Remove all Tap events
         *
         * @param {Object} handleObj
         */
        remove: function(handleObj) {
            if (handleObj.tap && handleObj.tap.destroy) {
                handleObj.tap.destroy();
            }
        }
    };

}(document, jQuery));