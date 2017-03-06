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

  this.symmetries = []; // an index of all quadrants that should contain mirrors of this path
  this.velocity = new Two.Vector(3, 3);
  this.scale = new Two.Vector(1, 1);

  this.addTo = function (quadrant) {
    var symPath = this.symmetries.length === 0 ? this : this.clone();
    symPath.translation = this.translation;
    this.symmetries.push(symPath);
    quadrant.add(symPath);
  }

  var oldUpdate = this._update;
  this._update = function () {
    if (this.velocity.x !== 0 || this.velocity.y !== 0)
      this.translation.addSelf(this.velocity);
    oldUpdate.apply(this, arguments);
  }


  // visual defaults
  this.scale.set(two.width/2, two.height/2);
  var variance = new Two.Vector(Math.random(),Math.random()).normalize();
  variance.multiplyScalar(0.9); // max
  variance.addSelf(new Two.Vector(0.1, 0.1)); // min
  this.scale.multiplySelf(variance);
  this.rotation = Math.PI/2 * Math.random();
  var bounds = this.getBoundingClientRect();
  console.log(bounds);
  this.translation.set(-this.scale.x/2, -this.scale.y/2);

  this.fill = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",.5)";

//  var speedPercent = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height) / Math.sqrt(two.width * two.width + two.height * two.height);
//  console.log(speedPercent);
//  var speed = .5 + 4.5 * speedPercent;
  var inverseVariance = new Two.Vector(1 - variance.x, 1 - variance.y);
  var speed = inverseVariance.multiplyScalar(5);
  console.log(speed.length());
  var direction = Math.random()*Math.PI/2;
  this.velocity.set(Math.cos(direction)*speed.x, Math.sin(direction)*speed.y);
//  this.velocity.addSelf(new Two.Vector(1,1));


  this.noStroke();

  this.addTo(q1);
  this.addTo(q2);
  this.addTo(q3);
  this.addTo(q4);
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

// kickoff
two.trigger("resize");
two.play();
