# Leandro Untal — Portfolio

An Astro static portfolio with a client-only React Three Fiber background island. The page content is rendered as static HTML; the WebGL scene hydrates in the browser and follows GSAP ScrollTrigger progress.

## Run locally

Use Node.js `^20.19.1` or `>=22.12.0` with npm:

```sh
npm install
npm run dev
```

Build and preview the static site with:

```sh
npm run build
npm run preview
```

## Architecture

- `astro.config.mjs` wires up the React integration and Tailwind CSS v4 Vite plugin.
- `src/pages/index.astro` contains the static portfolio sections and project/photo data arrays. Images continue to load from their existing paths in `public/`.
- `src/components/HeroCanvas.tsx` is the `client:only="react"` R3F island. It creates a procedural geospatial node network and reacts to pointer position.
- GSAP ScrollTrigger in `index.astro` publishes scroll progress to the scene, which uses it to move the camera through the network.
- `src/styles/global.css` defines the Tailwind import, theme tokens, and glass / terminal styling.
