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
  
  square = 
    x: 0
    y: 0
    w: 20
    h: 20
  
  # move a square visually, by moving the world
  # 
  examples.movingSquareWithKeyboard = (time) ->
    
    app.clear("#fff")
    
    world.move(0, 5)  if keyboard.keys.up
    world.move(0, -5) if keyboard.keys.down
    world.move(5, 0)  if keyboard.keys.left
    world.move(-5, 0) if keyboard.keys.right
    
    if keyboard.command(["a", "s", "d"], false)
      square.w += 1
      square.h += 1
      
    if square.w > 50
      square.w = square.h = 15
    
    
    # wrap screen - if you reach the edge move back to the start, and vice-versa
    # x's
    world.set(0, world.view.y) if world.view.x * -1 > world.view.width
    world.set(-world.view.width, world.view.y) if world.view.x * -1 < 0
    # y's
    world.set(world.view.x, 0) if world.view.y * -1 > world.view.height
    world.set(world.view.x, -world.view.height) if world.view.y * -1 < 0
    
    app.fillStyle "#ccc"
    world.fillRect(square.x, square.y, square.w, square.h)
    world.debug()
  
  # change the function below to view different examples
  app.render(examples.movingSquareWithKeyboard)
  app.start()
