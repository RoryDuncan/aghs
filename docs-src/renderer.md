# Aghs.Renderer

## Methods

The following methods are attached to the Renderer's prototype.

#### Renderer.clear
Parameter: `String` color
Default: `#fff`
Shorthand method for quickly filling the entire drawing context with the fill color.

#### Renderer.fillWith
Parameter: `String` color
Default: `#000000`
Shorthand method for quickly setting `fillStyle()` and then immediately filling via `.fill()`.

#### Renderer.strokeWith
Paramter: `String` color
Default: `#000000`
Shorthand method for quickly setting `strokeStyle` and then immediately stroking via `.stroke()`.

#### Renderer.chain
Parameters: `Function` func, `Boolean` hasReturnValue
Returns a function that will always return the Renderer instance.

_Note: This function is used internally, it may have access removed later_


#### Renderer.extendContext
Internal function used for extending `CanvasRenderingContext2D`. Not recommended to be called.
This function will be remove from access in a future version.


## Drawing API

### Extending CanvasRenderingContext2D

The following methods are extensions of the [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D). The primary difference is that the methods below are chainable, unless they return a meaningful value. Methods with a meaningful return value are on `Renderer.chainingExceptions`.

You may refer to the excellent [CanvasRenderingContext2D](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) documentation on Mozilla Developer Network (MDN).


#### globalAlpha
#### globalCompositeOperation
#### filter
#### imageSmoothingEnabled
#### imageSmoothingQuality
#### strokeStyle
#### fillStyle
#### shadowOffsetX
#### shadowOffsetY
#### shadowBlur
#### shadowColor
#### lineWidth
#### lineCap
#### lineJoin
#### miterLimit
#### lineDashOffset
#### font
#### textAlign
#### textBaseline
#### save
#### restore
#### scale
#### rotate
#### translate
#### transform
#### setTransform
#### resetTransform
#### createLinearGradient
#### createRadialGradient
#### createPattern
#### clearRect
#### fillRect
#### strokeRect
#### beginPath
#### fill
#### stroke
#### drawFocusIfNeeded
#### clip
#### isPointInPath
#### isPointInStroke
#### fillText
#### strokeText
#### measureText
#### drawImage
#### createImageData (Non Chainable)
#### getImageData (Non Chainable)
#### putImageData
#### setLineDash
#### closePath
#### moveTo
#### lineTo
#### quadraticCurveTo
#### bezierCurveTo
#### arcTo
#### rect
#### arc
#### ellipse
#### getContextAttributes (Non Chainable)
#### getLineDash (Non Chainable)


#### Renderer.polygon
Parameter: `Array` points
Creates a `CanvasRenderingContext2D` path from an array of coordinates. The last point in the chain is then connected back to the first point, making the polygonal path.

Example:

```
poly = [
  { x: 18,   y: 90 },
  { x: 50,   y: 90 },
  { x: 103,  y: 60 },
  { x: 216,  y: 60 } 
]
```

Because Renderer utilizes chaining, you can then call your drawing methods afterwords after `Renderer.polygon()`.
_Using the `poly` variable from the snippet above_:

```
Renderer.polygon(poly).strokeWith("black").fillWith("green")

```

#### Renderer.triangle
Shorthand syntax for a 3 point polygon. See `Renderer.polygon()`.

#### Renderer.strs

Performs a `s`ave, `t`ranslate, `r`otate, and `s`cale.
Shorthand initialism and technique inspired by[CanvasQuery.js's STARS](http://canvasquery.com/stars).

The difference being that Aghs does not use an internal align property, so it is without it.

#### Aghs.trs
Parameters: `
Like `Renderer.strs()`, but without the `.save()`.

#### Aghs.do

Do is a way to quickly apply a save and restore around another set of actions.
Rather than needing to do:

``` coffee
  
  aghs.save()
  someFunc()
  someOtherFunc()
  etcFunc()
  aghs.restore()

```

You can instead use `.do()`:

``` coffee
Renderer.do someFunc, someOtherFunc, etcFunc
```
