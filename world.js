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

},{"./utils.coffee":1}]},{},[2]);
