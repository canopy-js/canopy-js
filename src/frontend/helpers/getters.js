import { slugFor } from 'helpers/identifiers';

const canopyContainer = document.getElementById('_canopy');
if(!canopyContainer) {
  throw new Error('Page must have an html element with id "_canopy"');
}

const defaultTopic = document.getElementById('_canopy').dataset.defaultTopic;
if(!defaultTopic) {
  throw new Error('HTML element with id "_canopy" must have a default topic data attribute');
}

const sectionElementOfTopic = (topicName, subtopicName) => {
  return document.querySelector('#_canopy #_canopy_' + topicName + '_' + subtopicName );
}

export {
  canopyContainer,
  defaultTopic,
  sectionElementOfTopic
};
