(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Aghs, StateMachine, World, aghs, utils;

utils = require("./src/core/utils.coffee");

World = require("./src/plugins/world.coffee");

StateMachine = require("./src/plugins/state.coffee");

Aghs = require("./src/core/aghs.coffee");

aghs = new Aghs();

aghs.module("world", new World(aghs));

aghs.module("utils", utils);

aghs.module("state", new StateMachine(aghs).proxy);

window.Aghs = function() {
  return aghs;
};

module.exports = aghs;

},{"./src/core/aghs.coffee":3,"./src/core/utils.coffee":5,"./src/plugins/state.coffee":6,"./src/plugins/world.coffee":7}],2:[function(require,module,exports){
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
var Aghs, EventEmitter, chain, extend, noop, utils,
  slice = [].slice;

extend = require("extend");

utils = require("./utils.coffee");

EventEmitter = require("./events.coffee");

noop = utils.noop;

chain = utils.chain;

Aghs = function(options) {
  var canvas, config, context, that, triggerReady;
  if (options == null) {
    options = {};
  }
  that = this;
  if (options.el === void 0) {
    canvas = document.createElement('canvas');
    canvas.id = "screen";
    document.body.appendChild(canvas);
  } else if (typeof options.el === "string" && options.el[0] === "#") {
    canvas = document.getElementById(options.el);
  } else {
    canvas = options.el;
  }
  this.isReady = false;
  this.canvas = canvas;
  this.modules = [];
  this.module("events", new EventEmitter());
  this.context = this._ = context = canvas.getContext("2d");
  if (options.wrapContext !== false) {
    this.extendContext();
  }
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
  this.layers = {
    "screen": {
      canvas: canvas,
      context: context
    }
  };
  this.events.on("resize", function() {
    that.config.width = that.canvas.width;
    return that.config.height = that.canvas.width;
  });
  config = {
    "fullscreen": true,
    "wrappedContext": true,
    'smoothing': true,
    "width": options.width || canvas.width,
    "height": options.height || canvas.height,
    "scale": options.scale || 1,
    "frameskip": {
      "count": 0,
      "enabled": options.frameskip || true,
      "threshold": 120
    }
  };
  this.config = extend({}, this.config, config);
  if (options.fullscreen != null) {
    config.fullscreen = options.fullscreen;
  }
  if (options.wrappedContext != null) {
    config.wrappedContext = options.wrappedContext;
  }
  if (options.smoothing != null) {
    config.smoothing = options.smoothing;
  }
  this.settings(config);
  return this;
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

Aghs.prototype.chain = function(func, hasReturnValue) {
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

Aghs.prototype.chainingExceptions = {
  "getImageData": "getImageData",
  "createImageData": "createImageData",
  "isPointInStroke": "isPointInStroke",
  "isPointInPath": "isPointInPath"
};

Aghs.prototype.extendContext = function() {
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
    throw new Error("Illegal Invocation: extendContext. Call after instantiation.");
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
  step = function(e) {
    var _now;
    if (this.running !== true) {
      return;
    }
    this.events.trigger("step", time);
    _now = now();
    time.now = _now;
    time.delta = _now - time.lastCalled;
    time.elapsed += time.delta;
    if (skipFrame(time.delta)) {
      this.config.frameskip.count += 1;
      time.elapsed -= time.delta;
    } else {
      this.events.trigger("prerender", time);
      this.events.trigger("render", time);
    }
    time.lastCalled = _now;
    this.events.trigger("postrender", time);
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
  this.imageSmoothingEnabled(this.config.smoothing);
  return this;
};

Aghs.prototype.settings = function(config) {
  if (config == null) {
    config = {};
  }
  extend(this.config, config);
  this.screen();
  if (this.config.fullscreen) {
    this.maximize();
  } else {
    this.resize(this.config.width, this.config.height);
  }
  this.scale(this.config.scale, this.config.scale);
  this.antialias();
  return this;
};

Aghs.prototype.layer = function(name, width, height) {
  var canvas, context;
  if (width == null) {
    width = this.config.width;
  }
  if (height == null) {
    height = this.config.height;
  }
  if (!name || name === "screen") {
    this.context = this._;
    this.currentLayer = "screen";
    return this;
  }
  this.currentLayer = name;
  if (!this.layers[name]) {
    canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    context = canvas.getContext("2d");
    this.layers[name] = {
      name: name,
      canvas: canvas,
      context: context
    };
    this.context = this.layers[name].context;
  } else {
    this.context = this.layers[name].context;
  }
  return this;
};

Aghs.prototype.screen = function() {
  return this.layer("screen");
};

Aghs.prototype.draw = function(source, target) {
  var data, layer;
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
  layer = this.layers[this.currentLayer];
  if (!target.layer) {
    target.layer = this._;
  } else {
    if (this.layers[target.layer]) {
      target.layer = this.layers[target.layer].context;
    }
  }
  if (!source.width) {
    source.width = layer.canvas.width;
  }
  if (!source.height) {
    source.height = layer.canvas.height;
  }
  data = this.context.getImageData(0, 0, source.width, source.height);
  target.layer.putImageData(data, target.x, target.y);
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
    cacheResizeAndRender(this.layers[this.currentLayer] || this._);
    this.events.trigger("resize");
  }
  return this;
};

Aghs.prototype.polygon = function(points) {
  if (points == null) {
    points = [];
  }
  if (!(points.length > 0)) {
    console.warn("Missing Parameter 1 in Aghs.polygon");
    return this;
  }
  this.beginPath();
  this.moveTo(points[0].x, points[0].y);
  points.forEach(function(pt) {
    return this.lineTo(pt.x, pt.y);
  });
  return this.closePath();
};

Aghs.prototype.triangle = function(pt1, pt2, pt3) {
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

Aghs.prototype.strs = function() {
  var args;
  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  this.save();
  return this.tars.apply(this, args);
};

Aghs.prototype.trs = function(x, y, rotation, scale) {
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

Aghs.prototype["do"] = function() {
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

Aghs.prototype.clear = function(fill) {
  if (fill == null) {
    fill = "#fff";
  }
  return this.fillStyle(fill).fillRect(0, 0, this.config.width, this.config.height);
};

Aghs.prototype.fillWith = function(color) {
  if (color == null) {
    color = "#000";
  }
  return this.fillStyle(color).fill();
};

Aghs.prototype.strokeWith = function(color) {
  if (color == null) {
    color = "#000";
  }
  return this.strokeStyle(color).stroke();
};

module.exports = Aghs;

},{"./events.coffee":4,"./utils.coffee":5,"extend":2}],4:[function(require,module,exports){
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
    event: event,
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

chain = function(wrapper, host, func) {
  return function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    func.apply(host, args);
    return wrapper;
  };
};

module.exports = {
  chain: chain,
  noop: noop,
  defer: defer,
  throttle: throttle
};

},{}],6:[function(require,module,exports){
var State, StateMachine, events, extend, utils;

extend = require("extend");

utils = require("../core/utils.coffee");

events = {
  "state:init": function() {
    var done, state, that;
    state = this.states[this.active];
    that = this;
    done = function() {
      state.isReady = true;
      return that.events.trigger("state:ready");
    };
    state.initialized = true;
    return state.init.call(state, done);
  },
  "step": function(time) {
    var state;
    state = this.states[this.active];
    return state.step.call(state, time);
  },
  "prerender": function(time) {
    var state;
    state = this.states[this.active];
    return state.prerender.call(state, time);
  },
  "render": function(time) {
    var state;
    state = this.states[this.active];
    return state.render.call(state, time);
  },
  "postrender": function(time) {
    var state;
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
    state = this.states[this.active];
    return state.leave.call(state);
  },
  "state:destroy": function() {
    var state;
    state = this.states[this.active];
    return state.destroy.call(state);
  }
};

State = function(aghs, options) {
  var config;
  if (options == null) {
    options = {};
  }
  this.name = options.name;
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
  this.isReady = false;
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

StateMachine = function(aghs1) {
  var callback, emptyState, eventname;
  this.aghs = aghs1;
  this.events = this.aghs.events;
  this.states = {};
  this.length = 0;
  for (eventname in events) {
    callback = events[eventname];
    this.events.on(eventname, callback, this);
  }
  emptyState = "empty";
  this.add({
    name: emptyState
  });
  this.active = emptyState;
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
  state = new State(this.aghs, options);
  this.states[state.name] = state;
  this.length += 1;
  if (length === 1) {
    this.set(name);
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
      this.events.trigger("state:ready");
      this.events.trigger("state:enter");
    }
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
  return this.add(arguments[0]);
};

module.exports = StateMachine;

},{"../core/utils.coffee":5,"extend":2}],7:[function(require,module,exports){
var World, location, utils;

utils = require("../core/utils.coffee");

location = function(world, _x, _y) {
  var offset, origin, x, y;
  offset = world.offset;
  origin = world.origin;
  x = origin.x + offset.x + _x;
  y = origin.y + offset.y + _y;
  return [x, y];
};

World = function(aghs, options) {
  this.aghs = aghs != null ? aghs : null;
  if (options == null) {
    options = {};
  }
  if (!this.aghs) {
    throw new TypeError("Missing Agh.js Instance as first parameter.");
  }
  this._ = this.aghs._;
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
    width: options.width || this.aghs.width,
    height: options.height || this.aghs.height
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

World.prototype.type = function(preset) {
  this.type = preset || this.type;
  if (this.type === "platformer" || this.type === "chart") {
    this.origin.x = 0;
    this.origin.y = this.aghs.canvas.height;
  }
  if (this.type === "cartesian" || this.type === "map") {
    this.origin.x = this.aghs.canvas.width * 0.5;
    this.origin.y = this.aghs.canvas.height * 0.5;
  }
  return this;
};

World.prototype.clean = function() {
  this.view.x = ~~this.view.x;
  this.view.y = ~~this.view.y;
  this.offset.x = ~~this.offset.x;
  this.offset.y = ~~this.offset.y;
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
  return this.aghs.fillStyle("#000").font(size + "px Small Fonts").fillText("view: x: " + this.view.x + ", y: " + this.view.y + " w: " + this.view.width + " h: " + this.view.height, size, this.view.height - size * 2).fillText("offset: " + this.offset.x + ", " + this.offset.y, size, this.view.height - size);
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
  this._.translate.apply(this._, this.calc(x, y));
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
  this.aghs.fillRect(calcX, calcY, w, h);
  return this;
};

World.prototype.strokeRect = function(x, y, w, h) {
  var calcX, calcY, ref;
  ref = this.calc(x, y), calcX = ref[0], calcY = ref[1];
  this.aghs.strokeRect(calcX, calcY, w, h);
  return this;
};

World.prototype.moveTo = function(x, y) {
  var calcX, calcY, ref;
  ref = this.calc(x, y), calcX = ref[0], calcY = ref[1];
  this._.moveTo.apply(this._, this.calc(x, y));
  return this;
};

World.prototype.lineTo = function(x, y) {
  var calcX, calcY, ref;
  ref = this.calc(x, y), calcX = ref[0], calcY = ref[1];
  this._.lineTo.apply(this._, this.calc(x, y));
  return this;
};

World.prototype.quadraticCurveTo = function(cpx, cpy, x, y) {
  var _cpx, _cpy, _x, _y, ref, ref1;
  ref = this.calc(cpx, cpy), _cpx = ref[0], _cpy = ref[1];
  ref1 = this.calc(x, y), _x = ref1[0], _y = ref1[1];
  this._.quadraticCurveTo(_cpx, _cpy, _x, _y);
  return this;
};

World.prototype.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
  var _cp1x, _cp1y, _cp2x, _cp2y, _x, _y, ref, ref1, ref2;
  ref = this.calc(cp1x, cp1y), _cp1x = ref[0], _cp1y = ref[1];
  ref1 = this.calc(cp2x, cp2y), _cp2x = ref1[0], _cp2y = ref1[1];
  ref2 = this.calc(x, y), _x = ref2[0], _y = ref2[1];
  this._.bezierCurveTo(_cp1x, _cp1y, _cp2x, _cp2y, _x, _y);
  return this;
};

World.prototype.arcTo = function(x1, y1, x2, y2, radius) {
  var endx, endy, ref, ref1, startx, starty;
  ref = this.calc(x1, y1), startx = ref[0], starty = ref[1];
  ref1 = this.calc(x2, y2), endx = ref1[0], endy = ref1[1];
  this._.arcTo(startx, starty, endx, endy, radius);
  return this;
};

World.prototype.rect = function(x, y, width, height) {
  var _x, _y, ref;
  ref = this.calc(x, y), _x = ref[0], _y = ref[1];
  this._.rect(_x, _y, width, height);
  return this;
};

World.prototype.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
  var _x, _y, ref;
  ref = this.calc(x, y), _x = ref[0], _y = ref[1];
  this._.arc(_x, _y, radius, startAngle, endAngle, anticlockwise);
  return this;
};

World.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise) {
  var _x, _y, ref;
  ref = this.calc(x, y), _x = ref[0], _y = ref[1];
  this._.ellipse(_x, _y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
  return this;
};

World.prototype.getImageData = function(sx, sy, sw, sh) {
  var ref, x, y;
  ref = this.calc(sx, sy), x = ref[0], y = ref[1];
  this._.getImageData(x, y, sw, sh);
  return this;
};

World.prototype.putImageData = function(imgdata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight) {
  var ref, x, y;
  ref = this.calc(dx, dy), x = ref[0], y = ref[1];
  this._.putImageData(imgdata, x, y, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
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

},{"../core/utils.coffee":5}]},{},[1]);
