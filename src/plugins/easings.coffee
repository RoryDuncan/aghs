module.exports = {
  
  'linear': (t) ->
    return t
  
  'inQuad': (t) ->
    return t * t
  
  'outQuad': (t) ->
    return t * (2 - t)
  
  'inOutQuad': (t) ->
    return if t < .5 then 2 * t * t else -1 + (4 - 2 * t) * t
  
  'inCubic': (t) ->
    return t * t * t
  
  'outCubic': (t) ->
    return (--t) * t * t + 1
  
  'inOutCubic': (t) ->
    return if t < .5 then 4 * t * t * t else (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  
  'inQuart': (t) ->
    return t * t * t * t
  
  'outQuart': (t) ->
    return 1 - (--t) * t * t * t
  
  'inOutQuart': (t) ->
    return if t < .5 then 8 * t * t * t * t else 1 - 8 * (--t) * t * t * t
  
  'inQuint': (t) ->
    return t * t * t * t * t
  
  'outQuint': (t) ->
    return 1 + (--t) * t * t * t * t
  
  'inOutQuint': (t) ->
    return if t < .5 then 16 * t * t * t * t * t else 1 + 16 * (--t) * t * t * t * t
  
  'inSine': (t) ->
    return -1 * Math.cos(t / 1 * (Math.PI * 0.5)) + 1;
  
  'outSine': (t) ->
    return Math.sin(t / 1 * (Math.PI * 0.5))
  
  'inOutSine': (t) ->
    return -1 / 2 * (Math.cos(Math.PI * t) - 1)
  
  'inExpo': (t) ->
    return if t is 0 then 0 else Math.pow(2, 10 * (t - 1))
  
  'outExpo': (t) ->
    return if t is 1 then 1 else (-Math.pow(2, -10 * t) + 1)
  
  'inOutExpo': (t) ->
    return t if (t is 0 or t is 1)
    return 0.5 * Math.pow(2, 10 * (t - 1)) if ((t /= 0.5) < 1)
    return 0.5 * (-Math.pow(2, -10 * --t) + 2)
  
  'inCirc': (t) ->
    return -1 * (Math.sqrt(1 - t * t) - 1)
  
  'outCirc':(t) ->
    return Math.sqrt(1 - (t = t - 1) * t)
  
  'inOutCirc':(t) ->
    if ((t /= 1 / 2) < 1)
      return -1 / 2 * (Math.sqrt(1 - t * t) - 1)
    return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1)
  
  'inElastic': (t) ->
    s = 1.70158
    p = 0
    a = 1
    if (t is 0 or t is 1)
      return t
    if (!p)
      p = 0.3 
    if (a < 1)
      a = 1
      s = p / 4
    else
      s = p / (2 * Math.PI) * Math.asin(1 / a)
    return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p))
  
  'outElastic': (t) ->
    s = 1.70158
    p = 0
    a = 1
    return 0 if (t is 0)
    return 1 if (t is 1)
    p = 0.3  if (!p)
    if (a < 1)
      a = 1
      s = p / 4
    else
      s = p / (2 * Math.PI) * Math.asin(1 / a)
    return a * Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1

  'inOutElastic': (t) ->
    s = 1.70158
    p = 0
    a = 1
    return 0 if (t is 0)
    return 1 if ((t /= 1 / 2) is 2)
    p = (0.3 * 1.5) if (!p)
    if a < 1
      a = 1
      s = p / 4
    else
      s = p / (2 * Math.PI) * Math.asin(1 / a)
    if (t < 1)
      return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p));
    return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t - s) * (2 * Math.PI) / p) * 0.5 + 1;
} 