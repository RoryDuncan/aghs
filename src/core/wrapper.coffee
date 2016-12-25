
extend = require "extend"
utils = require "./utils.coffee"

Wrapper = (options = {}) ->
  
  if options.el is undefined
    canvas = document.createElement('canvas')
    canvas.id = "screen"
    document.body.appendChild(canvas)
  else if typeof options.el is "string" and options.el[0] is "#"
    canvas = document.getElementById options.el
  else
    canvas = options.el
    
  return @
  
Wrapper::chainingExceptions = {
  "getImageData",
  "createImageData",
  "isPointInStroke",
  "isPointInPath"
}