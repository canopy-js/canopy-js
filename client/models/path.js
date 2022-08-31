import { defaultTopic, canopyContainer, projectPathPrefix, hashUrls } from 'helpers/getters';
import Paragraph from 'models/paragraph';
import Topic from '../../cli/commands/shared/topic';

class Path {
  constructor(argument) {
    if (!argument) {
      this.pathArray = [];
    } else if (Array.isArray(argument)) {
      if (argument.length === 0) {
        this.pathArray = [];
      } else {
        this.pathArray = argument.slice();
        Path.validatePathArray(this.pathArray);
      }
      this.pathString = Path.arrayToString(this.pathArray);
    } else if (typeof argument === 'string' || argument instanceof String) {
      this.pathArray = Path.stringToArray(argument);
      this.pathString = Path.arrayToString(this.pathArray); // array formation removes invalid segments so we reform the string
    }
  }

  equals(otherPath) {
    return this.string === otherPath.string;
  }

  static validatePathArray(array) {
    array.forEach(tuple => {
      if (tuple.length !== 2) throw newError(`Invalid path segment format: ${tuple}`);
      if (!(tuple[0] instanceof Topic) || !(tuple[1] instanceof Topic)) throw newError(`Invalid path segment format: ${tuple}`);
    })
  }

  addSegment(topic, subtopic) {
    if (this.empty) return new Path([[topic, subtopic]]);
    return new Path(this.pathArray.concat([[topic, subtopic]]));
  }

  replaceTerminalSubtopic(newSubtopic) {
    let lastSegment = this.lastSegment;
    return this.withoutLastSegment.addSegment(lastSegment.firstTopic, newSubtopic);
  }

  toString() {
    return this.string;
  }

  get array() {
    return this.pathArray;
  }

  get string() {
    return this.pathString;
  }

  get rootTopicPath() {
    return new Path([[this.firstTopic, this.firstTopic]]);
  }

  get firstTopic() {
    return this.pathArray[0][0];
  }

  get firstSubtopic() {
    return this.pathArray[0][1];
  }

  get secondTopic() {
    return this.pathArray[1] && this.pathArray[1][0];
  }

  get secondSubtopic() {
    return this.pathArray[1] && this.pathArray[1][1];
  }

