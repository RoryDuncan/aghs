
extend = require "extend"
utils = require "./utils.coffee"

#
#
#
Renderer = (options = {}) ->
  
  # create a canvas element if an element or selector is not passed in
  
  if options.el is undefined
    canvas = document.createElement('canvas')
    canvas.id = "screen"
    document.body.appendChild(canvas)
  else if typeof options.el is "string" and options.el[0] is "#"
    canvas = document.getElementById options.el
  else
    canvas = options.el
  
  # set primary canvas and context
  @CANVAS   = canvas  
  @CONTEXT  = canvas.getContext("2d")
  
  @canvas = canvas
  @context = @CONTEXT
  
  @extendContext()
  return @

#
#
#
Renderer::_change = (@state, @canvas, @context) ->
  return @
  
Renderer::_create = (width, height) ->
    canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    context = canvas.getContext "2d"
    return [canvas, context]

# Renderer.extendContext
#
# Add all methods of the HTMLCanvasElement 2D Context to our wrapper
Renderer::extendContext = () ->

  that = @
  ctx = @context
  
  makeSetGetFunction = (keyname) ->
    return (value) ->
      return that.context[keyname] if value is undefined
      that.context[keyname] = value
      return that

  if not ctx
    throw new Error("A CanvasRenderingContext2D is required for Wrapper to function.")

  # Iterate over all canvas context methods
  for key, value of ctx
    
    if typeof value is "function"
      hasReturn = false
      for exceptionName of @chainingExceptions
        if key is exceptionName
          hasReturn = true
      @[key] = @chain(value, hasReturn)
    else 
      if key isnt "canvas"
        @[key] = makeSetGetFunction(key)
  return @

# Renderer.chain
#
# Meta programming function, used internally. Can be used to chain a function to Aghs
Renderer::chain = (func, hasReturnValue) ->
  source = @
  if hasReturnValue
    return (args...) ->
      return func.apply(source.context, args)
  else return (args...) ->
    func.apply(source.context, args)
    return source



# Renderer.chainingExceptions
#
# these functions have meaningful return values (don't chain them)
Renderer::chainingExceptions = {
  "getImageData",
  "createImageData",
  "isPointInStroke",
  "isPointInPath"
}


# Renderer.polygon()
#
# Draw a polygonal path from a a chain of coordinates
Renderer::polygon = (points = []) ->
  
  unless points.length > 0 
    console.warn "Missing Parameter 1 in Renderer.polygon"
    return @ # do nothing
  
  
  # init path, then move to the starting point
  @beginPath()
  @moveTo(points[0].x, points[0].y)
  # lineTo all points
  points.forEach (pt) -> @lineTo(pt.x, pt.y)
  # closePath automatically closes returns from the last point to the first one
  # so yay to that
  return @closePath()

# Renderer.triangle()
#
# shorthand and alternate syntax for creating a triangle path
Renderer::triangle = (pt1 = {x: 0, y: 0}, pt2 = {x:0, y:0}, pt3 = {x:0, y:0}) ->
  # if a matrix is passed in
  if typeof pt1 is "object" and pt1.length isnt undefined
    return @polygon(pt1)
  # else do
  @beginPath()
  @moveTo(pt1.x, pt1.y)
  @lineTo(pt2.x, pt2.y)
  @lineTo(pt3.x, pt3.y)
  @closePath()
  return @


# Renderer.strs()
# save, translate, rotate, scale!
Renderer::strs = (args...) ->
  @save()
  return @tars.apply(@, args)
  
# Renderer.tars
# Translate, rotate, scale!
Renderer::trs = (x = 0, y = 0, rotation = 0, scale = 1) ->
  @translate x, y
  .rotate(rotation)
  .scale(scale, scale)
  return @


# Renderer.do()
# Execute a fn or set of fn's in between a save and restore.
Renderer::do = (actions...) ->
  
  @save()
  action() for action in actions
  @restore()
  return @

#
# 
Renderer::clear = (fill = "#fff") ->
  return @fillStyle(fill).fillRect(0, 0, @canvas.width, @canvas.height)

#
#
Renderer::fillWith = (color = "#000") ->
  return @fillStyle(color).fill()
  
#
#
Renderer::strokeWith = (color = "#000") ->
  return @strokeStyle(color).stroke()


module.exports = Renderer