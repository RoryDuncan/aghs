

# module requires
utils         = require "./src/utils.coffee"
World         = require "./src/world.coffee"
StateMachine  = require "./src/state.coffee"

# our framework
Aghs = require "./src/aghs.coffee"

# instantiate
app = new Aghs()


# modules
app.module "world", new World(app)
app.module "utils", utils
app.module "state", new StateMachine(app).proxy




window.Aghs = () -> 
  return app




module.exports = app