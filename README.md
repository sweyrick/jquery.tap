# jQuery.tap

http://aarongloege.github.com/jquery.tap/
A jQuery plugin that creates a click alternative for touch enabled browsers.

## Why?

Click events on touch devices do not work the best. There is a 300ms delay from when you release your finger to the time the click event is triggered. This behavior is not desired.

## How do I use it?

What is nice about this plugin, and what makes it different from other plugins, is that it takes advantage of jQuery's special event API, so you can use `jQuery.on` to bind events.

```javascript
// jQuery.on method
$('.element').on('tap', onTapHandler);
$('.element').on('tap', dataObject, onTapHandler);
```

And, because the event is bound through jQuery's `on` API, you can take advantage of namespaces and delegate events:

```javascript
// Namespace
$('.element').on('tap.widget', onTapHandler);
$('.element').on('tap.widget', dataObject, onTapHandler);

// Delegate
$('.element').on('tap', '.child-element', onTapHandler);
$('.element').on('tap', '.child-element', dataObject, onTapHandler);

// Together now
$('.element').on('tap.widget', '.child-element', onTapHandler);
$('.element').on('tap.widget', '.child-element', dataObject, onTapHandler);
```

The tap event will also bubble.

## What About Desktop?

If the browser does not support touch events, then the regular click event will be used. No need for if/else statements, jQuery.tap will do that for you.

## Licence

jQuery.tap is licensed under the [MIT license](http://opensource.org/licenses/mit-license.html).