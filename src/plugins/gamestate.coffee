extend = require "extend"
utils = require "../core/utils.coffee"

#
# a list of all handlers for each each event that 
# a state may have
events =
  
  "state:init": () ->
    
    state = @states[@active]
    state.initialized = true
    that = @
    
    # we want to be certain that 'done' is only called once
    asyncDone = false
    done = () ->
      return if asyncDone
      state.isReady = asyncDone = true
      that.events.trigger "state:ready"
    
    state.init.call(state, done)
    # synchronous version
    done() unless asyncDone
    
    
  "step": (params...) ->
    return if @active is null
    state = @states[@active]
    state.step.call(state, params...)
    
  "prerender": (params...) ->
    return if @active is null
    state = @states[@active]
    state.prerender.call(state, params...)
    
  "render": (params...) ->
    return if @active is null
    state = @states[@active]
    state.render.call(state, params...)

  "postrender": (params...) ->
    return if @active is null
    state = @states[@active]
    state.postrender.call(state, params...)
    
  "state:ready": (params...) ->
    state = @states[@active]
    state.ready.call(state, params...)
    
  "state:enter": (params...) ->
    state = @states[@active]
    @aghs.configure state.config
    state.enter.call(state, params...)
    
  "state:leave": (params...) ->
    return if @active is null
    state = @states[@active]
    state.leave.call(state, params...)
  
  "state:destroy": (time, renderer, aghs) ->
    return if @active is null
    state = @states[@active]
    state.destroy.call(state, params...)

#
# The state object, created with StateManager::add
#
State = (aghs, @state, options = {}) ->

  @name = options.name
  @isReady = if options.isReady then options.isReady else false
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
StateMachine = (@aghs, @autostart = true) ->
  @events = @aghs.events
  @states = {}
  @length = 0
  # bind all events
  @events.on(eventname, callback, @) for eventname, callback of events
  @active = null

  @proxy = @proxy.bind(@)
  return @

# StateMachine.add()
# Add a new state
# param: {name, <any state event above as a function (ie, "step")>}
StateMachine::add = (options = {}) ->
  if not options.name?
    throw new Error "state 'name' is missing from options parameter."
  
  state = new State(@aghs, @, options)
  @states[state.name] = state
  @length += 1
  
  if @length is 1
    @set(state.name)

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
      @events.trigger "state:enter"
  else
    console.warn "A GameState with a name of '#{name}' doesn't exist yet"
  return @
  
  
#
#
StateMachine::get = (name) ->
  return @states[name] or null

# state.proxy()
# proxy is the function attached to other objects,
# if you would like a different usage model
StateMachine::proxy = () ->
  
  # returns "this", for usage such as:
  # aghs.state().get() or aghs.state().set("loading")
  return @ if arguments.length is 0
  
  if typeof arguments[0] is "string"
    @set(arguments[0]) 
    return @
  # assume all other cases are state creations
  @add(arguments[0])
  
  return @


module.exports = StateMachine