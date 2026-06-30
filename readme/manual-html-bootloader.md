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
  </div>
</div>
```

The generated build removes the bootloader once the first real, non-loading Canopy paragraph has rendered. If you write your own removal script, use the same lifecycle: remove the bootloader after `#_canopy` contains `section.canopy-section:not(.canopy-loading-section) > p.canopy-paragraph`.

```html
<script>
(() => {
  const canopy = document.getElementById('_canopy');
  const loader = canopy && canopy.querySelector(':scope > .canopy-boot-loading-graphic');
  if (!canopy || !loader || !window.MutationObserver) return;

  const removeLoader = () => {
    if (!canopy.querySelector('section.canopy-section:not(.canopy-loading-section) > p.canopy-paragraph')) return;
    loader.remove();
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
  animation: canopy-boot-loading-reveal 1ms linear 150ms forwards;
  display: flex;
  flex-direction: column;
  gap: 13px;
  justify-content: center;
  margin: 10px auto 0;
  max-width: 594px;
  min-height: 180px;
  opacity: 0;
  padding: 22px 30px;
  position: relative;
  width: min(64.8vw, 594px);
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line {
  animation: canopy-boot-loading-line-shimmer 2400ms ease-in-out infinite alternate;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.24), rgba(0, 0, 0, 0.03));
  background-size: 320% 100%;
  border-radius: 999px;
  display: block;
  filter: blur(2.4px);
  height: 18px;
  opacity: 0.74;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-heading-line {
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.035), rgba(0, 0, 0, 0.42), rgba(0, 0, 0, 0.035));
  filter: blur(3.8px);
  height: 32px;
  margin: 0 auto 8px;
  width: 68%;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(2) {
  width: 84%;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(3) {
  animation-delay: 130ms;
  width: 96%;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(4) {
  animation-delay: 260ms;
  width: 62%;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-line:nth-of-type(5) {
  animation-delay: 390ms;
  width: 74%;
}

@keyframes canopy-boot-loading-reveal {
  to { opacity: 1; }
}

@keyframes canopy-boot-loading-line-shimmer {
  from { background-position: 120% 0; opacity: 0.58; }
  to { background-position: -20% 0; opacity: 0.72; }
}
</style>
```
