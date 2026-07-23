local utils = require("utils")

function helper(x, y)
  return x + y
end

function lurek.draw()
  lurek.render.draw("sprite.png", 10, 20)
end

return utils
