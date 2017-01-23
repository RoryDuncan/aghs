do () ->
  # the error to display if window.Aghs is undefined.
  errorMessage = "index.js may be missing. Make sure to run 'npm run dev' to begin development." 
  return console.error(errorMessage) unless window.Aghs
  
  # begin dev below
  
  app = window.Aghs()
  world = app.world
  world.viewport(window.innerWidth - 20, window.innerHeight - 20)
  keyboard = app.keyboard
  console.log(app)
  animation = app.animation
  
  # Examples
  # examples namespace
  examples = {}
  
  log = false
  examples.basicDraw = (time, $) ->
    unless log
      console.log $
      log = true
      
    $.clear()
    .fillStyle("#0d8")
    .fillRect(100, 100, 20, 20)
  

  # move a square visually, by moving the world
  # 
  examples.movingSquareWithKeyboard = (time, $) ->
      
    $.clear("#fff")
    
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
    
    $.fillStyle "#ccc"
    world.fillRect(0, 0, 25, 25)
    world.debug()
  
  
  tween = new animation.Tween()
  
  console.log(tween)
  
  thing = {
    x: 0,
    y: 0
  }
  
  tween
  .from(thing)
  .to({x: 500, y: 500})
  .for(1000).init().start()
  
  #
  #
  examples.basicTween = (time, $) ->
    $.clear("#088")
    $.fillStyle("#fff")
    $.fillRect(thing.x, thing.y, 10, 10)
  
  
  
  
  # change the function argument below to view different examples
  app.render(examples.basicTween)
  app.start()
