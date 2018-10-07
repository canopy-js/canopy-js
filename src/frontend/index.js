import canopyContainer from 'helpers/getters';
import { validateClientHtml } from 'initializers/validate_client_html';

validateClientHtml();

var defaultTopic = document.getElementById('_canopy').dataset.defaultTopic;
console.log(defaultTopic);
console.log(canopyContainer);
