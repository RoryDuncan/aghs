do () ->
  return console.error("something went wroooong") unless window.Aghs
  
  
  # setup
  aghs = window.Aghs()
  world = aghs.world
  keyboard = aghs.keyboard
  world.viewport(window.innerWidth - 20, window.innerHeight - 20)
  
  # helper
  rand3Ints = () ->
    tally = 350
    i1 = ~~(Math.random() * 255)
    tally -= i1
    i2 = ~~(Math.random() * tally)
    tally -= i2
    i3 = tally
    
    return [i1, i2, i3]

  reset = () ->
    snake.position =
      x: ~~(board.width / 2)
      y: ~~(board.height / 2)
    
    snake.history = []
    snake.length = 3
    
    powerup.reposition() 
  
  # win state
  winner = false
  
  
  #
  # keeps track of game ticks
  ticks = 
    last: 0
    
  #
  # the display / board area
  board =
    x: 0,
    y: 0,
    width: 50
    height: 50
    color: "#334"
    
    render: (time, $) ->
      $.fillStyle(@color).fillRect(@x, @y, @width, @height)
  
  
  powerup = 
    
    color: null
    width: 1
    height: 1
    position:
      x: 0
      y: 0
    
    recolor: () ->
      colors = [0, 255, 155]
      c = rand3Ints()
      @color = "rgb(#{c[0]}, #{c[1]}, #{c[2]})"
    
    reposition: () ->
      @recolor()
      @position.x = ~~(Math.random() * board.width)
      @position.y = ~~(Math.random() * board.height)
      
    render: (time, $) ->
      
      if time.elapsed % 1000 < 500
        @width = 0.8
        @height = 0.8
        $.fillStyle(@color).fillRect(@position.x + 0.1, @position.y + 0.1, @width, @height)
      
      else
        @width = 1
        @height = 1
        $.fillStyle(@color).fillRect(@position.x, @position.y, @width, @height)
  
  
  #
  # the player-controlled object
  snake =
    
    length: 3
    history: []
    hasChanged: true
    color: "#fff"
    historyColor: "#d2d2d2"
    position: 
      x: ~~(board.width / 2)
      y: ~~(board.height / 2)
    direction: "down"
    
    step: (time) ->
      
      
      # out of bounds
      unless board.width > @position.x >= 0 and board.height > @position.y >= 0
        aghs.state("endscreen")
      
      # collide with tail
      # save processor by checking only after we've moved
      if @hasChanged
        @hasChanged = false
        
        p = @position
        result = @history.findIndex (h, i) ->
          r = h.position.x is p.x and h.position.y is p.y
          return r
        aghs.state("endscreen") if result > 0
      
      
        
      # collide with powerup
      if @position.x is powerup.position.x and @position.y is powerup.position.y
        @length += 1
        if @length >= (board.width * board.height)
          winner = true
          aghs.state("endscreen")
        else
          powerup.reposition()
      
      # inputs
      snake.direction = "up" if keyboard.keys.up and snake.direction isnt "down"
      snake.direction = "down" if keyboard.keys.down and snake.direction isnt "up"
      snake.direction = "left" if keyboard.keys.left and snake.direction isnt "right"
      snake.direction = "right" if keyboard.keys.right and snake.direction isnt "left"
      
      # tick
      if time.elapsed - ticks.last > 100
        ticks.last = time.elapsed + 1
        @move()
        @hasChanged = true
        
      
    render: (time, $) ->
      that = @
      $.fillStyle(@color).fillRect(@position.x, @position.y, 1, 1)
      
      size = 1
      $.font("#{size}px 'Press Start 2P'")
      
      metrics = $.context.measureText("score: #{@length - 3}")
      
      x = (board.width - metrics.width) / 2
      y = board.height + (size * 2)
      
      $.fillStyle("#aaa").fillText("score: #{@length - 3}", x, y)
      
      size = 1
      $.font("#{size}px 'Press Start 2P'")
      
      metrics = $.context.measureText("score: #{@length - 3}")
      
      x = (board.width - metrics.width) / 2
      y = board.height + (size * 4)
      
      $.fillStyle("#aaa").fillText("time: #{time.elapsed}", x, y)
      
      
      @history.forEach (history) -> 
        $.fillStyle(that.historyColor).fillRect(history.position.x, history.position.y, 1, 1)
      
      return
    
    # methods
    move: () ->
      
      # add current position to our history
      x = @position.x
      y = @position.y
      
      @history.unshift
        position: {x, y}
        direction: @direction
      
      # trim end
      if @history.length > @length
        @history.length = @length
        
      @position.y -= 1 if @direction is "up"
      @position.y += 1 if @direction is "down"
      @position.x -= 1 if @direction is "left"
      @position.x += 1 if @direction is "right"
        
      return

  
  # our gameplay state
  game = 
    
    name: "gameplay"
    
    enter: (state) ->
      aghs.renderer.scale(10,10)
      powerup.reposition()
      
    step: (time, $) ->
      
      snake.step(time, $)
      
    render: (time, $) ->
      $.clear("#222")
      board.render(time, $)
      powerup.render(time, $)
      snake.render(time, $)

  
  
  gameover = 
    
    name: "endscreen"
    
    fadeInValue: 1
    lastUpdate: 0
    
    enter: (time) ->
      aghs.renderer.scale(10,10)
      @colorToggle = false
      
    step: (time, $) ->
      
      if time.elapsed - ticks.last > 500
        ticks.last = time.elapsed + 1
        @colorToggle = not @colorToggle
      @text = if winner then "You Win!" else "Game Over"
      if keyboard.keys.space
        reset()
        aghs.state "gameplay"
        
    render: (time, $) ->
      $.clear("#222")
      board.render(time, $)
      powerup.render(time, $)
      snake.render(time, $)
      
      # game over text
      size = 3
      $.font("#{size}px 'Press Start 2P'")
      
      metrics = $.context.measureText(@text)
      
      x = (board.width - metrics.width) / 2
      y = (board.height + size) / 2
      
      $.fillStyle(if @colorToggle then "#fff" else "#aac").fillText(@text, x, y)
      
      
      # press space bar to restart text
      $.font("#{1}px 'Press Start 2P'")
      
      metrics = $.context.measureText("Press SPACE BAR to play again")
      
      x = (board.width - metrics.width) / 2
      y = (board.height + 1) / 2
      
      $.fillStyle("#eee").fillText("Press SPACE BAR to play again", x, y + size)
  

  
  # set game state
  aghs.state(game)
  aghs.state(gameover)
  # start engine
  aghs.start()
