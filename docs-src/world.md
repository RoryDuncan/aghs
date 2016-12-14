
# Aghs World Plugin

A gamestate plugin for the Aghs Framework.
It essentially holds a cartesian coordinate system, and only renders at a specific 'view' of the grid.

Special notes:

- The cartesian grid is near-infinite (as per JS limit on floats.)
- Forces all grid positions to be integers as an act of to enforced simplicity.

# API

## Properties

### World.orientation

A scalar value used for all methods.
_Not all circumstances of changing these values are fully tested._

### World.origin

The starting position that determines where further calculates the current view. Generally these values should be set once and not changed again.
When setting these values, also refer to `World.type` in case a preset exists that will fulfill your requirements.

### World.view

The view can be considered the 'camera' of the world. Objects placed on the world will only be on the visible canvas if within the view.

The view is an object containing the following keys:
  - `x`
  - `y`
  - `z`
  - `perspective`
  - `width`
  - `height`


### World.offset

Offset is the distance from the origin that has been calculated, and the inverse distance that the current view is calculated at.

Offset is an object containing the following keys:
  - `x`
  - `y`


### World.type

String name depicting a preset that controls where the origin positions, offsets, and the like are set as and calculated.

Defaults to "cartesian".

Use `World.preset()` to change to another type. 

## Methods

### World.viewport()

Parameters: `int` width, `int` height.

Sets the `World.view`'s width and height, as well as the rendering canvas width and height via `Aghs.resize`.

### World.inView()

Parameters: `int` x, `int` y.

Checks if the x and y positions are within the world's view.

Non-optimized: Does not shortcut logic or calculations.

### World.preset()

Parameter: `string` value

the `value` parameter is the name of a `World.type` that `World` will be set as.

### World.clean()

Rounds all view and offset values to be integers, making it so you can expect integer values when working with the `World` plugin.
Called after `World.move()` by default. 
Uses `Math.round` for rounding.

### World.move()

Parameters: `int` x `int` y

Moves the viewport by the `x` and `y` parameter amount. Inversely moves the offset by the specified amount.

Calls `World.clean` after each call.

### World.calc()

Parameters: `int` x `int` y
Returns: `Array` [x, y]
Calculates the `x` and `y` values relative to the world's offsets and origin.
All `World` methods already use `World.calc` under the surface.


### World.set()

Parameters: `int` x `int` y

Sets the world coordinates to the parameter `x` and `y` positions.

## Drawing API

Drawing API methods operate on the HTMLCanvasRendering Context of an Aghs primary renderer.

These methods, such as `World.translate` and `World.fillRect`, can be used to draw relative to the World location.
