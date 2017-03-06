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
}
Quadrant.prototype = Object.create(Two.Group.prototype);

var q1 = new Quadrant();

var rect = new Two.Rectangle(0, 0, 128, 128);
rect.fill = "red";
rect.noStroke();
q1.add(rect);

two.trigger("resize");
two.play();
