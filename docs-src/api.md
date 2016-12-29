# API

---

#### Aghs.render
Parameter: `Function`
Quick alias for `Aghs.events.on("render", <parameter fn>)`. Great for prototyping, but using gamestates is a more scalable and manageable affair. 


#### Aghs.step
Parameter: `Function`
Quick alias for `Aghs.events.on("step", <parameter fn>)`. Great for prototyping, but using gamestates is a more scalable and manageable affair.


#### Aghs.module
Parameters: `String` name, `Object` thing
Adds another object or function to the Aghs namespace. `name` is the key that will be added.
moduling allows you to carry the single aghs instantiation as a single, holistic framework, and attach other smaller parts to it with ease.

Example of adding a module:
``` coffee
log = (a) -> console.log "log: ${a}"
aghs = new Aghs(options);

# add the module
aghs.module "log", log

# ...
# then use it later
aghs.log "bang!" # "log: bang!"

```

Example 2:
``` coffee
aghs.module "lifetimeStats", {
  kills: 0,
  deaths: 0,
  assists: 0
}

aghs.lifetimeStats.kills += 1
```

_Note: Context isn't controlled or bound, so you can use a bound function for the second parameter freely.

Example:

``` coffee
_players = players.bind(players)
aghs.module "players", _players
```

#### Aghs.antialias
Reinforces the configured `imageSmoothingEnabled` setting given at Aghs instantiation.
See `Aghs.config.smoothing` for the value that will be set. 
Used internally when switching between layers. Use this if you've changed the setting and want to set imageSmoothing to the current layer's imageSmoothing value.

_This method may be made private in the future._


#### Aghs.ready
Parameter: `Function` callback
Calls the argument function when the document, canvas, and aghs are all ready.
If `Aghs.ready` is called after `Aghs.isReady` is already `true`, the argument function is called immediately, so you can be certain the function will always be executed.

Example:
A common usage would be to start aghs as soon as it is ready:
``` coffee

aghs.ready () ->
  aghs.start()

```

Each subsequent call to ready internally uses `Aghs.events.on("ready", <parameter fn>)`, so they will all queue and be executed on-ready.

#### Aghs.start

Begins the rendering loop. Don't forget to call this!

#### Aghs.stop

Stops the aghs step/render loop.
Calling `Aghs.start()` again is like a soft-reset to the loop's internal clock, but other aghs properties may not be reset to their initial state.

#### Aghs.attach
Paramters: `String` name, `Object` module
For modules that need to hook into the step or render events. These modules aren't added to the Aghs namespace, instead they're kept track of internally via `Aghs.__attached`. These modules can be more temporary, and can be added or removed using `.attach()` / `.unattach()`

#### Aghs.unattach
Parameter: `String` name
Unbinds a module previously attached using `Aghs.attach()`, matching the paramter `name`. 

#### Aghs.maximize

Sets the canvas and configuration so that it fills the entire page.

#### Aghs.configure
Parameter: `Object` config
Update the current configuration with any value in the `config` parameter, and then update the aghs and canvas states to match.

#### Aghs.layer
Parameters: `String` name, 
Optional Paramters:`Number` width, `Number` height - both inherited from Aghs.config if not given.

Creates or switches to a new layer matching layer `name`.
When creating:
1. Creates a new canvas.
2. Creates a new context from the new canvas; Sets to Aghs.context
3. saves the canvas, context, and name as a new _layer_.

Calling `Aghs.layer` with a name that already exists will switch to that layer.

There is only one layer by default, named `screen`, which is the drawing layer.

#### Aghs.screen
Shorthand for quickly switching to the drawing layer.

#### Aghs.draw
Optional Parameters: 

- `Object` source = {x: 0, y: 0, width: layer.width, height: layer.height}
- `Object` target = {x: 0, y: 0}
- 
Retrieves the current layer as imagedata and then draws it on the primary drawing canvas (layer `screen`)

#### Aghs.resize
Parameters: `Number` width, `Number` height, `Boolean` allLayers (defaults to false)
Change's the current layer's width and height. If `allLayers` parameter is true it will resize all layers, including the `screen` layer.


---



## Properties

These values are attached to the Aghs object...for now. They're currently accessible until deemed that they won't need to be accessed. Essentially: **Access to some or all of these properties may be removed in later versions of Aghs**.

#### Aghs.isReady 

Type: `Boolean`
Indicates if the Aghs instance is ready. Consequently, it also means that the `canvas` and `document` are also ready.
If you wish to do something after Aghs is ready, it's suggested you use the `ready` event.

#### Aghs.running
Type: `Boolean`
Determines if Aghs should continue looping, or calling it's render and step loops.
Rather than setting to false to stop the loop, you should use `Aghs.stop()` so other systems can gracefully stop.

#### Aghs.modules
Type: `Array`
List of the names of all modules currently added to the Aghs instance via `Aghs.module`.

#### Aghs.canvas
Type: `HTMLCanvasElement`
A reference to the Renderer's primary canvas, found on the DOM.

#### __frame
Type: `Number` (integer)
The current frame count since `Aghs.start` was called.

#### __attached

Type: `Object`
Reference of all currently _attached_ modules.
Attached modules hook into the `render` or `step` events of Aghs.

#### chainingExceptions
type: `Object`
A reference object used to specify which values should not be chained for the Drawing API.
If you wish to specify chaining exceptions, do them before Aghs instantiation.

#### layers
Type: `Object`
A reference object containing all temporary canvases and contexts, coined "layers". See `Aghs.Layer()` for more information.

#### currentLayer
Type: `String`
A reference to the current layer. At Aghs instantiation it will be "screen".
_For advanced usage only:_ `currentLayer` can be used to get the current layer, as seen below:

``` coffee
layer = @layers[@currentLayer]
# layer = {HTMLCanvasElement canvas, string name, CanvasRenderingContext2D context}
```

#### config
Type: `Object`
A reference to the configuration of the Aghs framework, including many Aghs instantiation arguments.

The keys and their default values are below:

##### fullscreen
Type: `Boolean`
Default: `true`
Configuration value that determines if the canvas's width and height are maximized inside the window.

##### renderer
Type: `Boolean`
Default: `true`
Determines if the CanvasRenderingContext2D methods are chained and extended onto a new Renderer instance.

##### smoothing
Type: `Boolean`
Default: `true`
Determines if `imageSmoothing` is enabled or disabled across all layers. By browser default, all new contexts are set to `imageSmoothing: false`.

##### width
Type: `Number`
Default: Canvas Width
The width of the canvas. If `Aghs.config.fullscreen` is true, it will overwrite this value.

##### height
Type: `Number`
Default: Canvas Height
Same as `Aghs.config.height`, above.

##### scale
Type: `Number`
Default: 1
Scale is a multiplier for the values that the canvas uses. Refer to the CanvasRenderingContext2D's implementation for a better understanding.
Value that is passed to `CanvasRenderingContext2D.scale`. Passed as both the x and y value.

##### frameskip
Type: `Object`
Contains three keys: `count`, `enabled`, and `threshold`–where:
- `enabled` is whether frameskipping is used. Defaults to true.
- `count`is the total number of frames skipped since `Aghs.start()` was called.
- `threshold` is the amount milliseconds that is allowed in a single render, else the frame becomes skipped, where no rendering occurs. Defaults to 120ms.




---




## Internals

#### Aghs.events

The events module is the only module used for the Aghs framework that is not readily swappable. It is instantiated within the constructor of the Aghs instance and has a hookable-events that can be utilized.


## Plugins

#### world
#### utils
#### state
#### keyboard
