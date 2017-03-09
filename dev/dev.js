(function() {
  var animation, app, errorMessage, examples, keyboard, log, thing, tween, world;
  errorMessage = "index.js may be missing. Make sure to run 'npm run dev' to begin development.";
  if (!window.Aghs) {
    return console.error(errorMessage);
  }
  app = window.Aghs();
  world = app.world;
  world.viewport(window.innerWidth, window.innerHeight);
  keyboard = app.keyboard;
  console.log(app);
  animation = app.animation;
  examples = {};
  log = false;
  examples.basicDraw = function(time, $) {
    if (!log) {
      console.log($);
      log = true;
    }
    return $.clear().fillStyle("#0d8").fillRect(100, 100, 20, 20);
  };
  examples.movingSquareWithKeyboard = function(time, $) {
    $.clear("#fff");
    if (keyboard.keys.up) {
      world.move(0, 5);
    }
    if (keyboard.keys.down) {
      world.move(0, -5);
    }
    if (keyboard.keys.left) {
      world.move(5, 0);
    }
    if (keyboard.keys.right) {
      world.move(-5, 0);
    }
    if (world.view.x * -1 > world.view.width) {
      world.set(0, world.view.y);
    }
    if (world.view.x * -1 < 0) {
      world.set(-world.view.width, world.view.y);
    }
    if (world.view.y * -1 > world.view.height) {
      world.set(world.view.x, 0);
    }
    if (world.view.y * -1 < 0) {
      world.set(world.view.x, -world.view.height);
    }
    $.fillStyle("#ccc");
    world.fillRect(0, 0, 25, 25);
    return world.debug();
  };

  /*
  thing = {
    x: 0,
    y: 0
  }
    
  document.body.addEventListener "click", () ->
    tween = new animation.Tween()
    
    console.log(tween)
    
    thing.x = ~~(Math.random() * window.innerWidth)
    thing.y = ~~(Math.random() * window.innerHeight)
    console.log thing.x, thing.y
    tween
    .from(thing)
    .to({x: 500, y: 500})
    .for(1000).init().start()
   */
  examples.basicTween = function(time, $) {
    $.clear("#088");
    $.fillStyle("#fff");
    return $.fillRect(thing.x, thing.y, 10, 10);
  };
  thing = {
    x: 0,
    y: window.innerHeight
  };
  tween = new animation.Tween();
  tween.from(thing).to({
    x: window.innerWidth,
    y: 0
  })["for"](5000, "inOutElastic").init();
  document.body.addEventListener("click", function() {
    thing.x = 0;
    thing.y = window.innerHeight;
    return tween.start();
  });
  examples.tweenSteps = function(time, $) {
    var i, len, ref, step;
    $.clear("#fff");
    ref = tween.data.steps;
    for (i = 0, len = ref.length; i < len; i++) {
      step = ref[i];
      $.fillStyle("#d2d2d2");
      $.fillRect(step.$x - 5, step.$y - 5, 20, 20);
    }
    $.fillStyle("#08b");
    return $.fillRect(thing.x, thing.y, 10, 10);
  };
  app.render(examples.tweenSteps);
  return app.start();
})();
