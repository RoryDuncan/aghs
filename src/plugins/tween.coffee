

extend = require "extend"
Easings = require "./easings.coffee"
# we utilize an event manager independent of aghs
Events = require "../core/events.coffee"



TweenManager = () ->
  Events.call(this)
  @tweens = []
  return @

TweenManager::add = (tween) ->
  id = @tweens.push tween
  tween._ref = id

TweenManager::remove = (tween) ->
  # filter all except the matched
  # then use that filtered result as our new @tweens
  @tweens = @tweens.filter (t) -> t._ref isnt tween._ref

TweenManager::step = (time, $) ->
  @tweens.forEach (tween) -> tween.step(time, $)
  return @

###

Tween()
  .from({x:0})
  .to({x: 10})
  .for(6000)

###

Tween = (from, to, options) ->
  
  # 'super'
  Events.call(@)
  
  @state = null
  @active = false
  @done = false
  
  @options = 
    from:     null
    to:       null
    duration: null
    easing:   null
  
  @time =
    elapsed: 0
    start: null
    end:  null
  
  @data = null
  
  @set(from, to, options) if arguments.length is 3
  return @

# extend event emitter
Tween:: = Object.create(Events::)
Tween::constructor = Tween

# Manager, ya-know
Tween::Manager = null

# Tween.from()
# Pass in the starting object, from which the tween will originate
Tween::from = (options, @affectSource = true) ->
  @options.from = options
  return @

# Tween.to()
# Pass in the target object of the animation
# the value of the object are compared with the object passed in to Tween.from()
Tween::to = (options) ->
  @options.to = options
  return @

# Tween.for()
# Pass in the duration and easing of the animation
Tween::for = (duration, easing = "linear") ->
  @options.duration = duration
  @options.easing = easing
  return @

# Tween.partial()
# Conditional check fn, determining if this tween is still a partial tween
Tween::partial = () ->
  return not (@options.from and @options.to and @options.duration and @options.easing)

# Tween.init()
# Compiles the partial tween state, initiating all the data into a TweenData 
# object
Tween::init = () ->
  throw new Error "Tween is still a partial" if @partial()
  @data = new TweenData(@options)
  return @

# Tween.set()
# shorthand for setting the Tween.from(), Tween.to(), and Tween.for()
Tween::set = (start, target, options) ->

  @from(start)
  @to(target)
  @for(options.duration, options.easing)
  
  return @

# Tween.start()
# Indicates that the tween's animation should begin animating
Tween::start = () ->
  @active = true
  @reset() if @done
  @Manager.add(@) if @Manager # automatically removed from manager when done
  return @

# Tween.reset()
# Reset the animation, so that it can be animated again
Tween::reset = () ->
  @time.start = null
  @time.end = null
  @done = false
  @data.reset()
  return @

# Tween.step()
# interval fn that updates the state of the tween based on it's tween data
Tween::step = (time) ->
  
  return @ unless @active
  
  # if active, but start doesn't have a value, then it's the first step
  if @time.start is null
    @time.start = time.elapsed
    @state = @data.step.next()
  
  @trigger "step"
  
  # check if we're done
  if @state.done
    @active = false
    @done   = true
    @time.end = time.elapsed
    @Manager.remove(@) if @Manager
    @trigger "complete"
    @complete(@) if @complete
    return @
  
  # logic for determining the current state
  interval = @data.interval
  nextElapsedStep = @time.start + @state.value.elapsed + interval
  
  # check if we should go to the next step-state
  if time.elapsed >= nextElapsedStep
    @state = @data.step.next()
    
    @trigger "change"
    
    # mutate the parameter object
    if @affectSource and (not @state.done)
      for key, value of @state.value
        
        if key[0] is "$"
          k = key.substr(1)
          @options.from[k] = value
    
  

# TweenData
# internal object for a tween animation
# pre-calculates the steps of the tween upon instantiation
# created via Tween.init()
TweenData = (options) ->
  
  @easing = options.easing
  ease = Easings[options.easing]
  unless ease
    throw new Error("TweenData-> Invalid easing provided: #{options.easing}")
  
  # since we render our steps beforehand we utilize a floor interval :
  # each step will occur, at most, once per 'minStepInterval'
  minStepInterval = @interval = 20 # milliseconds
  
  duration = @duration = if options.duration <= minStepInterval then 0 else options.duration
  @length = options.steps or Math.max(@duration / minStepInterval, 1)
  
  @steps = []
  
  # generate and iterate over our steps
  for i in [0...@length]
    
    # object containing data related to that step
    # inspected during runtime to determine the current tween value
    step = {}
    # how much time has passed
    elapsed = i * minStepInterval
    # the progress value, represent what % through the tween we are
    delta   = (elapsed / duration)
    easedDelta = ease(delta)
    
    # add the change of each key (for this step) to the step obj
    for key, value of options.to
      startingValue = options.from[key]
      change        = (value - startingValue)
      
      if change is 0
        state = startingValue
        
      else
        # limit state to 2 decimal places
        state = +((change * easedDelta + startingValue).toFixed(2))
      
      # set the key-value to be the state of the tween at that step
      step["$#{key}"] = state

    step.elapsed  = elapsed
    step.delta    = delta
    # add to our list
    @steps.push(step)
  
  @reset()
  console.log @
  return @

TweenData::reset = () ->
  @step = @iterate()

# iterate
# Generator Fn - initialized within constructor
# returns a state object
# state = 
#   elapsed:  <int>   -- the elapsed time of the tween (pregrenerated)
#   delta:    <int>   -- the % of the tween that has passed
#   
# also, contains keys for each value being tweened:
#   [key]:    <?>     -- the tweened value at this state
#
TweenData::iterate = () ->
  for i in [0...@steps.length]
    yield @steps[i]


# Animation
# Interface object
Animation = (aghs) ->
  
  @Manager = new TweenManager()
  @Tween = Tween
  @Tween::Manager = @Manager
  @TweenData = TweenData
  
  aghs.attach false, @Manager
  
  return @
  
module.exports = {Tween, Animation, TweenData, TweenManager}
    
  