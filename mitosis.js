// utils
var _listenTo = function (targetObj, eventString, callback) {
  var self = this;
  targetObj.bind(eventString, function () {
    callback.call(self, arguments);
  });
}
Two.Rectangle.prototype.listenTo = _listenTo;
Two.Rectangle.prototype.size = function (width, height) {
  this.vertices[0].set(0, 0);
  this.vertices[1].set(width, 0);
  this.vertices[2].set(width, -height);
  this.vertices[3].set(0, -height);
}

// Bindings
var two = new Two().appendTo(document.body);
two.bind("resize", function () {
  two.width = window.innerWidth;
  two.height = window.innerHeight;
});

window.addEventListener("resize", function () {
  two.trigger("resize");
});


// Sreen quadrant
function Quadrant() {
  this.listenTo = _listenTo;
  this.mask = new Two.Rectangle(0, 0, two.width/2, two.height/2); // bs values overwritten later

  this.listenTo(two, "resize", function () {
    this.mask.size(two.width / 2, two.height / 2);
    this.group.translation.set(two.width / 2, two.height / 2);
  });

  this.group = two.makeGroup(this.mask);
  // The translation should correspond to the origin of this quadrant

  this.group.mask = this.mask;

  this.add = function(){
    this.group.add.apply(this.arguments);
    this.group.center();
  }
}

var q1 = new Quadrant();

var rect = new Two.Rectangle(0, 0, 128, 128);
rect.fill = "red";
rect.noStroke();
q1.group.add(rect);

two.trigger("resize");
two.play();
