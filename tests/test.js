var app, world;

app = window.Aghs();

world = app.world;

world.viewport(400, 400);

app.render(function(time) {
  app.clear("#fff");
  world.move(-5, 0);
  if (world.view.x * -1 > world.view.width) {
    world.set(200, 0);
  }
  app.fillStyle("#ccc");
  world.fillRect(0, 0, 20, 20);
  return world.debug();
});

app.start();
