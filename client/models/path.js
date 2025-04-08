import { defaultTopic, canopyContainer, projectPathPrefix, hashUrls } from 'helpers/getters';
import Paragraph from 'models/paragraph';
import Link from 'models/link';
import Topic from '../../cli/shared/topic';
import updateView from 'display/update_view';

class Path {
  constructor(argument) {
    if (!argument) {
      this.array = [];
    } else if (Array.isArray(argument)) {
      if (argument.length === 0) {
        this.array = [];
      } else {
        this.array = argument.slice();
        Path.validatePathArray(this.array);
      }
      this.pathString = Path.arrayToString(this.array);
    } else if (typeof argument === 'string' || argument instanceof String) {
      this.array = Path.stringToArray(argument);
      this.pathString = Path.arrayToString(this.array); // array formation removes invalid segments so we reform the string
    }
  }

  get length() {
    if (!this.array[0]) {
      return 0;
    } else {
      return this.array.length;
    }
  }

  static stringToArrayCache = {};

  static stringToArray(pathString) {
    if (typeof pathString !== 'string') throw new Error("Function requires string argument");
    if (this.stringToArrayCache.hasOwnProperty(pathString)) return this.stringToArrayCache[pathString];

    if (pathString === '/') {
      return [];
    }

    let slashSeparatedUnits = pathString
      .replace(/%5C%5C(%23|#)|%5C(%23|#)|(%23|#)/g, match => {
        if (match.startsWith('%5C%5C')) return '%5C%5C#'; // this is a name-character escaped backslash followed by path-#
        if (match.startsWith('%5C')) return '%5C#'; // this is a name-character #
        return '#'; // # or %23 are path-#
      })
      .split('/')
      .filter((string) => string !== '');

    slashSeparatedUnits = Path.fixOrphanSubtopics(pathString, slashSeparatedUnits);

    let array = slashSeparatedUnits.map((segmentString) => {
      let [topic, subtopic] = Topic.parseUrlSegment(segmentString);
      return [topic, subtopic || topic];
    }).filter(segment => segment[0]);

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
    if (otherPath.isTopic) return false;
    if (this.visitsTopicNotIn(otherPath)) return false // trying to figure it out before DOM is rendered
    if (`${otherPath.string}/`.includes(`${this.string}/`)) return true; // / to ensure not mid-topic match
    return this.isIn(otherPath?.paragraph?.parentParagraph.path);
  }

  visitsTopicNotIn(otherPath) {
    return this.topicStringArray.some(topic => !otherPath.topicStringArray.includes(topic));
  }

  includes(otherPath) {
    return otherPath.isIn(this);
  }

  includesTopic(topic) {
    return this.array.find(([currentTopic, _]) => {
      return Topic.areEqual(topic, currentTopic);
    });
  }

  get string() {
    return this.pathString;
  }

  get empty() {
    return !this.array[0];
  }

  slice() {
    return new this.constructor(this.array.slice.call(this.array, ...arguments));
  }

  sliceAfterLastTopicInstance(topic) {
    return new this.constructor(this.array.slice(0, this.array.findLastIndex(([t]) => Topic.areEqual(t, topic)) + 1)); // after
  }

  sliceBeforeLastTopicInstance(topic) {
    return new this.constructor(this.array.slice(0, this.array.findLastIndex(([t]) => Topic.areEqual(t, topic)))); // after
  }

  get segments() {
    return this.array;
  }

  get firstTopic() {
    if (this.empty) return null;
    return this.array[0][0];
  }

  get firstTopicPath() {
    return this.constructor.forSegment(this.array[0][0], this.array[0][0]);
  }

  get lastTopic() {
    return this.lastSegment.firstTopic;
  }

  get firstSubtopic() {
    if (this.empty) return null;
    return this.array[0][1];
  }

  get lastSubtopic() {
    return this.lastSegment.firstSubtopic;
  }

  get secondTopic() {
    return this.array[1] && this.array[1][0];
  }

  get secondSubtopic() {
    return this.array[1] && this.array[1][1];
  }

