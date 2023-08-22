import { canopyContainer } from 'helpers/getters';

function preloadImages(parsedJson) {
  let json = JSON.stringify(parsedJson);
  canopyContainer.imagePreloadArray = canopyContainer.imagePreloadArray || [];

  const regex = /<img\s[^>]*?src=["']([^"']+)["']|resourceUrl": ?"([^"]+)"/g;

  [...json.matchAll(regex)].map(m => m[1] || m[2]).forEach(url => {
    let image = new Image();
    image.src = url; // this loads and caches the image
    canopyContainer.imagePreloadArray.push(image); // keep reference to avoid garbage collection
  });
}

export { preloadImages };
