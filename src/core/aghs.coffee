extend = require "extend"
utils = require "./utils.coffee"
EventEmitter = require "./events.coffee"


# Helpers
noop = utils.noop
chain = utils.chain



# Aghs Namespace Object
# Parameter: option `Object

#  param:
#   options = 
#     fullscreen: true
#     width: <viewport width>
#     height <viewport height>
#     frameskip: true
#     smoothing: false
#     scale: 1

Aghs = (options = {}) ->
  
  that = @
  # create a canvas element if an element or selector is not passed in
  if options.el is undefined
    canvas = document.createElement('canvas')
    canvas.id = "screen"
    document.body.appendChild(canvas)
  else if typeof options.el is "string" and options.el[0] is "#"
    canvas = document.getElementById options.el
  else
    canvas = options.el

  @isReady = false
  @canvas = canvas
  @modules = []
  @module("events", new EventEmitter())
  @context = @_ = context = canvas.getContext "2d"
  # only do on instantiation
  @extendContext() unless options.wrapContext is false
  
  # begin readiness detection
  triggerReady = () ->
    utils.defer () ->
      that.isReady = true
      that.events.trigger "ready"
    return
  
  # if already ready..
  if document.readyState is "complete" 
    triggerReady()
  else # wait for readiness
    document.onreadystatechange = () ->
      triggerReady() if document.readyState is "complete"

  # layers, modules
  @__attached = {};
  @currentLayer = "screen";
  @layers = 
    "screen": {canvas, context}
  
  # internal events
  @events.on "resize", () ->
    that.config.width   = that.canvas.width
    that.config.height  = that.canvas.width
  
  # apply the config
  config = 
    "fullscreen":     true
    "wrappedContext": true
    'smoothing':      true
    "width":          options.width or canvas.width
    "height":         options.height or canvas.height
    "scale":          options.scale or 1
    
    "frameskip":
      "count":        0
      "enabled":      options.frameskip or true
      "threshold":    120
  
  @config = extend {}, @config, config
  
  # these settings default to true, so overwrite if they exist in the options
  config.fullscreen = options.fullscreen if options.fullscreen?
  config.wrappedContext = options.wrappedContext if options.wrappedContext?
  config.smoothing = options.smoothing if options.smoothing?
  
  @settings(config)
  return @
  

# Aghs.module
#
# Add a module to the Aghs object
Aghs::module = (name, obj) ->
  throw new Error "Missing module parameter 1 or parameter 2" unless name and obj
  throw new Error "Module Exists: #{name} already exists." if @name?
  @modules.push name
  @[name] = obj
  return @


# Aghs.chain
#
# Meta programming function, used internally. Can be used to chain any function to Aghs
Aghs::chain = (func, hasReturnValue) ->
  source = @
  if hasReturnValue
    return (args...) ->
      return func.apply(source.context, args)
  else return (args...) ->
    func.apply(source.context, args)
    return source

# Aghs.chainingExceptions
#
# these functions have meaningful return values (don't chain them)
Aghs::chainingExceptions = {
  "getImageData",
  "createImageData",
  "isPointInStroke",
  "isPointInPath"
}

# Aghs.extendContext
#
# Extend the Canvas.getContext("2d") prototype to also be attached to Aghs
Aghs::extendContext = () ->

  that = @
  ctx = @context
  
  makeSetGetFunction = (keyname) ->
    return (value) ->
      return that.context[keyname] if value is undefined
      that.context[keyname] = value
      return that

  if not ctx
    throw new Error("Illegal Invocation: extendContext. Call after instantiation.")

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

# Aghs.ready()
#
# Fire the passed-in function when the document and canvas are ready
Aghs::ready = (fn) ->
  if @isReady then fn.call(@)
  else
    @events.on "ready", fn, @
  return @

# Aghs.start()
#
# Start the rendering calls and timers
Aghs::start = () ->
  
  now = () -> return Date.now()
  
  # build our frame skipping mechanism
  frameSkippingThreshold = @config.frameskip.threshold
  
  if @config.frameskip.allow 
    skipFrame = (dt) -> return (dt > frameSkippingThreshold)
  else
    skipFrame = (dt) -> return false
    
  
  start = now()
  # this format helps v8 engine build optimized classes
  time = {
    'elapsed':        0,
    'lastCalled':     now(),
    'now':            now(),
    'start':          now(),
    'delta':          null,
    'id':             null
  }
  
  # called before the user-defined render

  step = (e) ->
    return unless @running is true
    @events.trigger "step", time
    _now = now()
    time.now = _now
    time.delta = (_now - time.lastCalled)
    time.elapsed += time.delta

    
    if skipFrame(time.delta)
      @config.frameskip.count += 1
      time.elapsed -= time.delta
    else
      @events.trigger "prerender", time
      @events.trigger "render", time
    time.lastCalled = _now
    @events.trigger "postrender", time
    
    time.id = window.requestAnimationFrame boundStep
    @__frame = time.id
    
  
  boundStep = step.bind(@)
  @running = true
  time.id = window.requestAnimationFrame boundStep
  return @

#
#
Aghs::stop = () ->
  window.cancelAnimationFrame @__frame
  @running = false
  return @


