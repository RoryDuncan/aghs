extend = require "extend"
utils = require "./utils.coffee"
EventEmitter = require "./events.coffee"
Renderer = require "./renderer.coffee"


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

  # here we go
  that = @
  @modules = []
  @config = {}
  @module "events",     new EventEmitter() unless options.events is false
  @module "renderer",   new Renderer(options) unless options.renderer is false
  @$ = @renderer
  @canvas = @renderer.CANVAS
  @isReady = false
  
  # begin readiness detection
  triggerReady = () ->
    utils.defer () ->
      that.isReady = true
      # knees weak:
      that.events.trigger "ready"
    return
  
  # if ready when called..
  if document.readyState is "complete" 
    triggerReady()
  else # wait for readiness
    document.onreadystatechange = () ->
      triggerReady() if document.readyState is "complete"

  # layers, modules
  @__attached = {};
  @currentLayer = "screen";
  
  screen = 
    canvas:   @renderer.canvas
    context:  @renderer.context
    
  @layers = {screen}
  
  # internal events
  @events.on "resize", () ->
    that.config.width   = that.canvas.width
    that.config.height  = that.canvas.height
  
  Configuration = @Configuration
  @configure(new Configuration(options))
  
  return @

Aghs::Configuration = (options = {}) ->
  
  config = 
    "fullscreen": true
    "smoothing": true
    "width": window.innerWidth
    "height": window.innerHeight
    "scale": 1
    
    "frameskip":
      "count":        0
      "enabled":      true
      "threshold":    120
    
  return extend {}, options, config

# Aghs.module
#
# Add a module to the Aghs object
Aghs::module = (name, obj) ->
  throw new Error "Missing module parameter 1 or parameter 2" unless name and obj
  throw new Error "Module Exists: #{name} already exists." if @name?
  @modules.push name
  @[name] = obj
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
  
  @time = () -> return time
  
  # the internal step function, private to Aghs::start
  # called before the step event
  step = (e) ->
    return unless @running is true
    _now = now()
    time.now = _now
    time.delta = (_now - time.lastCalled)
    time.elapsed += time.delta
    @events.trigger "step", time
    
    if skipFrame(time.delta)
      @config.frameskip.count += 1
      time.elapsed -= time.delta
    else
      @events.trigger "prerender", time, @renderer, @
      @events.trigger "render", time, @renderer, @
    time.lastCalled = _now
    @events.trigger "postrender", time, @renderer, @
    
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
  @renderer.imageSmoothingEnabled(@config.smoothing)
  return @

# Aghs.configure()
#
# Quick-apply a new configuration
Aghs::configure = (@config) ->
  
  throw new Error("Invalid config passed to Aghs::configure") unless @config
  
  @screen() # change to primary renderer
  
  if @config.fullscreen
    @maximize()
  else
    @resize(@config.width, @config.height)
  
  @renderer.scale(@config.scale, @config.scale)
  @antialias()
  return @

# Aghs.layer()
# Switch to another canvas and context
#
Aghs::layer = (name = "screen", width, height) ->
  
  width = @config.width unless width?
  height = @config.height unless height?
  
  canvas = null
  context = null
  
  if name is "screen"
    
    canvas = @renderer.CANVAS
    context = @renderer.CONTEXT
  
  else
    
    if @layers[name]
      layer = @layers[name]
      canvas = layer.canvas
      context = layer.context

    else # then create a new layer
      [canvas, context] = @renderer._create(width, height)
      @layers[name] = {name, canvas, context}

  @currentLayer = name
  @renderer._change(name, canvas, context)
  
  return @

# Aghs.screen
#
# a shorthand for switching to the primary canvas
Aghs::screen = () -> return @layer("screen")


# Aghs.draw()
#
# retrieve the current layer as imagedata and draw it on the target canvas
Aghs::draw = (source = {x: 0, y: 0}, target = {x: 0, y: 0}) ->
  
  _source = @renderer.context
  
  # target can be an object containing x, y, and/or name
  if target.name?
    _target = @layers[target.name].context
  else
    _target = @renderer.CONTEXT
  
  if not source.width
    source.width = @renderer.canvas.width
  
  if not source.height
    source.height = @renderer.canvas.height
  
  data = _source.getImageData(source.x, source.y, source.width, source.height)
  _target.putImageData(data, target.x || 0, target.y || 0)
  
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
    cacheResizeAndRender(@layers[@currentLayer])
    @events.trigger "resize"

  return @

module.exports = Aghs