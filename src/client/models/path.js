import { defaultTopic, canopyContainer, projectPathPrefix } from 'helpers/getters';
import { selectedLink, metadataForLink } from 'helpers/getters';
import { slugFor } from 'helpers/identifiers';

class Path {
  constructor(argument) {
    if (!argument) {
      this.pathArray = [['', '']];
    } else if (Array.isArray(argument)) {
      if (argument.length === 0) {
        this.pathArray = [['', '']];
      } else {
        this.pathArray = JSON.parse(JSON.stringify(argument));
      }
      this.pathString = Path.arrayToString(this.pathArray);
    } else if (typeof argument === 'string' || argument instanceof String) {
      this.pathString = argument;
      this.pathArray = Path.stringToArray(this.pathString);
    }
  }

  equals(otherPath) {
    return this.string === otherPath.string;
  }

  addSegment(topic, subtopic) {
    if (this.empty) return new Path([[topic, subtopic]]);
    return new Path(this.pathArray.concat([[topic, subtopic]]));
  }

  newTerminalSubtopic(newSubtopic) {
    let lastSegment = this.lastSegment;
    return this.withoutLastSegment.addSegment(lastSegment.topic, newSubtopic);
  }

  toString() {
    return JSON.stringify(this.pathArray);
  }

  get array() {
    return this.pathArray;
  }

  get string() {
    return this.pathString;
  }

  get firstTopic() {
    return this.pathArray[0][0];
  }

  get topic() {
    return this.pathArray[0][0];
  }

  get rootPath() {
    return new Path([[this.topic, this.topic]]);
  }

  get firstSubtopic() {
    return this.pathArray[0][1];
  }

  get subtopic() {
    return this.pathArray[0][1];
  }

  get secondTopic() {
    return this.pathArray[1] && this.pathArray[1][0];
  }

  get secondSubtopic() {
    return this.pathArray[1] && this.pathArray[1][1];
  }

  get firstSegment() {
    return new Path([[this.pathArray[0][0], this.pathArray[0][1]]]);
  }

  get lastSegment() {
    return new Path(this.pathArray.slice(-1));
  }

  get withoutFirstSegment() {
    return new Path(this.pathArray.slice(1));
  }

  get withoutLastSegment() {
    return new Path(this.pathArray.slice(0, -1));
  }

  get clone() {
    return new Path(JSON.parse(JSON.stringify(this.pathArray)));
  }

  get length() {
    if (this.pathArray[0][0] === '') {
      return 0;
    } else {
      return this.pathArray.length;
    }
  }

  relativeSectionElement(suppliedRootElement) {
    let rootElement = suppliedRootElement;
    if (!suppliedRootElement) { rootElement = canopyContainer; }
    let path = this.clone;

    let currentNode = rootElement;
    if (rootElement === canopyContainer) {
      currentNode = rootElement.querySelector(
        `[data-topic-name="${path.firstTopic}"]` +
        `[data-subtopic-name="${path.firstSubtopic}"]` +
        `[data-path-depth="${0}"]`
      );
      if (path.length === 1) { return currentNode; }
    }

    for (let i = 0; i < path.length; i++) {
      if (!currentNode) { return null; }
      path = path.withoutFirstSegment;
      let newPathDepth = Number(currentNode.dataset.pathDepth) + 1;

      currentNode = currentNode.querySelector(
        `[data-topic-name="${path.firstTopic}"]` +
        `[data-subtopic-name="${path.firstSubtopic}"]` +
        `[data-path-depth="${newPathDepth}"]`
      );
    }

    return currentNode;
  }

  get sectionElement() {
    return this.relativeSectionElement(canopyContainer);
  }

  get empty() {
    return this.pathArray[0][0] === '';
  }

  static get default() {
    return new Path([[defaultTopic, defaultTopic]]);
  }

  static get current() {
   let pathString = window.location.pathname + window.location.hash;
    if (pathString.indexOf(projectPathPrefix) === 0) {
      pathString = pathString.slice(projectPathPrefix.length);
    }

    return new Path(pathString);
  }

  static get initial() {
    if (Path.current.empty) {
      return Path.default;
    } else {
      return Path.current;
    }
  }

  static forTopic(topicName) {
    return new Path([[topicName, topicName]]);
  }

  static stringToArray(pathString) {
    if (pathString.indexOf(projectPathPrefix) === 0) {
      pathString = pathString.slice(projectPathPrefix.length);
    }

    if (pathString === '/') {
      return [['','']];
    }

    let slashSeparatedUnits = pathString.
      replace(/_/g, ' ').
      split('/').
      filter((string) => string !== '');

    slashSeparatedUnits = Path.fixOrphanSubtopics(pathString, slashSeparatedUnits);

    let pathArray = slashSeparatedUnits.map((slashSeparatedUnit) => {
      // Capture two groups: (letters)#(optional_more_letters)
      let match = slashSeparatedUnit.match(/([^#]*)(?:#([^#]*))?/);
      return [
        match[1] || match[2] || null,
        match[2] || match[1] || null,
      ];
    }).filter((segment) => segment[0] !== null);

    return pathArray;
  }

  static arrayToString(pathArray) {
    if (Array.isArray(pathArray) && pathArray.length === 0) {
      return '/';
    }

    if (!(Array.isArray(pathArray) && Array.isArray(pathArray[0]))) {
      throw 'Path array must be two-dimensional array';
    }

    let pathString = '/';

    if (projectPathPrefix) {
      pathString += projectPathPrefix;
    }

    pathString += pathArray.map(([topic, subtopic]) => {
      let pathSegmentString = slugFor(topic);
      if (subtopic && subtopic !== topic) {
        pathSegmentString += "#" + slugFor(subtopic);
      }
      return pathSegmentString;
    }).join('/');

    return pathString;
  }

  static fixOrphanSubtopics(pathString, slashSeparatedUnits) {
    // eg /Topic/#Subtopic/A#B  -> /Topic#Subtopic/A#B

    if (pathString.match(/\/#\w+/)) {
      for (let i = 1; i < slashSeparatedUnits.length; i++) {
        if (slashSeparatedUnits[i].match(/^#/)) {
          if (!slashSeparatedUnits[i - 1].match(/#/)) { // eg /Topic/#Subtopic -> /Topic#Subtopic
            let newItem = slashSeparatedUnits[i - 1] + slashSeparatedUnits[i];
            let newArray = slashSeparatedUnits.slice(0, i - 1).
              concat([newItem]).
              concat(slashSeparatedUnits.slice(i + 1));
            return newArray;
          } else { // eg /Topic#Subtopic/#Subtopic2 -> /Topic#Subtopic/Subtopic2
            let newItem = slashSeparatedUnits[i].slice(1);
            let newArray = slashSeparatedUnits.slice(0, i).
              concat([newItem]).
              concat(slashSeparatedUnits.slice(i + 1));
            return newArray;
          }
        }
      }
    }

    return slashSeparatedUnits;
  }

  static setPath(newPath, displayOptions) {
    let oldPath = Path.current;
    let documentTitle = newPath.firstTopic;
    let historyApiFunction = newPath.equals(oldPath) ? replaceState : pushState;

    historyApiFunction(
      metadataForLink(selectedLink()),
      documentTitle,
      newPath.string
    );

    function replaceState(a, b, c) {
      history.replaceState(a, b, c);
    }

    function pushState(a, b, c) {
      history.pushState(a, b, c);
    }
  }
}

export default Path;
