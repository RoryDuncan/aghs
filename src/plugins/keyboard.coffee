# essentially a fork of playground.js's keyboard, but adapted for use with Aghs
# ( and rewritten in coffeescript )
# ->  https://github.com/rezoner/playground/blob/master/src/Keyboard.js
 




# Keyboard
#
#
Keyboard = (@options = {}) ->
  
  # state
  @pressed = []
  @keys = {}
  @disabled = @options.disabled or false
  
  # add each keycode name to the keys object
  for k, v of @keycodes
    @keys[v] = false
  
  # bindings
  @handler = @handler.bind(@)
  
  # begin listening
  @capture()
  return @

#
# Defined on the prototype as an optimization, so that the JIT compiler needs to only create 1 internal class
Keyboard::keys = {}
Keyboard::pressed = []


#
# Keys that shouldn't be default prevented, and prevented from propagating
Keyboard::allowBubbling = [
  "ctrl"    
]

#
# clears out the list of pressed keys
Keyboard::clear = () ->
  @pressed = []
  return @

#
#
Keyboard::handler = (e) ->
  @clear()
  return if @disabled
  
  pressed = (if e.type is "keyup" then false else true)
  
  char = e.which
  # alphabet-related keys are between 48 and 90
  if 48 <= char <= 90
    key = String.fromCharCode(char).toLowerCase()
  else 
    key = @keycodes[char]

  unless @allowBubbling.indexOf key > 0  
    e.preventdefault()
    e.stoppropagation()
  
  
  @keys[key] = pressed;
  
  
  for k, v of @keys
    @pressed.push k if v
  
  return

#
#
Keyboard::capture = () ->
  
  document.addEventListener "keydown",    @handler
  document.addEventListener "keyup",      @handler
  # document.addEventListener "keypress",   @handler
  
  return @

#
#
Keyboard::release = () ->
  
  document.removeEventListener "keydown",    @handler
  document.removeEventListener "keyup",      @handler
  # document.removeEventListener "keypress",   @handler
  
  return @

#
#
Keyboard::keycodes = 
  37:   "left",
  38:   "up",
  39:   "right",
  40:   "down",
  45:   "insert",
  46:   "delete",
  8:    "backspace",
  9:    "tab",
  13:   "enter",
  16:   "shift",
  17:   "ctrl",
  18:   "alt",
  19:   "pause",
  20:   "caps-lock",
  27:   "escape",
  32:   "space",
  33:   "pageup",
  34:   "pagedown",
  35:   "end",
  36:   "home",
  96:   "numpad-0",
  97:   "numpad-1",
  98:   "numpad-2",
  99:   "numpad-3",
  100:  "numpad-4",
  101:  "numpad-5",
  102:  "numpad-6",
  103:  "numpad-7",
  104:  "numpad-8",
  105:  "numpad-9",
  106:  "numpad-mul",
  107:  "numpad-add",
  109:  "numpad-sub",
  110:  "numpad-dec",
  111:  "numpad-div",
  112:  "f1",
  113:  "f2",
  114:  "f3",
  115:  "f4",
  116:  "f5",
  117:  "f6",
  118:  "f7",
  119:  "f8",
  120:  "f9",
  121:  "f10",
  122:  "f11",
  123:  "f12",
  144:  "num-lock",
  145:  "scroll-lock",
  186:  "semicolon",
  187:  "equal",
  188:  "comma",
  189:  "dash",
  190:  "period",
  191:  "slash",
  192:  "grave-accent",
  219:  "open-bracket",
  220:  "backslash",
  221:  "close-bracket",
  222:  "single-quote"

module.exports = Keyboard