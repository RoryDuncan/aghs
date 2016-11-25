#
# This file instantiates our framework,
# then connects all of our plugins together
#

# module requires
utils         = require "./src/core/utils.coffee"
World         = require "./src/plugins/world.coffee"
StateMachine  = require "./src/plugins/state.coffee"

# our core wrapper
Aghs = require "./src/core/aghs.coffee"

# instantiate
app = new Aghs()


# modules
app.module "world", new World(app)
app.module "utils", utils
app.module "state", new StateMachine(app).proxy




window.Aghs = () -> 
  return app




module.exports = app