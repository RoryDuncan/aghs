extend = require "extend"
require "./utils.coffee"

#  triggered event functions
events =
  
  "create": () ->
    state = @states[@active]
    state.create?call(state)
    
  "step": (time) ->
    state = @states[@active]
    state.step?call(state, time)
    
  "prerender": (time) ->
    state = @states[@active]
    state.prerender?call(state, time)
    
  "render": (time) ->
    state = @states[@active]
    state.render?call(state, time)

  "postrender": (time) ->
    state = @states[@active]
    state.postrender?call(state, time)
    

  "enter": () ->
    state = @states[@active]
    state.enter?call(state)
    
  "leave": () ->
    state = @states[@active]
    state.leave?call(state)
  
  "destroy": () ->
    state = @states[@active]
    state.destroy?call(state)

State = (options = {}) ->
  @name = options.name
  extend @, options
  return @

# add all trigger functions to the prototype
State::[eventname] = utils.noop for eventname of events



StateMachine = (@aghs) ->
  @events = @aghs.events
  @states = {}
  @active = null
  
  # bind all events
  @events.on eventname, callback, @ for eventname, callback of events
  
  return @



  
  
  
StateMachine::state = (options) ->
  