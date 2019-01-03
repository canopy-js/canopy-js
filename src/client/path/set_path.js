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
  let newTopicName = newPathArray[0][0];
  let newSubtopicName = newPathArray[0][1];
  let oldPathArray = parsePathString();

  let replaceState = (a, b, c) => { history.replaceState(a, b, c) };
  let pushState = (a, b, c) => {
    history.pushState(a, b, c);
  };
  let historyApiFunction = newPathArray === oldPathArray ? replaceState : pushState;

  historyApiFunction(
    metadataFromLink(selectedLink()),
    '',
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

  // let popStateEvent = new PopStateEvent(
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
