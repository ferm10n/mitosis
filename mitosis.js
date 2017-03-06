// jshint browser:true
/* globals Two */
// Bindings
var two = new Two().appendTo(document.body);
two.on("resize", function () {
  two.width = window.innerWidth;
  two.height = window.innerHeight;
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
  var points = arguments;
  if (points.length === 0) {
    points = [
      new Two.Anchor(-0.5, -0.5),
      new Two.Anchor(0.5, -0.5),
      new Two.Anchor(0.5, 0.5),
      new Two.Anchor(-0.5, 0.5)
    ];
  }
  Two.Path.call(this, points);

  this.symmentries = []; // an index of all quadrants that should contain mirrors of this path
  this.velocity = new Two.Vector(0, 0);

  this.addTo = function (quadrant) {
    var symPath = this.symmentries.length === 0 ? this : this.clone();
    symPath.translation = this.translation;
    this.symmentries.push(symPath);
    quadrant.add(symPath);
  }

  var oldUpdate = this._update;
  this._update = function () {
    if (this.velocity.x !== 0 || this.velocity.y !== 0)
      this.translation.addSelf(this.velocity);
    oldUpdate.apply(this, arguments);
  }
};
Surface.prototype = Object.create(Two.Path.prototype);


// Quadrant setup
var q1 = new Quadrant();
var q2 = new Quadrant();
var q3 = new Quadrant();
var q4 = new Quadrant();
q2.scale = new Two.Vector(-1, 1);
q3.scale = new Two.Vector(-1, -1);
q4.scale = new Two.Vector(1, -1);

// Surface setup
var rect = new Surface();
rect.scale = 256;
rect.translation.set(-128, -128);
rect.fill = "red";
rect.noStroke();
rect.addTo(q1);
rect.addTo(q2);
rect.addTo(q3);
rect.addTo(q4);

// kickoff
two.trigger("resize");
two.play();