  get firstSegment() {
    return new Path(this.pathArray.slice(0, 1));
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

  get length() {
    if (!this.pathArray[0]) {
      return 0;
    } else {
      return this.pathArray.length;
    }
  }

  get sectionElement() {
    return Path.elementAtRelativePath(this, canopyContainer);
  }

  get paragraph() {
    if (this.sectionElement) {
      return new Paragraph(this.sectionElement);
    } else {
      return null;
    }
  }

  get empty() {
    return !this.pathArray[0];
  }

  static get default() {
    let topic = Topic.fromMixedCase(defaultTopic);
    return new Path([[topic, topic]]);
  }

  static get current() {
    let pathString = window.location.href.slice(window.location.origin.length)

    if (projectPathPrefix && pathString.indexOf(`/${projectPathPrefix}`) === 0) {
      pathString = pathString.slice(projectPathPrefix.length + 1); // remove prefix and leading slash
    }

    if (pathString.indexOf('/#') === 0) pathString = pathString.slice(2);  // remove hash sign plus leading slash

    return new Path(pathString);
  }

  static get currentOrDefault() {
    if (Path.current.empty) {
      return Path.default;
    } else {
      return Path.current;
    }
  }

  static forTopic(topic) {
    return new Path([[topic, topic]]);
  }

  static forSegment(topic, subtopic) {
    return new Path([[topic, subtopic]]);
  }

  static stringToArray(pathString) {
    if (typeof pathString !== 'string') throw newError("Function requires string argument");

    if (pathString === '/') {
      return [];
    }

    let slashSeparatedUnits = pathString.
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

    pathArray = pathArray.map(([topicString, subtopicString]) => [
      Topic.fromEncodedSlug(topicString),
      Topic.fromEncodedSlug(subtopicString)
    ]);

    return pathArray;
  }

  static arrayToString(pathArray) {
    if (!Array.isArray(pathArray)) throw newError('Argument must be array');

    if (Array.isArray(pathArray) && pathArray.length === 0) {
      return '/';
    }

    if (!Array.isArray(pathArray[0])) {
      throw newError('Path array must be two-dimensional array');
    }

    let pathString = '/';

    pathString += pathArray.map(([topic, subtopic]) => {
      let pathSegmentString = topic.slug;
      if (subtopic && subtopic.slug !== topic.slug) {
        pathSegmentString += "#" + subtopic.slug;
      }
      return pathSegmentString;
    }).join('/');

    return pathString;
  }

  static fixOrphanSubtopics(pathString, slashSeparatedUnits) {
    // Sometimes browsers insert forward slashes before the first pound sign which we have to remove
    // eg /Topic/#Subtopic/A#B  -> /Topic#Subtopic/A#B

    if (typeof pathString !== 'string') throw newError("pathString must be a string argument");
    if (!Array.isArray(slashSeparatedUnits)) throw newError('slashSeparatedUnits must be an array');

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

  static connectingLinkValid(parentElement, pathToDisplay) {
    if (!parentElement) throw newError('Parent element required');
    if (!(pathToDisplay instanceof Path)) throw newError('pathToDisplay must be a Path object');

    if (parentElement === canopyContainer) return true;

    let parentParagraph = new Paragraph(parentElement);
    if (!parentParagraph.linkByTarget(pathToDisplay.firstTopic)) {
      console.error(`Parent element [${parentParagraph.topic.mixedCase}, ${parentParagraph.subtopic.mixedCase}] has no ` +
        `connecting link to subsequent path segment [${pathToDisplay.firstTopic}, ${pathToDisplay.firstTopic}]`);
      return false;
    } else {
      return true;
    }
  }

  static elementAtRelativePath(suppliedPath, suppliedRootElement) {
    if (!(suppliedPath instanceof Path)) throw newError('pathToDisplay must be a Path object');
    if (!suppliedRootElement || !suppliedRootElement.tagName) 'Root element must be a DOM node';

    let rootElement = suppliedRootElement;
    if (!suppliedRootElement) { rootElement = canopyContainer; }
    let path = suppliedPath;

    let currentNode = rootElement;
    if (rootElement === canopyContainer) {
      currentNode = rootElement.querySelector(
        `[data-topic-name="${path.firstTopic.escapedMixedCase}"]` +
        `[data-subtopic-name="${path.firstSubtopic.escapedMixedCase}"]` +
        `[data-path-depth="${0}"]`
      );

      if (path.length === 1) { return currentNode; }
      if (!currentNode) return null;
      path = path.withoutFirstSegment;
    }

    let subpath = path;
    for (let i = 0; i < path.length; i++) {
      let newPathDepth = Number(currentNode.dataset.pathDepth) + 1;
      currentNode = currentNode.querySelector(
        `[data-topic-name="${subpath.firstTopic.escapedMixedCase}"]` +
        `[data-subtopic-name="${subpath.firstSubtopic.escapedMixedCase}"]` +
        `[data-path-depth="${newPathDepth}"]`
      );

      if (!currentNode) return null;
      subpath = subpath.withoutFirstSegment;
    }

    return currentNode;
  }

  static setPath(newPath) {
    if (!(newPath instanceof Path)) throw newError('newPath must be Path object');

    let oldPath = Path.current;
    let documentTitle = newPath.firstTopic.display;
    let historyApiFunction = newPath.equals(oldPath) ? replaceState : pushState;
    let fullPathString = (projectPathPrefix ? `/${projectPathPrefix}` : '') + (hashUrls ? '/#' : '') + newPath.string;

    historyApiFunction(
      history.state, // this will be changed via Link#persistInHistory
      documentTitle,
      fullPathString
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
