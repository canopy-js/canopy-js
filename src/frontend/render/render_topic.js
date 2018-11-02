import requestJson from 'requests/request_json';
import { canopyContainer } from 'helpers/getters';
import renderDomTree from 'render/render_dom_tree';
import displayPath from 'display/display_path'
import { sectionElementOfTopic } from 'helpers/getters';
import { firstLinkOfSection } from 'keys/relationships';
import { defaultTopic, linkOfNumber } from 'helpers/getters';
import setPathAndFragment from 'helpers/set_path_and_fragment';

const renderTopic = (topicName, subtopicName, selectLinkFromParent, selectLinkNumber) => {
  var existingSectionElement = sectionElementOfTopic(topicName, subtopicName)
  var linkElement = linkIfProvided(selectLinkFromParent, selectLinkNumber, existingSectionElement);

  if(existingSectionElement) {
    createOrReplaceHeader(topicName);
    displayPath(
      topicName,
      subtopicName,
      linkElement
    );
    return;
  }

  requestJson(topicName, function(dataObject) {
    var paragraphsBySubtopic = dataObject;

    createOrReplaceHeader(topicName);

    const domTree = renderDomTree(
      topicName,
      topicName,
      paragraphsBySubtopic,
      [],
      {}
    );

    canopyContainer.appendChild(domTree);

    displayPath(
      topicName,
      subtopicName,
      linkIfProvided(selectLinkFromParent, selectLinkNumber, domTree)
    );
  }, (e) => {
    setPathAndFragment(defaultTopic, null);
  });
}

function linkIfProvided(selectLinkFromParent, selectLinkNumber, existingSectionElement) {
  if (typeof selectLinkNumber === 'number') {
    var sectionOfLink = selectLinkFromParent ?
      existingSectionElement.parentNode :
      existingSectionElement;

    var link = linkOfNumber(selectLinkNumber, sectionOfLink);

    return link;
  } else {
    return null;
  }
}

function createOrReplaceHeader(topicName) {
  var existingHeader = document.querySelector('#_canopy h1')
  if (existingHeader) { existingHeader.remove(); }

  var headerTextNode = document.createTextNode(topicName)
  var headerDomElement = document.createElement('h1');
  headerDomElement.appendChild(headerTextNode);
  canopyContainer.prepend(headerDomElement);
};

export default renderTopic;
