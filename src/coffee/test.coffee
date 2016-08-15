
app = require "../../index.coffee"
app.imageSmoothingEnabled(false)
.webkitImageSmoothingEnabled(false)
console.log app

world = app.world
world.viewport(400, 400)

app.render (time) ->
  app.clear("#fff")
  world.move(-5, 0)
  world.set(200, 0) if world.view.x * -1 > world.view.width
  app.fillStyle "#ccc"
  world.fillRect(0, 0, 20, 20)
  world.debug()
app.start()
  