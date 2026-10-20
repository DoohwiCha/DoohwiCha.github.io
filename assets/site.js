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

  microprint();
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

  // Microprint, as on a banknote: on the home pages the ring round the portrait (phones), the
  // dashed ring of the diagram (wider screens) and the footer rule are lines of text about 2.5 px
  // high, readable only when zoomed in: questions from statistics and finance, and seven people
  // who asked them first. In Night City the portrait ring and the footer change.
  function microprint() {
    if (!document.querySelector(".hero")) return;
    var NS = "http://www.w3.org/2000/svg";
    var ko = (document.documentElement.lang || "").indexOf("ko") === 0;
    var T = ko ? {
      top: "우연과 실력은 어떻게 구별하는가 · 과거는 미래에 대해 얼마나 말해 주는가",
      bottom: "모형은 얼마나 틀려도 쓸모 있는가 · 위험은 어디로 옮겨 가는가",
      ncTop: "투자의 경계를 달리다 · 아직 아무도 재 보지 않은 곳으로",
      ncBottom: "경계 너머의 달은 페이지 끝, 오른쪽 아래에",
      art: ["파스칼·페르마, 1654 · 끝나지 않은 판은 어떻게 나누는가", "베이즈, 1763 · 새 증거 앞에서 믿음은 얼마나 바뀌어야 하는가",
        "골턴, 1886 · 극단은 왜 평균으로 돌아오는가", "바슐리에, 1900 · 가격의 움직임을 확률로 쓸 수 있는가",
        "고셋(스튜던트), 1908 · 작은 표본은 얼마나 말해 줄 수 있는가", "마코위츠, 1952 · 위험과 수익을 함께 놓고 고를 수 있는가",
        "에프론, 1979 · 표본 하나로 그 표본의 불확실성을 알 수 있는가"],
      rule: "불확실한 내일을 오늘 어떻게 재는가 · ",
      ncRule: "투자의 경계 너머 · 차두휘 · NIGHT CITY · "
    } : {
      top: "HOW DO WE TELL LUCK FROM SKILL? · WHAT DOES THE PAST SAY ABOUT THE FUTURE?",
      bottom: "HOW WRONG CAN A MODEL BE AND STILL BE USEFUL? · WHERE DOES RISK GO?",
      ncTop: "RUNNING THE EDGE OF INVESTING · WHERE NO ONE HAS MEASURED YET",
      ncBottom: "THE MOON BEYOND THE EDGE: END OF THE PAGE, BOTTOM RIGHT",
      art: ["PASCAL & FERMAT, 1654 · HOW DO YOU DIVIDE THE STAKES OF AN UNFINISHED GAME?",
        "BAYES, 1763 · HOW MUCH SHOULD NEW EVIDENCE CHANGE WHAT WE BELIEVE?", "GALTON, 1886 · WHY DO EXTREMES RETURN TOWARD THE MEAN?",
        "BACHELIER, 1900 · CAN PRICE MOVES BE WRITTEN IN PROBABILITIES?", "GOSSET (STUDENT), 1908 · HOW MUCH CAN A SMALL SAMPLE TELL US?",
        "MARKOWITZ, 1952 · CAN WE CHOOSE BY RISK AND RETURN TOGETHER?", "EFRON, 1979 · CAN ONE SAMPLE MEASURE ITS OWN UNCERTAINTY?"],
      rule: "HOW DO WE MEASURE AN UNCERTAIN TOMORROW TODAY? · ",
      ncRule: "BEYOND THE EDGE OF INVESTING · DOOHWI CHA · NIGHT CITY · "
    };
    var n = 0;

    function el(tag, attrs, parent) {
      var e = document.createElementNS(NS, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    }

    // text along an arc from angle a0 to a1 (degrees, y down), stretched to fill it. Over the top the
    // arc runs clockwise with the baseline inside; under the bottom it runs the other way with the
    // baseline outside, so every line reads upright.
    function arc(parent, cx, cy, r, a0, a1, text, cls) {
      var rad = Math.PI / 180, id = "mp-" + n++;
      function pt(a) { return (cx + r * Math.cos(a * rad)).toFixed(1) + " " + (cy + r * Math.sin(a * rad)).toFixed(1); }
      el("path", { id: id, d: "M" + pt(a0) + "A" + r + " " + r + " 0 0 " + (a1 > a0 ? 1 : 0) + " " + pt(a1), fill: "none" }, parent);
      var t = el("text", { "class": cls || "", textLength: (Math.abs(a1 - a0) * rad * r).toFixed(1), lengthAdjust: "spacing" }, parent);
      var p = el("textPath", { href: "#" + id }, t);
      p.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + id);
      p.textContent = text;
    }

    // portrait (phones): 86 px ring drawn at 4x, just outside the 76 px photo
    var photo = document.querySelector(".hero-photo");
    if (photo) {
      var ring = el("svg", { "class": "mp mp-ring", viewBox: "0 0 344 344", "aria-hidden": "true", focusable: "false" });
      arc(ring, 172, 172, 157.6, 184, 356, T.top, "mp-day");
      arc(ring, 172, 172, 164.8, 176, 4, T.bottom, "mp-day");
      arc(ring, 172, 172, 157.6, 184, 356, T.ncTop, "mp-nc");
      arc(ring, 172, 172, 164.8, 176, 4, T.ncBottom, "mp-nc");
      photo.parentNode.insertBefore(ring, photo.nextSibling);
    }

    // diagram (wider screens): seven arcs between the seats replace the dashed ring
    var art = document.querySelector(".hero-art svg");
    var circle = art && art.querySelector(".art-ring");
    if (circle) {
      var cx = +circle.getAttribute("cx") * 4, cy = +circle.getAttribute("cy") * 4, r = +circle.getAttribute("r");
      var g = el("g", { "class": "mp mp-art", transform: "scale(.25)" });
      var step = 360 / 7, gap = 14 / r / (Math.PI / 180); // keep clear of the 9-unit seats
      for (var i = 0; i < 7; i++) {
        var a0 = -90 + i * step + gap, a1 = -90 + (i + 1) * step - gap;
        var under = Math.sin(((a0 + a1) / 2) * Math.PI / 180) > 0.1;
        var R = (under ? r + 1.4 : r - 1.2) * 4;
        var from = under ? a1 : a0, to = under ? a0 : a1;
        arc(g, cx, cy, R, from, to, T.art[i]);
      }
      circle.parentNode.insertBefore(g, circle.nextSibling);
      circle.style.stroke = "none";
    }

    // footer rule: one line of 10 px text scaled to a quarter
    var foot = document.querySelector("footer.site-foot");
    if (foot) {
      var strip = document.createElement("div");
      strip.className = "mp mp-rule";
      strip.setAttribute("aria-hidden", "true");
      [[T.rule, "mp-day"], [T.ncRule, "mp-nc"]].forEach(function (r) {
        var line = document.createElement("span");
        line.className = r[1];
        line.textContent = new Array(40).join(r[0]);
        strip.appendChild(line);
      });
      foot.insertBefore(strip, foot.firstChild);
    }
    document.documentElement.classList.add("mp-on");
  }

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
    var ko = (root.lang || "").indexOf("ko") === 0;
    var moon = null, lunar = null, lunarDone = false;

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
        moon = document.createElement("button");
        moon.type = "button";
        moon.className = "nc-moon";
        moon.setAttribute("aria-label", ko ? "달 위 걷기" : "Walk on the moon");
        moon.addEventListener("click", moonWalk);
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

    // the moon at the end of the page: a quiet walk on it, footprints toward the horizon and, for
    // the last few steps, a faint yellow trail beside them
    function lunarScene() {
      var d = document.createElement("dialog");
      d.className = "nc-lunar";
      d.setAttribute("aria-label", ko ? "달 위에서" : "On the moon");
      var s = '<svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' +
        '<radialGradient id="nc-earth" cx=".38" cy=".34" r=".75"><stop offset="0" stop-color="#bfe3ff"/><stop offset=".45" stop-color="#4f8fe0"/>' +
        '<stop offset="1" stop-color="#173a7a"/></radialGradient>' +
        '<linearGradient id="nc-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a8e9c"/><stop offset=".35" stop-color="#5a5e6b"/>' +
        '<stop offset="1" stop-color="#26282f"/></linearGradient></defs>';
      var seed = 7;
      function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
      for (var i = 0; i < 70; i++) {
        s += '<circle cx="' + (rnd() * 1000).toFixed(0) + '" cy="' + (rnd() * 600).toFixed(0) + '" r="' + (0.6 + rnd() * 1.4).toFixed(1) +
          '" fill="#fff" opacity="' + (0.35 + rnd() * 0.6).toFixed(2) + '"/>';
      }
      s += '<circle cx="312" cy="292" r="30" fill="#4f8fe0" opacity=".12"/><circle cx="312" cy="292" r="17" fill="url(#nc-earth)"/>' +
        '<path d="M-100 1000V636Q500 556 1100 636V1000Z" fill="url(#nc-ground)"/>' +
        '<ellipse cx="330" cy="700" rx="46" ry="9" fill="#3c3f49" opacity=".55"/><ellipse cx="660" cy="660" rx="30" ry="6" fill="#3c3f49" opacity=".5"/>' +
        '<ellipse cx="610" cy="820" rx="70" ry="14" fill="#3c3f49" opacity=".45"/>';
      // seven pairs from the near ground to the horizon; the last three get a companion
      var k = 0;
      function foot(x, y, sc, cls, rot) {
        s += '<ellipse class="fp' + cls + '" style="--i:' + k + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (4.6 * sc).toFixed(2) +
          '" ry="' + (9.5 * sc).toFixed(2) + '" transform="rotate(' + rot + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
      }
      for (var p = 0; p < 7; p++) {
        var t = p / 6, y = 742 - t * 116, sc = 0.86 - 0.5 * t, x = 498 - t * 12;
        k = 2 * p;
        foot(x - 9 * sc, y, sc, "", -6);
        if (p >= 4) foot(x + 30 * sc, y - 3 * sc, sc, " fp-y", -4);
        k = 2 * p + 1;
        foot(x + 9 * sc, y - 12 * sc, sc, "", 6);
        if (p >= 4) foot(x + 48 * sc, y - 15 * sc, sc, " fp-y", 8);
      }
      s += '</svg>';
      d.innerHTML = s + '<div class="say"><p class="line">' + (ko ? "경계 너머엔,<br>이런 고요가 있었다." : "Beyond the edge,<br>this quiet.") + '</p>' +
        '<p class="cap">NIGHT CITY // 384,400 KM</p></div>' +
        '<button type="button" class="back">' + (ko ? "나이트 시티로 돌아가기" : "Back to Night City") + '</button>';
      d.addEventListener("click", function (e) {
        if (lunarDone || (e.target.closest && e.target.closest(".back"))) closeMoon();
      });
      d.addEventListener("close", function () { if (moon) moon.focus({ preventScroll: true }); });
      document.body.appendChild(d);
      return d;
    }

    function moonWalk() {
      if (!lunar) lunar = lunarScene();
      if (lunar.open) return;
      lunarDone = reduce;
      clearTimeout(timers.lunar);
      if (!reduce) timers.lunar = setTimeout(function () { lunarDone = true; }, 2800); // taps close it once the walk is over
      if (lunar.showModal) lunar.showModal();
      else lunar.setAttribute("open", "");
      var back = lunar.querySelector(".back");
      if (back) back.focus({ preventScroll: true });
    }

    function closeMoon() {
      if (!lunar || !lunar.open) return;
      if (lunar.close) lunar.close();
      else { lunar.removeAttribute("open"); if (moon) moon.focus({ preventScroll: true }); }
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
        closeMoon();
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
      if (e.key !== "Escape") return;
      if (lunar && lunar.open) { if (!lunar.showModal) closeMoon(); return; } // Esc leaves the moon first, then the mode
      if (root.classList.contains("nc")) set(false);
    });
  }
})();
