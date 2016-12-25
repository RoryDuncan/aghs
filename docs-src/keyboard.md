
# Aghs Keyboard Plugin

A plugin that allows access to a human-friendly reference of keys, and their state.

In essence, it is a fork of [Playground.js's keyboard](https://github.com/rezoner/playground/blob/master/src/Keyboard.js), but rewritten in coffeescript.


# API

## Properties

### Keyboard.disabled

If set to `true` keyboard will not register any further keys as pressed.  
Defaults to `false`.

### Keyboard.keys

An object consisting of lowercase and trimmed *name* of all keyboard buttons as keys and a value of either `true`/`false`. `Keyboard.keys` will allow you to access individual keys to determine if they're currently pressed. See the usage section for examples. Below are the names of the keys

#### keys reference

  - `left`
  - `up`
  - `right`
  - `down`
  - `insert`
  - `delete`
  - `backspace`
  - `tab`
  - `enter`
  - `shift`
  - `ctrl`
  - `alt`
  - `pause`
  - `caps-lock`
  - `escape`
  - `space`
  - `pageup`
  - `pagedown`
  - `end`
  - `home`
  - `numpad_0`
  - `numpad_1`
  - `numpad_2`
  - `numpad_3`
  - `numpad_4`
  - `numpad_5`
  - `numpad_6`
  - `numpad_7`
  - `numpad_8`
  - `numpad_9`
  - `numpad_mul`
  - `numpad_add`
  - `numpad_sub`
  - `numpad_dec`
  - `numpad_div`
  - `f1`
  - `f2`
  - `f3`
  - `f4`
  - `f5`
  - `f6`
  - `f7`
  - `f8`
  - `f9`
  - `f10`
  - `f11`
  - `f12`
  - `numlock`
  - `scrolllock`
  - `semicolon`
  - `equal`
  - `comma`
  - `dash`
  - `period`
  - `slash`
  - `grave-accent`
  - `open-bracket`
  - `backslash`
  - `closebracket`
  - `singlequote`

### Keyboard.pressed

An array of all keys that are pressed.

## Methods

### Keyboard.capture()

Add event listeners, to begin watching for keyup and keydown changes.  
_Note: `keypress` changes aren't listened for._

### Keyboard.release()

Functionally, the inverse of `Keyboard.capture()` Removes "keydown" and "keyup" event listeners from the document.

### Keyboard.clear()

Resets the state of the `Keyboard.pressed` to an empty array.

### Keyboard.command()
Parameters: `array` keys, `bool` exactMatch _default: `true`_

Returns `true` if all key names in the parameter `keys` array are pressed-otherwise `false`.

A few examples:
```
aghs.keyboard.command(["ctrl", "alt", "left"])
aghs.keyboard.command(["left", "up"])
```

### Exposed Internals

### `[on prototype]` Keyboard.handler()

The callback for the event listeners related `keyup` / `keydown`.

### `[on prototype]` Keyboard.keycodes

An object containing keys for each keyboard charactor code, and values for their name.