import { paintGlobalLinks, unpaintGlobalLinks } from 'keys/handlers';

function registerAltKeyListeners() {
  window.addEventListener('keydown', function(e) {
    if (e.altKey) {
      paintGlobalLinks();
    }
  });

  window.addEventListener('keyup', function(e) {
    if (e.key === 'Alt') {
      unpaintGlobalLinks();
    }
  });
}

export default registerAltKeyListeners;
