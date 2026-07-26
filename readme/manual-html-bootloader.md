# Manual HTML bootloader

When using `canopy build --manual-html`, you can include an initial bootloader as a direct child of `#_canopy`. Canopy recognizes `.canopy-boot-loading-graphic` during initial load and defers its own placeholder loading graphic while that bootloader is present.

```html
<div id="_canopy" data-default-topic="Your Default Topic">
  <div class="canopy-loading-graphic canopy-boot-loading-graphic" aria-hidden="true">
    <span class="canopy-loading-line canopy-loading-heading-line"></span>
    <span class="canopy-loading-line"></span>
    <span class="canopy-loading-line"></span>
    <span class="canopy-loading-line"></span>
    <span class="canopy-loading-line"></span>
    <span class="canopy-loading-line"></span>
    <span class="canopy-loading-line"></span>
  </div>
</div>
```

Generated builds wait 150ms before revealing the bootloader, then keep it visible for at least 200ms before fading it out. For deep hosted paths where the page heading is unlikely to be visible immediately, they also switch the bootloader to paragraph-only mode when the hosted route has at least three non-empty `/` or `#` segments. Manual HTML can use the same heuristic:

```html
<script>
(() => {
  if (window.location.protocol === 'file:') return;
  const hash = window.location.hash || '';
  const route = window.location.pathname + (hash.startsWith('#/') ? '' : hash);
  const pathSegments = route.split(/[\/#]/).filter(Boolean);
  const loader = document.querySelector('#_canopy > .canopy-boot-loading-graphic');
  if (!loader) return;
  if (pathSegments.length >= 3) loader.classList.add('canopy-boot-loading-graphic-deep');
  window.setTimeout(() => {
    if (!loader.isConnected || loader.classList.contains('canopy-boot-loading-graphic-fading-out')) return;
    loader.dataset.canopyBootloaderVisibleAt = String(Date.now());
    loader.classList.add('canopy-boot-loading-graphic-visible');
  }, 150);
})();
</script>
```

The generated build fades out and removes the bootloader once the first real, non-loading Canopy paragraph has rendered. If you write your own removal script, use the same lifecycle: fade the bootloader after `#_canopy` contains `section.canopy-section:not(.canopy-loading-section) > p.canopy-paragraph`.

```html
<script>
(() => {
  const canopy = document.getElementById('_canopy');
  const loader = canopy && canopy.querySelector(':scope > .canopy-boot-loading-graphic');
  if (!canopy || !loader || !window.MutationObserver) return;

  const removeLoader = () => {
    if (!canopy.querySelector('section.canopy-section:not(.canopy-loading-section) > p.canopy-paragraph')) return;
    if (loader.dataset.canopyBootloaderRemovalScheduled === 'true') return;
    if (!loader.classList.contains('canopy-boot-loading-graphic-visible')) {
      loader.remove();
      observer.disconnect();
      return;
    }
    const visibleAt = Number(loader.dataset.canopyBootloaderVisibleAt);
    const remainingVisibleMs = Math.max(0, 200 - (visibleAt ? Date.now() - visibleAt : 200));
    if (remainingVisibleMs > 0) {
      loader.dataset.canopyBootloaderRemovalScheduled = 'true';
      window.setTimeout(() => {
        delete loader.dataset.canopyBootloaderRemovalScheduled;
        removeLoader();
      }, remainingVisibleMs);
      return;
    }
    loader.classList.add('canopy-boot-loading-graphic-fading-out');
    loader.addEventListener('animationend', () => loader.remove(), { once: true });
    observer.disconnect();
  };

  const observer = new MutationObserver(removeLoader);
  observer.observe(canopy, { attributes: true, childList: true, subtree: true });
  removeLoader();
})();
</script>
```

Use CSS that visually matches Canopy's runtime loading graphic. The exact generated bootloader CSS is:

