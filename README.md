# Valentin Barrios — portfolio

Static site. No build step, no dependencies to install — the only external
requests are Google Fonts and the Three.js CDN script loaded in
`index.html`.

The site lives at the root of this repo, so any static host can deploy it
with zero configuration.

## Preview locally

```
python3 -m http.server 8080
```

Then open http://localhost:8080.

## Deploy

Point any static host at the root of this repo — nothing to configure:

- **Vercel / Netlify (Git import)** — import this repo as-is, framework
  preset "Other", no build command, no root directory override needed
- **Netlify Drop** — drag the whole repo folder onto https://app.netlify.com/drop
- **GitHub Pages** — set Pages to serve from the `main` branch, root
- **Any FTP/static host** — copy everything in this repo to the web root

`index.html` is the entry point and all assets are referenced with
relative paths.

## Structure

```
index.html        markup
css/styles.css    all styles
js/main.js        hero shader fallback, scroll-linked type/reveal system,
                   pop-up reveal + lightbox, 3D capsule viewer
assets/videos/    case-study and hero footage (H.264 MP4)
assets/images/    renders and photos
assets/models/    STL model for the 3D capsule viewer
```
