(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
var World, utils;

utils = require("./utils.coffee");

World = function(settings) {
  this.settings = settings != null ? settings : {};
  return this;
};

World.prototype.translate = function() {};

World.prototype.fillRect = function() {};

World.prototype.strokeRect = function() {};

World.prototype.moveTo = function() {};

World.prototype.lineTo = function() {};

World.prototype.quadraticCurveTo = function() {};

World.prototype.bezierCurveTo = function() {};

World.prototype.arcTo = function() {};

World.prototype.rect = function() {};

World.prototype.arc = function() {};

World.prototype.ellipse = function() {};

World.prototype.getImageData = function() {};

World.prototype.putImageData = function() {};

World.prototype.drawImage = function() {};

module.exports = World;

},{"./utils.coffee":1}]},{},[2]);
