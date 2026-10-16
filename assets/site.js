// Folds the paper list on phones and highlights the current section in the menu.
// The page works without it.
(function () {
  // phones: start with the full paper list folded
  var pub = document.getElementById("publications");
  if (pub && window.matchMedia && window.matchMedia("(max-width: 720px)").matches) pub.open = false;

  if (!("IntersectionObserver" in window)) return;
  var links = {};
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (a) {
    links[a.getAttribute("href").slice(1)] = a;
  });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting || !links[e.target.id]) return;
      Object.keys(links).forEach(function (k) { links[k].classList.remove("active"); });
      links[e.target.id].classList.add("active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  Object.keys(links).forEach(function (id) {
    var sec = document.getElementById(id);
    if (sec) spy.observe(sec);
  });
})();
