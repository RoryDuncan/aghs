(function() {
  var app, errorMessage, examples, keyboard, log, world;
  errorMessage = "index.js may be missing. Make sure to run 'npm run dev' to begin development.";
  if (!window.Aghs) {
    return console.error(errorMessage);
  }
  app = window.Aghs();
  world = app.world;
  keyboard = app.keyboard;
  console.log(app);
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
  app.render(examples.movingSquareWithKeyboard);
  return app.start();
})();
