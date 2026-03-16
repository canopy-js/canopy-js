import { canopyContainer } from 'helpers/getters';

function shouldPreloadImage(url) {
  if (!url) return false;

  return (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('/') ||
    url.startsWith('./') ||
    url.startsWith('../')
  );
}

function preloadImages(parsedJson) {
  let json = JSON.stringify(parsedJson);
  canopyContainer.imagePreloadArray = canopyContainer.imagePreloadArray || [];

  const regex = /<img\s[^>]*?src=\\?["']([^"']+?)\\?["']|resourceUrl": ?"([^"]+)/g;

  [...json.matchAll(regex)].map(m => m[1] || m[2]).filter(shouldPreloadImage).forEach(url => {
    let image = new Image();
    image.src = url; // this loads and caches the image
    canopyContainer.imagePreloadArray.push(image); // keep reference to avoid garbage collection
  });
}

export { preloadImages };
