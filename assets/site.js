// Highlights the current section in the header menu. The page works without it.
(function () {
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
