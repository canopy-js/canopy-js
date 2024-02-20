import { defaultTopic, canopyContainer, projectPathPrefix, hashUrls } from 'helpers/getters';
import ScrollableContainer from 'helpers/scrollable_container';
import Paragraph from 'models/paragraph';
import Link from 'models/link';
import Topic from '../../cli/shared/topic';
import updateView from 'display/update_view';

class Path {
  constructor(argument) {
    if (!argument) {
      this.pathArray = [];
    } else if (Array.isArray(argument)) {
      if (argument.length === 0) {
        this.pathArray = [];
      } else {
        this.pathArray = argument.slice();
        Path.validatePathArray(this.array);
      }
      this.pathString = Path.arrayToString(this.array);
    } else if (typeof argument === 'string' || argument instanceof String) {
      this.pathArray = Path.stringToArray(argument);
      this.pathString = Path.arrayToString(this.array); // array formation removes invalid segments so we reform the string
    }
  }

  get length() {
    if (!this.pathArray[0]) {
      return 0;
    } else {
      return this.pathArray.length;
    }
  }

  static stringToArrayCache = {};

  static stringToArray(pathString) {
    if (typeof pathString !== 'string') throw new Error("Function requires string argument");
    if (this.stringToArrayCache.hasOwnProperty(pathString)) return this.stringToArrayCache[pathString];

    if (pathString === '/') {
      return [];
    }

    let slashSeparatedUnits = pathString.
      split('/').
      filter((string) => string !== '');

    slashSeparatedUnits = Path.fixOrphanSubtopics(pathString, slashSeparatedUnits);

    let array = slashSeparatedUnits.map((slashSeparatedUnit) => {
      // Capture two groups: (letters)#(optional_more_letters)
      let match = slashSeparatedUnit.match(/([^#]*)(?:#([^#]*))?/);
      return [
        match[1] || match[2] || null,
        match[2] || match[1] || null,
      ];
    }).filter((segment) => segment[0] !== null);

    array = array.map(([topicString, subtopicString]) => [
      Topic.fromEncodedSlug(topicString),
      Topic.fromEncodedSlug(subtopicString)
    ]);

    this.stringToArrayCache[pathString] = array;
    return array;
  }

  static arrayToString(array) {
    if (!Array.isArray(array)) throw new Error('Argument must be array');

    if (Array.isArray(array) && array.length === 0) {
      return '/';
    }

    if (!Array.isArray(array[0])) {
      throw new Error('Path array must be two-dimensional array');
    }

    let pathString = '/';

    pathString += array.map(([topic, subtopic]) => {
      let pathSegmentString = topic.url;
      if (subtopic && subtopic.url !== topic.url) {
        pathSegmentString += "#" + subtopic.url;
      }
      return pathSegmentString;
    }).join('/');

    return pathString;
  }

  equals(otherPath) {
    if (!otherPath) return false;
    return this.string === otherPath.string;
  }

  isIn(otherPath) { // is otherPath a subpath of this
    if (!otherPath) return false;
    if (this.equals(otherPath)) return true;
    if (otherPath.isSingleTopic) return false;
    if (this.isSegmentOf(otherPath)) return true; // trying to figure it out before DOM is rendered
    if (this.visitsTopicNotIn(otherPath)) return false // trying to figure it out before DOM is rendered
    return this.isIn(otherPath?.paragraph?.parentParagraph.path);
  }

  visitsTopicNotIn(otherPath) {
    return this.topicStringArray.some(topic => !otherPath.topicStringArray.includes(topic));
  }

  isSegmentOf(otherPath) { // the visible path string has subset
    return otherPath.string.includes(this.string);
  }

  includes(otherPath) {
    return otherPath.isIn(this);
  }

  get array() {
    return this.pathArray;
  }

  get string() {
    return this.pathString;
  }

  get empty() {
    return !this.array[0];
  }

  slice() {
    return new this.constructor(this.pathArray.slice.call(this.pathArray, ...arguments));
  }

  get segments() {
    return this.pathArray;
  }

  get firstTopic() {
    if (this.empty) return null;
    return this.pathArray[0][0];
  }

  get firstTopicPath() {
    return this.constructor.forSegment(this.pathArray[0][0], this.pathArray[0][0]);
  }

  get lastTopic() {
    return this.lastSegment.topic;
  }

  get topic() {
    return this.lastSegment.array[0]?.[0];
  }

  get firstSubtopic() {
    if (this.empty) return null;
    return this.pathArray[0][1];
  }

  get lastSubtopic() {
    return this.lastSegment.subtopic;
  }

  get secondTopic() {
    return this.pathArray[1] && this.pathArray[1][0];
  }

  get secondSubtopic() {
    return this.pathArray[1] && this.pathArray[1][1];
  }

  get firstSegment() {
    return new this.constructor(this.pathArray.slice(0, 1));
  }

  get lastSegment() {
    return new this.constructor(this.pathArray.slice(-1));
  }

  get withoutFirstSegment() {
    return new this.constructor(this.pathArray.slice(1));
  }

  get withoutLastSegment() {
    return new this.constructor(this.pathArray.slice(0, -1));
  }

  get isSingleTopic() {
    return this.pathArray.length === 1 && this.pathArray[0][0].mixedCase === this.pathArray[0][1].mixedCase;
  }

  get parentPath() {
    return this.paragraph?.parentParagraph?.path;
  }

  get parentLink() {
    return this.paragraph?.parentLink;
  }

  get nextLink() {
    return this.paragraph?.firstLink || this.paragraph?.parentLink;
  }

  forEach(callback) {
    this.array.forEach(callback);
  }

  clone() {
    return new Path(this.array.slice());
  }

  get cycle() {
    let cycle = null;

    this.array.forEach((selectedSegment, selectedIndex) => {
      this.array.forEach((currentSegment, currentIndex) => {
        if (selectedSegment[0].mixedCase === currentSegment[0].mixedCase && selectedIndex < currentIndex) {
          cycle = {
            start: selectedIndex,
            end: currentIndex
          };
        }
      });
    });

    return cycle;
  }

  reduce() {
    const cycle = this.cycle;
    let resultPath;

    // console.log(this.cycle)

    if (cycle) {
      const pathWithoutCycle = [
        ...this.array.slice(0, cycle.start),
        ...this.array.slice(cycle.end)
      ];
      resultPath = new Path(pathWithoutCycle);
    } else {
      resultPath = this.clone();
    }

    return resultPath;
  }

  static introducesNewCycle(parentPath, literalPath) {
    if (literalPath.reduce().length < literalPath.length) return true; // unlikely but technically this introduces cycle

    let parentPathTopicStrings = parentPath.topicArray.map(t => t.mixedCase); // we only want a cycle not already in parentPath
    let targetPathTopicStrings = literalPath.topicArray.map(t => t.mixedCase);
    return parentPathTopicStrings.some((enclosingTopicString, enclosingTopicIndex) => {
      return targetPathTopicStrings.some((targetTopicString, targetTopicIndex) => {
        return enclosingTopicString === targetTopicString &&
          !(parentPath.equals(parentPath.append(literalPath).reduce()))// Reject A/B/C -> C or A/B/C/C -> C, where reduction equals current path producing no-op
      });
    });
  }

  overlap(otherPath) {
    if (this.firstTopic.mixedCase !== otherPath.firstTopic.mixedCase) return null;
    let candidatePath = otherPath;

    while (!candidatePath.isSingleTopic) {
      if (this.includes(candidatePath)) return candidatePath;
      if (!candidatePath.parentPath) throw new Error(`Undefined parent path for ${candidatePath}`);
      candidatePath = candidatePath.parentPath;
    }

    return candidatePath;
  }

  subsetOf(otherPath) { // this is subset of otherPath
    return otherPath.includes(this) &&
      !this.equals(otherPath); // unlike #includes, which accepts a self-match
  }

  intermediaryPaths(otherPath) {
    if (!this.overlap(otherPath)) return null;
    if (!this.subsetOf(otherPath)) return null;

    let result = [];
    let bufferPath = otherPath.clone();

    while(bufferPath && !this.equals(bufferPath)) {
      result.unshift(bufferPath);
      bufferPath = bufferPath.parentPath;
    }

    result.unshift(this);

    return result;
  }

  get includedParagraphs() {
    let result = [];
    let currentParagraph = this.paragraph;
    while (currentParagraph) {
      result.push(currentParagraph);
      currentParagraph = currentParagraph.parentParagraph;
    }

    return result;
  }

  siblingOf(otherPath) {
    return !!(this.parentPath && otherPath.parentPath) && // if either doesn't have a parent it can't have siblings
      !this.equals(otherPath) && // doesn't count if the paths are the same
      this.parentPath.equals(otherPath.parentPath);
  }

  childOf(otherPath) { // this is child of otherPath
    return this.parentPath?.equals(otherPath);
  }

  parentOf(otherPath) { // this is parent of otherPath
    return otherPath.parentPath?.equals(this);
  }

  display(options = {}) {
    if (options?.newTab) return window.open(location.origin + this.string, '_blank');
    if (this.empty) return console.error('Cannot display empty path');

    return updateView(this, this.parentLink, options);
  }

  selectALink(options = {}) {
    return this.display({ renderOnly: true}).then(() => (this.paragraph.firstLink || this.paragraph.parentLink).select(options));
  }

  addSegment(topic, subtopic) {
    if (this.empty) return new Path([[topic, subtopic]]);
    return new Path(this.array.concat([[topic, subtopic]]));
  }

  append(otherPath) {
    return new Path(this.string + '/' + otherPath.string);
  }

  replaceTerminalSubtopic(newSubtopic) {
    if (this.length === 0) return this;
    let lastSegment = this.lastSegment;
    return this.withoutLastSegment.addSegment(lastSegment.firstTopic, newSubtopic);
  }

  get removeTerminalSubtopic() {
    if (this.length === 0) return this;
    let lastSegment = this.lastSegment;
    return this.withoutLastSegment.addSegment(lastSegment.firstTopic, lastSegment.firstTopic);
  }

  toString() {
    return this.string;
  }

  get rootTopicPath() {
    if (this.length > 0) {
      return new Path([[this.firstTopic, this.firstTopic]]);
    } else {
      return this;
    }
  }

  get topicArray() {
    return this.array.map(([topic, subtopic]) => topic);
  }

  get topicStringArray() {
    return this.array.map(([topic, subtopic]) => topic.mixedCase);
  }

  get sectionElement() {
    return Path.elementAtRelativePath(this, canopyContainer);
  }

  get paragraph() {
    if (Paragraph.byPath(this)) return Paragraph.byPath(this);

    if (this.sectionElement) {
      return new Paragraph(this.sectionElement);
    } else {
      return null;
    }
  }

  get parentParagraph() {
    return this.paragraph.parentParagraph;
  }

  get present() {
    return !!this.array[0];
  }

  static get default() {
    let topic = Topic.for(defaultTopic());
    return new Path([[topic, topic]]);
  }

  static get root() {
    return Path.url.rootTopicPath;
  }

  static get current() {
    return Path.rendered || Path.url;
  }

  static get rendered() {
    return Paragraph.selection?.path;  // the user may have just changed the URL, and we want to know what the current path rendered is
  }

  static get focused() {
    let focusY = ScrollableContainer.visibleHeight * 0.3 + ScrollableContainer.currentScroll;

    Array.from(document.querySelectorAll('.canopy-paragraph')).find(paragraphElement => {

    });
  }

  static get url() {
    let pathString = window.location.href.slice(window.location.origin.length)

    if (projectPathPrefix && pathString.indexOf(`/${projectPathPrefix}`) === 0) {
      pathString = pathString.slice(projectPathPrefix.length + 1); // remove prefix and leading slash
    }

    if (pathString.indexOf('/#') === 0) pathString = pathString.slice(2);  // remove hash sign plus leading slash

    return new Path(pathString);
  }

  static get initial() {
    if (Path.url.present && Link.savedSelection) {
      return Link.savedSelection.previewPath;
    } else if (Path.url.empty) {
      return Path.default;
    } else {
      return Path.url;
    }
  }

  static connectingLinkValid(parentElement, pathToAppend) {
    if (!parentElement) throw new Error('Parent element required');
    if (!(pathToAppend instanceof Path)) throw new Error('pathToAppend must be a Path object');

    if (parentElement === canopyContainer) return true;

    let parentParagraph = new Paragraph(parentElement);
    if (!parentParagraph.linkByChild(pathToAppend.firstTopic)) {
      console.error(`Parent element [${parentParagraph.topic.mixedCase}, ${parentParagraph.subtopic.mixedCase}] has no ` +
        `connecting link to subsequent path segment [${pathToAppend.firstTopic.mixedCase}, ${pathToAppend.firstTopic.mixedCase}]`);
      return false;
    } else {
      return true;
    }
  }

  static elementAtRelativePath(path, rootElement) {
    if (!(path instanceof Path)) throw new Error('pathToDisplay must be a Path object');
    rootElement = rootElement || canopyContainer;

    let currentNode = rootElement;
    let subpath = path;
    let currentPathDepth = Number(rootElement.dataset.pathDepth || -1);

    for (let i = 0; i < path.length; i++) {
      currentPathDepth = currentPathDepth + 1;
      currentNode = currentNode.querySelector(
        `:scope > ` + // the next topic must be a direct child of the current subtopic, not some other subtopic with the same global link
        `[data-topic-name="${subpath.firstTopic.cssMixedCase}"]` +
        `[data-subtopic-name="${subpath.firstTopic.cssMixedCase}"]` +
        `[data-path-depth="${currentPathDepth}"]` +
        (subpath.firstTopic.mixedCase !== subpath.firstSubtopic.mixedCase ? // only look for a subtopic if the path segment has one
        ` ` +
        `[data-topic-name="${subpath.firstTopic.cssMixedCase}"]` +
        `[data-subtopic-name="${subpath.firstSubtopic.cssMixedCase}"]` +
        `[data-path-depth="${currentPathDepth}"]` : '')
      );

      if (!currentNode) return null;
      subpath = subpath.withoutFirstSegment;
    }

    if (!currentNode) console.log('element at relative path', path, rootElement, currentNode);

    return currentNode;
  }

  static setPath(newPath, options = {}) {
    if (!(newPath instanceof Path)) throw new Error('newPath must be Path object');

    let oldPath = Path.url;
    let documentTitle = newPath.lastTopic.mixedCase;
    let historyApiFunction = ((Path.url.empty || newPath.equals(oldPath)) && !options.pushHistoryState) ? replaceState : pushState;
    let fullPathString = newPath.productionPathString;

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

  get productionPathString() {
    let productionPathString = '';

    if (projectPathPrefix) productionPathString += `/${projectPathPrefix}`;

    if (hashUrls) productionPathString += '/#';

    return productionPathString + this.pathString;
  }

  static fixOrphanSubtopics(pathString, slashSeparatedUnits) {
    // Sometimes browsers insert forward slashes before the first pound sign which we have to remove
    // eg /Topic/#Subtopic/A#B  -> /Topic#Subtopic/A#B

    if (typeof pathString !== 'string') throw new Error("pathString must be a string argument");
    if (!Array.isArray(slashSeparatedUnits)) throw new Error('slashSeparatedUnits must be an array');

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

  static validatePathArray(array) {
    array.forEach(tuple => {
      if (tuple.length !== 2) throw new Error(`Invalid path segment format: ${tuple}`);
      if (!(tuple[0] instanceof Topic) || !(tuple[1] instanceof Topic)) throw new Error(`Invalid path segment format: ${JSON.stringify(tuple)}`);
    })
  }

  static forTopic(topic) {
    return new this([[topic, topic]]);
  }

  static forSegment(topic, subtopic) {
    if (!(topic instanceof Topic && subtopic instanceof Topic)) throw new Error('Argument must be of type Topic');
    return new this([[topic, subtopic]]);
  }

  static for(arg) {
    return new this(arg);
  }

  static from(arg) {
    return new this(arg);
  }
}

export default Path;
