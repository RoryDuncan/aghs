
extend = require "extend"
utils = require "./utils.coffee"

#  triggered event functions
events =
  
  "state:init": () ->
    state = @states[@active]
    that = @
    
    done = () ->
      state.isReady = true
      that.events.trigger "state:ready"
      
    state.initialized = true
    state.init.call(state, done)
    
  "step": (time) ->
    state = @states[@active]
    state.step.call(state, time)
    
  "prerender": (time) ->
    state = @states[@active]
    state.prerender.call(state, time)
    
  "render": (time) ->
    state = @states[@active]
    state.render.call(state, time)

  "postrender": (time) ->
    state = @states[@active]
    state.postrender.call(state, time)
    
  "state:ready": () ->
    state = @states[@active]
    state.ready.call(state)
    
  "state:enter": () ->
    state = @states[@active]
    @aghs.settings state.config
    state.enter.call(state)
    
  "state:leave": () ->
    state = @states[@active]
    state.leave.call(state)
  
  "state:destroy": () ->
    state = @states[@active]
    state.destroy.call(state)

#
#
#
State = (aghs, options = {}) ->

  @name = options.name
  config = {
    "fullscreen": options.fullscreen
    "width":      options.width
    "height":     options.height
    "frameskip":  options.frameskip
    "smoothing":  options.smoothing
    "scale":      options.scaling
  }
  extend(@, options)
  @initialized = false
  @isReady = false
  @config = extend(config, aghs.config)
  
  return @

#
# add all trigger functions to the prototype
State::init       = utils.noop
State::ready      = utils.noop
State::enter      = utils.noop
State::leave      = utils.noop
State::destroy    = utils.noop
State::prerender  = utils.noop
State::render     = utils.noop
State::postrender = utils.noop
State::step       = utils.noop


# StateMachine
# Keeps track of state within the aghs app
#
StateMachine = (@aghs) ->
  @events = @aghs.events
  @states = {}
  @active = null
  @length = 0
  # bind all events
  @events.on eventname, callback, @ for eventname, callback of events
  
  return @

#
#
StateMachine::add = (options = {}) ->
  if options.name? 
    throw new Error "state 'name' is missing from options parameter."
  
  state = new State(@aghs, options)
  @states[state.name] = state
  @length += 1
  
  @set(name) if length is 1
  return state
  

#
#
StateMachine::set = (name) ->
  if @states[name]?
    
    @events.trigger "state:leave"
    @active = name
    state = @states[@active]
    
    if state.initialized is false
      @events.trigger "state:init"
    if state.isReady
      @events.trigger "state:ready"
      @events.trigger "state:enter"
  return @
  
  
#
#
StateMachine::get = (name) ->
  return @states[name] or null

# state.proxy()
# proxy is the function attached to other objects,
# if you would like a different usage model
StateMachine::proxy = () ->
  
  
  # aghs.state().get()
  return @ if arguments.length is 0
  
  if typeof arguments[0] is "string"
    @set(arguments[0]) 
    return @
  # assume all other cases are state creations
  
  return @add(arguments[0])


module.exports = StateMachine