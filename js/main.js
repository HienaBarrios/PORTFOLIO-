(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const REVEAL_WINDOW = 0.28; // fraction of viewport height the typewriter takes to complete
  const TYPE_UNIT = "character"; // "character" | "word"

  /* ---------------------------------------------------------------------
   * Language: auto-detected from the visitor's browser, overridable by a
   * manual toggle that's remembered for next time. No separate page or
   * URL per language — same HTML, text swapped in place before anything
   * else (typewriter/reveal) reads the DOM.
   * ------------------------------------------------------------------- */
  const I18N = {
    en: {
      "nav.work": "Work",
      "nav.contact": "Contact",
      "hero.title": "Valentin<br>Barrios<br>graphic<br>designer",
      "hero.lead": "I create branding, 3D modeling, 3D printing and product design.<br>Currently working on a 3D lab making cranial orthoses and product design",
      "hero.practice1": "3D modeling",
      "hero.practice2": "Branding",
      "hero.practice3": "Product design",
      "work.title": "Selected work",
      "case.development": "Development",
      "case.pixels-title": "From pixels to real objects",
      "case.pixels-copy": "Together with my team, we had just one week to bring this ambitious project to life—from the initial 3D modeling and development to the final alpaca casting. Working under such a tight deadline made every stage a challenge, but seeing the finished pieces come together made the experience truly rewarding.",
      "case.dale-side-copy": "3D modeling of five commemorative award plaques for Bad Bunny's final concert at River Plate Stadium, developed for production with a strong focus on detail and high-quality finishing.",
      "case.michelob-copy": "For an upcoming large-scale Michelob ULTRA installation inspired by Messi, I developed and produced thousands of custom 3D-printed pieces, taking the project from initial modeling through final production.",
      "case.michelob-heading2": "An individual message, a collective artwork",
      "case.michelob-copy2": "Fans insert personal messages into 3D-printed capsules and add them to a panel to reveal a massive Messi mosaic, receiving a commemorative keychain in return",
      "teaser.sub": "Branding · Identity system",
      "about.eyebrow": "About",
      "about.heading": "i'm a multimedial designer based in Buenos Aires Argentina",
      "about.philosophy-copy": "I approach design as an integral system where the digital and physical worlds converge. My focus is the balance between urban aesthetics and maximum technical precision, whether modeling cell-shaded figures, sculpting custom jewelry or setting up additive manufacturing processes.",
      "about.teammates": "What teammates say",
      "about.quote1": "“An exceptional designer. His command of 3D modeling and his vision for integrating 3D graphic design took our project to another level.”",
      "about.author1": "Marketing director — Dale Play",
      "about.quote2": "“I've been working with Valen for a while now. He has exceptional attention to detail and is fast at executing any project.”",
      "about.author2": "Gonzalo Castaño - Visual artist",
      "clients.selected": "Selected",
      "contact.eyebrow": "Contact",
      "contact.email": "Email",
      "contact.elsewhere": "Elsewhere"
    },
    es: {
      "nav.work": "Trabajo",
      "nav.contact": "Contacto",
      "hero.title": "Valentin<br>Barrios<br>diseñador<br>gráfico",
      "hero.lead": "Creo branding, modelado 3D, impresión 3D y diseño de producto.<br>Actualmente trabajando en un laboratorio 3D fabricando ortesis craneales y diseño de producto",
      "hero.practice1": "Modelado 3D",
      "hero.practice2": "Branding",
      "hero.practice3": "Diseño de producto",
      "work.title": "Trabajo seleccionado",
      "case.development": "Desarrollo",
      "case.pixels-title": "De los píxeles a los objetos reales",
      "case.pixels-copy": "Junto con mi equipo, tuvimos solo una semana para dar vida a este ambicioso proyecto: desde el modelado 3D inicial y el desarrollo hasta la fundición final en alpaca. Trabajar con un plazo tan ajustado hizo de cada etapa un desafío, pero ver las piezas terminadas hizo que la experiencia valiera totalmente la pena.",
      "case.dale-side-copy": "Modelado 3D de cinco placas conmemorativas para el último concierto de Bad Bunny en el Estadio River Plate, desarrolladas para producción con un fuerte foco en el detalle y el terminado de alta calidad.",
      "case.michelob-copy": "Para una próxima instalación a gran escala de Michelob ULTRA inspirada en Messi, desarrollé y produje miles de piezas personalizadas impresas en 3D, llevando el proyecto desde el modelado inicial hasta la producción final.",
      "case.michelob-heading2": "Un mensaje individual, una obra colectiva",
      "case.michelob-copy2": "Los fans insertan mensajes personales en cápsulas impresas en 3D y las suman a un panel para revelar un mosaico gigante de Messi, y a cambio reciben un llavero conmemorativo",
      "teaser.sub": "Branding · Sistema de identidad",
      "about.eyebrow": "Acerca de",
      "about.heading": "soy un diseñador multimedial de Buenos Aires, Argentina",
      "about.philosophy-copy": "Concibo el diseño como un sistema integral donde el mundo digital y el físico convergen. Mi enfoque busca el equilibrio entre la estética urbana y la máxima precisión técnica, ya sea modelando figuras con estilo cell-shading, esculpiendo joyería personalizada o configurando procesos de manufactura aditiva.",
      "about.teammates": "Lo que dicen mis compañeros",
      "about.quote1": "“Un diseñador excepcional. Su dominio del modelado 3D y su visión para integrar diseño gráfico 3D llevaron nuestro proyecto a otro nivel.”",
      "about.author1": "Director de marketing — Dale Play",
      "about.quote2": "“Vengo trabajando con Valen desde hace un tiempo. Tiene una atención al detalle excepcional y es rápido para ejecutar cualquier proyecto.”",
      "about.author2": "Gonzalo Castaño - Artista plástico",
      "clients.selected": "Seleccionados",
      "contact.eyebrow": "Contacto",
      "contact.email": "Email",
      "contact.elsewhere": "Redes"
    }
  };

  function detectLang() {
    try {
      const saved = localStorage.getItem("vb-lang");
      if (saved === "en" || saved === "es") return saved;
    } catch (e) {}
    const nav = (navigator.language || navigator.userLanguage || "en").toLowerCase();
    return nav.startsWith("es") ? "es" : "en";
  }

  function applyTranslations(lang) {
    const dict = I18N[lang] || I18N.en;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.innerHTML = dict[key];
    });
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang-btn") === lang);
    });
  }

  function initLangToggle(lang) {
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.getAttribute("data-lang-btn");
        try { localStorage.setItem("vb-lang", next); } catch (e) {}
        location.reload();
      });
    });
    applyTranslations(lang);
  }

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
   * Pop-up reveal for [data-pop] groups (Bad Bunny plaques, Messi mosaic) —
   * each image springs in with a stagger; leaving the viewport resets them
   * like the fade-up.
   * ------------------------------------------------------------------- */
  function initPopReveal() {
    document.querySelectorAll("[data-pop]").forEach((group) => {
      const imgs = [...group.querySelectorAll("img")];
      imgs.forEach((img, i) => img.style.setProperty("--i", i));

      // After the last image lands, switch to the quick hover transition
      const settleAfter = (imgs.length - 1) * 140 + 650;
      let settleTimer;
      const io = new IntersectionObserver(([entry]) => {
        group.classList.toggle("is-in", entry.isIntersecting);
        clearTimeout(settleTimer);
        if (entry.isIntersecting) settleTimer = setTimeout(() => group.classList.add("is-settled"), settleAfter);
        else group.classList.remove("is-settled");
      }, { threshold: 0.3, rootMargin: "0px 0px -8% 0px" });

      io.observe(group);
    });
  }

  /* ---------------------------------------------------------------------
   * Lightbox — clicking a [data-pop] image opens it full size. Arrows step
   * through the rest of its group; Esc, the × or a click outside closes it.
   * ------------------------------------------------------------------- */
  function initPopLightbox() {
    const groups = [...document.querySelectorAll("[data-pop]")];
    if (!groups.length || !window.HTMLDialogElement) return;

    const box = document.createElement("dialog");
    box.className = "lightbox";
    box.innerHTML =
      '<img alt="">' +
      '<button class="lightbox__close" type="button" aria-label="Close">×</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="Previous">←</button>' +
      '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="Next">→</button>';
    document.body.appendChild(box);
    const big = box.querySelector("img");
    let imgs = [];
    let current = 0;

    const show = (i) => {
      current = (i + imgs.length) % imgs.length;
      big.src = imgs[current].src;
      big.alt = imgs[current].alt;
      big.style.animation = "none";
      void big.offsetWidth; // replay the pop on every change
      big.style.animation = "";
    };
    const open = (set, i) => {
      imgs = set;
      box.classList.toggle("lightbox--single", set.length < 2);
      show(i);
      box.showModal();
    };

    groups.forEach((group) => {
      const set = [...group.querySelectorAll("img")];
      set.forEach((img, i) => {
        img.tabIndex = 0;
        img.setAttribute("role", "button");
        img.addEventListener("click", () => open(set, i));
        img.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(set, i); }
        });
      });
    });

    box.querySelector(".lightbox__close").addEventListener("click", () => box.close());
    box.querySelector(".lightbox__nav--prev").addEventListener("click", () => show(current - 1));
    box.querySelector(".lightbox__nav--next").addEventListener("click", () => show(current + 1));
    big.addEventListener("click", () => box.close());
    box.addEventListener("click", (e) => { if (e.target === box) box.close(); });
    box.addEventListener("keydown", (e) => {
      if (imgs.length < 2) return;
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
    box.addEventListener("close", () => imgs[current].focus({ preventScroll: true }));
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
    const lang = detectLang();
    initLangToggle(lang); // translate static copy before the typewriter splits any text nodes
    initHeroVideoFallback();
    setTimeout(() => {
      initFadeUp();
      initPopReveal();
      initPopLightbox();
      initTypewriter();
      initTilt();
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, 120);
  });
})();