  get firstSegment() {
    return new this.constructor(this.array.slice(0, 1));
  }

  get lastSegment() {
    return new this.constructor(this.array.slice(-1));
  }

  get withoutFirstSegment() {
    return new this.constructor(this.array.slice(1));
  }

  get withoutLastSegment() {
    return new this.constructor(this.array.slice(0, -1));
  }

  get withoutLastSubtopic() {
    return new this.constructor(this.array.slice(0, -1)).append(Path.forTopic(this.lastTopic));
  }

  endsWith(otherPath) {
    // Check if there is at least one segment at the end of both paths that matches.
    const thisLength = this.array.length;
    const otherLength = otherPath.array.length;

    // If the other path is longer, it cannot be at the end of this path.
    if (otherLength > thisLength) {
      return false;
    }

    // Compare the segments starting from the end of both paths.
    for (let i = 1; i <= otherLength; i++) {
      const [thisTopic, thisSubtopic] = this.array[thisLength - i];
      const [otherTopic, otherSubtopic] = otherPath.array[otherLength - i];

      if (
        thisTopic.mixedCase !== otherTopic.mixedCase ||
        thisSubtopic.mixedCase !== otherSubtopic.mixedCase
      ) {
        return false;
      }
    }

    return true; 
  }

  get isTopic() {
    return this.array.length === 1 && Topic.areEqual(this.array[0][0], this.array[0][1]);
  }

  get parentPath() {
    return this.paragraph?.parentParagraph?.path;
  }

  get parentParagraph() {
    if (this.lastSegment.isTopic) { // in case child paragraph for last segment isn't rendered yet
      return this.withoutLastSegment.paragraph;
    }

    return this.paragraph.parentParagraph;
  }

  get parentLinks() {
    if (this.isTopic) { return null; }

    let paragraphWithLinks = this.lastSegment.isTopic ? this.withoutLastSegment.paragraph : this.parentParagraph;
  
    return paragraphWithLinks.linksBySelector(
      (link) =>
        (link.isGlobal && Topic.areEqual(link.childTopic, this.lastSegment.firstTopic)) ||
        (link.isLocal && Topic.areEqual(link.targetSubtopic, this.lastSegment.firstSubtopic))
    );
  }

  get parentLink() {
    if (this.isTopic) { return null; }

    if (this.parentParagraph.linkElements.includes(Link.selection?.element) && Link.selection?.childParagraph?.equals(this)) {
      return Link.selection; // when selected link is path reference and so is one of the open links also
    }

    // if paragraph is subtopic, parent link must be local reference in parent
    if (!this.lastSegment.isTopic) {
      return this.parentParagraph.links.find(link => link.isLocal && Topic.areEqual(link.targetSubtopic, this.paragraph.subtopic));
    }

    // if there are multiple global links beginning with the given topic, prefer the last selection
    let lastSelectionOfParent = Link.lastSelectionOfParagraph(this.parentParagraph);
    if (this.parentLinks.length > 1 && lastSelectionOfParent && this.parentLinks.find(l => l.equals(lastSelectionOfParent))) {
      return lastSelectionOfParent;
    }

    // if one of the potential parents is a simple global reference, prefer that over a longer path
    let simpleGlobalParent = this.parentParagraph && this.parentParagraph.links.find(
      link => link.isGlobal &&
        link.literalPath.length === 1 &&
        Topic.areEqual(link.childTopic, this.lastSegment.firstTopic) &&
        Topic.areEqual(link.childSubtopic, this.lastSegment.firstTopic)
    );
    if (simpleGlobalParent) return simpleGlobalParent;

    // otherwise pick the first matching link
    return this.parentParagraph && this.parentParagraph.links.find(
      link => link.isGlobal && Topic.areEqual(link.childTopic, this.lastSegment.firstTopic)
    );
  }

