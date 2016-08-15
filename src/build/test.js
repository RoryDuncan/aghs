(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{}],2:[function(require,module,exports){
var Aghs, EventEmitter, chain, extend, noop, utils,
  slice = [].slice;

utils = require("./utils.coffee");

EventEmitter = require("./events.coffee");

extend = require("extend");

noop = utils.noop;

chain = utils.chain;

Aghs = function(options) {
  var canvas, that;
  this.options = options != null ? options : {};
  that = this;
  if (this.options.el === void 0) {
    canvas = document.createElement('canvas');
    canvas.id = "screen";
    document.body.appendChild(canvas);
  } else if (typeof this.options.el === "string" && this.options.el[0] === "#") {
    canvas = document.getElementById(this.options.el);
  } else {
    canvas = this.options.el;
  }
  this.frameSkipping = {
    skippedFrames: 0,
    allow: this.options.frameSkip || true,
    threshold: 120
  };
  this.isReady = false;
  document.onreadystatechange = function() {
    if (document.readyState === "complete") {
      return setTimeout(function() {
        that.isReady = true;
        return that.events.trigger("ready");
      }, 17);
    }
  };
  this.canvas = canvas;
  this.context = this._ = canvas.getContext("2d");
  if (this.options.wrapContext !== false) {
    this.extendContext();
  }
  if (this.options.fullscreen !== false) {
    this.maximize();
  }
  this.width = canvas.width;
  this.height = canvas.height;
  this.events = new EventEmitter();
  this.__modules = {};
  this.layers = {};
  this.currentLayer = "screen";
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
  "createImageData": "createImageData"
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
  frameSkippingThreshold = this.frameSkipping.threshold;
  if (this.frameSkipping.allow) {
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
      this.frameSkipping.skippedFrames += 1;
      time.elapsed -= time.delta;
    } else {
      this.events.trigger("prerender", time);
      this.render.call(this, time);
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

Aghs.prototype.render = function(render) {
  if (typeof render === "function") {
    this.render = render;
  } else {
    throw new Error("Render function is not set.");
  }
  return this;
};

Aghs.prototype.attach = function(obj, modulename) {
  var name;
  if (!obj) {
    return this;
  }
  name = modulename || Object.getPrototypeOf(obj).constructor.name;
  this.__modules[name] = obj;
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
  module = this.__modules[modulename];
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
  return this;
};

Aghs.prototype.throttle = function(func, delay, ctx, returnValue) {
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

Aghs.prototype.layer = function(name, width, height) {
  var canvas, context;
  if (width == null) {
    width = this.width;
  }
  if (height == null) {
    height = this.height;
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
      canvas: canvas,
      context: context
    };
    console.log(this.layers[name]);
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
  if (!width) {
    w = window.innerWidth;
  }
  if (!height) {
    h = window.innerHeight;
  }
  cacheResizeAndRender = function(layer) {
    var data;
    data = layer.context.getImageData(0, 0, width, height);
    layer.canvas.width = width;
    layer.canvas.height = height;
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
  }
  return this;
};

Aghs.prototype.polygon = function(data) {
  var datum, i, len, x, y;
  this.beginPath();
  x = data[0][0];
  y = data[0][1];
  this.moveTo(x, y);
  for (i = 0, len = data.length; i < len; i++) {
    datum = data[i];
    x = datum[0];
    y = datum[1];
    this.lineTo(x, y);
  }
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

Aghs.prototype.align = function(x, y) {
  if (x === void 0 || x === null) {
    return this;
  }
  if (y === void 0) {
    y = x;
  }
  this.translate(this.width * x, this.height * y);
  return this;
};

Aghs.prototype.origin = Aghs.prototype.align;

Aghs.prototype.stars = function() {
  var args;
  args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  this.save();
  return this.tars.apply(this, args);
};

Aghs.prototype.tars = function(x, y, alignX, alignY, rotation, scale) {
  if (x == null) {
    x = 0;
  }
  if (y == null) {
    y = 0;
  }
  if (alignX == null) {
    alignX = 0;
  }
  if (alignY == null) {
    alignY = 0;
  }
  if (rotation == null) {
    rotation = 0;
  }
  if (scale == null) {
    scale = 1;
  }
  this.translate(x, y).align(alignX, alignY).rotate(rotation).scale(scale, scale);
  return this;
};

Aghs.prototype["do"] = function() {
  var action, actions, i, len;
  actions = 1 <= arguments.length ? slice.call(arguments, 0) : [];
  this.save();
  actions[0]();
  if (actions.length > 1) {
    for (i = 0, len = actions.length; i < len; i++) {
      action = actions[i];
      action();
    }
  }
  this.restore();
  return this;
};

Aghs.prototype.clear = function(fill) {
  if (fill == null) {
    fill = "#fff";
  }
  return this.fillStyle(fill).fillRect(0, 0, this.width, this.height);
};

Aghs.prototype.fillWith = function(color) {
  if (color == null) {
    color = "#000";
  }
  return this.fillStyle(color).fill();
};

window.Aghs = Aghs;

module.exports = Aghs;

},{"./events.coffee":3,"./utils.coffee":5,"extend":1}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
var Aghs, World, app, world;

Aghs = require("./aghs.coffee");

World = require("./world.coffee");

app = new Aghs();

world = new World(app);

app.render(function(time) {
  app.clear("#fff");
  world.move(-15, 0);
  if (world.view.x * -1 > world.view.width) {
    world.set(200, 0);
  }
  app.fillStyle("#000");
  world.fillRect(0, 100, 200, 200);
  return world.debug();
});

app.start();

},{"./aghs.coffee":2,"./world.coffee":6}],5:[function(require,module,exports){
var chain, noop;

noop = function() {};

chain = function(wrapper, host, func) {
  func.apply(host, args);
  return wrapper;
};

module.exports = {
  chain: chain,
  noop: noop
};

},{}],6:[function(require,module,exports){
var World, location, utils;

utils = require("./utils.coffee");

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
    throw new TypeError("Missing Agh.js Instance as third parameter.");
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
  this.view.width = this.aghs.canvas.width = w;
  return this.view.height = this.aghs.canvas.height = h;
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

},{"./utils.coffee":5}]},{},[4]);
