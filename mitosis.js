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

  q1.add(this);
};
Surface.prototype = Object.create(Two.Path.prototype);


var q1 = new Quadrant();
var q2 = new Quadrant();
var q3 = new Quadrant();
var q4 = new Quadrant();

q2.scale = new Two.Vector(-1, 1);
q3.scale = new Two.Vector(-1, -1);
q4.scale = new Two.Vector(1, -1);

var rect = new Surface();
rect.scale = 256;
rect.fill = "red";
rect.noStroke();

two.trigger("resize");
two.play();
