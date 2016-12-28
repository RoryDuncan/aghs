
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
  
  @canvas = canvas  
  @context = @_ = context = canvas.getContext("2d")
  @extendContext()
  return @


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


module.exports = Renderer