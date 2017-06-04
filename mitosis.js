// jshint browser:true
/* globals Two */

var largestDimension = Math.max(window.innerHeight, window.innerWidth)

// Bindings
var two = new Two({
  type: Two.Types.canvas
}).appendTo(document.body);
two.on("resize", function () {
  two.width = window.innerWidth;
  two.height = window.innerHeight;
  largestDimension = Math.max(window.innerWidth, window.innerWidth)
});
window.addEventListener("resize", function () {
  two.trigger("resize");
  two.update();
});


// Sreen quadrant
var Quadrant = function Quadrant() {
  Two.Group.apply(this, arguments); // inherit constructor
  two.add(this);

  this.listenTo(two, "resize", function () {
    this.translation.set(two.width / 2, two.height / 2);
  });

  this.mask = new Two.Path([
    new Two.Anchor(),
    new Two.Anchor(),
    new Two.Anchor(),
    new Two.Anchor()
  ]);
  this.mask.listenTo(two, "resize", function () {
    this.vertices[0].set(0, 0);
    this.vertices[1].set(two.width / 2, 0);
    this.vertices[2].set(two.width / 2, two.height / 2);
    this.vertices[3].set(0, two.height / 2);
  });
  this.add(this.mask);
};
Quadrant.prototype = Object.create(Two.Group.prototype);


var Surface = function Surface() {
  // Default coords and super constructor
  surfaces.push(this);
  this.dead = false;
  var points = arguments;

  var variance = new Two.Vector(Math.random(), Math.random());
  variance.multiplyScalar(.9).addSelf(new Two.Vector(.1, .1));

  var scale = variance.clone().multiplyScalar(Math.max(two.width * .7, two.height * .7));

  // default shape
  if (points.length === 0) {
    points = [
      new Two.Anchor(-scale.x / 2, -scale.y / 2),
      new Two.Anchor(scale.x / 2, -scale.y / 2),
      new Two.Anchor(scale.x / 2, scale.y / 2),
      new Two.Anchor(-scale.x / 2, scale.y / 2)
    ];
  }

  // rotate object
  var rotation = Math.random() * Math.PI / 2;
  points.forEach(function (point) {
    point = point.rotate(rotation);
  });
  var rotationSpeed = Math.random() * .002 - .001;
  Two.Path.call(this, points);

  this.symmetries = []; // an index of all quadrants that should contain mirrors of this path
  this.velocity = new Two.Vector(0, 0);

  this.addTo = function (quadrant) {
    var symPath = this.symmetries.length === 0 ? this : this.clone();
    symPath.rotation = this.rotation;
    symPath.translation = this.translation;
    this.symmetries.push(symPath);
    quadrant.add(symPath);
  }

  var self = this;
  this.update = function () {
    self.velocity.multiplyScalar(1.005);
    if (self.velocity.x !== 0 || self.velocity.y !== 0)
      self.translation.addSelf(self.velocity.clone().multiplyScalar(boost));

    var bounds = self.getBoundingClientRect();
    if (bounds.left > two.width || bounds.top > two.height)
      self.remove();

    self.symmetries.forEach(function (symmetry) {
      symmetry.rotation += rotationSpeed * boost;
    });
  }

  this._update();
  this.listenTo(two, Two.Events.update, this.update);

  this.die = function () {
    this.dead = true;
    this.remove();
  }

  // override
  this.remove = function () {
    this.symmetries.forEach(function (symmetry) {
      symmetry.parent.remove(symmetry);
    });
    this.stopListening(two, Two.Events.update, this.update);
    surfaces.splice(surfaces.indexOf(this), 1);

    var self = this;
    setTimeout(function () {
      if (!self.dead)
        new Surface();
    }, 1000 * Math.random());
  }

  // visual defaults
  var bounds = this.getBoundingClientRect();
  this.translation.set(-bounds.width / 2, -bounds.height / 2);
  if (Math.random() > .5) {
    this.translation.addSelf(new Two.Vector(Math.random() * two.width / 2, 0));
  } else {
    this.translation.addSelf(new Two.Vector(0, Math.random() * two.height / 2));
  }

  this.fill = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",.5)";
  this.stroke = this.fill;
  this.linewidth = 1 + 9 * Math.random();

  var inverseVariance = new Two.Vector(1 - variance.x, 1 - variance.y);
  var speed = inverseVariance.multiplyScalar(.1).length();
  var direction = Math.random() * Math.PI / 2;
  this.velocity.set(Math.cos(direction) * speed, Math.sin(direction) * speed);

  if (Math.random() > .5) {
    this.noStroke();
  } else {
    this.noFill();
  }

  this.addTo(q1);
  this.addTo(q2);
  this.addTo(q3);
  this.addTo(q4);
};
Surface.prototype = Object.create(Two.Path.prototype);

var boost = 1;
var targetBoost = boost;
var minBoost = 1+2*(1-(largestDimension/2000));
var minBoost = 1;
two.on("update", function () {
  minBoost = 1+2*(1-(largestDimension/2000));
  maxBoost = 8+minBoost;
  boost += (targetBoost - boost) * .1;
});

// Quadrant setup
var q1 = new Quadrant();
var q2 = new Quadrant();
var q3 = new Quadrant();
var q4 = new Quadrant();
q2.scale = new Two.Vector(-1, 1);
q3.scale = new Two.Vector(-1, -1);
q4.scale = new Two.Vector(1, -1);

// Surface setup
var surfaces = [];
var initialCount = 25; // parseInt(location.search.replace("?",""));
for(var i = 0; i < initialCount; i++)
  var rect = new Surface();

// UI control
addEventListener("touchstart", function (ev) {
  targetBoost = maxBoost;
  surfaceControl(ev.touches[0].clientY);
});
addEventListener("mousedown", function (ev) {
  targetBoost = maxBoost;
  surfaceControl(ev.clientY);
});
addEventListener("touchend", function () {
  targetBoost = minBoost;
});
addEventListener("mouseup", function () {
  targetBoost = minBoost;
});

function surfaceControl(y) {
  if (y > two.height * .75)
    surfaces[0].die();
  else if (y < two.height * .25)
    new Surface();
}

// kickoff
two.trigger("resize");
two.play();
