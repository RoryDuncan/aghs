(function() {
  var app, errorMessage, examples, keyboard, world;
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
    world.fillRect(0, 0, 20, 20);
    return world.debug();
  };
  app.render(examples.movingSquareWithKeyboard);
  return app.start();
})();
