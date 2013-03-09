/**
 * @fileOverview
 * Copyright (c) 2013 Aaron Gloege
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * jQuery Tap Plugin
 * Using the tap event, this plugin will properly simulate a click event
 * in touch browsers using touch events, and on non-touch browsers,
 * click will automatically be used instead.
 *
 * @author Aaron Gloege
 * @version 1.0
 */
(function(document, $) {
    'use strict';

    /**
     * Flag to determine if touch is supported
     *
     * @type {boolean}
     * @constant
     */
    var TOUCH = $.support.touch = !!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch);

    /**
     * Event namespace
     *
     * @type {string}
     * @constant
     */
    var HELPER_NAMESPACE = '._tap';

    /**
     * Event name
     *
     * @type {string}
     * @constant
     */
    var EVENT_NAME = 'tap';

    /**
     * Event variables to copy to touches
     *
     * @type {Array}
     * @constant
     */
    var EVENT_VARIABLES = 'clientX clientY screenX screenY pageX pageY'.split(' ');

    /**
     * Object for tracking current touch settings (x, y, target, canceled, etc)
     *
     * @type {object}
     * @static
     */
    var TOUCH_VALUES = {

        /**
         * target element of touchstart event
         *
         * @type {jQuery}
         */
        $el: null,

        /**
         * pageX position of touch on touchstart
         *
         * @type {number}
         */
        x: 0,

        /**
         * pageY position of touch on touchstart
         *
         * @type {number}
         */
        y: 0,

        /**
         * Number of touches currently active on touchstart
         *
         * @type {number}
         */
        count: 0,

        /**
         * Has the current tap event been canceled?
         *
         * @type {boolean}
         */
        cancel: false

    };

    /**
     * Create a new event from the original event
     * Copy over EVENT_VARIABLES from the first changedTouches
     *
     * @param {string} type
     * @param {jQuery.Event} e
     * @return {jQuery.Event}
     * @private
     */
    var _createEvent = function(type, e) {
        var originalEvent = e.originalEvent;
        var event = $.Event(originalEvent);
        var touch = originalEvent.changedTouches ? originalEvent.changedTouches[0] : originalEvent;

        event.type = type;

        var i = 0;
        var length = EVENT_VARIABLES.length;

        for (; i < length; i++) {
            event[EVENT_VARIABLES[i]] = touch[EVENT_VARIABLES[i]];
        }

        return event;
    };

    /**
     * Tap object that will track touch events and
     * trigger the tap event when necessary
     *
     * @name Tap
     * @type {object}
     */
    var Tap = {

        /**
         * Flag to determine if touch events are currently enabled
         *
         * @type {boolean}
         */
        isEnabled: false,

        /**
         * Are we currently tracking a tap event?
         *
         * @type {boolean}
         */
        isTracking: false,

        /**
         * Enable touch event listeners
         *
         * @return {Tap}
         */
        enable: function() {
            if (this.isEnabled) {
                return this;
            }

            this.isEnabled = true;

            $(document.body)
                .on('touchstart' + HELPER_NAMESPACE, this.onTouchStart)
                .on('touchend' + HELPER_NAMESPACE, this.onTouchEnd)
                .on('touchcancel' + HELPER_NAMESPACE, this.onTouchCancel);

            return this;
        },

        /**
         * Disable touch event listeners
         *
         * @return {boolean}
         */
        disable: function() {
            if (!this.isEnabled) {
                return this;
            }

            this.isEnabled = false;

            $(document.body)
                .off('touchstart' + HELPER_NAMESPACE, this.onTouchStart)
                .off('touchend' + HELPER_NAMESPACE, this.onTouchEnd)
                .off('touchcancel' + HELPER_NAMESPACE, this.onTouchCancel);

            return this;
        },

        /**
         * Store touch start values and target
         * @param {jQuery.Event} e
         */
        onTouchStart: function(e) {
            var touches = e.originalEvent.touches;
            TOUCH_VALUES.count = touches.length;

            if (Tap.isTracking) {
                return;
            }

            Tap.isTracking = true;
            var touch = touches[0];

            TOUCH_VALUES.cancel = false;
            TOUCH_VALUES.$el = $(e.target);
            TOUCH_VALUES.x = touch.pageX;
            TOUCH_VALUES.y = touch.pageY;
        },

        /**
         * If touch has not been canceled, create a
         * tap event and trigger it on the target element
         *
         * @param {jQuery.Event} e
         */
        onTouchEnd: function(e) {
            if (
                !TOUCH_VALUES.cancel &&
                TOUCH_VALUES.count === 1 &&
                Tap.isTracking
            ) {
                TOUCH_VALUES.$el.trigger(_createEvent(EVENT_NAME, e));
            }
            // Cancel tap
            Tap.onTouchCancel(e);
        },

        /**
         * Cancel tap by setting TOUCH_VALUES.cancel to true
         *
         * @param {jQuery.Event} e
         */
        onTouchCancel: function(e) {
            Tap.isTracking = false;
            TOUCH_VALUES.cancel = true;
        }

    };

    // Setup special event and enable
    // tap only if a tap event is bound
    $.event.special[EVENT_NAME] = {
        setup: function() {
            Tap.enable();
        }
    };

    // If we are not in a touch compatible browser, map tap event to the click event
    if (!TOUCH) {

        /**
         * Click event ID's that have already been converted to a tap
         *
         * @type {object}
         * @private
         */
        var _converted = [];

        /**
         * Convert click events into tap events
         *
         * @param {jQuery.Event} e
         * @private
         */
        var _onClick = function(e) {
            var originalEvent = e.originalEvent;
            if (e.isTrigger || _converted.indexOf(originalEvent) >= 0) {
                return;
            }

            // limit size of _converted array
            if (_converted.length > 3) {
                _converted.splice(0, _converted.length - 3);
            }

            _converted.push(originalEvent);

            var event = _createEvent(EVENT_NAME, e);
            $(e.target).trigger(event);
        };

        // Bind click events that will be converted to a tap event
        //
        // Would have liked to use the bindType and delegateType properties
        // to map the tap event to click events, but this does not allow us to prevent the
        // tap event from triggering when a click event is manually triggered via .trigger().
        // Tap should only trigger if the user physically clicks.
        $.event.special[EVENT_NAME] = {
            setup: function() {
                $(this).on('click' + HELPER_NAMESPACE, _onClick);
            },
            teardown: function() {
                $(this).off('click' + HELPER_NAMESPACE, _onClick);
            }
        };
    }

}(document, jQuery));