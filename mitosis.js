var two = new Two().appendTo(document.body);

// Sizing stuffs
function sizeToWindow() {
  two.width = window.innerWidth;
  two.height = window.innerHeight;
}
window.addEventListener("resize", function () {
  sizeToWindow();
});
sizeToWindow();

two.update();
