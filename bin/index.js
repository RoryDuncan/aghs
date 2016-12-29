(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Aghs, Keyboard, StateMachine, World, aghs, utils;

utils = require("./src/core/utils.coffee");

World = require("./src/plugins/world.coffee");

StateMachine = require("./src/plugins/gamestate.coffee");

Keyboard = require("./src/plugins/keyboard.coffee");

Aghs = require("./src/core/aghs.coffee");

aghs = new Aghs();

aghs.module("world", new World(aghs));

aghs.module("utils", utils);

aghs.module("state", new StateMachine(aghs).proxy);

aghs.module("keyboard", new Keyboard());

window.Aghs = function() {
  return aghs;
};

module.exports = aghs;

},{"./src/core/aghs.coffee":3,"./src/core/utils.coffee":6,"./src/plugins/gamestate.coffee":7,"./src/plugins/keyboard.coffee":8,"./src/plugins/world.coffee":9}],2:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],3:[function(require,module,exports){
var Aghs, EventEmitter, Renderer, chain, extend, noop, utils;

extend = require("extend");

utils = require("./utils.coffee");

EventEmitter = require("./events.coffee");

Renderer = require("./renderer.coffee");

noop = utils.noop;

chain = utils.chain;

Aghs = function(options) {
  var Configuration, screen, that, triggerReady;
  if (options == null) {
    options = {};
  }
  that = this;
  this.modules = [];
  this.config = {};
  if (options.events !== false) {
    this.module("events", new EventEmitter());
  }
  if (options.renderer !== false) {
    this.module("renderer", new Renderer(options));
  }
  this.$ = this.renderer;
  this.canvas = this.renderer.CANVAS;
  this.isReady = false;
  triggerReady = function() {
    utils.defer(function() {
      that.isReady = true;
      return that.events.trigger("ready");
    });
  };
  if (document.readyState === "complete") {
    triggerReady();
  } else {
    document.onreadystatechange = function() {
      if (document.readyState === "complete") {
        return triggerReady();
      }
    };
  }
  this.__attached = {};
  this.currentLayer = "screen";
  screen = {
    canvas: this.renderer.canvas,
    context: this.renderer.context
  };
  this.layers = {
    screen: screen
  };
  this.events.on("resize", function() {
    that.config.width = that.canvas.width;
    return that.config.height = that.canvas.height;
  });
  Configuration = this.Configuration;
  this.configure(new Configuration(options));
  return this;
};

Aghs.prototype.Configuration = function(options) {
  var config;
  if (options == null) {
    options = {};
  }
  config = {
    "fullscreen": true,
    "smoothing": true,
    "width": window.innerWidth,
    "height": window.innerHeight,
    "scale": 1,
    "frameskip": {
      "count": 0,
      "enabled": true,
      "threshold": 120
    }
  };
  return extend({}, options, config);
};

Aghs.prototype.module = function(name, obj) {
  if (!(name && obj)) {
    throw new Error("Missing module parameter 1 or parameter 2");
  }
  if (this.name != null) {
    throw new Error("Module Exists: " + name + " already exists.");
  }
  this.modules.push(name);
  this[name] = obj;
  return this;
};

Aghs.prototype.ready = function(fn) {
  if (this.isReady) {
    fn.call(this);
  } else {
    this.events.on("ready", fn, this);
  }
  return this;
};

Aghs.prototype.start = function() {
  var boundStep, frameSkippingThreshold, now, skipFrame, start, step, time;
  now = function() {
    return Date.now();
  };
  frameSkippingThreshold = this.config.frameskip.threshold;
  if (this.config.frameskip.allow) {
    skipFrame = function(dt) {
      return dt > frameSkippingThreshold;
    };
  } else {
    skipFrame = function(dt) {
      return false;
    };
  }
  start = now();
  time = {
    'elapsed': 0,
    'lastCalled': now(),
    'now': now(),
    'start': now(),
    'delta': null,
    'id': null
  };
  this.time = function() {
    return time;
  };
  step = function(e) {
    var _now;
    if (this.running !== true) {
      return;
    }
    _now = now();
    time.now = _now;
    time.delta = _now - time.lastCalled;
    time.elapsed += time.delta;
    this.events.trigger("step", time);
    if (skipFrame(time.delta)) {
      this.config.frameskip.count += 1;
      time.elapsed -= time.delta;
    } else {
      this.events.trigger("prerender", time, this.renderer, this);
      this.events.trigger("render", time, this.renderer, this);
    }
    time.lastCalled = _now;
    this.events.trigger("postrender", time, this.renderer, this);
    time.id = window.requestAnimationFrame(boundStep);
    return this.__frame = time.id;
  };
  boundStep = step.bind(this);
  this.running = true;
  time.id = window.requestAnimationFrame(boundStep);
  return this;
};

Aghs.prototype.stop = function() {
  window.cancelAnimationFrame(this.__frame);
  this.running = false;
  return this;
};

Aghs.prototype.step = function(step) {
  if (typeof step === "function") {
    this.events.on("step", step);
  }
  return this;
};

Aghs.prototype.render = function(render) {
  if (typeof render === "function") {
    this.events.on("render", render);
  }
  return this;
};

Aghs.prototype.attach = function(modulename, obj) {
  var name;
  if (!obj) {
    return this;
  }
  name = modulename || Object.getPrototypeOf(obj).constructor.name;
  this.__attached[name] = obj;
  console.log("Attaching module as '" + name);
  if (obj.step) {
    this.events.on("step", obj.step, obj);
  }
  if (obj.render) {
    this.events.on("render", obj.render, obj);
  }
  return this;
};

Aghs.prototype.unattach = function(modulename) {
  var module;
  if (!modulename) {
    return this;
  }
  module = this.__attached[modulename];
  if (module) {
    if (module.step) {
      this.events.off("step", module.step);
    }
    if (module.render) {
      this.events.off("render", module.render);
    }
  }
  return this;
};

Aghs.prototype.maximize = function() {
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  this.events.trigger("resize");
  return this;
};

Aghs.prototype.antialias = function() {
  this.renderer.imageSmoothingEnabled(this.config.smoothing);
  return this;
};

Aghs.prototype.configure = function(config1) {
  this.config = config1;
  if (!this.config) {
    throw new Error("Invalid config passed to Aghs::configure");
  }
  this.screen();
  if (this.config.fullscreen) {
    this.maximize();
  } else {
    this.resize(this.config.width, this.config.height);
  }
  this.renderer.scale(this.config.scale, this.config.scale);
  this.antialias();
  return this;
};

Aghs.prototype.layer = function(name, width, height) {
  var canvas, context, layer, ref;
  if (name == null) {
    name = "screen";
  }
  if (width == null) {
    width = this.config.width;
  }
  if (height == null) {
    height = this.config.height;
  }
  canvas = null;
  context = null;
  if (name === "screen") {
    canvas = this.renderer.CANVAS;
    context = this.renderer.CONTEXT;
  } else {
    if (this.layers[name]) {
      layer = this.layers[name];
      canvas = layer.canvas;
      context = layer.context;
    } else {
      ref = this.renderer._create(width, height), canvas = ref[0], context = ref[1];
      this.layers[name] = {
        name: name,
        canvas: canvas,
        context: context
      };
    }
  }
  this.currentLayer = name;
  this.renderer._change(name, canvas, context);
  return this;
};

Aghs.prototype.screen = function() {
  return this.layer("screen");
};

Aghs.prototype.draw = function(source, target) {
  var _source, _target, data;
  if (source == null) {
    source = {
      x: 0,
      y: 0
    };
  }
  if (target == null) {
    target = {
      x: 0,
      y: 0
    };
  }
  _source = this.renderer.context;
  if (target.name != null) {
    _target = this.layers[target.name].context;
  } else {
    _target = this.renderer.CONTEXT;
  }
  if (!source.width) {
    source.width = this.renderer.canvas.width;
  }
  if (!source.height) {
    source.height = this.renderer.canvas.height;
  }
  data = _source.getImageData(source.x, source.y, source.width, source.height);
  _target.putImageData(data, target.x || 0, target.y || 0);
  return this;
};

Aghs.prototype.resize = function(width, height, allLayers) {
  var cacheResizeAndRender, h, layer, name, ref, w;
  if (allLayers == null) {
    allLayers = false;
  }
  w = width || this.config.width;
  h = height || this.config.height;
  cacheResizeAndRender = function(layer) {
    var data;
    data = layer.context.getImageData(0, 0, w, h);
    layer.canvas.width = w;
    layer.canvas.height = h;
    return layer.context.putImageData(data, 0, 0);
  };
  if (allLayers) {
    ref = this.layers;
    for (name in ref) {
      layer = ref[name];
      cacheResizeAndRender(layer);
    }
  } else {
    cacheResizeAndRender(this.layers[this.currentLayer]);
    this.events.trigger("resize");
  }
  return this;
};

module.exports = Aghs;

},{"./events.coffee":4,"./renderer.coffee":5,"./utils.coffee":6,"extend":2}],4:[function(require,module,exports){
var EventEmitter,
  slice = [].slice;

EventEmitter = function() {
  this.__events = [];
  this.__allowed = {};
  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addEventListener = function(name, fn, context) {
  if (context == null) {
    context = null;
  }
  if (name === void 0 || fn === void 0) {
    throw new SyntaxError("EventEmitter.on is missing a required parameter.");
  }
  this.__events[name] = this.__events[name] || [];
  this.__events[name].push({
    event: name,
    fn: fn,
    context: context
  });
  if (this.__allowed[name] === void 0) {
    this.__allowed[name] = true;
  }
  return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeEventListener = function(name, fn) {
  var events;
  if (name === void 0) {
    throw new SyntaxError("EventEmitter.off is missing a required parameter.");
  }
  if (fn === void 0) {
    this.__events[name] = [];
    delete this.__allowed[name];
  } else {
    events = this.__events[name] || [];
    this.__events[name] = events.filter(function(el, i, arr) {
      if (el.fn === fn) {
        return false;
      }
      return true;
    });
  }
  return this;
};

EventEmitter.prototype.trigger = function() {
  var data, event;
  event = arguments[0], data = 2 <= arguments.length ? slice.call(arguments, 1) : [];
  if (event === void 0) {
    throw new SyntaxError("EventEmitter.trigger is missing or has an invalid parameter.");
  }
  if (this.__allowed[event] !== true) {
    return this;
  }
  this.__events[event].forEach(function(el, i, arr) {
    return el.fn.apply(el.context, data);
  });
  return this;
};

EventEmitter.prototype.enable = function(event) {
  if (this.__allowed[event] !== void 0) {
    this.__allowed[event] = true;
  }
  return this;
};

EventEmitter.prototype.disable = function(event) {
  if (this.__allowed[event] !== void 0) {
    this.__allowed[event] = false;
  }
  return this;
};

module.exports = EventEmitter;

},{}],5:[function(require,module,exports){
var Renderer, extend, utils,
  slice = [].slice;

extend = require("extend");

utils = require("./utils.coffee");

Renderer = function(options) {
  var canvas;
  if (options == null) {
    options = {};
  }
  if (options.el === void 0) {
    canvas = document.createElement('canvas');
    canvas.id = "screen";
    document.body.appendChild(canvas);
  } else if (typeof options.el === "string" && options.el[0] === "#") {
    canvas = document.getElementById(options.el);
  } else {
    canvas = options.el;
  }
  this.CANVAS = canvas;
  this.CONTEXT = canvas.getContext("2d");
  this.canvas = canvas;
  this.context = this.CONTEXT;
  this.extendContext();
  return this;
};

Renderer.prototype._change = function(state, canvas1, context1) {
  this.state = state;
  this.canvas = canvas1;
  this.context = context1;
  return this;
};

Renderer.prototype._create = function(width, height) {
  var canvas, context;
  canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  context = canvas.getContext("2d");
  return [canvas, context];
};

Renderer.prototype.extendContext = function() {
  var ctx, exceptionName, hasReturn, key, makeSetGetFunction, that, value;
  that = this;
  ctx = this.context;
  makeSetGetFunction = function(keyname) {
    return function(value) {
      if (value === void 0) {
        return that.context[keyname];
      }
      that.context[keyname] = value;
      return that;
    };
  };
  if (!ctx) {
    throw new Error("A CanvasRenderingContext2D is required for Wrapper to function.");
  }
  for (key in ctx) {
    value = ctx[key];
    if (typeof value === "function") {
      hasReturn = false;
      for (exceptionName in this.chainingExceptions) {
        if (key === exceptionName) {
          hasReturn = true;
        }
      }
      this[key] = this.chain(value, hasReturn);
    } else {
      if (key !== "canvas") {
        this[key] = makeSetGetFunction(key);
      }
    }
  }
  return this;
};

Renderer.prototype.chain = function(func, hasReturnValue) {
  var source;
  source = this;
  if (hasReturnValue) {
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return func.apply(source.context, args);
    };
  } else {
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      func.apply(source.context, args);
      return source;
    };
  }
};

Renderer.prototype.chainingExceptions = {
  "getImageData": "getImageData",
  "createImageData": "createImageData",
  "isPointInStroke": "isPointInStroke",
  "isPointInPath": "isPointInPath"
};

Renderer.prototype.polygon = function(points) {
  if (points == null) {
    points = [];
  }
  if (!(points.length > 0)) {
    console.warn("Missing Parameter 1 in Renderer.polygon");
    return this;
  }
  this.beginPath();
  this.moveTo(points[0].x, points[0].y);
  points.forEach(function(pt) {
    return this.lineTo(pt.x, pt.y);
  });
  return this.closePath();
};

Renderer.prototype.triangle = function(pt1, pt2, pt3) {
  if (pt1 == null) {
    pt1 = {
      x: 0,
      y: 0
    };
  }
  if (pt2 == null) {
    pt2 = {
      x: 0,
      y: 0
    };
  }
  if (pt3 == null) {
    pt3 = {
      x: 0,
      y: 0
    };
  }
  if (typeof pt1 === "object" && pt1.length !== void 0) {
    return this.polygon(pt1);
  }
  this.beginPath();
  this.moveTo(pt1.x, pt1.y);
  this.lineTo(pt2.x, pt2.y);
  this.lineTo(pt3.x, pt3.y);
  this.closePath();
  return this;
};

Renderer.prototype.strs = function() {
  var args;
  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  this.save();
  return this.tars.apply(this, args);
};

Renderer.prototype.trs = function(x, y, rotation, scale) {
  if (x == null) {
    x = 0;
  }
  if (y == null) {
    y = 0;
  }
  if (rotation == null) {
    rotation = 0;
  }
  if (scale == null) {
    scale = 1;
  }
  this.translate(x, y).rotate(rotation).scale(scale, scale);
  return this;
};

Renderer.prototype["do"] = function() {
  var action, actions, i, len;
  actions = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  this.save();
  for (i = 0, len = actions.length; i < len; i++) {
    action = actions[i];
    action();
  }
  this.restore();
  return this;
};

Renderer.prototype.clear = function(fill) {
  if (fill == null) {
    fill = "#fff";
  }
  return this.fillStyle(fill).fillRect(0, 0, this.canvas.width, this.canvas.height);
};

Renderer.prototype.fillWith = function(color) {
  if (color == null) {
    color = "#000";
  }
  return this.fillStyle(color).fill();
};

Renderer.prototype.strokeWith = function(color) {
  if (color == null) {
    color = "#000";
  }
  return this.strokeStyle(color).stroke();
};

module.exports = Renderer;

},{"./utils.coffee":6,"extend":2}],6:[function(require,module,exports){
var chain, defer, noop, throttle,
  slice = [].slice;

noop = function() {};

defer = function(fn) {
  return setTimeout(fn, 17);
};

throttle = function(func, delay, ctx, returnValue) {
  var lastCalled, now;
  if (func == null) {
    func = null;
  }
  if (delay == null) {
    delay = 250;
  }
  if (ctx == null) {
    ctx = null;
  }
  if (returnValue == null) {
    returnValue = null;
  }
  if (!func) {
    return;
  }
  lastCalled = performance.now();
  now = null;
  return function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if ((lastCalled + delay) > (now = performance.now())) {
      return returnValue;
    }
    lastCalled = now;
    return func.apply(ctx, args);
  };
};

chain = function(wrapper, context, func) {
  return function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    func.apply(context, args);
    return wrapper;
  };
};

