
# EventEmitter Object
#
#
EventEmitter = () ->
  @__events = []
  @__allowed = {}
  return @


# EventEmitter.on()
#
#
EventEmitter::on =
EventEmitter::addEventListener = (name, fn, context = null) ->
  
  if name is undefined or fn is undefined
    throw new SyntaxError("EventEmitter.on is missing a required parameter.")
  
  @__events[name] = @__events[name] or []
  @__events[name].push {event: name, fn, context}
  
  # don't override any disables by adding a new event
  @__allowed[name] = true if @__allowed[name] is undefined
  return @

# EventEmitter.off()
#
#
EventEmitter::off =
EventEmitter::removeEventListener = (name, fn) ->
  
  if name is undefined
    throw new SyntaxError("EventEmitter.off is missing a required parameter.")
  
  if fn is undefined
    @__events[name] = [] # clear the entire event
    delete @__allowed[name]

  # if the specific function is passed in remove only that function,
  # not all event functions under that event name
  else
    events = @__events[name] or []
    @__events[name] = events.filter (el, i, arr) ->
      return false if el.fn is fn
      return true
  return @


# EventEmitter.trigger()
#
#
EventEmitter::trigger = (event, data...) ->
  
  if event is undefined
    throw new SyntaxError("EventEmitter.trigger is missing or has an invalid parameter.")
  
  # only trigger allowed events
  return @ unless @__allowed[event] is true
  
  @__events[event].forEach (el, i, arr) -> el.fn.apply(el.context, data)
  return @

# EventEmitter.enable()
#
#
EventEmitter::enable = (event) ->
  @__allowed[event] = true if @__allowed[event] isnt undefined
  return @

# EventEmitter.disable()
#
#
EventEmitter::disable = (event) ->
  @__allowed[event] = false if @__allowed[event] isnt undefined
  return @


module.exports = EventEmitter