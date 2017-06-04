/* es-lint env:browser */
/* globals Two */

// utils
function getLargestDimension () {
  return Math.max(window.innerHeight, window.innerWidth)
}
function surfaceControl (y) { // checks if a surface should be added or removed on a touch/click input
  if (y > two.height * 1.75) {
    surfaces[0].dead = true
    surfaces[0].remove()
  } else if (y < two.height * 0.25) surfaces.push(new Surface())
}
function makeTwo () {
  return new Two({
    type: Two.Types.canvas
  })
}

// Shared vars
var largestDimension = getLargestDimension()
var minBoost = 1 + 2 * (1 - (largestDimension / 2000))
var maxBoost = minBoost * 8
var boost = minBoost
var targetBoost = boost
var surfaces = []
var initialCount = 35
var quadrants = [makeTwo(), makeTwo(), makeTwo(), makeTwo()]
var two = quadrants[3]

// Event bindings
two.on('resize', function () {
  quadrants.forEach(function (quadrant) {
    quadrant.width = window.innerWidth/2
    quadrant.height = window.innerHeight/2
  })
  quadrants.forEach(function (quadrant) {
    quadrant.update()
  })
  largestDimension = getLargestDimension()
})
window.addEventListener('resize', function () {
  two.trigger('resize')
})
two.on('update', function () {
  minBoost = 1 + 2 * (1 - (largestDimension / 2000))
  maxBoost = 8 + minBoost
  boost += (targetBoost - boost) * 0.2
})
two.on('render', function () {
  var img = two.renderer.ctx.getImageData(0, 0, two.width*2, two.height*2)
  quadrants[0].renderer.ctx.putImageData(img, 0,0)
  quadrants[1].renderer.ctx.putImageData(img, 0,0)
  quadrants[2].renderer.ctx.putImageData(img, 0,0)
})
// UI control
window.addEventListener('touchstart', function (ev) {
  targetBoost = maxBoost
  surfaceControl(ev.touches[0].clientY)
})
window.addEventListener('mousedown', function (ev) {
  targetBoost = maxBoost
  surfaceControl(ev.clientY)
})
window.addEventListener('touchend', function () {
  targetBoost = minBoost
})
window.addEventListener('mouseup', function () {
  targetBoost = minBoost
})

// basic shape
var Surface = function Surface () {
  // Default coords and super constructor
  this.dead = false
  var points = arguments
  var self = this

  // geometry stuff
  var variance = new Two.Vector(Math.random(), Math.random())
  variance.multiplyScalar(0.9).addSelf(new Two.Vector(0.1, 0.1))
  var scale = variance.clone().multiplyScalar(Math.max(two.width * 0.7, two.height * 0.7))
  // default shape
  if (points.length === 0) {
    points = [
      new Two.Anchor(-scale.x / 2, -scale.y / 2),
      new Two.Anchor(scale.x / 2, -scale.y / 2),
      new Two.Anchor(scale.x / 2, scale.y / 2),
      new Two.Anchor(-scale.x / 2, scale.y / 2)
    ]
  }
  // rotate object
  var rotation = Math.random() * Math.PI / 2
  points.forEach(function (point) {
    point = point.rotate(rotation)
  })
  var rotationSpeed = Math.random() * 0.002 - 0.001
  Two.Path.call(this, points)

  // motion stuff
  this.velocity = new Two.Vector(0, 0)
  var bounds = this.getBoundingClientRect()
  this.translation.set(-bounds.width / 2, -bounds.height / 2)
  if (Math.random() > 0.5) { // coin flip
    this.translation.addSelf(new Two.Vector(Math.random() * two.width / 2, 0))
  } else {
    this.translation.addSelf(new Two.Vector(0, Math.random() * two.height / 2))
  }
  var inverseVariance = new Two.Vector(1 - variance.x, 1 - variance.y)
  var speed = inverseVariance.multiplyScalar(0.1).length()
  var direction = Math.random() * Math.PI / 2
  this.velocity.set(Math.cos(direction) * speed, Math.sin(direction) * speed)

  // color stuff
  this.red = 0
  this.green = 0
  this.blue = 0
  this.linewidth = 1 + 9 * Math.random()
  if (Math.random() > 0.5) {
    this.noStroke()
  } else {
    this.noFill()
  }

  this.update = function () {
    // motion stuff
    var acceleration = 1.005 + 0.01 * ((boost - minBoost) / (maxBoost - minBoost))
    self.velocity.multiplyScalar(acceleration)
    if (self.velocity.x !== 0 || self.velocity.y !== 0) {
      self.translation.addSelf(self.velocity.clone().multiplyScalar(boost))
    }

    var bounds = self.getBoundingClientRect()
    if (bounds.left > two.width*2 || bounds.top > two.height*2) { self.remove() }

    // color stuff
    if (Math.random() < 0.005 || !self.targetRed) {
      self.targetRed = Math.random()
      self.targetGreen = Math.random()
      self.targetBlue = Math.random()
    }
    var transitionFactor = 0.05
    self.red += (self.targetRed - self.red) * transitionFactor
    self.green += (self.targetGreen - self.green) * transitionFactor
    self.blue += (self.targetBlue - self.blue) * transitionFactor
    self.fill = 'rgba(' + Math.floor(self.red * 255) + ',' + Math.floor(self.green * 255) + ',' + Math.floor(self.blue * 255) + ',.5)'
    self.stroke = self.fill
  }

  this._update()
  this.listenTo(two, Two.Events.update, this.update)

  // override
  this.remove = function () {
    two.remove(self)
    self.stopListening(two, Two.Events.update, self.update)
    surfaces.splice(surfaces.indexOf(self), 1)

    setTimeout(function () {
      if (!self.dead) { surfaces.push(new Surface()) }
    }, 1000 * Math.random())
  }

  two.add(self)
}
Surface.prototype = Object.create(Two.Path.prototype)

// kickoff
for (var i = 0; i < initialCount; i++) surfaces.push(new Surface())
for (var i = 0; i < quadrants.length; i++) {
  quadrants[i].renderer.domElement = document.getElementById('q'+(i + 1))
  quadrants[i].renderer.ctx = quadrants[i].renderer.domElement.getContext('2d')
}
two.trigger('resize')
two.play()
