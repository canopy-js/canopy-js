import canopyContainer from 'helpers/getters';

const validateClientHtml= () => {
  if (!canopyContainer) {
    throw new Error('Page must have an html element with id "_canopy"');
  }
}

export {
  validateClientHtml
}