module.exports = {
  chain: chain,
  noop: noop,
  defer: defer,
  throttle: throttle
};

},{}],7:[function(require,module,exports){
var State, StateMachine, events, extend, utils;

extend = require("extend");

utils = require("../core/utils.coffee");

events = {
  "state:init": function() {
    var asyncDone, done, state, that;
    state = this.states[this.active];
    state.initialized = true;
    that = this;
    asyncDone = false;
    done = function() {
      if (asyncDone) {
        return;
      }
      state.isReady = asyncDone = true;
      return that.events.trigger("state:ready");
    };
    state.init.call(state, done);
    if (!asyncDone) {
      return done();
    }
  },
  "step": function(time) {
    var state;
    if (this.active === null) {
      return;
    }
    state = this.states[this.active];
    return state.step.call(state, time);
  },
  "prerender": function(time) {
    var state;
    if (this.active === null) {
      return;
    }
    state = this.states[this.active];
    return state.prerender.call(state, time);
  },
  "render": function(time) {
    var state;
    if (this.active === null) {
      return;
    }
    state = this.states[this.active];
    return state.render.call(state, time);
  },
  "postrender": function(time) {
    var state;
    if (this.active === null) {
      return;
    }
    state = this.states[this.active];
    return state.postrender.call(state, time);
  },
  "state:ready": function() {
    var state;
    state = this.states[this.active];
    return state.ready.call(state);
  },
  "state:enter": function() {
    var state;
    state = this.states[this.active];
    this.aghs.settings(state.config);
    return state.enter.call(state);
  },
  "state:leave": function() {
    var state;
    if (this.active === null) {
      return;
    }
    state = this.states[this.active];
    return state.leave.call(state);
  },
  "state:destroy": function() {
    var state;
    if (this.active === null) {
      return;
    }
    state = this.states[this.active];
    return state.destroy.call(state);
  }
};

State = function(aghs, state1, options) {
  var config;
  this.state = state1;
  if (options == null) {
    options = {};
  }
  this.name = options.name;
  this.isReady = options.isReady ? options.isReady : false;
  config = {
    "fullscreen": options.fullscreen,
    "width": options.width,
    "height": options.height,
    "frameskip": options.frameskip,
    "smoothing": options.smoothing,
    "scale": options.scaling
  };
  extend(this, options);
  this.initialized = false;
  this.config = extend(config, aghs.config);
  return this;
};

State.prototype.init = utils.noop;

State.prototype.ready = utils.noop;

State.prototype.enter = utils.noop;

State.prototype.leave = utils.noop;

State.prototype.destroy = utils.noop;

State.prototype.prerender = utils.noop;

State.prototype.render = utils.noop;

State.prototype.postrender = utils.noop;

State.prototype.step = utils.noop;

StateMachine = function(aghs1, autostart) {
  var callback, eventname;
  this.aghs = aghs1;
  this.autostart = autostart != null ? autostart : true;
  this.events = this.aghs.events;
  this.states = {};
  this.length = 0;
  for (eventname in events) {
    callback = events[eventname];
    this.events.on(eventname, callback, this);
  }
  this.active = null;
  this.proxy = this.proxy.bind(this);
  return this;
};

StateMachine.prototype.add = function(options) {
  var state;
  if (options == null) {
    options = {};
  }
  if (options.name == null) {
    throw new Error("state 'name' is missing from options parameter.");
  }
  state = new State(this.aghs, this, options);
  this.states[state.name] = state;
  this.length += 1;
  if (this.length === 1) {
    this.set(state.name);
  }
  return state;
};

StateMachine.prototype.set = function(name) {
  var state;
  if (this.states[name] != null) {
    this.events.trigger("state:leave");
    this.active = name;
    state = this.states[this.active];
    if (state.initialized === false) {
      this.events.trigger("state:init");
    }
    if (state.isReady) {
      this.events.trigger("state:enter");
    }
  } else {
    console.warn("A GameState with a name of '" + name + "' doesn't exist yet");
  }
  return this;
};

StateMachine.prototype.get = function(name) {
  return this.states[name] || null;
};

StateMachine.prototype.proxy = function() {
  if (arguments.length === 0) {
    return this;
  }
  if (typeof arguments[0] === "string") {
    this.set(arguments[0]);
    return this;
  }
  this.add(arguments[0]);
  return this;
};

module.exports = StateMachine;

},{"../core/utils.coffee":6,"extend":2}],8:[function(require,module,exports){
var Keyboard;

Keyboard = function(options) {
  var k, ref, v;
  this.options = options != null ? options : {};
  this.pressed = [];
  this.keys = {};
  this.disabled = this.options.disabled || false;
  ref = this.keycodes;
  for (k in ref) {
    v = ref[k];
    this.keys[v] = false;
  }
  this.handler = this.handler.bind(this);
  this.capture();
  return this;
};

Keyboard.prototype.keys = {};

Keyboard.prototype.pressed = [];

Keyboard.prototype.allowBubbling = ["ctrl"];

Keyboard.prototype.clear = function() {
  this.pressed = [];
  return this;
};

Keyboard.prototype.command = function(keys, exact) {
  var i, key, len, matching;
  if (exact == null) {
    exact = true;
  }
  if (exact && keys.length !== this.pressed.length) {
    return false;
  }
  matching = true;
  for (i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    if (this.keys[key]) {
      continue;
    }
    matching = false;
    break;
  }
  return matching;
};

Keyboard.prototype.handler = function(e) {
  var char, k, key, pressed, ref, v;
  this.clear();
  if (this.disabled) {
    return;
  }
  pressed = (e.type === "keyup" ? false : true);
  char = e.which;
  if ((48 <= char && char <= 90)) {
    key = String.fromCharCode(char).toLowerCase();
  } else {
    key = this.keycodes[char];
  }
  if (this.allowBubbling.indexOf(key) < 0) {
    e.preventDefault();
    e.stopPropagation();
  }
  this.keys[key] = pressed;
  ref = this.keys;
  for (k in ref) {
    v = ref[k];
    if (v) {
      this.pressed.push(k);
    }
  }
};

Keyboard.prototype.capture = function() {
  document.addEventListener("keydown", this.handler);
  document.addEventListener("keyup", this.handler);
  return this;
};

Keyboard.prototype.release = function() {
  document.removeEventListener("keydown", this.handler);
  document.removeEventListener("keyup", this.handler);
  return this;
};

Keyboard.prototype.keycodes = {
  37: "left",
  38: "up",
  39: "right",
  40: "down",
  45: "insert",
  46: "delete",
  8: "backspace",
  9: "tab",
  13: "enter",
  16: "shift",
  17: "ctrl",
  18: "alt",
  19: "pause",
  20: "caps-lock",
  27: "escape",
  32: "space",
  33: "pageup",
  34: "pagedown",
  35: "end",
  36: "home",
  96: "numpad-0",
  97: "numpad-1",
  98: "numpad-2",
  99: "numpad-3",
  100: "numpad-4",
  101: "numpad-5",
  102: "numpad-6",
  103: "numpad-7",
  104: "numpad-8",
  105: "numpad-9",
  106: "numpad-mul",
  107: "numpad-add",
  109: "numpad-sub",
  110: "numpad-dec",
  111: "numpad-div",
  112: "f1",
  113: "f2",
  114: "f3",
  115: "f4",
  116: "f5",
  117: "f6",
  118: "f7",
  119: "f8",
  120: "f9",
  121: "f10",
  122: "f11",
  123: "f12",
  144: "num-lock",
  145: "scroll-lock",
  186: "semicolon",
  187: "equal",
  188: "comma",
  189: "dash",
  190: "period",
  191: "slash",
  192: "grave-accent",
  219: "open-bracket",
  220: "backslash",
  221: "close-bracket",
  222: "single-quote"
};

module.exports = Keyboard;

},{}],9:[function(require,module,exports){
var World, int, location, utils;

utils = require("../core/utils.coffee");

location = function(world, _x, _y) {
  var offset, origin, x, y;
  offset = world.offset;
  origin = world.origin;
  x = Math.round(origin.x + offset.x + _x);
  y = Math.round(origin.y + offset.y + _y);
  return [x, y];
};

int = function(v) {
  return Math.round(v);
};

World = function(aghs, options) {
  this.aghs = aghs;
  if (options == null) {
    options = {};
  }
  if (!this.aghs) {
    throw new TypeError("Missing Agh.js Instance as first parameter.");
  }
  this.$ = this.aghs.renderer;
  this.type = "cartesian";
  this.orientation = {
    x: 1,
    y: 1
  };
  this.origin = {
    x: 0,
    y: 0
  };
  this.view = {
    x: 0,
    y: 0,
    z: 0,
    perspective: 1000,
    width: this.$.canvas.width,
    height: this.$.canvas.height
  };
  this.offset = {
    x: 0,
    y: 0
  };
  return this;
};

World.prototype.viewport = function(w, h) {
  if (!w) {
    return this;
  }
  if (!h) {
    h = w;
  }
  this.view.width = w;
  this.view.height = h;
  return this.aghs.resize(w, h);
};

World.prototype.inView = function(x, y) {
  var ref, xCheck, yCheck;
  ref = this.calc(x, y), x = ref[0], y = ref[1];
  xCheck = (this.view.x < x && x < this.view.x + this.view.width);
  yCheck = (this.view.y < y && y < this.view.y + this.view.height);
  return xCheck && yCheck;
};

World.prototype.preset = function(preset) {
  this.type = preset || this.type;
  switch (this.type) {
    case "platformer":
    case "chart":
      this.origin.x = 0;
      this.origin.y = this.aghs.canvas.height;
      break;
    default:
      this.origin.x = this.aghs.canvas.width * 0.5;
      this.origin.y = this.aghs.canvas.height * 0.5;
  }
  return this;
};

World.prototype.clean = function() {
  this.view.x = Math.round(this.view.x);
  this.view.y = Math.round(this.view.y);
  this.view.z = Math.round(this.view.z);
  this.offset.x = Math.round(this.offset.x);
  this.offset.y = Math.round(this.offset.y);
  return this;
};

World.prototype.move = function(x, y) {
  if (x == null) {
    x = 0;
  }
  if (y == null) {
    y = 0;
  }
  this.view.x += x * this.orientation.x;
  this.view.y += y * this.orientation.y;
  this.offset.x -= x * this.orientation.x;
  this.offset.y -= y * this.orientation.y;
  this.clean();
  return this;
};

World.prototype.calc = function(x, y) {
  return location(this, x, y);
};

World.prototype.set = function(x, y) {
  if (x != null) {
    this.offset.x = this.origin.x - x;
    this.view.x = this.origin.x + x;
  }
  if (y != null) {
    this.offset.y = this.origin.y - y;
    this.view.y = this.origin.y + y;
  }
  return this;
};

World.prototype.debug = function() {
  var size;
  size = 12;
  return this.$.fillStyle("#000").font(size + "px Small Fonts").fillText("view: x: " + this.view.x + ", y: " + this.view.y + " w: " + this.view.width + " h: " + this.view.height, size, this.view.height - size * 2).fillText("offset: " + this.offset.x + ", " + this.offset.y, size, this.view.height - size);
};


/*   Canvas API

Methods that operate on the HTMLCanvasRendering Context
 */

World.prototype.translate = function(x, y) {
  if (x == null) {
    x = 0;
  }
  if (y == null) {
    y = 0;
  }
  this.$.translate.apply(this.$, this.calc(x, y));
  return this;
};

World.prototype.fillRect = function(x, y, w, h) {
  var calcX, calcY, ref;
  if (x == null) {
    x = 0;
  }
  if (y == null) {
    y = 0;
  }
  ref = this.calc(x, y), calcX = ref[0], calcY = ref[1];
  this.$.fillRect(calcX, calcY, w, h);
  return this;
};

World.prototype.strokeRect = function(x, y, w, h) {
  var calcX, calcY, ref;
  ref = this.calc(x, y), calcX = ref[0], calcY = ref[1];
  this.$.strokeRect(calcX, calcY, w, h);
  return this;
};

World.prototype.moveTo = function(x, y) {
  var calcX, calcY, ref;
  ref = this.calc(x, y), calcX = ref[0], calcY = ref[1];
  this.$.moveTo.apply(this._, this.calc(x, y));
  return this;
};

World.prototype.lineTo = function(x, y) {
  var calcX, calcY, ref;
  ref = this.calc(x, y), calcX = ref[0], calcY = ref[1];
  this.$.lineTo.apply(this._, this.calc(x, y));
  return this;
};

World.prototype.quadraticCurveTo = function(cpx, cpy, x, y) {
  var _cpx, _cpy, _x, _y, ref, ref1;
  ref = this.calc(cpx, cpy), _cpx = ref[0], _cpy = ref[1];
  ref1 = this.calc(x, y), _x = ref1[0], _y = ref1[1];
  this.$.quadraticCurveTo(_cpx, _cpy, _x, _y);
  return this;
};

World.prototype.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
  var _cp1x, _cp1y, _cp2x, _cp2y, _x, _y, ref, ref1, ref2;
  ref = this.calc(cp1x, cp1y), _cp1x = ref[0], _cp1y = ref[1];
  ref1 = this.calc(cp2x, cp2y), _cp2x = ref1[0], _cp2y = ref1[1];
  ref2 = this.calc(x, y), _x = ref2[0], _y = ref2[1];
  this.$.bezierCurveTo(_cp1x, _cp1y, _cp2x, _cp2y, _x, _y);
  return this;
};

World.prototype.arcTo = function(x1, y1, x2, y2, radius) {
  var endx, endy, ref, ref1, startx, starty;
  ref = this.calc(x1, y1), startx = ref[0], starty = ref[1];
  ref1 = this.calc(x2, y2), endx = ref1[0], endy = ref1[1];
  this.$.arcTo(startx, starty, endx, endy, radius);
  return this;
};

World.prototype.rect = function(x, y, width, height) {
  var _x, _y, ref;
  ref = this.calc(x, y), _x = ref[0], _y = ref[1];
  this.$.rect(_x, _y, width, height);
  return this;
};

World.prototype.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
  var _x, _y, ref;
  ref = this.calc(x, y), _x = ref[0], _y = ref[1];
  this.$.arc(_x, _y, radius, startAngle, endAngle, anticlockwise);
  return this;
};

