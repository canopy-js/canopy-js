import { defaultTopic, canopyContainer, projectPathPrefix, hashUrls } from 'helpers/getters';
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
        Path.validatePathArray(this.pathArray);
      }
      this.pathString = Path.arrayToString(this.pathArray);
    } else if (typeof argument === 'string' || argument instanceof String) {
      this.pathArray = Path.stringToArray(argument);
      this.pathString = Path.arrayToString(this.pathArray); // array formation removes invalid segments so we reform the string
    }
  }

  equals(otherPath) {
    if (!otherPath) return false;
    return this.string === otherPath.string;
  }

  isIn(otherPath) { // is otherPath a subpath of this
    if (this.equals(otherPath)) return true;
    if (otherPath.isSingleTopic) return false;
    return this.isIn(otherPath.paragraph.parentParagraph.path);
  }

  includes(otherPath) {
    return otherPath.isIn(this);
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
    this.pathArray.forEach(callback);
  }

  slice() {
    return new Path(this.pathArray.slice.call(this.pathArray, ...arguments));
  }

  get segments() {
    return this.pathArray;
  }

  clone() {
    return new Path(this.pathArray.slice());
  }

  get cycle() {
    let cycle = null;

    this.pathArray.forEach((selectedSegment, selectedIndex) => {
      this.pathArray.forEach((currentSegment, currentIndex) => {
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

    if (cycle) {
      const pathWithoutCycle = [
        ...this.pathArray.slice(0, cycle.start),
        ...this.pathArray.slice(cycle.end)
      ];
      resultPath = new Path(pathWithoutCycle);
    } else {
      resultPath = this.clone();
    }

    return resultPath;
  }

  overlap(otherPath) {
    if (this.firstTopic.mixedCase !== otherPath.firstTopic.mixedCase) return null;
    let candidatePath = otherPath;

    while (!candidatePath.isSingleTopic) {
      if (this.includes(candidatePath)) return candidatePath;
      candidatePath = candidatePath.parentPath;
    }

    return candidatePath;
  }

  isSubset(otherPath) { // this is subset of otherPath
    return otherPath.includes(this);
  }

  intermediaryPaths(otherPath) {
    if (!this.overlap(otherPath)) return null;
    if (!this.isSubset(otherPath)) return null;

    let result = [];
    let bufferPath = otherPath.clone();

    while(bufferPath && !this.equals(bufferPath)) {
      result.unshift(bufferPath);
      bufferPath = bufferPath.parentPath;
    }

    result.unshift(this);

    return result;
  }

  sibling(otherPath) {
    return !!(this.parentPath && otherPath.parentPath) && // if either doesn't have a parent it can't have siblings
      !this.equals(otherPath) && // doesn't count if the paths are the same
      this.parentPath.equals(otherPath.parentPath);
  }

  child(otherPath) { // this is child of otherPath
    return this.parentPath?.equals(otherPath);
  }

  parent(otherPath) { // this is parent of otherPath
    return otherPath.parentPath?.equals(this);
  }

  display(options) {
    if (options?.newTab) return window.open(location.origin + this.string, '_blank');
    return updateView(this, this.parentLink, {noDisplay: options.selectALink, ...options}).then(() => { // prepare the DOM so there is a link to select
      if (options.selectALink) this.nextLink.select({scrollTo: 'link', noDisplay: false, ...options });
    });
  }

  static validatePathArray(array) {
    array.forEach(tuple => {
      if (tuple.length !== 2) throw new Error(`Invalid path segment format: ${tuple}`);
      if (!(tuple[0] instanceof Topic) || !(tuple[1] instanceof Topic)) throw new Error(`Invalid path segment format: ${JSON.stringify(tuple)}`);
    })
  }

  addSegment(topic, subtopic) {
    if (this.empty) return new Path([[topic, subtopic]]);
    return new Path(this.pathArray.concat([[topic, subtopic]]));
  }

  append(otherPath) {
    return new Path(this.string + '/' + otherPath.string);
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
    if (this.length > 0) {
      return new Path([[this.firstTopic, this.firstTopic]]);
    } else {
      return this;
    }
  }

  get firstTopic() {
    return this.pathArray[0][0];
  }

  get lastTopic() {
    return this.lastSegment.topic;
  }

  get topic() {
    return this.lastSegment.pathArray[0]?.[0];
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

  get isSingleTopic() {
    return this.pathArray.length === 1 && this.pathArray[0][0].mixedCase === this.pathArray[0][1].mixedCase;
  }

  get length() {
    if (!this.pathArray[0]) {
      return 0;
    } else {
      return this.pathArray.length;
    }
  }

  get topicArray() {
    return this.pathArray.map(([topic, subtopic]) => topic);
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

  get present() {
    return !!this.pathArray[0];
  }

  static animate(pathToDisplay, options) { // we animate when the new path overlaps a bit but goes in a different direction
    if (!Path.rendered) return false;  // user may be changing URL first so we use path from DOM

    return !Path.rendered.equals(pathToDisplay) &&
      !options.noScroll &&
      !options.initialLoad &&
      !options.noAnimate &&
      options.scrollStyle !== 'instant' &&
      Path.rendered.present &&
      !!Path.rendered.overlap(pathToDisplay) &&
      !Path.rendered.sibling(pathToDisplay) &&
      !Path.rendered.child(pathToDisplay) &&
      !Path.rendered.parent(pathToDisplay);
  }

  static get default() {
    let topic = Topic.for(defaultTopic);
    return new Path([[topic, topic]]);
  }

  static get current() {
    return Path.rendered || Path.url;
  }

  static get rendered() {
    return Paragraph.selection?.path;  // the user may have just changed the URL, and we want to know what the current path rendered is
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
    if (Path.url.present && Link.priorSelection) {
      return Link.priorSelection.previewPath;
    } else if (Path.url.empty) {
      return Path.default;
    } else {
      return Path.url;
    }
  }

  static forTopic(topic) {
    return new Path([[topic, topic]]);
  }

  static forSegment(topic, subtopic) {
    return new Path([[topic, subtopic]]);
  }

  static stringToArray(pathString) {
    if (typeof pathString !== 'string') throw new Error("Function requires string argument");

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
    if (!Array.isArray(pathArray)) throw new Error('Argument must be array');

    if (Array.isArray(pathArray) && pathArray.length === 0) {
      return '/';
    }

    if (!Array.isArray(pathArray[0])) {
      throw new Error('Path array must be two-dimensional array');
    }

    let pathString = '/';

    if (projectPathPrefix) pathString += `${projectPathPrefix}/`;

    if (hashUrls) pathString += '#/';

    pathString += pathArray.map(([topic, subtopic]) => {
      let pathSegmentString = topic.url;
      if (subtopic && subtopic.url !== topic.url) {
        pathSegmentString += "#" + subtopic.url;
      }
      return pathSegmentString;
    }).join('/');

    return pathString;
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

  static connectingLinkValid(parentElement, pathToDisplay) {
    if (!parentElement) throw new Error('Parent element required');
    if (!(pathToDisplay instanceof Path)) throw new Error('pathToDisplay must be a Path object');

    if (parentElement === canopyContainer) return true;

    let parentParagraph = new Paragraph(parentElement);
    if (!parentParagraph.linkByTarget(pathToDisplay.firstTopic)) {
      console.error(`Parent element [${parentParagraph.topic.mixedCase}, ${parentParagraph.subtopic.mixedCase}] has no ` +
        `connecting link to subsequent path segment [${pathToDisplay.firstTopic.mixedCase}, ${pathToDisplay.firstTopic.mixedCase}]`);
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
        `[data-topic-name="${subpath.firstTopic.escapedMixedCase}"]` +
        `[data-subtopic-name="${subpath.firstTopic.escapedMixedCase}"]` +
        `[data-path-depth="${currentPathDepth}"]` +
        (subpath.firstTopic.mixedCase !== subpath.firstSubtopic.mixedCase ? // only look for a subtopic if the path segment has one
        ` ` +
        `[data-topic-name="${subpath.firstTopic.escapedMixedCase}"]` +
        `[data-subtopic-name="${subpath.firstSubtopic.escapedMixedCase}"]` +
        `[data-path-depth="${currentPathDepth}"]` : '')
      );

      if (!currentNode) return null;
      subpath = subpath.withoutFirstSegment;
    }

    if (!currentNode) console.log('element at relative path', path, rootElement, currentNode);

    return currentNode;
  }

  static setPath(newPath) {
    if (!(newPath instanceof Path)) throw new Error('newPath must be Path object');

    let oldPath = Path.url;
    let documentTitle = newPath.firstTopic.display;
    let historyApiFunction = (Path.url.empty || newPath.equals(oldPath)) ? replaceState : pushState;
    let fullPathString = newPath.string;

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
