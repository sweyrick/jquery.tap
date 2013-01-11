(function($) {
    'use strict';

    $(document).ready(function() {

        var $touchInner = $('.touch-inner');

        $('.touch-area').on('tap', function(e) {
            console.log('tap event', e);
            $touchInner.prepend("Tap {\n    x: " + e.pageX + ",\n    y: " + e.pageY + "\n};\n");
        });

    });

}(jQuery));