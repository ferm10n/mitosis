/* es-lint env:browser */
/* globals Two */

// Shared vars
var largestDimension = getLargestDimension()
var minBoost = 1 + 2 * (1 - (largestDimension / 2000))
var maxBoost = minBoost * 8
var boost = minBoost
var targetBoost = boost
var surfaces = []
var initialCount = 25

// Event bindings
var two = new Two({
  type: Two.Types.canvas
}).appendTo(document.body)
two.on('resize', function () {
  two.width = window.innerWidth
  two.height = window.innerHeight
  largestDimension = getLargestDimension()
})
window.addEventListener('resize', function () {
  two.trigger('resize')
  two.update()
})
two.on('update', function () {
  minBoost = 1 + 2 * (1 - (largestDimension / 2000))
  maxBoost = 8 + minBoost
  boost += (targetBoost - boost) * 0.2
//  var quad = two.renderer.ctx.getImageData(two.width/2, two.height/2, two.width/2, two.height/2)
//  two.renderer.ctx.putImageData(quad, 0, 0)
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

// utils
function getLargestDimension () {
  return Math.max(window.innerHeight, window.innerWidth)
}
function surfaceControl (y) { // checks if a surface should be added or removed on a touch/click input
  if (y > two.height * 0.75) {
    surfaces[0].dead = true
    surfaces[0].remove()
  } else if (y < two.height * 0.25) surfaces.push(new Surface())
}

// Sreen quadrant
var Quadrant = function Quadrant () {
  Two.Group.apply(this, arguments) // inherit constructor
  two.add(this)
  this.mask = new Two.Path([
    new Two.Anchor(),
    new Two.Anchor(),
    new Two.Anchor(),
    new Two.Anchor()
  ])

  this.listenTo(two, 'resize', function () {
    this.translation.set(two.width / 2, two.height / 2)
  })
  this.mask.listenTo(two, 'resize', function () {
    this.vertices[0].set(0, 0)
    this.vertices[1].set(two.width / 2, 0)
    this.vertices[2].set(two.width / 2, two.height / 2)
    this.vertices[3].set(0, two.height / 2)
  })
  this.add(this.mask)
}
Quadrant.prototype = Object.create(Two.Group.prototype)

// basic shape
var Surface = function Surface () {
  // Default coords and super constructor
  this.dead = false
  var points = arguments
  var self = this
  this.symmetries = [] // an index of all quadrants that should contain mirrors of this path

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
    if (bounds.left > two.width || bounds.top > two.height) { self.remove() }

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

    // update symmetries
    self.symmetries.forEach(function (symmetry) {
      symmetry.rotation += rotationSpeed * boost
      symmetry.fill = self.fill
      symmetry.stroke = self.stroke
    })
  }

  this._update()
  this.listenTo(two, Two.Events.update, this.update)

  // override
  this.remove = function () {
    this.symmetries.forEach(function (symmetry) {
      symmetry.parent.remove(symmetry)
    })
    this.stopListening(two, Two.Events.update, this.update)
    surfaces.splice(surfaces.indexOf(this), 1)

    setTimeout(function () {
      if (!self.dead) { surfaces.push(new Surface()) }
    }, 1000 * Math.random())
  }

  // create symmetries
  quadrants.forEach(function (quadrant) {
    var symPath = self.symmetries.length === 0 ? self : self.clone()
    symPath.rotation = self.rotation
    symPath.translation = self.translation
    self.symmetries.push(symPath)
    quadrant.add(symPath)
  })
}
Surface.prototype = Object.create(Two.Path.prototype)

// Quadrant setup
var quadrants = [new Quadrant(), new Quadrant(), new Quadrant(), new Quadrant()]
quadrants[1].scale = new Two.Vector(-1, 1)
quadrants[2].scale = new Two.Vector(-1, -1)
quadrants[3].scale = new Two.Vector(1, -1)

// kickoff
for (var i = 0; i < initialCount; i++) surfaces.push(new Surface())
two.trigger('resize')
two.play()
