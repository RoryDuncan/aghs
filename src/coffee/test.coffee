
app = require "../../index.coffee"
world = app.world

app.render (time) ->
  app.clear("#fff")
  world.move(-15, 0)
  if world.view.x * -1 > world.view.width
    world.set(200, 0)
    world.distance(0)
  app.fillStyle "#ccc"
  world.fillRect(0, 100, 200, 200)
  world.debug()
app.start()
  