# Aghs.step
#
Aghs::step = (step) ->
  @events.on "step", step if typeof step is "function"
  return @
    

# Aghs.render
#
Aghs::render = (render) ->
  @events.on "render", render if typeof render is "function"
  return @
    

# Aghs.attach
#
# Add an object that has a step and/or render function to Aghs's step and/or render function
Aghs::attach = (modulename, obj) ->
  return @ unless obj
  name = modulename or Object.getPrototypeOf(obj).constructor.name
  @__attached[name] = obj
  console.log "Attaching module as '#{name}"
  @events.on("step", obj.step, obj) if obj.step
  @events.on("render", obj.render, obj) if obj.render
  return @

# Aghs.unattach
#
# Undoes Aghs.attach
Aghs::unattach = (modulename) ->
  return @ unless modulename
  module = @__attached[modulename]
  if module
    @events.off("step", module.step) if module.step
    @events.off("render", module.render) if module.render
  return @

# Aghs.maximize()
#
# change the canvas to fit the viewport
Aghs::maximize = () ->
  @canvas.width = window.innerWidth
  @canvas.height = window.innerHeight
  @events.trigger "resize"
  return @

# Aghs.antialias()
#
# Sets or reinforces the configured smoothing setting
Aghs::antialias = () ->
  @imageSmoothingEnabled(@config.smoothing)
  return @

# Aghs.settings()
#
# Quick-apply a new configuration
Aghs::settings = (config = {}) ->
  extend @config, config
  @screen()
  if @config.fullscreen
    @maximize()
  else
    @resize(@config.width, @config.height)
  
  @scale(@config.scale, @config.scale)
  @antialias()
  return @

# Aghs.layer()
# Switch to another canvas and context
#
Aghs::layer = (name, width, height) ->
  
  width = @config.width unless width?
  height = @config.height unless height?
  
  if not name or name is "screen"
    @context = @_
    @currentLayer = "screen"
    return @
  
  @currentLayer = name
  
  unless @layers[name] # create a new layer
    canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    context = canvas.getContext "2d"
    @layers[name] = {name, canvas, context}
    @context = @layers[name].context
  else
    @context = @layers[name].context
  return @

# Aghs.screen
#
# a shorthand for switching to the primary canvas
Aghs::screen = () -> return @layer("screen")


# Aghs.draw()
#
# retrieve the current layer as imagedata and draw it on the primary canvas
Aghs::draw = (source = {x: 0, y: 0}, target = {x: 0, y: 0}) ->
  
  layer = @layers[@currentLayer]
  
  unless target.layer
    target.layer = @_
  else
    if @layers[target.layer]
      target.layer = @layers[target.layer].context
  
  unless source.width
    source.width = layer.canvas.width
  
  unless source.height
    source.height = layer.canvas.height
  
  data = @context.getImageData(0, 0, source.width, source.height)
  target.layer.putImageData(data, target.x, target.y)
  
  return @

# Aghs.resize()
#
# changes the size of the current context's canvas
Aghs::resize = (width, height, allLayers = false) ->
  
  w = width or @config.width
  h = height or @config.height
  
  cacheResizeAndRender = (layer) ->
    data = layer.context.getImageData(0, 0, w, h)
    layer.canvas.width = w
    layer.canvas.height = h
    layer.context.putImageData(data, 0, 0)
  
  if allLayers 
    cacheResizeAndRender(layer) for name, layer of @layers
  else 
    cacheResizeAndRender(@layers[@currentLayer] or @_)
    @events.trigger "resize"

  return @

# Aghs.polygon()
#
# Draw a polygonal path from a a chain of coordinates
Aghs::polygon = (points = []) ->
  
  unless points.length > 0 
    console.warn "Missing Parameter 1 in Aghs.polygon"
    return @ # do nothing
  
  
  # init path, then move to the starting point
  @beginPath()
  @moveTo(points[0].x, points[0].y)
  # lineTo all points
  points.forEach (pt) -> @lineTo(pt.x, pt.y)
  # closePath automatically closes returns from the last point to the first one
  # so yay to that
  return @closePath()

# Aghs.triangle()
#
# shorthand and alternate syntax for creating a triangle path
Aghs::triangle = (pt1 = {x: 0, y: 0}, pt2 = {x:0, y:0}, pt3 = {x:0, y:0}) ->
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


# Aghs.strs()
# save, translate, rotate, scale!
Aghs::strs = (args...) ->
  @save()
  return @tars.apply(@, args)
  
# Aghs.tars
# Translate, rotate, scale!
Aghs::trs = (x = 0, y = 0, rotation = 0, scale = 1) ->
  @translate x, y
  .rotate(rotation)
  .scale(scale, scale)
  return @


# Aghs.do()
# Execute a fn or set of fn's in between a save and restore.
Aghs::do = (actions...) ->
  
  @save()
  action() for action in actions
  @restore()
  return @

#
# 
Aghs::clear = (fill = "#fff") ->
  return @fillStyle(fill).fillRect(0, 0, @config.width, @config.height)

#
#
Aghs::fillWith = (color = "#000") ->
  return @fillStyle(color).fill()
  
#
#
Aghs::strokeWith = (color = "#000") ->
  return @strokeStyle(color).stroke()



module.exports = Aghs