import { slugFor } from 'helpers/identifiers';
import {
  selectedLink,
  documentTitleFor,
  uniqueSubtopic,
  metadataFromLink
} from 'helpers/getters';
import parsePathString from 'path/parse_path_string';
import pathStringFor from 'path/path_string_for';

const setPathAndFragment = (newPathArray) => {
  var newTopicName = newPathArray[0][0];
  var newSubtopicName = newPathArray[0][1];
  var oldPathArray = parsePathString();

  var replaceState = (a, b, c) => { history.replaceState(a, b, c) };
  var pushState = (a, b, c) => {
    history.pushState(a, b, c);
  };
  var historyApiFunction = newPathArray === oldPathArray ? replaceState : pushState;

  historyApiFunction(
    metadataFromLink(selectedLink()),
    documentTitleFor(newTopicName, newSubtopicName),
    pathStringFor(newPathArray)
  );

  // function pathFor(topicName, subtopicName) {
  //   return '/' + slugFor(topicName) +
  //     (uniqueSubtopic(topicName, subtopicName) ?
  //       `#${slugFor(subtopicName)}` : '')
  // }

  // function pathStringFor(pathArray) {
  //   pathArray.map((tuple) => `${tuple[0]}#${tuple[1]}`).join('/');
  // }

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
