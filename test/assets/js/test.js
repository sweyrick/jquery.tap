(function($, mocha) {
    'use strict';

    mocha.setup({ ignoreLeaks: true, ui: 'bdd' });

    var touchA = '#touchA';
    var touchB = '#touchB';
    var $body = $('body');
    var $touchA = $(touchA);
    var $touchB = $(touchB);

    var taps = 0;

    var _onTap = function() {
        taps++;
    };

    beforeEach(function() {
        $.support.touch = this.touch === true;
        taps = 0;
    });

    afterEach(function() {
        $body.off();
        $touchA.off();
        $touchB.off();
    });

    describe('Manual Triggers', function() {

        it('will trigger tap if tap is manually triggered on same element', function() {
            $touchA
                .on('tap', _onTap)
                .trigger('tap');

            expect(taps).to.be(1);
        });

        it('will trigger tap if tap is manually triggered on child element', function() {
            $touchA.on('tap', _onTap);
            $touchB.trigger('tap');

            expect(taps).to.be(1);
        });

        it('will trigger tap if tap is manually triggered on same element with namespace', function() {
            $touchA
                .on('tap.tap1', _onTap)
                .on('tap.tap2', _onTap)
                .trigger('tap.tap2');

            expect(taps).to.be(1);
        });

        it('will trigger namespaced taps if tap is manually triggered on same element without namespace', function() {
            $touchA
                .on('tap.tap1', _onTap)
                .on('tap.tap2', _onTap)
                .trigger('tap');

            expect(taps).to.be(2);
        });

        it('will not trigger tap if click is manually triggered on same element', function() {
            $touchA
                .on('tap.tap1', _onTap)
                .on('tap.tap2', _onTap)
                .trigger('click');

            expect(taps).to.be(0);
        });

        it('will not trigger tap if click is manually triggered on child element', function() {
            $touchA
                .on('tap.tap1', _onTap)
                .on('tap.tap2', _onTap);

            $touchB.trigger('click');

            expect(taps).to.be(0);
        });
    });

    describe('Delegate Manual Triggers', function() {

        it('will trigger tap if tap is manually triggered on same element', function() {
            $body.on('tap', touchA, _onTap);
            $touchA.trigger('tap');

            expect(taps).to.be(1);
        });

        it('will trigger tap if tap is manually triggered on child element', function() {
            $body.on('tap', touchA, _onTap);
            $touchB.trigger('tap');

            expect(taps).to.be(1);
        });

        it('will trigger tap if tap is manually triggered on same element with namespace', function() {
            $body.on('tap.tap1', touchA, _onTap);
            $body.on('tap.tap2', touchA, _onTap);
            $touchA.trigger('tap.tap2');

            expect(taps).to.be(1);
        });

        it('will trigger namespaced taps if tap is manually triggered on same element without namespace', function() {
            $body.on('tap.tap1', touchA, _onTap);
            $body.on('tap.tap2', touchA, _onTap);
            $touchA.trigger('tap');

            expect(taps).to.be(2);
        });

        it('will not trigger tap if click is manually triggered on same element', function() {
            $body.on('tap.tap1', touchA, _onTap);
            $body.on('tap.tap2', touchA, _onTap);
            $touchA.trigger('click');

            expect(taps).to.be(0);
        });

        it('will not trigger tap if click is manually triggered on child element', function() {
            $body.on('tap.tap1', touchA, _onTap);
            $body.on('tap.tap2', touchA, _onTap);
            $touchB.trigger('click');

            expect(taps).to.be(0);
        });
    });

    describe('Touch Events', function() {

        it('will trigger tap after touchstart, touchmove, and touchend in less than 300ms', function() {
            this.touch = $.support.touch = true;
            $touchA
                .on('tap', _onTap)
                .simulate('touchstart')
                .simulate('touchmove')
                .simulate('touchend');

            expect(taps).to.be(1);
        });

        it('will not trigger if moved more than 10px between touchstart and touchmove', function() {
            $touchA
                .on('tap', _onTap)
                .simulate('touchstart')
                .simulate('touchmove', { clientX: 20, clientY: 20 })
                .simulate('touchend');

            expect(taps).to.be(0);
        });

        it('will not trigger if moved more than 300ms elapse between touchstart and touchmove', function(done) {
            $touchA
                .on('tap', _onTap)
                .simulate('touchstart')
                .simulate('touchmove');

            setTimeout(function() {
                $touchA.simulate('touchend');
                expect(taps).to.be(0);
                done();
            }, 400);
        });

        it('will trigger if moved less than 300ms elapse between touchstart and touchmove', function(done) {
            $touchA
                .on('tap', _onTap)
                .simulate('touchstart')
                .simulate('touchmove');

            setTimeout(function() {
                $touchA.simulate('touchend');
                expect(taps).to.be(1);
                done();
            }, 200);
        });

        it('will trigger tap on parent element when triggered on child', function() {
            $body.on('tap', _onTap);
            $touchA
                .simulate('touchstart')
                .simulate('touchmove')
                .simulate('touchend');

            expect(taps).to.be(1);
        });

        it('will trigger tap 2x on parent element when triggered on child', function() {
            $body.on('tap', _onTap);
            $touchA
                .on('tap', _onTap)
                .simulate('touchstart')
                .simulate('touchmove')
                .simulate('touchend');

            expect(taps).to.be(2);
        });

        it('will not trigger if more than one touch occures', function() {
            $body.on('tap', _onTap);
            $touchA
                .on('tap', _onTap)
                .simulate('touchstart')
                .simulate('touchstart', {}, 2)
                .simulate('touchend', {}, 1)
                .simulate('touchend');

            expect(taps).to.be(0);
        });

    });

    describe('Delegate Touch Events', function() {

        it('will trigger tap after touchstart, touchmove, and touchend in less than 300ms', function() {
            this.touch = $.support.touch = true;
            $body.on('tap', touchA, _onTap);
            $touchA
                .simulate('touchstart')
                .simulate('touchmove')
                .simulate('touchend');

            expect(taps).to.be(1);
        });

        it('will not trigger if moved more than 10px between touchstart and touchmove', function() {
            $body.on('tap', touchA, _onTap);
            $touchA
                .simulate('touchstart')
                .simulate('touchmove', { clientX: 20, clientY: 20 })
                .simulate('touchend');

            expect(taps).to.be(0);
        });

        it('will not trigger if moved more than 300ms elapse between touchstart and touchmove', function(done) {
            $body.on('tap', touchA, _onTap);
            $touchA
                .simulate('touchstart')
                .simulate('touchmove');

            setTimeout(function() {
                $touchA.simulate('touchend');
                expect(taps).to.be(0);
                done();
            }, 400);
        });

        it('will trigger if moved less than 300ms elapse between touchstart and touchmove', function(done) {
            $body.on('tap', touchA, _onTap);
            $touchA
                .simulate('touchstart')
                .simulate('touchmove');

            setTimeout(function() {
                $touchA.simulate('touchend');
                expect(taps).to.be(1);
                done();
            }, 200);
        });

        it('will trigger tap on parent element when triggered on child', function() {
            $body.on('tap', touchA, _onTap);
            $touchB
                .simulate('touchstart')
                .simulate('touchmove')
                .simulate('touchend');

            expect(taps).to.be(1);
        });

        it('will trigger tap 2x on parent element when triggered on child', function() {
            $body.on('tap', touchA, _onTap);
            $touchB
                .on('tap', _onTap)
                .simulate('touchstart')
                .simulate('touchmove')
                .simulate('touchend');

            expect(taps).to.be(2);
        });

    });

    describe('Click Events', function() {

        it('will trigger tap on click', function() {
            this.touch = $.support.touch = false;
            $touchA
                .on('tap', _onTap)
                .simulate('click');

            expect(taps).to.be(1);
        });

        it('will trigger tap on parent element when triggered on child bound to parent', function() {
            $body.on('tap', _onTap);
            $touchA
                .simulate('click');

            expect(taps).to.be(1);
        });

        it('will trigger tap 2x on parent element when triggered on child and bound to both parent and child', function() {
            $body.on('tap', _onTap);
            $touchA
                .on('tap', _onTap)
                .simulate('click');

            expect(taps).to.be(2);
        });

    });

    describe('Delegate Click Events', function() {

        it('will trigger tap on click', function() {
            this.touch = $.support.touch = false;
            $body.on('tap', touchA, _onTap);
            $touchA
                .simulate('click');

            expect(taps).to.be(1);
        });

        it('will trigger tap on parent element when triggered on child and bound to parent', function() {
            $body.on('tap', touchA, _onTap);
            $touchB
                .simulate('click');

            expect(taps).to.be(1);
        });

        it('will trigger tap 2x on parent element when triggered on child and bound to both parent and child', function() {
            $body.on('tap', touchA, _onTap);
            $touchB
                .on('tap', _onTap)
                .simulate('click');

            expect(taps).to.be(2);
        });

    });

    $(document).ready(function() {
        mocha.run();
    });

}(jQuery, mocha));