utils = require "../core/utils.coffee"

# Helpers

# location
# calculates the relative location
location = (world, _x, _y) ->
  
  offset = world.offset
  origin = world.origin
  
  # normalized
  
  x =  Math.round(origin.x + offset.x + _x)
  y =  Math.round(origin.y + offset.y + _y)
      
  return [x, y]


int = (v) -> return Math.round(v);

# World Object
# An object to execute CanvasRenderingContext2D methods relative to a coordinate system.
#
World = (@aghs, options = {}) ->

  throw new TypeError "Missing Agh.js Instance as first parameter." unless @aghs
  
  # operates on the primary context, not other layers
  @$ = @aghs.renderer
  
  @type = "cartesian"
  
  @orientation = 
    x: 1
    y: 1
  
  @origin = 
    x: 0
    y: 0
  
  # the 'camera', determining what is viewed on the canvas
  @view = 
    x: 0
    y: 0
    z: 0
    perspective: 1000
    width: @$.canvas.width
    height: @$.canvas.height
  
  # offsets are added to each x and y calculation
  @offset = 
    x: 0
    y: 0
  
  return @

# World.viewport()
# Set the viewport size
World::viewport = (w, h)  ->
  return @ unless w
  h = w if not h
  
  @view.width = w
  @view.height = h
  @aghs.resize(w, h)

# World.inView()
# Check if the coordinates are within the current view
World::inView = (x, y) ->
  [x, y] = @calc(x, y)
  xCheck = @view.x < x < @view.x + @view.width
  yCheck = @view.y < y < @view.y + @view.height
  return xCheck and yCheck

# World.preset()
# Set the world to a specific preset, determining the origin and orientation
World::preset = (preset) ->
  
  @type = preset or @type
  
  switch @type
  
    when "platformer", "chart"
      @origin.x = 0
      @origin.y = @aghs.canvas.height
    # Defaults:
    # when "cartesian", "map"
    else
      @origin.x = @aghs.canvas.width * 0.5
      @origin.y = @aghs.canvas.height * 0.5
    
  return @


# World.clean()
# Keeps our world grid decimal-free by making sure all numbers are integers
World::clean = () ->
  @view.x =   Math.round(@view.x)
  @view.y =   Math.round(@view.y)
  @view.z =   Math.round(@view.z)
  @offset.x = Math.round(@offset.x)
  @offset.y = Math.round(@offset.y)
  return @

# World.move()
# Moves the viewport and offset by the x and y parameter amount
World::move = (x = 0, y = 0) ->
  @view.x   += x * @orientation.x
  @view.y   += y * @orientation.y
  @offset.x -= x * @orientation.x
  @offset.y -= y * @orientation.y
  @clean()
  return @

# World.calc()
# curried version of the location function
World::calc = (x, y) -> return location(@, x, y)

# World.set()
# Sets the world coordinates to a specific location
World::set = (x, y) ->
  
  if x?
    @offset.x = @origin.x - x
    @view.x = @origin.x + x
  
  if y?
    @offset.y = @origin.y - y
    @view.y = @origin.y + y
    
  return @

# World.debug()
# show relevant information rendered onto the canvas.
World::debug = () ->
  size = 12
  @$.fillStyle "#000"
  .font("#{size}px Small Fonts")
  .fillText("view: x: #{@view.x}, y: #{@view.y} w: #{@view.width} h: #{@view.height}", size, @view.height - size*2)
  .fillText("offset: #{@offset.x}, #{@offset.y}", size, @view.height - size)



###   Canvas API

Methods that operate on the HTMLCanvasRendering Context

###



#
# this, ctx.translate(x, y);
World::translate = (x = 0, y = 0) ->
  @$.translate.apply(@$, @calc(x, y))
  return @

#
# this, ctx.fillRect(x, y, width, height);
World::fillRect = (x = 0, y = 0, w, h) ->
  [calcX, calcY] = @calc x, y
  @$.fillRect(calcX, calcY, w, h)
  return @

#
# void ctx.strokeRect(x, y, width, height);
World::strokeRect = (x, y, w, h) -> 
  [calcX, calcY] = @calc x, y
  @$.strokeRect(calcX, calcY, w, h)
  return @

#
# void ctx.moveTo(x, y);
World::moveTo = (x, y) -> 
  [calcX, calcY] = @calc x, y
  @$.moveTo.apply(@_, @calc(x, y))
  return @

#
# void ctx.lineTo(x, y);
World::lineTo = (x, y) ->
  [calcX, calcY] = @calc x, y
  @$.lineTo.apply(@_, @calc(x, y))
  return @

#
# void ctx.quadraticCurveTo(cpx, cpy, x, y);
World::quadraticCurveTo = (cpx, cpy, x, y) ->
  [_cpx, _cpy] = @calc(cpx, cpy)
  [_x, _y] = @calc(x, y)
  @$.quadraticCurveTo(_cpx, _cpy, _x, _y)
  return @
  

#
# void ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
World::bezierCurveTo = (cp1x, cp1y, cp2x, cp2y, x, y) -> 
  [_cp1x, _cp1y] = @calc(cp1x, cp1y)
  [_cp2x, _cp2y] = @calc(cp2x, cp2y)
  [_x, _y] = @calc(x, y)
  @$.bezierCurveTo(_cp1x, _cp1y, _cp2x, _cp2y, _x, _y)
  return @

#
# void ctx.arcTo(x1, y1, x2, y2, radius);
World::arcTo = (x1, y1, x2, y2, radius) ->
  [startx, starty] = @calc(x1, y1)
  [endx, endy] = @calc(x2, y2)
  @$.arcTo(startx, starty, endx, endy, radius)
  return @
#
# void ctx.rect(x, y, width, height);
World::rect = (x, y, width, height) ->
  [_x, _y] = @calc(x,y)
  @$.rect(_x, _y, width, height)
  return @

#
# void ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
World::arc = (x, y, radius, startAngle, endAngle, anticlockwise) ->
  [_x, _y] = @calc(x, y);
  @$.arc(_x, _y, radius, startAngle, endAngle, anticlockwise)
  return @

#
# void ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
World::ellipse = (x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) ->
  [_x, _y] = @calc(x, y)
  @$.ellipse(_x, _y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise)
  return @

#
# ImageData ctx.getImageData(sx, sy, sw, sh);
World::getImageData = (sx, sy, sw, sh) ->
  [x, y] = @calc(sx, sy)
  @$.getImageData(x, y, sw, sh)
  return @

#
# void ctx.putImageData(imagedata, dx, dy);
# void ctx.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
World::putImageData = (imgdata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) ->
  [x, y] = @calc(dx, dy)
  @$.putImageData(imgdata, x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight)
  return @

#
# void ctx.drawImage(image, dx, dy);
# void ctx.drawImage(image, dx, dy, dWidth, dHeight);
# void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
World::drawImage = (image) ->
  
  if arguments.length is 9
    [x, y] = @calc(arguments[5], arguments[6])
    arguments[5] = x
    arguments[6] = y
    @_.drawImage.apply(@_, arguments)
  
  else
    
    [dx, dy] = @calc(arguments[1], arguments[2])
    dw = arguments[3]
    dh = arguments[4]
    @_.drawImage(image, dx, dy, dw, dh)
    
  return @

module.exports = World
  