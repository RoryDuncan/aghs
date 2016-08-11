
EventEmitter = require "./events.coffee"
extend = require("extend")

# Helpers


noop = () -> return


chain = (wrapper, host, func) ->
  # could use fast.js optimization 
  #    (switch statement with + .call for small args)
  func.apply(host, args)
  return wrapper





# Aghs Object
#
#
Aghs = (@options = {}) ->
  
  that = @
  
  # create a canvas element if an element or selector is not passed in
  if @options.el is undefined
    canvas = document.createElement('canvas')
    canvas.id = "screen"
    document.body.appendChild(canvas)
  else if typeof @options.el is "string" and @options.el[0] is "#"
    canvas = document.getElementById @options.el
  else
    canvas = @options.el
  
  @frameSkipping = {
    skippedFrames: 0,
    allow: @options.frameSkip or true,
    threshold: 120
  }

  @isReady = false

  document.onreadystatechange = () ->
    if document.readyState is "complete"
      setTimeout () ->
        that.isReady = true
        that.events.trigger "ready"
      , 17
        
  @canvas = canvas
  @context = @_ = canvas.getContext "2d"
  @extendContext() unless @options.wrapContext is false
  @maximize() unless @options.fullscreen is false
  
  @width = canvas.width
  @height = canvas.height
  @events = new EventEmitter();
  @__modules = {};
  @layers = {};
  @currentLayer = "screen";
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

# Aghs
#
# these functions have meaningful return values (don't chain them)
Aghs::chainingExceptions = {
  "getImageData",
  "createImageData"
}

# TODO: rework this so we can use offsets
methods = []
properties = []
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
      methods.push key
      hasReturn = false
      for exceptionName of @chainingExceptions
        if key is exceptionName
          hasReturn = true
      @[key] = @chain(value, hasReturn)
    else 
      if key isnt "canvas"
        properties.push key
        @[key] = makeSetGetFunction(key)
  console.log methods.toString()
  console.log properties.toString()
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
  now = () ->
    return Date.now()
  
  # build our frame skipping mechanism
  frameSkippingThreshold = @frameSkipping.threshold
  
  if @frameSkipping.allow 
    
    skipFrame = (dt) ->
      return (dt > frameSkippingThreshold)
    
  else skipFrame = (dt) -> return false
    
  
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
      @frameSkipping.skippedFrames += 1
      time.elapsed -= time.delta
    else
      @events.trigger "prerender", time
      @render.call(@, time)
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

#
#
Aghs::render = (render) ->
  if typeof render is "function"
    @render = render 
  else throw new Error "Render function is not set."

  return @

# Aghs.attach
#
# Add an object that has a step and/or render function to Aghs's step and/or render function
Aghs::attach = (obj, modulename) ->
  return @ unless obj
  name = modulename or Object.getPrototypeOf(obj).constructor.name
  @__modules[name] = obj
  console.log "Attaching module as '#{name}"
  @events.on("step", obj.step, obj) if obj.step
  @events.on("render", obj.render, obj) if obj.render
  return @

# Aghs.unattach
#
# Undoes Aghs.attach
Aghs::unattach = (modulename) ->
  return @ unless modulename
  module = @__modules[modulename]
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
  return @

# Aghs.throttle
#
#
Aghs::throttle = (func = null, delay = 250, ctx = null, returnValue = null) ->
  return unless func
  lastCalled = performance.now()
  now = null
  return (args...) ->
    if (lastCalled + delay) > (now = performance.now())
      return returnValue
    lastCalled = now
    return func.apply(ctx, args)

# Aghs.layer()
# Switch to another canvas and context
#
Aghs::layer = (name, width = @width, height = @height) ->
  
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
    @layers[name] = {canvas, context}
    console.log @layers[name]
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
  
  w = window.innerWidth unless width
  h = window.innerHeight unless height
  
  cacheResizeAndRender = (layer) ->
    data = layer.context.getImageData(0, 0, width, height)
    layer.canvas.width = width
    layer.canvas.height = height
    layer.context.putImageData(data, 0, 0)
  
  if allLayers 
    cacheResizeAndRender(layer) for name, layer of @layers
  else 
    cacheResizeAndRender(@layers[@currentLayer])

  return @

# Aghs.polygon()
#
#
Aghs::polygon = (data) ->
  
  @beginPath()
  x = data[0][0]
  y = data[0][1]
  @moveTo(x, y)
  
  for datum in data
    x = datum[0]
    y = datum[1]
    @lineTo(x, y)
    
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

# Aghs.align
#
#
Aghs::align = (x, y) ->
  return @ if x is undefined or x is null
  if y is undefined
    y = x
  @translate(@width * x, @height * y)
  return @

#
# alias
Aghs::origin = Aghs::align

#
#
Aghs::stars = (args...) ->
  @save()
  return @tars.apply(@, args)
  
#
#
Aghs::tars = (x = 0, y = 0, alignX = 0, alignY = 0, rotation = 0, scale = 1) ->
  @translate x, y
  .align alignX, alignY
  .rotate(rotation)
  .scale(scale, scale)
  return @

#
#
Aghs::do = (actions...) ->
  
  @save()
  actions[0]()
  if actions.length > 1
    action() for action in actions
  @restore()
  return @

#
# 
Aghs::clear = (fill = "#fff") ->
  return @fillStyle(fill).fillRect(0, 0, @width, @height)

#
#
Aghs::fillWith = (color = "#000") ->
  return @fillStyle(color).fill()

window.Aghs = Aghs
module.exports = Aghs