  firstParentLink() {
    return this.firstTopicPath.intermediaryPathsTo(this)[1].parentLink;
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

  get pageTitle() {
    if (this.firstTopic.mixedCase !== this.lastTopic.mixedCase) {
      return this.firstTopic.mixedCase + ': ' + this.lastTopic.mixedCase;
    } else {
      return this.firstTopic.mixedCase;
    }
  }

  get cycle() {
    let cycle = null;

    this.array.forEach((selectedSegment, selectedIndex) => {
      this.array.forEach((currentSegment, currentIndex) => {
        if (Topic.areEqual(selectedSegment[0], currentSegment[0]) && selectedIndex < currentIndex) {
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

  get containsBackCycle() {
    return this.reduce().subsetOf(this);
  }

  get containsForwardCycle() {
    return this.cycle && !this.containsBackCycle;
  }

  static introducesNewCycle(parentPath, literalPath) {
    if (literalPath.reduce().length < literalPath.length) return true; // unlikely but technically this introduces cycle

    let parentPathTopicStrings = parentPath.topicArray.map(t => t.mixedCase); // we only want a cycle not already in parentPath
    let targetPathTopicStrings = literalPath.topicArray.map(t => t.mixedCase);
    return parentPathTopicStrings.some((enclosingTopicString) => {
      return targetPathTopicStrings.some((targetTopicString) => {
        return enclosingTopicString === targetTopicString; //&&
          /// !(parentPath.equals(parentPath.append(literalPath).reduce()))// Reject A/B/C -> C or A/B/C/C -> C, where reduction equals current path producing no-op
      });
    });
  }

  initialOverlap(otherPath) {
    if (this.empty || otherPath.empty) return null;
    if (this.firstTopic.mixedCase !== otherPath.firstTopic.mixedCase) return null;
    
    for (let i = 0; i < Math.min(this.array.length, otherPath.array.length); i++) { // doesn't assume both paths in DOM
      const [topic1, subtopic1] = this.array[i];
      const [topic2, subtopic2] = otherPath.array[i];

      if (Topic.areEqual(topic1, topic2)) {
        if (Topic.areEqual(subtopic1, subtopic2)) {
          continue;
        } else {
          break; // diversions that break within a segment require .parentPath approach
        }
      } else { // topics not equal, divergence occurs at segment boundary
        return this.slice(0, i);
      }
    }

    let candidatePath = otherPath;
    while (!candidatePath.isTopic) {
      if (this.includes(candidatePath)) return candidatePath;
      if (!candidatePath.parentPath) throw new Error(`Undefined parent path for ${candidatePath}`);
      candidatePath = candidatePath.parentPath;
    }

    return candidatePath;
  }

  initialPartialOverlap(otherPath) { // an overlap that is not a subset or equivalence
    return this.initialOverlap(otherPath)
      && !this.equals(otherPath)
      && !this.subsetOf(otherPath)
      && !otherPath.subsetOf(this);
  }

  overlaps(otherPath) {
    return this.topicArray.some(t1 => otherPath.topicArray.some(t2 => Topic.areEqual(t1, t2)));
  }

  isBefore(otherPath) { // two initially overlapping paths, in the paragraph of divergence, which parent link is earlier?
    if (!this.initialOverlap(otherPath)) return null;
    let overlapPath = this.initialOverlap(otherPath);
    let thisParentLink = overlapPath.intermediaryPathsTo(this)[1].parentLink;
    let otherParentLink = overlapPath.intermediaryPathsTo(otherPath)[1].parentLink;

    if (thisParentLink.element.compareDocumentPosition(otherParentLink.element) & Node.DOCUMENT_POSITION_FOLLOWING) { // this is first
      return true;
    } else {
      return false;
    }
  }

  terminalOverlap(otherPath) { // e.g A/B/C B/C/D
    let lastInstanceOfFirstTopicOfOtherPath = this.array.findLastIndex(([t]) => Topic.areEqual(t, otherPath.firstTopic));
    if (lastInstanceOfFirstTopicOfOtherPath === -1) return false;
    let otherPathIndex = 0;

    for (let i = lastInstanceOfFirstTopicOfOtherPath; i < this.length; i++) {
      if (otherPathIndex >= otherPath.length) return false;
      if (!Topic.areEqual(this.array[i][0], otherPath.array[otherPathIndex][0])) return false;
      if (!Topic.areEqual(this.array[i][1], otherPath.array[otherPathIndex][1])) return false;
      otherPathIndex++;
    }

    return true; // got to the end without a difference
  }

  twoStepChange(otherPath) {
    return this.initialPartialOverlap(otherPath);
  }

  fulcrumLink(otherPath) { // parent link of first paragraph of otherPath under overlap paragraph
    if (this.includes(otherPath)) return otherPath.initialOverlapAndFirstChild(this).parentLink;
    return this.initialOverlapAndFirstChild(otherPath).parentLink;
  }

  initialOverlapAndFirstChild(otherPath) { // path of "this" plus first subtopic not in otherPath, to get parent link
    if (this.includes(otherPath)) return null; // this function assumes we are going down from "this" to "otherPath"
    let overlapPath = this.initialOverlap(otherPath);
    return overlapPath.intermediaryPathsTo(otherPath)[1];
  }

  subsetOf(otherPath) { // this is subset of otherPath
    return otherPath.includes(this) &&
      !this.equals(otherPath); // unlike #includes, which accepts a self-match
  }

  intermediaryPathsTo(otherPath) {
    if (!this.isIn(otherPath)) return null; // we only handle straight path increases
    let [shorterPath, longerPath] = [this, otherPath];
    let result = [];
    let bufferPath = longerPath.clone();

    while(bufferPath && !shorterPath.equals(bufferPath)) {
      result.unshift(bufferPath);
      bufferPath = bufferPath.parentPath;
    }

    result.unshift(this);

    return result;
  }

  get paragraphs() {
    let result = [];
    let currentParagraph = this.paragraph;
    while (currentParagraph) {
      result.push(currentParagraph);
      currentParagraph = currentParagraph.parentParagraph;
    }

    return result;
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
    if (options.options) throw 'Caller produced malformed options object';

    return updateView(this, null, options);
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

  get topicArray() {
    return this.array.map(([topic]) => topic);
  }

  get topicStringArray() {
    return this.array.map(([topic]) => topic.mixedCase);
  }

  get sectionElement() {
    return Path.elementAtRelativePath(this, canopyContainer);
  }

  get paragraph() {
    if (Paragraph.byPath(this)) return Paragraph.byPath(this);
    if (this.length === 0) return null;

    if (this.sectionElement) {
      return new Paragraph(this.sectionElement);
    } else {
      return null;
    }
  }

  get paragraphElement() {
    return this.paragraph.paragraphElement;
  }

  get present() {
    return !!this.array[0];
  }

  static get default() {
    let topic = Topic.for(defaultTopic());
    return new Path([[topic, topic]]);
  }

  static get root() {
    return Path.url.firstTopicPath;
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
    if (Path.url.present && Link.savedSelection) { // page doesn't exist yet so can't validate selection
      return Link.savedSelection.selectionPath;
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
    if (!parentParagraph.linkByChild(pathToAppend.firstTopic)) { // this can happen eg if a live project is edited eg a-> [c->] b
      console.error(`Parent element [${parentParagraph.topic.mixedCase}, ${parentParagraph.subtopic.mixedCase}] has no ` +
        `connecting link to subsequent path segment [${pathToAppend.firstTopic.mixedCase}]`);
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

    if (currentNode === canopyContainer) return null;

    return currentNode;
  }

  static setPath(newPath, linkToSelect, options = {}) {
    if (!(newPath instanceof Path)) throw new Error('newPath must be Path object');
    if (options.popState) return; // the URL has already changed

    let oldPath = Path.url;
    let documentTitle = newPath.lastTopic.mixedCase;

    let sameLinkSelection = 
      (!history.state?.linkSelection && !linkToSelect) ||
      (linkToSelect && history.state?.linkSelection && Link.for(history.state?.linkSelection).equals(linkToSelect));

    let replaceHistoryState = Path.url.empty || (newPath.equals(oldPath) && sameLinkSelection); // either the old one is bad or the new one is the same
    let historyApiFunction = replaceHistoryState ? replaceState : pushState;
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
