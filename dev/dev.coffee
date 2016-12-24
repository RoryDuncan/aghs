do () ->
  # the error to display if window.Aghs is undefined.
  errorMessage = "index.js may be missing. Make sure to run 'npm run dev' to begin development." 
  return console.alert(errorMessage) unless window.Aghs
  
  # begin dev below
  
  app = window.Aghs()
  world = app.world
  world.viewport(400, 400)
  keyboard = app.keyboard
  console.log(app)
  
  
  # Examples
  # examples namespace
  examples = {}
  
  # move a square visually, by moving the world
  # 
  examples.movingSquareWithKeyboard = (time) ->
    app.clear("#fff")
    
    world.move(0, 5)  if keyboard.keys.up
    world.move(0, -5) if keyboard.keys.down
    world.move(5, 0)  if keyboard.keys.left
    world.move(-5, 0) if keyboard.keys.right
    
    
    # wrap screen - if you reach the edge move back to the start, and vice-versa
    # x's
    world.set(0, world.view.y) if world.view.x * -1 > world.view.width
    world.set(-world.view.width, world.view.y) if world.view.x * -1 < 0
    # y's
    world.set(world.view.x, 0) if world.view.y * -1 > world.view.height
    world.set(world.view.x, -world.view.height) if world.view.y * -1 < 0
    
    app.fillStyle "#ccc"
    world.fillRect(0, 0, 20, 20)
    world.debug()
  
  # change the function below to view different examples
  app.render(examples.movingSquareWithKeyboard)
  app.start()
