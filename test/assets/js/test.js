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

        describe('Direct Callback Bindings', function() {

            it('will trigger tap event if tap is manually triggered on same element', function() {
                $touchA
                    .on('tap', _onTap)
                    .trigger('tap');

                expect(taps).to.be(1);
            });

            it('will trigger tap event if tap is manually triggered on child element', function() {
                $touchA.on('tap', _onTap);
                $touchB.trigger('tap');

                expect(taps).to.be(1);
            });

            it('will trigger namespaced tap event if namespaced tap is manually triggered on same element', function() {
                $touchA
                    .on('tap.tap1', _onTap)
                    .on('tap.tap2', _onTap)
                    .trigger('tap.tap2');

                expect(taps).to.be(1);
            });

            it('will trigger namespaced tap event if non-namespaced tap is manually triggered on same element', function() {
                $touchA
                    .on('tap.tap1', _onTap)
                    .on('tap.tap2', _onTap)
                    .trigger('tap');

                expect(taps).to.be(2);
            });

            it('will not trigger tap event if click is manually triggered on same element', function() {
                $touchA
                    .on('tap', _onTap)
                    .trigger('click');

                expect(taps).to.be(0);
            });

            it('will not trigger tap event if click is manually triggered on child element', function() {
                $touchA.on('tap', _onTap);
                $touchB.trigger('click');

                expect(taps).to.be(0);
            });

            it('will bubble tap event when triggered', function() {
                $body.on('tap', _onTap);
                $touchA.on('tap', _onTap);
                $touchB.trigger('tap');

                expect(taps).to.be(2);
            });
        });

        describe('Delegate Callback Bindings', function() {

            it('will trigger tap event if tap is manually triggered on target selector', function() {
                $body.on('tap', touchA, _onTap);
                $touchA.trigger('tap');

                expect(taps).to.be(1);
            });

            it('will trigger tap event if tap is manually triggered on child of target selector', function() {
                $body.on('tap', touchA, _onTap);
                $touchB.trigger('tap');

                expect(taps).to.be(1);
            });

            it('will trigger namespaced tap event if namespaced tap is manually triggered on target selector', function() {
                $body.on('tap.tap1', touchA, _onTap);
                $body.on('tap.tap2', touchA, _onTap);
                $touchA.trigger('tap.tap2');

                expect(taps).to.be(1);
            });

            it('will trigger namespaced taps if non-namespaced tap is manually triggered on target selector', function() {
                $body.on('tap.tap1', touchA, _onTap);
                $body.on('tap.tap2', touchA, _onTap);
                $touchA.trigger('tap');

                expect(taps).to.be(2);
            });

            it('will not trigger tap event if click is manually triggered on target selector', function() {
                $body.on('tap.tap1', touchA, _onTap);
                $body.on('tap.tap2', touchA, _onTap);
                $touchA.trigger('click');

                expect(taps).to.be(0);
            });

            it('will not trigger tap event if click is manually triggered on child of target selector', function() {
                $body.on('tap.tap1', touchA, _onTap);
                $body.on('tap.tap2', touchA, _onTap);
                $touchB.trigger('click');

                expect(taps).to.be(0);
            });

            it('will bubble tap event when triggered', function() {
                $body
                    .on('tap', touchA, _onTap)
                    .on('tap', touchB, _onTap);
                $touchB.trigger('tap');

                expect(taps).to.be(2);
            });
        });

    });

    describe('Touch Events', function() {

        describe('Direct Callback Bindings', function() {

            it('will trigger tap event after touchstart, touchmove, and touchend are triggered', function() {
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

            it('will trigger if 300ms elapse between touchstart and touchmove', function(done) {
                $touchA
                    .on('tap', _onTap)
                    .simulate('touchstart')
                    .simulate('touchmove');

                setTimeout(function() {
                    $touchA.simulate('touchend');
                    expect(taps).to.be(1);
                    done();
                }, 300);
            });

            it('will trigger if 1000ms elapse between touchstart and touchmove', function(done) {
                $touchA
                    .on('tap', _onTap)
                    .simulate('touchstart')
                    .simulate('touchmove');

                setTimeout(function() {
                    $touchA.simulate('touchend');
                    expect(taps).to.be(1);
                    done();
                }, 1000);
            });

            it('will trigger tap event on parent element when triggered on child', function() {
                $body.on('tap', _onTap);
                $touchA
                    .simulate('touchstart')
                    .simulate('touchmove')
                    .simulate('touchend');

                expect(taps).to.be(1);
            });

            it('will trigger tap event 2x on parent element when triggered on child', function() {
                $body.on('tap', _onTap);
                $touchA
                    .on('tap', _onTap)
                    .simulate('touchstart')
                    .simulate('touchmove')
                    .simulate('touchend');

                expect(taps).to.be(2);
            });

            it('will not trigger if more than one touch', function() {
                $body.on('tap', _onTap);
                $touchA
                    .on('tap', _onTap)
                    .simulate('touchstart')
                    .simulate('touchstart', {}, 2)
                    .simulate('touchend', {}, 1)
                    .simulate('touchend');

                expect(taps).to.be(0);
            });

            it('will bubble tap event after touchstart and touchend', function() {
                $body.on('tap', _onTap);
                $touchA.on('tap', _onTap);
                $touchB
                    .simulate('touchstart')
                    .simulate('touchend');

                expect(taps).to.be(2);
            });

        });

        describe('Delegate Callback Bindings', function() {

            it('will trigger tap event after touchstart, touchmove, and touchend in less than 300ms', function() {
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

            it('will trigger if 300ms elapse between touchstart and touchmove', function(done) {
                $body.on('tap', touchA, _onTap);
                $touchA
                    .simulate('touchstart')
                    .simulate('touchmove');

                setTimeout(function() {
                    $touchA.simulate('touchend');
                    expect(taps).to.be(1);
                    done();
                }, 300);
            });

            it('will trigger if 1000ms elapse between touchstart and touchmove', function(done) {
                $body.on('tap', touchA, _onTap);
                $touchA
                    .simulate('touchstart')
                    .simulate('touchmove');

                setTimeout(function() {
                    $touchA.simulate('touchend');
                    expect(taps).to.be(1);
                    done();
                }, 1000);
            });

            it('will trigger tap event on parent element when triggered on child', function() {
                $body.on('tap', touchA, _onTap);
                $touchB
                    .simulate('touchstart')
                    .simulate('touchmove')
                    .simulate('touchend');

                expect(taps).to.be(1);
            });

            it('will trigger tap event 2x on parent element when triggered on child', function() {
                $body.on('tap', touchA, _onTap);
                $touchB
                    .on('tap', _onTap)
                    .simulate('touchstart')
                    .simulate('touchmove')
                    .simulate('touchend');

                expect(taps).to.be(2);
            });

            it('will bubble tap event after touchstart and touchend', function() {
                $body.on('tap', touchA, _onTap);
                $touchA.on('tap',touchB,  _onTap);
                $touchB
                    .simulate('touchstart')
                    .simulate('touchend');

                expect(taps).to.be(2);
            });

        });

    });

    describe('Click Events', function() {

        describe('Direct Callback Bindings', function() {

            it('will trigger tap event on click', function() {
                this.touch = $.support.touch = false;
                $touchA
                    .on('tap', _onTap)
                    .simulate('mousedown')
                    .simulate('click');

                expect(taps).to.be(1);
            });

            it('will trigger tap event on parent element when triggered on child bound to parent', function() {
                $body.on('tap', _onTap);
                $touchA
                    .simulate('mousedown')
                    .simulate('click');

                expect(taps).to.be(1);
            });

            it('will bubble tap event after click event', function() {
                $body.on('tap', _onTap);
                $touchA.on('tap', _onTap);
                $touchB
                    .simulate('mousedown')
                    .simulate('click');

                expect(taps).to.be(2);
            });
        });

        describe('Delegate Callback Bindings', function() {

            it('will trigger tap event on click', function() {
                this.touch = $.support.touch = false;
                $body.on('tap', touchA, _onTap);
                $touchA
                    .simulate('mousedown')
                    .simulate('click');

                expect(taps).to.be(1);
            });

            it('will trigger tap event on parent element when triggered on child and bound to parent', function() {
                $body.on('tap', touchA, _onTap);
                $touchB
                    .simulate('mousedown')
                    .simulate('click');

                expect(taps).to.be(1);
            });

            it('will bubble tap event after click event', function() {
                $body.on('tap', touchB, _onTap);
                $touchA
                    .on('tap', touchB, _onTap)
                    .on('tap', _onTap);
                $touchB
                    .simulate('mousedown')
                    .simulate('click');

                expect(taps).to.be(3);
            });

            it('will only trigger single tap event and not delegate tap events', function() {
                $body.on('tap', touchB, _onTap);
                $touchA
                    .on('tap', touchB, _onTap)
                    .on('tap', _onTap);
                $touchA
                    .simulate('mousedown')
                    .simulate('click');

                expect(taps).to.be(1);
            });

            it('will not trigger if mouse moves more than 10px', function() {
                $body.on('tap', touchB, _onTap);
                $touchA
                    .on('tap', touchB, _onTap)
                    .on('tap', _onTap);
                $touchB
                    .simulate('mousedown')
                    .simulate('mousemove', { clientX: 50 })
                    .simulate('click');

                expect(taps).to.be(0);
            });

        });
    });

    $(document).ready(function() {
        mocha.run();
    });

}(jQuery, mocha));