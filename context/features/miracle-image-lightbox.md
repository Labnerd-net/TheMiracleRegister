# Plan: Miracle Image Lightbox

## Context

Miracle detail pages now display multiple images (hero + gallery). There's no way to view them full-size. A lightbox overlay lets users see the full image with caption and attribution without leaving the page. Implemented with native `<dialog>` + `showModal()` — no dependencies, focus trapping and Escape dismissal come for free.

## Scope

Single file change: `src/pages/miracles/[slug].astro`

No schema changes, no new files, no test changes (DOM interaction; manual browser testing per spec).

## Implementation

### 1. Make images clickable

**Hero image** (lines 218–231): Wrap the existing `<div>` container in a `<button>` with `data-lightbox-*` attributes.

**Gallery images** (lines 299–317): Wrap each image `<div>` in a `<button>` with `data-lightbox-*` attributes.

Data attributes on each button:
- `data-lightbox-url` — the image URL
- `data-lightbox-caption` — caption text (omitted if null)
- `data-lightbox-attr` — source attribution text (omitted if null)

Use `<button type="button">` with `style="display:contents;cursor:zoom-in;border:none;background:none;padding:0"` so the button has no visual effect on the existing card layout. The existing card styling stays on the inner `<div>`.

### 2. Add the shared `<dialog>` element

Place a single `<dialog id="lb">` before the closing `</Base>` tag, after the Leaflet script block:

```
<dialog id="lb">
  <button id="lb-close" aria-label="Close">✕</button>
  <img id="lb-img" src="" alt="" />
  <div id="lb-meta">
    <p id="lb-caption"></p>
    <p id="lb-attr"></p>
  </div>
</dialog>
```

### 3. CSS

Add a `<style>` block (or inline styles) covering:

```css
#lb {
  border: none;
  background: transparent;
  padding: 1.5rem;
  max-width: min(90vw, 1100px);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}
#lb::backdrop {
  background: rgba(0, 0, 0, 0.88);
}
#lb-img {
  max-width: 100%;
  max-height: calc(90vh - 6rem);
  object-fit: contain;
  display: block;
}
#lb-close {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}
#lb-meta {
  text-align: center;
  color: #ccc;
  font-size: 0.8rem;
}
```

### 4. Script

Add a single `<script is:inline>` block after the dialog:

```js
const lb = document.getElementById('lb');
const lbImg = document.getElementById('lb-img');
const lbCaption = document.getElementById('lb-caption');
const lbAttr = document.getElementById('lb-attr');

function openLightbox(url, caption, attr) {
  lbImg.src = url;
  lbImg.alt = caption || '';
  lbCaption.textContent = caption || '';
  lbAttr.textContent = attr || '';
  lb.showModal();
}

document.querySelectorAll('[data-lightbox-url]').forEach(btn => {
  btn.addEventListener('click', () => {
    openLightbox(
      btn.dataset.lightboxUrl,
      btn.dataset.lightboxCaption || '',
      btn.dataset.lightboxAttr || ''
    );
  });
});

document.getElementById('lb-close').addEventListener('click', () => lb.close());

// Backdrop click: clicking the <dialog> itself (not its children) closes it
lb.addEventListener('click', (e) => {
  if (e.target === lb) lb.close();
});
```

## Verification

1. `npm run build` — must pass with no errors
2. Open any miracle with images (e.g. `/miracles/stigmata-of-padre-pio`, `/miracles/tilma-of-guadalupe`)
3. Click the hero image → lightbox opens full-size
4. Click gallery images → lightbox opens
5. Press Escape → lightbox closes
6. Click backdrop → lightbox closes
7. Click ✕ button → lightbox closes
8. Open lightbox, close, immediately click another image → works correctly
9. Disable JS → images visible inline, no lightbox (graceful degradation)
10. Mobile: tap opens lightbox, image fits viewport
