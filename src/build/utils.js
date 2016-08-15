(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1]);
