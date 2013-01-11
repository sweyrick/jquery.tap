(function($) {
    'use strict';

    $(document).ready(function() {

        var $touchInner = $('.touch-inner');
        var parent = $touchInner.parent()[0];

        $('.touch-area').on('tap', function(e) {
            console.log('tap event', e);
            $touchInner.prepend("Tap {\n    x: " + e.pageX + ",\n    y: " + e.pageY + "\n};\n");
            parent.scrollTop = 0;
        });

        $('body').on('touchmove', '.touch-area', function(e) {
            e.preventDefault();
        })

    });

}(jQuery));