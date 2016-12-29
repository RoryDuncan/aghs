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