```html
<style>
#_canopy > .canopy-boot-loading-graphic {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  gap: 20px;
  justify-content: flex-start;
  left: 50%;
  margin: 0;
  max-width: 594px;
  min-height: 180px;
  opacity: 0;
  padding: 0 30px 22px;
  pointer-events: none;
  position: fixed;
  top: 44px;
  transform: translateX(-50%);
  width: min(64.8vw, 594px);
  z-index: 1;
}

#_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-visible {
  opacity: 1;
}

#_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-fading-out {
  animation: canopy-boot-loading-fade-out 165ms ease forwards;
}

#_canopy > .canopy-boot-loading-graphic:not(.canopy-boot-loading-graphic-fading-out) ~ section.canopy-section {
  opacity: 0 !important;
  pointer-events: none;
}

#_canopy > h1.canopy-header + .canopy-boot-loading-graphic + section.canopy-topic-section {
  margin-top: 30px;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line {
  --canopy-boot-loading-line-base-opacity: 0.14;
  --canopy-boot-loading-line-delay: 0ms;
  --canopy-boot-loading-line-duration: 3200ms;
  --canopy-boot-loading-line-middle-opacity: 0.74;
  --canopy-boot-loading-line-shoulder-opacity: 0.16;
  --canopy-boot-loading-line-start: -46%;
  --canopy-boot-loading-line-stop: 44%;
  --canopy-boot-loading-line-sweep: 65%;
  background: rgba(0, 0, 0, var(--canopy-boot-loading-line-base-opacity));
  border-radius: 999px;
  display: block;
  filter: blur(2.9px);
  height: 24px;
  opacity: 0.74;
  overflow: hidden;
  position: relative;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line::after {
  animation: canopy-boot-loading-line-shimmer var(--canopy-boot-loading-line-duration) cubic-bezier(0.45, 0, 0.55, 1) infinite;
  animation-delay: var(--canopy-boot-loading-line-delay);
  background: linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.06) 34%, rgba(0, 0, 0, 0.18) 50%, rgba(0, 0, 0, 0.06) 66%, rgba(0, 0, 0, 0) 100%);
  content: '';
  inset: -40% calc(-1 * var(--canopy-boot-loading-line-sweep));
  position: absolute;
  transform: translateX(var(--canopy-boot-loading-line-start));
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-heading-line {
  background: rgba(0, 0, 0, 0.2);
  filter: blur(3.8px);
  height: 32px;
  margin: 0 auto 15px;
  width: 68%;
}

#_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep {
  gap: 22px;
  padding-top: 42px;
}

#_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep > .canopy-loading-heading-line {
  display: none;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(2) {
  --canopy-boot-loading-line-base-opacity: 0.135;
  --canopy-boot-loading-line-delay: -520ms;
  --canopy-boot-loading-line-duration: 3400ms;
  --canopy-boot-loading-line-middle-opacity: 0.68;
  --canopy-boot-loading-line-shoulder-opacity: 0.14;
  --canopy-boot-loading-line-start: -44%;
  --canopy-boot-loading-line-stop: 40%;
  --canopy-boot-loading-line-sweep: 58%;
  margin-left: -9%;
  width: 110%;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(3) {
  --canopy-boot-loading-line-base-opacity: 0.15;
  --canopy-boot-loading-line-delay: -1180ms;
  --canopy-boot-loading-line-duration: 2950ms;
  --canopy-boot-loading-line-middle-opacity: 0.82;
  --canopy-boot-loading-line-shoulder-opacity: 0.2;
  --canopy-boot-loading-line-start: -56%;
  --canopy-boot-loading-line-stop: 48%;
  --canopy-boot-loading-line-sweep: 76%;
  margin-left: -9%;
  width: 105%;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(4) {
  --canopy-boot-loading-line-base-opacity: 0.125;
  --canopy-boot-loading-line-delay: -260ms;
  --canopy-boot-loading-line-duration: 3950ms;
  --canopy-boot-loading-line-middle-opacity: 0.58;
  --canopy-boot-loading-line-shoulder-opacity: 0.12;
  --canopy-boot-loading-line-start: -36%;
  --canopy-boot-loading-line-stop: 34%;
  --canopy-boot-loading-line-sweep: 50%;
  margin-left: -9%;
  width: 71%;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(5) {
  --canopy-boot-loading-line-base-opacity: 0.145;
  --canopy-boot-loading-line-delay: -1640ms;
  --canopy-boot-loading-line-duration: 3250ms;
  --canopy-boot-loading-line-middle-opacity: 0.72;
  --canopy-boot-loading-line-shoulder-opacity: 0.16;
  --canopy-boot-loading-line-start: -49%;
  --canopy-boot-loading-line-stop: 43%;
  --canopy-boot-loading-line-sweep: 64%;
  margin-left: -9%;
  width: 83%;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(6) {
  --canopy-boot-loading-line-base-opacity: 0.13;
  --canopy-boot-loading-line-delay: -910ms;
  --canopy-boot-loading-line-duration: 4300ms;
  --canopy-boot-loading-line-middle-opacity: 0.61;
  --canopy-boot-loading-line-shoulder-opacity: 0.12;
  --canopy-boot-loading-line-start: -40%;
  --canopy-boot-loading-line-stop: 47%;
  --canopy-boot-loading-line-sweep: 57%;
  margin-left: -9%;
  width: 97%;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(7) {
  --canopy-boot-loading-line-base-opacity: 0.155;
  --canopy-boot-loading-line-delay: -2230ms;
  --canopy-boot-loading-line-duration: 2850ms;
  --canopy-boot-loading-line-middle-opacity: 0.84;
  --canopy-boot-loading-line-shoulder-opacity: 0.21;
  --canopy-boot-loading-line-start: -60%;
  --canopy-boot-loading-line-stop: 41%;
  --canopy-boot-loading-line-sweep: 74%;
  margin-left: -9%;
  width: 66%;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(n+6) {
  display: none;
}

#_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep > .canopy-loading-line:nth-of-type(4),
#_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep > .canopy-loading-line:nth-of-type(6) {
  margin-top: 16px;
}

#_canopy > .canopy-boot-loading-graphic.canopy-boot-loading-graphic-deep > .canopy-loading-line:nth-of-type(n+6) {
  display: block;
}

@keyframes canopy-boot-loading-fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes canopy-boot-loading-line-shimmer {
  0% { opacity: 0; transform: translateX(var(--canopy-boot-loading-line-start)); }
  18% { opacity: var(--canopy-boot-loading-line-shoulder-opacity); }
  50% { opacity: var(--canopy-boot-loading-line-middle-opacity); transform: translateX(0); }
  82% { opacity: var(--canopy-boot-loading-line-shoulder-opacity); }
  100% { opacity: 0; transform: translateX(var(--canopy-boot-loading-line-stop)); }
}
</style>
```
