(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1]);
