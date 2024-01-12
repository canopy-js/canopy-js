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
      candidatePath = candidatePath.parentPath;
    }

    return candidatePath;
  }

  subsetOf(otherPath) { // this is subset of otherPath
    return otherPath.includes(this);
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

    return updateView(this, this.parentLink, {renderOnly: options.selectALink, ...options}).then(() => { // prepare the DOM so there is a link to select
      if (options.selectALink) this.nextLink.select({ selectALink: false, ...options});
    });
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
    if (this.sectionElement) {
      return new Paragraph(this.sectionElement);
    } else {
      return null;
    }
  }

  get present() {
    return !!this.array[0];
  }

  static animate(pathToDisplay, linkToSelect, options = {}) { // we animate when the new path overlaps a bit but goes in a different direction
    if (!Path.rendered) return false;  // user may be changing URL first so we use path from DOM
    let currentPath = Link.selection?.effectivePathReference ? Link.selection.childPath : Path.rendered; // selected path reference is focal point not previewed path
    let newPath = (linkToSelect?.effectivePathReference && !options.scrollToParagraph) ? linkToSelect.childPath : pathToDisplay;

    return !currentPath.equals(newPath) &&
      !options.noScroll &&
      !options.initialLoad &&
      !options.noAnimate &&
      !options.noDisplay &&
      options.scrollStyle !== 'instant' &&
      currentPath.present &&
      !Link.selection?.siblingOf(linkToSelect) && // eg going from previewed path reference to sibling path reference
      !!currentPath.overlap(newPath) &&
      !currentPath.subsetOf(newPath) && // then we should just go down normally
      !currentPath.siblingOf(newPath) &&
      !currentPath.childOf(newPath) &&
      !currentPath.parentOf(newPath);
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

    if (projectPathPrefix) productionPathString += `${projectPathPrefix}/`;

    if (hashUrls) productionPathString += '#';

    return productionPathString + this.pathString;
  }
}

// Copy instance methods and getters/setters from SimplePath
Object.getOwnPropertyNames(SimplePath.prototype).forEach(prop => {
  if (prop !== 'constructor') {
    if (Path.prototype.hasOwnProperty(prop)) {
      throw new Error(`Property collision: ${prop} already exists on Path`);
    }
    const descriptor = Object.getOwnPropertyDescriptor(SimplePath.prototype, prop);
    Object.defineProperty(Path.prototype, prop, descriptor);
  }
});

// Copy static methods from SimplePath
Object.getOwnPropertyNames(SimplePath).forEach(prop => {
  if (prop !== 'prototype' && prop !== 'length' && prop !== 'name') {
    if (Path.hasOwnProperty(prop)) {
      throw new Error(`Static property collision: ${prop} already exists on Path`);
    }
    const descriptor = Object.getOwnPropertyDescriptor(SimplePath, prop);
    Object.defineProperty(Path, prop, descriptor);
  }
});

export default Path;
