import { slugFor } from 'helpers/identifiers';
import {
  topicNameFromUrl,
  subtopicNameFromUrl
} from 'helpers/url_parsers';
import {
  selectedLink,
  documentTitleFor,
  uniqueSubtopic,
  metadataFromLink
} from 'helpers/getters';

const setPathAndFragment = (topicName, subtopicName) => {
  var replaceState = (a, b, c) => { history.replaceState(a, b, c) };
  var pushState = (a, b, c) => {
    history.pushState(a, b, c);
  };
  var historyApiFunction = topicNameFromUrl() === topicName ? replaceState : pushState;

  historyApiFunction(
    metadataFromLink(selectedLink()),
    documentTitleFor(topicName, subtopicName),
    pathFor(topicName, subtopicName)
  );

  function pathFor(topicName, subtopicName) {
    return '/' + slugFor(topicName) +
      (uniqueSubtopic(topicName, subtopicName) ?
        `#${slugFor(subtopicName)}` : '')
  }

  // var popStateEvent = new PopStateEvent(
  //   'popstate',
  //   {
  //     state: nextLinkNumberAndLinkTypeAsObject(
  //       selectedLinkInParentSection,
  //       selectedLinkNumber
  //     )
  //   }
  // );

  // dispatchEvent(popStateEvent);
}
// function nextLinkNumberAndLinkTypeAsObject(selectedLinkInParentSection, selectedLinkNumber) {
//   return {
//     selectedLinkNumber,
//     selectedLinkInParentSection
//   };
// }

export default setPathAndFragment;
