
Aghs = require "./aghs.coffee"
World = require "./world.coffee"


app = new Aghs()
world = new World(app)


app.render (time) ->
  app.clear("#fff")
  world.move(-15, 0)
  if world.view.x*-1 > world.view.width
    world.set(200, 0)
  app.fillStyle "#000"
  world.fillRect(0, 100, 200, 200)
  world.debug()
app.start()
  