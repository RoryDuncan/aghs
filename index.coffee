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
aghs = new Aghs()

# you can now use aghs how you wish
# in this case, we'll add a few modules and then attach to the window object:

# the modules
aghs.module "world", new World(aghs)
aghs.module "utils", utils
aghs.module "state", new StateMachine(aghs).proxy

# Add window accessibility.
window.Aghs = () -> 
  return aghs




module.exports = aghs