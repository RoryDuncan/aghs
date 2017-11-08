
EventEmitter = require "../core/events.coffee"

dataFileTypes = [".json"]
audioFileTypes = [".mp3", ".wav", ".ogg", ".flac"]
videoFileTypes = [".mp4", ".webm", ""]
imageFileTypes

# has()
# check if a string contains any of the values in an array
has = (arr, str) -> return (arr.find (el, i) -> path.includes(el)) > 0


#
#
Assets = () ->
  
  return @
 
 
#
#
AssetLoader = () ->
  
  # Become an event emitter
  EventEmitter.call(@)
  
  @state = 
    loading: 0
    loaded: 0
  
  @loaded = 
    images: []
    sounds: []
    vidoes: []
    
  @loading = []
  
  return @
 
  
#
#
AssetLoader::loadImage = (path, callback) ->
  @loadMediaAsType path, Image
  # if a callback is passed, automatically add it to the emitted event
  @on path, callback if callback
  return @
  
    
#
#
AssetLoader::loadSound = (path, callback) ->
  @loadMediaAsType path, Sound
  # if a callback is passed, automatically add it to the emitted event
  @on path, callback if callback
  return @

#
#
AssetLoader::loadVideo = (path) ->
  video = document.createElement("video")
  video.addEventListener "canplaythrough", () -> 
    

    

# AssetLoader.loadMediaAsType()
# Allows you to pass the media type in, assuming it follows the expected api
AssetLoader::loadMediaAsType = (path, Media) ->
  
  that = @
  @state.loading += 1
  media = new Media()
  @loading.push media
  
  media.addEventListener "load", () ->
    that.trigger(path, media)
    that.loading = that.loading.filter (el) -> return el != media
    that.loaded += 1
    callback(media)
  
  
  
  
module.export = {Assets, AssetLoader}