(function($, mocha) {
    'use strict';

    mocha.setup({ ignoreLeaks: true, ui: 'bdd' });

    var spy = sinon.spy();

    var touchA = '#touchA';
    var touchB = '#touchB';

    var $body = $(document.body);
    var $touchA = $(touchA);
    var $touchB = $(touchB);

    beforeEach(function() {
        $.support.touch = this.touch === true;
    });

    afterEach(function() {
        $body.off();
        $touchA.off();
        $touchB.off();
        spy.reset();
    });

    describe('Manual Triggers', function() {

        describe('Direct Callback Bindings', function() {

            it('will trigger tap event if tap is manually triggered on same element', function() {
                $touchA
                    .on('tap', spy)
                    .trigger('tap');

                expect(spy.callCount).to.be(1);
            });

            it('will trigger tap event if tap is manually triggered on child element', function() {
                $touchA.on('tap', spy);
                $touchB.trigger('tap');

                expect(spy.callCount).to.be(1);
            });

            it('will trigger namespaced tap event if namespaced tap is manually triggered on same element', function() {
                $touchA
                    .on('tap.tap1', spy)
                    .on('tap.tap2', spy)
                    .trigger('tap.tap2');

                expect(spy.callCount).to.be(1);
            });

            it('will trigger namespaced tap event if non-namespaced tap is manually triggered on same element', function() {
                $touchA
                    .on('tap.tap1', spy)
                    .on('tap.tap2', spy)
                    .trigger('tap');

                expect(spy.callCount).to.be(2);
            });

            it('will not trigger tap event if click is manually triggered on same element', function() {
                console.log('trigger click');
                $touchA
                    .on('tap', spy)
                    .trigger('click');

                expect(spy.callCount).to.be(0);
            });

            it('will not trigger tap event if click is manually triggered on child element', function() {
                console.log('trigger click');
                $touchA.on('tap', spy);
                $touchB.trigger('click');

                expect(spy.callCount).to.be(0);
            });

            it('will bubble tap event when triggered', function() {
                console.log('test');
                $body.on('tap', spy);
                $touchA.on('tap', spy);
                $touchB.trigger('tap');

                expect(spy.callCount).to.be(2);
            });
        });

        describe('Delegate Callback Bindings', function() {

            it('will trigger tap event if tap is manually triggered on target selector', function() {
                $body.on('tap', touchA, spy);
                $touchA.trigger('tap');

                expect(spy.callCount).to.be(1);
            });

            it('will trigger tap event if tap is manually triggered on child of target selector', function() {
                $body.on('tap', touchA, spy);
                $touchB.trigger('tap');

                expect(spy.callCount).to.be(1);
            });

            it('will trigger namespaced tap event if namespaced tap is manually triggered on target selector', function() {
                $body
                    .on('tap.tap1', touchA, spy)
                    .on('tap.tap2', touchA, spy);
                $touchA.trigger('tap.tap2');

                expect(spy.callCount).to.be(1);
            });

            it('will trigger namespaced taps if non-namespaced tap is manually triggered on target selector', function() {
                $body
                    .on('tap.tap1', touchA, spy)
                    .on('tap.tap2', touchA, spy);
                $touchA.trigger('tap');

                expect(spy.callCount).to.be(2);
            });

            it('will not trigger tap event if click is manually triggered on target selector', function() {
                $body
                    .on('tap.tap1', touchA, spy)
                    .on('tap.tap2', touchA, spy);
                $touchA.trigger('click');

                expect(spy.callCount).to.be(0);
            });

            it('will not trigger tap event if click is manually triggered on child of target selector', function() {
                $body
                    .on('tap.tap1', touchA, spy)
                    .on('tap.tap2', touchA, spy);
                $touchB.trigger('click');

                expect(spy.callCount).to.be(0);
            });

            it('will bubble tap event when triggered', function() {
                $body
                    .on('tap', touchA, spy)
                    .on('tap', touchB, spy);
                $touchB.trigger('tap');

                expect(spy.callCount).to.be(2);
            });
        });

    });

    if ($.support.touch) {

        describe('Touch Events', function() {

            describe('Direct Callback Bindings', function() {

                it('will trigger tap event after touchstart, touchmove, and touchend are triggered', function() {
                    this.touch = $.support.touch = true;
                    $touchA
                        .on('tap', spy)
                        .simulate('touchstart')
                        .simulate('touchmove')
                        .simulate('touchend');

                    expect(spy.callCount).to.be(1);
                });

                it('will not trigger if moved more than 10px between touchstart and touchmove', function() {
                    $touchA
                        .on('tap', spy)
                        .simulate('touchstart')
                        .simulate('touchmove', { clientX: 20, clientY: 20 })
                        .simulate('touchend');

                    expect(spy.callCount).to.be(0);
                });

                it('will trigger if 300ms elapse between touchstart and touchmove', function(done) {
                    $touchA
                        .on('tap', spy)
                        .simulate('touchstart')
                        .simulate('touchmove');

                    setTimeout(function() {
                        $touchA.simulate('touchend');
                        expect(spy.callCount).to.be(1);
                        done();
                    }, 300);
                });

                it('will trigger if 1000ms elapse between touchstart and touchmove', function(done) {
                    $touchA
                        .on('tap', spy)
                        .simulate('touchstart')
                        .simulate('touchmove');

                    setTimeout(function() {
                        $touchA.simulate('touchend');
                        expect(spy.callCount).to.be(1);
                        done();
                    }, 1000);
                });

                it('will trigger tap event on parent element when triggered on child', function() {
                    $body.on('tap', spy);
                    $touchA
                        .simulate('touchstart')
                        .simulate('touchmove')
                        .simulate('touchend');

                    expect(spy.callCount).to.be(1);
                });

                it('will trigger tap event 2x on parent element when triggered on child', function() {
                    $body.on('tap', spy);
                    $touchA
                        .on('tap', spy)
                        .simulate('touchstart')
                        .simulate('touchmove')
                        .simulate('touchend');

                    expect(spy.callCount).to.be(2);
                });

                it('will not trigger if more than one touch', function() {
                    $body.on('tap', spy);
                    $touchA
                        .on('tap', spy)
                        .simulate('touchstart')
                        .simulate('touchstart', {}, 2)
                        .simulate('touchend', {}, 1)
                        .simulate('touchend');

                    expect(spy.callCount).to.be(0);
                });

                it('will bubble tap event after touchstart and touchend', function() {
                    $body.on('tap', spy);
                    $touchA.on('tap', spy);
                    $touchB
                        .simulate('touchstart')
                        .simulate('touchend');

                    expect(spy.callCount).to.be(2);
                });

            });

            describe('Delegate Callback Bindings', function() {

                it('will trigger tap event after touchstart, touchmove, and touchend in less than 300ms', function() {
                    this.touch = $.support.touch = true;
                    $body.on('tap', touchA, spy);
                    $touchA
                        .simulate('touchstart')
                        .simulate('touchmove')
                        .simulate('touchend');

                    expect(spy.callCount).to.be(1);
                });

                it('will not trigger if moved more than 10px between touchstart and touchmove', function() {
                    $body.on('tap', touchA, spy);
                    $touchA
                        .simulate('touchstart')
                        .simulate('touchmove', { clientX: 20, clientY: 20 })
                        .simulate('touchend');

                    expect(spy.callCount).to.be(0);
                });

                it('will trigger if 300ms elapse between touchstart and touchmove', function(done) {
                    $body.on('tap', touchA, spy);
                    $touchA
                        .simulate('touchstart')
                        .simulate('touchmove');

                    setTimeout(function() {
                        $touchA.simulate('touchend');
                        expect(spy.callCount).to.be(1);
                        done();
                    }, 300);
                });

                it('will trigger if 1000ms elapse between touchstart and touchmove', function(done) {
                    $body.on('tap', touchA, spy);
                    $touchA
                        .simulate('touchstart')
                        .simulate('touchmove');

                    setTimeout(function() {
                        $touchA.simulate('touchend');
                        expect(spy.callCount).to.be(1);
                        done();
                    }, 1000);
                });

                it('will trigger tap event on parent element when triggered on child', function() {
                    $body.on('tap', touchA, spy);
                    $touchB
                        .simulate('touchstart')
                        .simulate('touchmove')
                        .simulate('touchend');

                    expect(spy.callCount).to.be(1);
                });

                it('will trigger tap event 2x on parent element when triggered on child', function() {
                    $body.on('tap', touchA, spy);
                    $touchB
                        .on('tap', spy)
                        .simulate('touchstart')
                        .simulate('touchmove')
                        .simulate('touchend');

                    expect(spy.callCount).to.be(2);
                });

                it('will bubble tap event after touchstart and touchend', function() {
                    $body.on('tap', touchA, spy);
                    $touchA.on('tap',touchB,  spy);
                    $touchB
                        .simulate('touchstart')
                        .simulate('touchend');

                    expect(spy.callCount).to.be(2);
                });

            });

        });

    } else {

        describe('Click Events', function() {

            describe('Direct Callback Bindings', function() {

                it('will trigger tap event on click', function() {
                    this.touch = $.support.touch = false;
                    $touchA
                        .on('tap', spy)
                        .simulate('click');

                    expect(spy.callCount).to.be(1);
                });

                it('will trigger tap event on parent element when triggered on child bound to parent', function() {
                    $body.on('tap', spy);
                    $touchA.simulate('click');

                    expect(spy.callCount).to.be(1);
                });

                it('will bubble tap event after click event', function() {
                    $body.on('tap', spy);
                    $touchA.on('tap', spy);
                    $touchB.simulate('click');

                    expect(spy.callCount).to.be(2);
                });
            });

            describe('Delegate Callback Bindings', function() {

                it('will trigger tap event on click', function() {
                    $body.on('tap', touchA, spy);
                    $touchA.simulate('click');

                    expect(spy.callCount).to.be(1);
                });

                it('will trigger tap event on parent element when triggered on child and bound to parent', function() {
                    $body.on('tap', touchA, spy);
                    $touchB.simulate('click');

                    expect(spy.callCount).to.be(1);
                });

                it('will bubble tap event after click event', function() {
                    $body.on('tap', touchB, spy);
                    $touchA
                        .on('tap', touchB, spy)
                        .on('tap', spy);
                    $touchB.simulate('click');

                    expect(spy.callCount).to.be(3);
                });

                it('will only trigger single tap event and not delegate tap events', function() {
                    $body.on('tap', touchB, spy);
                    $touchA
                        .on('tap', touchB, spy)
                        .on('tap', spy)
                        .simulate('click');

                    expect(spy.callCount).to.be(1);
                });

            });
        });
    }

    $(document).ready(function() {
        mocha.run();
    });

}(jQuery, mocha));