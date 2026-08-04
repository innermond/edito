# edito

An SVG editor, good enough. A browser-based canvas for building and editing
SVG documents (shapes, text, images, filters, layouts) backed by a thin PHP
server.

## Stack

- **Frontend**: vanilla JS (ES modules), bundled with Webpack 4 and Babel.
- **Backend**: PHP, used only as a static file / templating server (`index.php`
  includes the requested SVG model, `noscript.php` serves paginated JSON data,
  `cors.php` proxies external URLs).
- **Styling**: Sass, compiled to `css/edito.css` (already checked in, so
  compiling it isn't required to run the app).

## Prerequisites

- Node.js and npm
- PHP (CLI, with the built-in server)

If you don't have `yarn`, use `npm` instead — the commands below use `npm`.

## Setup

```bash
npm install --ignore-scripts
```

`--ignore-scripts` avoids `node-sass`'s native build step (it needs a working
node-gyp/Python toolchain and isn't required unless you plan to edit the
Sass source — `css/edito.css` is already built and checked in).

## Running locally

1. **Build the JS bundle.** Webpack 4 needs Node's legacy OpenSSL provider on
   modern Node versions:

   ```bash
   NODE_OPTIONS=--openssl-legacy-provider npx webpack --config webpack.dev.js
   cp dist/*.js .
   ```

   (This is what `npm run dev` does, minus the `NODE_OPTIONS` shim needed on
   newer Node.)

2. **Provide a starting model.** `index.php` includes an SVG file named by
   the `model` query param, defaulting to `blanc.svg` at the project root.
   That file is intentionally gitignored (`.gitignore` excludes `*.svg`
   except under `icon/`) and isn't shipped in the repo, so create a minimal
   one before first run:

   ```bash
   cat > blanc.svg <<'EOF'
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
   </svg>
   EOF
   ```

3. **Start the PHP server:**

   ```bash
   php -S localhost:2999
   ```

4. Open `http://localhost:2999/index.php`.

Alternatively, `./.start.server.dev` starts the PHP server and `lite-server`
(a live-reload proxy in front of it) together, if you have `yarn` installed:

```bash
./.start.server.dev
```

## npm scripts

| Script | Purpose |
| --- | --- |
| `dev` | Build the dev bundle with Webpack and copy it to the project root |
| `prod` | Build the minified production bundle |
| `sass` | Watch and compile `scss/main.scss` to `css/edito.css` |
| `liteserver` | Run `lite-server`, proxying to the PHP server on port 2999 |
| `nice` | Format `src` with Prettier |

## Project layout

- `src/app/` — editor application code (selection, drag/pan/zoom, history,
  filters, text, floaters, UI chrome, IndexedDB persistence, etc.)
- `src/rows/model.js` — entry point for the layout-picker bundle
  (`model.pak.js`, used by `layouts.php`)
- `data/` — layout/shape/image category data consumed by the app and by
  `noscript.php`
- `scss/`, `css/` — styles (source and compiled output)
- `icon/` — UI icon SVGs (the only SVGs tracked in git)
- `index.php` — main editor page; includes the SVG model given by `?model=`
- `layouts.php` — standalone layout-picker page
- `noscript.php` — paginated JSON endpoint over the `data/*.js` files
- `cors.php` — simple CORS proxy for fetching external URLs
