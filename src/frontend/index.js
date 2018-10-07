import { canopyContainer, defaultTopic } from 'display/getters';
import displayTopic from 'display/display_topic';

// if no url
displayTopic(defaultTopic);

// if url
displayTopic(window.location);

window.addEventListener('hashchange', (e) => {

});
