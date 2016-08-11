
utils = require "./utils.coffee"


# World Object
#
#
World = (@settings = {}) ->
  return @

#
# void ctx.translate(x, y);
World::translate = () -> return

#
# void ctx.fillRect(x, y, width, height);

World::fillRect = () -> return
#
# void ctx.strokeRect(x, y, width, height);

World::strokeRect = () -> return

#
# void ctx.moveTo(x, y);
World::moveTo = () -> return

#
# void ctx.lineTo(x, y);
World::lineTo = () -> return

#
# void ctx.quadraticCurveTo(cpx, cpy, x, y);
World::quadraticCurveTo = () -> return

#
# void ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
World::bezierCurveTo = () -> return

#
# void ctx.arcTo(x1, y1, x2, y2, radius);
World::arcTo = () -> return

#
# void ctx.rect(x, y, width, height);
World::rect = () -> return

#
# void ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
World::arc = () -> return

#
# void ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
World::ellipse = () -> return

#
# ImageData ctx.getImageData(sx, sy, sw, sh);
World::getImageData = () -> return

#
# void ctx.putImageData(imagedata, dx, dy);
# void ctx.putImageData(imagedata, dx, dy, dirtyX, dirtyY, dirtyWidth, dirtyHeight);
World::putImageData = () -> return

#
# void ctx.drawImage(image, dx, dy);
# void ctx.drawImage(image, dx, dy, dWidth, dHeight);
# void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
World::drawImage = () -> return

#
#


module.exports = World
  