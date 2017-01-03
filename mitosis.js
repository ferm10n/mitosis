var two = new Two().appendTo(document.body);
two.bind("resize", function () {
  two.width = window.innerWidth;
  two.height = window.innerHeight;
});

window.addEventListener("resize", function () {
  two.trigger("resize");
});

var _listenTo = function (targetObj, eventString, callback) {
  var self = this;
  targetObj.bind(eventString, function () {
    callback.call(self, arguments);
  });
}

Two.Rectangle.prototype.listenTo = _listenTo;
Two.Rectangle.prototype.size = function (width, height) {
  this.vertices[0].set(-width / 2, -height / 2);
  this.vertices[1].set(width / 2, -height / 2);
  this.vertices[2].set(width / 2, height / 2);
  this.vertices[3].set(-width / 2, height / 2);
}

function Quadrant() {
  this.mask = two.makeRectangle(0, 0, two.width / 2, two.height / 2);
  //  this.mask.clip = false;

  this.mask.listenTo(two, "resize", function () {
    this.translation.set(two.width / 4, two.height / 4);
    this.size(two.width / 4, two.height / 4);
  });
  this.group = two.makeGroup(this.mask);

  //  var self = this;
  //  two.on("resize", function () {
  //
  //    self.group.translation.x = two.width / 2;
  //    self.group.translation.y = two.height / 2;
  //  });
}

var q1 = new Quadrant();
//var q2 = new Quadrant();
//q2.group.

//var rect = two.makeRectangle(0, 0, 128, 128);
//rect.fill = "white";
//rect.noStroke();
//
//var mask = two.makeRectangle(0, 0, 128, 64);
//
//var group = two.makeGroup(rect, mask);
//group.translation.x = two.width / 2;
//group.translation.y = two.height / 2;
//
//group.mask = mask;

two.trigger("resize");
two.play();
