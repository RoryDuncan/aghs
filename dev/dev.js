(function() {
  var app, errorMessage, examples, keyboard, square, world;
  errorMessage = "index.js may be missing. Make sure to run 'npm run dev' to begin development.";
  if (!window.Aghs) {
    return console.alert(errorMessage);
  }
  app = window.Aghs();
  world = app.world;
  world.viewport(400, 400);
  keyboard = app.keyboard;
  console.log(app);
  examples = {};
  square = {
    x: 0,
    y: 0,
    w: 20,
    h: 20
  };
  examples.movingSquareWithKeyboard = function(time) {
    app.clear("#fff");
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
    if (keyboard.command(["a", "s", "d"], false)) {
      square.w += 1;
      square.h += 1;
    }
    if (square.w > 50) {
      square.w = square.h = 15;
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
    app.fillStyle("#ccc");
    world.fillRect(square.x, square.y, square.w, square.h);
    return world.debug();
  };
  app.render(examples.movingSquareWithKeyboard);
  return app.start();
})();
