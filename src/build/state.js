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
var State, StateMachine, eventname, events, extend;

extend = require("extend");

require("./utils.coffee");

events = {
  "create": function() {
    var state;
    state = this.states[this.active];
    return typeof state.create === "function" ? state.create(call(state)) : void 0;
  },
  "step": function(time) {
    var state;
    state = this.states[this.active];
    return typeof state.step === "function" ? state.step(call(state, time)) : void 0;
  },
  "prerender": function(time) {
    var state;
    state = this.states[this.active];
    return typeof state.prerender === "function" ? state.prerender(call(state, time)) : void 0;
  },
  "render": function(time) {
    var state;
    state = this.states[this.active];
    return typeof state.render === "function" ? state.render(call(state, time)) : void 0;
  },
  "postrender": function(time) {
    var state;
    state = this.states[this.active];
    return typeof state.postrender === "function" ? state.postrender(call(state, time)) : void 0;
  },
  "enter": function() {
    var state;
    state = this.states[this.active];
    return typeof state.enter === "function" ? state.enter(call(state)) : void 0;
  },
  "leave": function() {
    var state;
    state = this.states[this.active];
    return typeof state.leave === "function" ? state.leave(call(state)) : void 0;
  },
  "destroy": function() {
    var state;
    state = this.states[this.active];
    return typeof state.destroy === "function" ? state.destroy(call(state)) : void 0;
  }
};

State = function(options) {
  if (options == null) {
    options = {};
  }
  this.name = options.name;
  extend(this, options);
  return this;
};

for (eventname in events) {
  State.prototype[eventname] = utils.noop;
}

StateMachine = function(aghs) {
  var callback;
  this.aghs = aghs;
  this.events = this.aghs.events;
  this.states = {};
  this.active = null;
  for (eventname in events) {
    callback = events[eventname];
    this.events.on(eventname, callback, this);
  }
  return this;
};

StateMachine.prototype.state = function(options) {};

},{"./utils.coffee":3,"extend":1}],3:[function(require,module,exports){
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
  func.apply(host, args);
  return wrapper;
};

module.exports = {
  chain: chain,
  noop: noop,
  defer: defer,
  throttle: throttle
};

},{}]},{},[2]);