World.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
  var _x, _y, ref;
  ref = this.calc(x, y), _x = ref[0], _y = ref[1];
  this.$.ellipse(_x, _y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
  return this;
};

World.prototype.getImageData = function(sx, sy, sw, sh) {
  var ref, x, y;
  ref = this.calc(sx, sy), x = ref[0], y = ref[1];
  this.$.getImageData(x, y, sw, sh);
  return this;
};

World.prototype.putImageData = function(imgdata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
  var ref, x, y;
  ref = this.calc(dx, dy), x = ref[0], y = ref[1];
  this.$.putImageData(imgdata, x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
  return this;
};

World.prototype.drawImage = function(image) {
  var dh, dw, dx, dy, ref, ref1, x, y;
  if (arguments.length === 9) {
    ref = this.calc(arguments[5], arguments[6]), x = ref[0], y = ref[1];
    arguments[5] = x;
    arguments[6] = y;
    this._.drawImage.apply(this._, arguments);
  } else {
    ref1 = this.calc(arguments[1], arguments[2]), dx = ref1[0], dy = ref1[1];
    dw = arguments[3];
    dh = arguments[4];
    this._.drawImage(image, dx, dy, dw, dh);
  }
  return this;
};

module.exports = World;

},{"../core/utils.coffee":6}]},{},[1]);
