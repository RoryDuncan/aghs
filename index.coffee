Aghs = require "./src/coffee/aghs.coffee"

# module requires
utils = require "./src/coffee/utils.coffee"
World = require "./src/coffee/world.coffee"

app = new Aghs()

# modules
app.module "world", new World(app)      # app.world  module
app.module "utils", utils               # app.utils  module


module.exports = app