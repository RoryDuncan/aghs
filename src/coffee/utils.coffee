noop = () -> return

defer = (fn) -> setTimeout(fn, 17)

throttle = (func = null, delay = 250, ctx = null, returnValue = null) ->
  return unless func
  lastCalled = performance.now()
  now = null
  return (args...) ->
    if (lastCalled + delay) > (now = performance.now())
      return returnValue
    lastCalled = now
    return func.apply(ctx, args)

chain = (wrapper, host, func) ->
  # could use fast.js optimization 
  #    (switch statement with + .call for small args)
  func.apply(host, args)
  return wrapper


module.exports = {chain, noop, defer, throttle}