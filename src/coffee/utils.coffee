noop = () -> return


chain = (wrapper, host, func) ->
  # could use fast.js optimization 
  #    (switch statement with + .call for small args)
  func.apply(host, args)
  return wrapper


module.exports = {chain, noop}