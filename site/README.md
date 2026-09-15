# Valentin Barrios — portfolio

Static site. No build step, no dependencies to install — the only external
requests are Google Fonts and the Three.js/GSAP CDN scripts loaded in
`index.html`.

## Preview locally

```
cd site
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploy

Upload this `site/` folder as-is to any static host:

- **Netlify Drop** — drag the folder onto https://app.netlify.com/drop
- **Vercel** — `vercel deploy` from inside `site/` (choose "Other" as the framework)
- **GitHub Pages** — push this folder's contents to a `gh-pages` branch (or
  set Pages to serve from this directory)
- **Any FTP/static host** — copy the contents of `site/` to the web root

There is nothing to configure: `index.html` is the entry point and all
assets are referenced with relative paths.

## Structure

```
index.html        markup
css/styles.css    all styles
js/main.js        hero shader fallback, scroll-linked type/reveal system,
                   renders filmstrip + lightbox, parallax tilt
assets/videos/    case-study and hero footage (H.264 MP4)
assets/images/    renders and photos
```
