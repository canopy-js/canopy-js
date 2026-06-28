# Manual HTML bootloader

When using `canopy build --manual-html`, you can include an initial bootloader as a direct child of `#_canopy`. Canopy recognizes `.canopy-boot-loading-graphic` during initial load and defers its own placeholder loading graphic while that bootloader is present.

```html
<div id="_canopy" data-default-topic="Your Default Topic">
  <div class="canopy-loading-graphic canopy-boot-loading-graphic" aria-hidden="true">
    <span class="canopy-loading-dot"></span>
    <span class="canopy-loading-dot"></span>
    <span class="canopy-loading-dot"></span>
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

Use CSS that visually matches Canopy's runtime loading dots. The exact generated bootloader CSS is:

```html
<style>
#_canopy > .canopy-boot-loading-graphic {
  align-items: center;
  animation: canopy-boot-loading-reveal 1ms linear 150ms forwards;
  display: flex;
  gap: 22px;
  justify-content: center;
  min-height: 180px;
  opacity: 0;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-dot {
  animation-duration: 3240ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  background: rgba(0, 0, 0, 0.34);
  border-radius: 50%;
  display: block;
  filter: blur(1px);
  height: 30px;
  width: 30px;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-dot:nth-child(1) {
  animation-name: canopy-boot-loading-dot-left;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-dot:nth-child(2) {
  animation-name: canopy-boot-loading-dot-center;
}

#_canopy > .canopy-boot-loading-graphic > .canopy-loading-dot:nth-child(3) {
  animation-name: canopy-boot-loading-dot-right;
}

@keyframes canopy-boot-loading-reveal {
  to { opacity: 1; }
}

@keyframes canopy-boot-loading-dot-left {
  0%, 100% {
    animation-timing-function: cubic-bezier(0.45, 0, 1, 1);
    opacity: 0.52;
    transform: scale(1.12);
  }

  12.5% { opacity: 0.58; transform: scale(1.36); }
  37.5%, 50%, 62.5%, 75% { opacity: 0.38; transform: scale(0.92); }

  87.5% {
    animation-timing-function: cubic-bezier(0.45, 0, 1, 1);
    opacity: 0.38;
    transform: scale(0.92);
  }

  25% { opacity: 0.52; transform: scale(1.12); }
}

@keyframes canopy-boot-loading-dot-center {
  0%, 100% { opacity: 0.52; transform: scale(1.12); }

  12.5%, 62.5% {
    animation-timing-function: cubic-bezier(0.45, 0, 1, 1);
    opacity: 0.38;
    transform: scale(0.92);
  }

  25%, 75% {
    animation-timing-function: cubic-bezier(0.45, 0, 1, 1);
    opacity: 0.52;
    transform: scale(1.12);
  }

  50% { opacity: 0.52; transform: scale(1.12); }
  37.5%, 87.5% { opacity: 0.58; transform: scale(1.36); }
  100% { opacity: 0.52; transform: scale(1.12); }
}

@keyframes canopy-boot-loading-dot-right {
  0%, 25%, 87.5%, 100% { opacity: 0.38; transform: scale(0.92); }

  37.5% {
    animation-timing-function: cubic-bezier(0.45, 0, 1, 1);
    opacity: 0.38;
    transform: scale(0.92);
  }

  50% {
    animation-timing-function: cubic-bezier(0.45, 0, 1, 1);
    opacity: 0.52;
    transform: scale(1.12);
  }

  62.5% { opacity: 0.58; transform: scale(1.36); }
  75% { opacity: 0.52; transform: scale(1.12); }
}
</style>
```
