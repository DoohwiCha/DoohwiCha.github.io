// Reveal-on-scroll and active nav link.
// Only elements that start below the fold are hidden, so the page stays
// fully visible if this script never runs.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    var fold = window.innerHeight * 0.94;
    document.querySelectorAll(".reveal").forEach(function (el) {
      if (el.getBoundingClientRect().top > fold) { el.classList.add("pre"); io.observe(el); }
    });
  }

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
