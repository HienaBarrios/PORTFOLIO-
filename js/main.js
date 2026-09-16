(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const REVEAL_WINDOW = 0.28; // fraction of viewport height the typewriter takes to complete
  const TYPE_UNIT = "character"; // "character" | "word"

  /* ---------------------------------------------------------------------
   * Hero WebGL fallback — a grayscale noise field + cell-shaded torus knot.
   * Only spun up if the hero video fails to load, so it never competes
   * with the real footage.
   * ------------------------------------------------------------------- */
  function initHeroGL() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas || !window.THREE) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    } catch (e) {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.autoClear = false;

    const bgScene = new THREE.Scene();
    const bgCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uInt: { value: 1 }
    };
    const bgMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: [
        "precision highp float;",
        "varying vec2 vUv;",
        "uniform float uTime; uniform vec2 uRes; uniform vec2 uMouse; uniform float uInt;",
        "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
        "float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); vec2 u = f*f*(3.0-2.0*f);",
        "  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y); }",
        "float fbm(vec2 p){ float v = 0.0; float a = 0.5; for(int i=0;i<5;i++){ v += a*noise(p); p *= 2.03; a *= 0.5; } return v; }",
        "void main(){",
        "  vec2 uv = vUv; vec2 p = uv * vec2(uRes.x/uRes.y, 1.0);",
        "  float t = uTime * 0.05 * uInt;",
        "  vec2 q = vec2(fbm(p*2.2 + t), fbm(p*2.2 - t + 4.7));",
        "  float f = fbm(p*3.0 + q*1.6 + vec2(0.0, t*1.4));",
        "  float g = mix(0.03, 0.22, smoothstep(0.15, 0.95, f));",
        "  g += smoothstep(0.62, 1.0, fbm(vec2(p.x*1.4, p.y*7.0 - t*2.0))) * 0.16;",
        "  g += smoothstep(0.45, 0.0, distance(uv, uMouse)) * 0.07;",
        "  g += smoothstep(0.004, 0.0, abs(fract(uv.y - uTime*0.045) - 0.5)) * 0.55;",
        "  g += (hash(uv * uTime) - 0.5) * 0.02;",
        "  g *= 0.45 + 0.55 * smoothstep(1.15, 0.25, distance(uv, vec2(0.5)));",
        "  gl_FragColor = vec4(vec3(g), 1.0);",
        "}"
      ].join("\n")
    });
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    cam.position.set(0, 0, 6.2);

    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: uniforms.uTime },
      vertexShader: "varying vec3 vN; varying vec3 vPos; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vPos = mv.xyz; gl_Position = projectionMatrix * mv; }",
      fragmentShader: [
        "precision highp float;",
        "varying vec3 vN; varying vec3 vPos;",
        "void main(){",
        "  vec3 n = normalize(vN); vec3 l = normalize(vec3(0.6, 0.85, 0.5));",
        "  float d = max(dot(n, l), 0.0);",
        "  float band = d > 0.82 ? 1.0 : d > 0.5 ? 0.62 : d > 0.24 ? 0.30 : 0.12;",
        "  float rim = pow(1.0 - max(dot(n, normalize(-vPos)), 0.0), 2.6);",
        "  float g = mix(0.06, 0.92, band) + rim * 0.45;",
        "  gl_FragColor = vec4(vec3(min(g, 1.0)), 1.0);",
        "}"
      ].join("\n")
    });
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(1.35, 0.42, 220, 32, 2, 3), mat);
    scene.add(knot);
    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.55, 1), 24),
      new THREE.LineBasicMaterial({ color: 0x333333 })
    );
    scene.add(wire);

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      const w = Math.max(1, r.width), h = Math.max(1, r.height);
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const target = { x: 0.5, y: 0.5 };
    window.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
    }, { passive: true });

    let visible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(canvas);
    }

    const clock = new THREE.Clock();
    const loop = () => {
      requestAnimationFrame(loop);
      if (!visible) return;
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;
      const m = uniforms.uMouse.value;
      m.x += (target.x - m.x) * 0.05;
      m.y += (target.y - m.y) * 0.05;
      knot.rotation.y = t * 0.18 + (m.x - 0.5) * 0.9;
      knot.rotation.x = Math.sin(t * 0.22) * 0.25 + (m.y - 0.5) * -0.6;
      wire.rotation.y = -t * 0.06;
      wire.rotation.x = t * 0.04;
      renderer.clear();
      renderer.render(bgScene, bgCam);
      renderer.clearDepth();
      renderer.render(scene, cam);
    };
    loop();
  }

  function initHeroVideoFallback() {
    const video = document.getElementById("heroVideo");
    if (!video) return;
    video.addEventListener("error", initHeroGL, { once: true });
  }

  /* ---------------------------------------------------------------------
   * Typewriter reveal — glyphs are pre-split into spans that already
   * occupy their final box, so revealing them by toggling opacity causes
   * zero layout shift. Progress is driven by scroll position for text
   * below the fold, and by a short on-load timer for the hero (which
   * starts already in view).
   * ------------------------------------------------------------------- */
  function splitChars(el) {
    if (el.__chars) return el.__chars;
    const byWord = TYPE_UNIT === "word";
    const chars = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          const units = byWord ? n.nodeValue.split(/(\s+)/) : [...n.nodeValue];
          units.forEach((c) => {
            const s = document.createElement("span");
            s.className = "tw-u";
            s.textContent = c;
            if (!c.trim()) s.style.whiteSpace = "pre-wrap";
            frag.appendChild(s);
            if (c.trim()) chars.push(s);
            else s.classList.add("tw-on");
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") {
          walk(n);
        }
      });
    };
    walk(el);
    el.__chars = chars;
    return chars;
  }

  function syncScrollReveal(nodes) {
    const vh = window.innerHeight;
    const span = REVEAL_WINDOW * vh;
    const atBottom = window.scrollY + vh >= document.documentElement.scrollHeight - 4;
    nodes.forEach((el) => {
      const chars = el.__chars || [];
      if (!chars.length || el.__introRunning) return;
      const r = el.getBoundingClientRect();
      let p = Math.max(0, Math.min(1, (vh - r.top) / Math.max(1, span)));
      if (r.top < vh * 0.66) p = 1; // already comfortably on screen: show it in full
      if (atBottom && r.top < vh) p = 1;
      const target = Math.round(p * chars.length);
      if (el.__shown === target) return;
      for (let i = 0; i < target; i++) chars[i].classList.add("tw-on");
      for (let i = target; i < (el.__shown || 0); i++) chars[i].classList.remove("tw-on");
      el.__shown = target;
    });
  }

  function introType(nodes) {
    const hero = document.querySelector("header#top");
    if (!hero) return;
    nodes.filter((el) => hero.contains(el)).forEach((el, idx) => {
      const chars = el.__chars || [];
      if (!chars.length) return;
      el.__introRunning = true;
      chars.forEach((c) => c.classList.remove("tw-on"));
      el.__shown = 0;
      const start = performance.now() + 180 + idx * 260;
      const dur = Math.max(500, Math.min(1500, chars.length * 26));
      const step = (now) => {
        const p = Math.max(0, Math.min(1, (now - start) / dur));
        const target = Math.round(p * chars.length);
        for (let i = el.__shown; i < target; i++) chars[i].classList.add("tw-on");
        el.__shown = target;
        if (p < 1) requestAnimationFrame(step);
        else el.__introRunning = false;
      };
      requestAnimationFrame(step);
    });
    hero.querySelectorAll("[data-anim]").forEach((el, i) => {
      el.style.transitionDelay = (700 + i * 140) + "ms";
      requestAnimationFrame(() => el.classList.add("is-in"));
    });
  }

  function initTypewriter() {
    const nodes = [...document.querySelectorAll("[data-tw]")];
    if (!nodes.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      nodes.forEach((el) => splitChars(el).forEach((s) => s.classList.add("tw-on")));
      return;
    }
    nodes.forEach((el) => { splitChars(el); el.__shown = 0; });
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; syncScrollReveal(nodes); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    syncScrollReveal(nodes);
    introType(nodes);
  }

  /* ---------------------------------------------------------------------
   * Fade-up reveal for paragraphs — entries near each other in the flow
   * cascade in with a short stagger; leaving the viewport resets them so
   * the reveal plays again on re-entry.
   * ------------------------------------------------------------------- */
  function initFadeUp() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = [...document.querySelectorAll("[data-anim]")];
    if (!nodes.length) return;

    const assign = () => {
      let step = 0, prevBottom = null;
      nodes.forEach((el) => {
        const r = el.getBoundingClientRect();
        const top = r.top + window.scrollY;
        if (prevBottom !== null && top - prevBottom < 160) step = step >= 3 ? 3 : step + 1;
        else step = 0;
        prevBottom = top + r.height;
        el.__stagger = step * 90;
      });
    };
    assign();
    window.addEventListener("resize", assign, { passive: true });

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const d = entry.isIntersecting ? (el.__stagger || 0) : 0;
        el.style.transitionDelay = d + "ms";
        el.classList.toggle("is-in", entry.isIntersecting);
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });

    nodes.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------------------
   * Renders filmstrip + lightbox
   * ------------------------------------------------------------------- */
  function plate(seed) {
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>"
      + "<defs><linearGradient id='p" + seed + "' x1='0' y1='0' x2='1' y2='1'>"
      + "<stop offset='0' stop-color='#" + (seed % 2 ? "6d571f" : "8a6c2a") + "'/>"
      + "<stop offset='0.45' stop-color='#f3e0a8'/>"
      + "<stop offset='0.7' stop-color='#b4923f'/>"
      + "<stop offset='1' stop-color='#4a3a12'/></linearGradient></defs>"
      + "<rect width='800' height='600' fill='#111111'/>"
      + "<rect x='" + (60 + seed * 14) + "' y='90' width='" + (560 - seed * 10) + "' height='" + (420 - seed * 8) + "' fill='url(#p" + seed + ")'/>"
      + "</svg>";
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }

  function initGalleryAndLightbox() {
    const strip = document.getElementById("filmstrip");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxClose = document.getElementById("lightboxClose");
    if (!strip || !lightbox || !lightboxImg) return;

    const labels = [
      "DALE PLAY / PLATE 01", "DALE PLAY / PLATE 02",
      "MICHELOB ULTRA / PLATE 01", "MICHELOB ULTRA / PLATE 02",
      "BANDA ETERNA / PLATE 01", "BANDA ETERNA / PLATE 02"
    ];

    const open = (src, alt) => {
      lightboxImg.src = src;
      lightboxImg.alt = alt || "";
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      lightbox.classList.remove("is-open");
      lightboxImg.removeAttribute("src");
      document.body.style.overflow = "";
    };

    labels.forEach((label, i) => {
      const src = plate(i + 1);
      const no = String(i + 1).padStart(2, "0");

      const figure = document.createElement("figure");
      figure.className = "film-item";

      const img = document.createElement("img");
      img.src = src;
      img.alt = label;
      img.loading = "lazy";
      img.addEventListener("click", () => open(src, label));

      const caption = document.createElement("figcaption");
      const labelSpan = document.createElement("span");
      labelSpan.textContent = label;
      const noSpan = document.createElement("span");
      noSpan.textContent = no;
      caption.append(labelSpan, noSpan);

      figure.append(img, caption);
      strip.appendChild(figure);
    });

    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
    lightboxClose.addEventListener("click", close);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) close();
    });
  }

  /* ---------------------------------------------------------------------
   * GSAP parallax tilt on the Banda Eterna teaser art
   * ------------------------------------------------------------------- */
  function initTilt() {
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      gsap.to(el, { yPercent: -6, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeroVideoFallback();
    initGalleryAndLightbox();
    setTimeout(() => {
      initFadeUp();
      initTypewriter();
      initTilt();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 120);
  });
})();
