
# Aghs Gamestate Plugin

A gamestate plugin for the Aghs Framework.
It is essentially a customized State Machine.

While these docs provide a high-level overview, viewing the actual sourcecode may be just as easily grokked, as it is fairly straight-forward code.

## GameState Object

A manager that attaches an `Aghs` instance to itself, and listens and triggers events of the Aghs instance. Keeps a dictionary object of created states, so that the may be switched between freely.

Instantiation looks like:

``` coffee

states = new GameState(aghsInstance [, setFirstGameState])

```

`setFirstGameState` is a boolean that determines if the first gamestate is added, shoudl also be set. Defaults to true.


## Using Proxy API

This plugin has a proxy method used for a simpler API with the Aghs framework.

Using `Aghs::module`, add the module like so:

_Note: Assume all code samples already have an Aghs object instantiated, as `aghs`._


``` coffee
# import gamestate
GameState = require '../gamestate.coffee'

# instantiate, then pass the proxy method
aghs.module "state", new GameState(aghs).proxy
```


The proxy method is only sugar for setting and getting states quickly. 
It's function is below:

#### If an object is passed, create a new gamestate with the object's properties.

The object is passed to the `.add` method

``` coffee
# using parens and curly braces to show that an object is pased:
aghs.state({
  name: "title screen"
  ...
})
```

#### If a string is passed, activate the state with a name matching the argument

The string is passed to the `.get` method

``` coffee
aghs.state "title screen" # changes to the "title screen" gamestate
```

#### If no arguments are passed: Return the gamestate object.

Allowing chaining of the methods of the GameState object.

``` coffee
gamestate = aghs.state() # -> returns the GameState object

gamestate.add( ... )
gamestate.set( ... )

```

## Methods

### GameState.add

Parameter: `Object` Options  

`options.name` is the only required key, and is expected to be a unique string.

Creates a new State object and adds it to the GameStates' list of managed states. If it is the first gamestate added, it will also be set using `GameState.set`.

#### State Object

The state object is created with the `GameState.add()` method. Any options are added to the state.

Options can have any keys that you require for your gamestate, but note the following **overrides**: 

```
fullscreen
width
height
frameskip
smoothing
scale
```

Add a new gamestate to the gamestate manager. The state is created based on a passed-in options object.

#### Overrides

The overrides are applied during a gamestate switch, and are _by default_ the same as the Agh's instances'.

### GameState.set
Parameter: `String` name

Changes the currently active gamestate to the one matching the `name` parameter, if it exists.

Changing the gamestate triggers the following events, as ordered:

1. The `state:leave` event of the currently actuve gamestate( now the previous state)
2. The `state:init` event of the next gamestate, if `state.initialized` is `false`.
3. The `state:ready` event of the next gamestate, if `state.isReady` is `false`.
4. The `state:enter` event of the next gamestate, which is now the currently active gamestate.

### GameState.get
Parameter: `String` name
Retrieves the State object matching the parameter `name`, or `null` if not found.
You can make modifications to the returned object, to affect the state.

## GameState Lifecycle

A gamestate has a specific lifecycle, based on the following events:

1. `state:init` - Called the first time that an event is changed to, before all other states.
2. `state:ready` - called after `state:init` has been called.
3. `state:enter` - Called every time that the state is changed **to**.
4. `state:leave` - Called every time that the state is changed **from**.
5. `state:destroy` Not implemented.

## GameState Events

See the GameState Lifecycle section for details on the below events.

- `state:init`
- `state:ready`
- `state:enter`
- `state:leave`
- `state:destroy`

The following events are based on the Aghs' internal step and render loop.

- `prerender`
- `render`
- `postrender`
- `step`


## Getting Started

The code below will show you how to setup, and the examples of using the GameState object.


#### Example 1: Creating a Gamestate


``` coffee

# since this is the first gamestate created, it is automatically set after it is added
aghs.state 

  # the unique name of the gamestate
  name: "title screen",
  
  # Any data we want associated with this state
  trees: 10
  foxes: 2
  colors: ["red", "blue"]
  
  # the step and render functions to call while this state is active
    
  init: () -> console.log "init #{@name}"
  ready: () -> console.log "ready #{@name}"
  enter: () -> console.log "enter #{@name}"
  step: (time) -> return 
  render: (time) -> return
  leave: () -> console.log "leave #{@name}"


```

#### Example 2: Changing between Gamestates

Continueing from the code from example one, we can then add another gamestate:

``` coffee

# create the second gamestate
aghs.state 

  name: "level select",
  init: () -> console.log "init #{@name}"
  ready: () -> console.log "ready #{@name}"
  enter: () -> console.log "enter #{@name}"
  step: (time) -> return 
  render: (time) -> return
  leave: () -> console.log "leave #{@name}"


# then switch to it, using the 'set' method
aghs.state().set(gamestate2.name)

```

The above example, in conjunction with the first example, will print the following to the console:

```
init overworld
ready overworld
enter overworld
leave overworld
init title screen
ready title screen
enter title screen
```

If you were to change to 'overworld' gamestate again you would notice that the `init overworld` and `init ready` event phases are not output to the console.

The `init` and `ready` events are for preparing gamestates the first time they are activated. `init` is a great time to load images or make async calls, while the `ready` event phase could be used to prepare those images- like assigning them to sprite objects, or what have you.
