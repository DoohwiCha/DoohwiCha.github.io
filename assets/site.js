// Folds the paper list on phones, highlights the current section in the menu,
// and keeps a hidden "Night City" mode behind the logo (tap it three times on a home page;
// tapping the portrait three times also puts on the shades; three more taps switch back).
// The page works without it.
(function () {
  var script = document.currentScript;
  var src = script && script.src ? script.src.split("?") : null;
  var assets = src ? src[0].replace(/[^/]*$/, "") : "assets/";
  var version = src && src[1] ? "?" + src[1] : ""; // same cache key as site.js for the files loaded later

  // phones: start with the full paper list folded
  var pub = document.getElementById("publications");
  if (pub && window.matchMedia && window.matchMedia("(max-width: 720px)").matches) pub.open = false;

  nightCity();

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

  function nightCity() {
    var brand = document.querySelector(".site .brand");
    // home pages only: there the logo points to the page itself, so a tap just scrolls to the top
    if (!brand || !document.querySelector(".hero")) return;
    var root = document.documentElement;
    var NS = "http://www.w3.org/2000/svg";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var icon = document.querySelector('link[rel="icon"]');
    var tint = document.querySelector('meta[name="theme-color"]');
    var dayIcon = icon && icon.getAttribute("href");
    var nightIcon = dayIcon && dayIcon.replace("%23111720", "%23fcee0a").replace("%23f2f4f7", "%2307070c");
    var dayTint = tint && tint.getAttribute("content");
    var art = document.querySelector(".hero-art svg");
    var portrait = art && art.querySelector("image");
    var photo = document.querySelector(".hero-photo");
    var edgeSrc = assets + "portrait-nc.jpg" + version;
    var requested = false, ready = false, wanted = false, built = false, edgeBuilt = false, edgeWanted = false;
    var byPhoto = false; // the portrait switched the whole mode on, so it switches it off again
    var timers = {};

    function load() {
      if (requested) return;
      requested = true;
      var font = document.createElement("link");
      font.rel = "stylesheet";
      font.href = "https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&display=swap";
      document.head.appendChild(font);
      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = assets + "nightcity.css" + version;
      css.onload = function () {
        ready = true;
        if (wanted) set(true);
      };
      document.head.appendChild(css);
    }

    function flash(cls, ms) {
      root.classList.remove(cls);
      void root.offsetWidth; // restart the animation
      root.classList.add(cls);
      clearTimeout(timers[cls]);
      timers[cls] = setTimeout(function () { root.classList.remove(cls); }, ms);
    }

    function svgEl(tag, attrs, parent) {
      var n = document.createElementNS(NS, tag);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(n);
      return n;
    }

    // parse SVG markup into nodes of this document
    function svgNodes(markup, attrs) {
      var doc = new DOMParser().parseFromString('<svg xmlns="' + NS + '" ' + (attrs || "") + ">" + markup + "</svg>", "image/svg+xml");
      return document.importNode(doc.documentElement, true);
    }

    // angular shades in the portrait's own 768 x 768 coordinates, tilted with the head
    function shades(id) {
      var L = "M282 240H374L379 254L367 297L350 307H306L290 293L284 260Z";
      var R = "M488 240H396L391 254L403 297L420 307H464L480 293L486 260Z";
      return '<g class="nc-shades"><g transform="rotate(-2.6 385 270)"><defs>' +
        '<linearGradient id="nc-lg' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04040a"/>' +
        '<stop offset=".62" stop-color="#11112a"/><stop offset="1" stop-color="#2b0d3d"/></linearGradient>' +
        '<linearGradient id="nc-rf' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#00f0ff" stop-opacity="0"/>' +
        '<stop offset=".46" stop-color="#00f0ff" stop-opacity=".55"/><stop offset=".54" stop-color="#ff2a6d" stop-opacity=".55"/>' +
        '<stop offset="1" stop-color="#ff2a6d" stop-opacity="0"/></linearGradient>' +
        '<radialGradient id="nc-eg' + id + '"><stop offset="0" stop-color="#ffd0dc"/><stop offset=".25" stop-color="#ff2a6d" stop-opacity=".9"/>' +
        '<stop offset="1" stop-color="#ff2a6d" stop-opacity="0"/></radialGradient>' +
        '<clipPath id="nc-cl' + id + '"><path d="' + L + R + '"/></clipPath></defs>' +
        '<path d="M286 244L254 250M484 244L516 248" stroke="#0b0b16" stroke-width="8" stroke-linecap="round"/>' +
        '<path d="' + L + R + '" fill="url(#nc-lg' + id + ')"/>' +
        '<g clip-path="url(#nc-cl' + id + ')">' +
        '<path d="M262 238L520 300L520 318L262 256Z" fill="url(#nc-rf' + id + ')" opacity=".45"/>' +
        '<ellipse cx="333" cy="268" rx="22" ry="12" fill="url(#nc-eg' + id + ')"/>' +
        '<ellipse cx="437" cy="268" rx="22" ry="12" fill="url(#nc-eg' + id + ')"/>' +
        '<path d="M405 284H458M405 290H436" stroke="#00f0ff" stroke-width="2.5" opacity=".85"/>' +
        '<path class="nc-glint" d="M250 226H282L250 322H218Z" fill="#fff" opacity=".6"/></g>' +
        '<path d="' + L + R + '" fill="none" stroke="#00f0ff" stroke-width="2.5" opacity=".55"/>' +
        '<path d="M281 233H489L492 236V242H278V236Z" fill="#fcee0a"/>' +
        '<path d="M374 243H396V251H374Z" fill="#fcee0a"/></g></g>';
    }

    function build() {
      if (built) return;
      built = true;
      var ring = art && art.querySelector(".art-ring");
      if (ring) {
        var cx = +ring.getAttribute("cx"), cy = +ring.getAttribute("cy");
        var roles = ["FIXER", "NETRUNNER", "SOLO", "TECHIE", "MEDTECH", "MEDIA", "NOMAD"];
        var crew = svgEl("g", { "class": "nc-crew" }, art);
        art.querySelectorAll(".art-node").forEach(function (n, i) {
          var x = +n.getAttribute("cx"), y = +n.getAttribute("cy");
          var dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1;
          var ux = dx / d, uy = dy / d;
          svgEl("text", {
            "class": "nc-role",
            x: (x + ux * 20).toFixed(1),
            y: (y + uy * 20 + 4).toFixed(1),
            "text-anchor": ux > 0.3 ? "start" : ux < -0.3 ? "end" : "middle"
          }, crew).textContent = roles[i % roles.length];
        });
        var h = art.viewBox && art.viewBox.baseVal ? art.viewBox.baseVal.height : 430;
        svgEl("text", { "class": "nc-crew-t", x: cx, y: h - 8, "text-anchor": "middle" }, crew).textContent = "CREW 07/07 // ONLINE";

        // Sandevistan afterimages: tinted copies of the portrait behind it
        var defs = art.querySelector("defs");
        if (portrait && defs) {
          var tints = [
            ".2 .5 .1 0 .6  .2 .5 .1 0 .55  0 0 0 0 0  0 0 0 1 0",
            ".2 .5 .1 0 .55  0 0 0 0 .05  .1 .25 .05 0 .25  0 0 0 1 0",
            "0 0 0 0 0  .2 .5 .1 0 .3  .2 .5 .1 0 .45  0 0 0 1 0"
          ];
          tints.forEach(function (m, k) {
            var f = svgEl("filter", { id: "nc-tint-" + k }, defs);
            svgEl("feColorMatrix", { type: "matrix", values: m }, f);
            var g = portrait.cloneNode(false);
            g.setAttribute("class", "nc-ghost");
            g.setAttribute("filter", "url(#nc-tint-" + k + ")");
            g.style.setProperty("--dx", (-18 * (3 - k)) + "px");
            g.style.setProperty("--o", (0.2 + 0.18 * k).toFixed(2));
            art.insertBefore(g, portrait);
          });
        }
      }
      var foot = document.querySelector("footer.site-foot");
      if (foot) {
        var moon = document.createElement("div");
        moon.className = "nc-moon";
        moon.setAttribute("aria-hidden", "true");
        foot.appendChild(moon);
      }
      var sweep = document.createElement("div");
      sweep.className = "nc-sweep";
      sweep.setAttribute("aria-hidden", "true");
      document.body.appendChild(sweep);
      var hud = document.createElement("div");
      hud.className = "nc-hud";
      hud.setAttribute("role", "status");
      hud.innerHTML = '<span>NIGHT CITY // ONLINE</span><button type="button">EXIT</button>';
      hud.querySelector("button").addEventListener("click", function () { set(false); });
      document.body.appendChild(hud);
    }

    // the portrait in Night City light, with shades: one copy in the hero diagram, one over the phone photo
    function buildEdge() {
      if (edgeBuilt) return;
      edgeBuilt = true;
      if (portrait) {
        var face = portrait.cloneNode(false);
        face.setAttribute("class", "nc-face");
        face.setAttribute("href", edgeSrc);
        art.insertBefore(face, portrait.nextSibling);
        var x = +portrait.getAttribute("x"), y = +portrait.getAttribute("y"), s = +portrait.getAttribute("width") / 768;
        var wrap = svgEl("g", { transform: "translate(" + x + " " + y + ") scale(" + s.toFixed(6) + ")" });
        var parsed = svgNodes(shades("h"));
        while (parsed.firstChild) wrap.appendChild(parsed.firstChild);
        art.insertBefore(wrap, face.nextSibling);
      }
      if (photo) {
        var img = document.createElement("img");
        img.className = "nc-pface";
        img.alt = "";
        img.src = edgeSrc;
        var over = svgNodes(shades("p"), 'class="nc-pshades" viewBox="0 0 768 768" aria-hidden="true"');
        photo.parentNode.insertBefore(over, photo.nextSibling);
        photo.parentNode.insertBefore(img, photo.nextSibling);
      }
      var toast = document.createElement("div");
      toast.className = "nc-toast";
      toast.setAttribute("aria-hidden", "true");
      toast.textContent = "STREET CRED +1";
      document.body.appendChild(toast);
    }

    function edge(on) {
      if (on && !edgeBuilt) {
        buildEdge();
        void root.offsetWidth; // let the new layers take their resting state first, so the drop animates
      }
      root.classList.toggle("nc-edge", on);
      if (on) flash("nc-cred", 2600);
    }

    function set(on) {
      if (on && !ready) { wanted = true; load(); return; }
      wanted = false;
      if (on) build();
      root.classList.toggle("nc", on);
      if (icon && nightIcon) icon.setAttribute("href", on ? nightIcon : dayIcon);
      if (tint) tint.setAttribute("content", on ? "#07070c" : dayTint);
      if (on) {
        if (!reduce) flash("nc-boot", 900);
        flash("nc-sandy", 1300);
        if (edgeWanted) { edgeWanted = false; edge(true); }
      } else {
        edgeWanted = false;
        byPhoto = false;
        root.classList.remove("nc-edge");
      }
    }

    // on, or about to be: the style sheet may still be on its way
    function isOn() { return root.classList.contains("nc") || wanted; }

    // three quick taps (each within 1.2 s of the last) on a target switch the mode; three more
    // switch it back
    var TAPS = 3;
    function counter(onDone) {
      var n = 0, last = 0;
      return function () {
        var now = Date.now();
        n = now - last < 1200 ? n + 1 : 1;
        last = now;
        if (n >= TAPS - 1) load(); // fetch the mode's files while the last tap is on its way
        if (n >= TAPS) { n = 0; onDone(); return TAPS; }
        return n;
      };
    }

    // a small shake on the taps before the last, so it is clear the taps are being counted
    function nudge(el) {
      if (reduce || !el || !el.animate) return;
      el.animate([
        { transform: "translate(0, 0)" }, { transform: "translate(-3px, 1px)" }, { transform: "translate(3px, -1px)" },
        { transform: "translate(-2px, 0)" }, { transform: "translate(0, 0)" }
      ], { duration: 260 });
    }

    // taps on a non-link: count pointer releases directly, because phones may swallow the
    // click of a quick second tap as a double-tap gesture; a drag or scroll does not count
    function bindTap(el, fn, accept) {
      el.style.touchAction = "manipulation";
      if (!window.PointerEvent) {
        el.addEventListener("click", function (e) { if (!accept || accept(e)) fn(); });
        return;
      }
      var down = null;
      el.addEventListener("pointerdown", function (e) { down = { x: e.clientX, y: e.clientY }; });
      el.addEventListener("pointerup", function (e) {
        if (e.isPrimary === false || (e.pointerType === "mouse" && e.button !== 0)) return;
        if (down && Math.abs(e.clientX - down.x) + Math.abs(e.clientY - down.y) > 12) return;
        if (accept && !accept(e)) return;
        fn();
      });
    }

    var logoTap = counter(function () { set(!isOn()); });
    brand.style.touchAction = "manipulation";
    brand.addEventListener("click", function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return; // new tab and the like
      e.preventDefault();
      var n = logoTap();
      if (n === 1) window.scrollTo(0, 0);
      if (n > 1 && n < TAPS) nudge(brand.querySelector(".brand-mark"));
    });

    // the portrait undoes what it did: if it switched the mode on, it switches it off again;
    // if the logo had switched the mode on, it only takes the shades on and off
    var photoTap = counter(function () {
      if (!isOn()) { byPhoto = true; edgeWanted = true; set(true); }
      else if (byPhoto) set(false);
      else edge(!root.classList.contains("nc-edge"));
    });
    var warmed = false;
    function onPhoto() {
      var n = photoTap();
      if (n >= TAPS - 1 && !warmed) { warmed = true; new Image().src = edgeSrc; } // fetch the Night City portrait early
      if (root.classList.contains("nc") && n !== TAPS) flash("nc-sandy", 900);
      else if (n > 1 && n < TAPS) { nudge(photo); nudge(portrait); }
    }
    if (photo) {
      photo.draggable = false;
      bindTap(photo, onPhoto);
    }
    if (art) bindTap(art, onPhoto, function (e) { return e.target.closest && e.target.closest("image, .nc-shades"); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("nc")) set(false);
    });
  }
})();
