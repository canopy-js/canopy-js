import { defaultTopic, canopyContainer, projectPathPrefix, hashUrls } from 'helpers/getters';
import Paragraph from 'models/paragraph';
import Link from 'models/link';
import Topic from '../../cli/shared/topic';
import updateView from 'display/update_view';
import { getCanonicalTopic } from 'requests/request_json';

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

  ancestorOf(otherPath) { // strict ancestor: lexical prefix or DOM parent within same-length subtopic chains
    if (!(otherPath instanceof Path)) return false;
    if (this.empty || otherPath?.empty) return false;
    if (this.length > otherPath.length) return false;
    if (otherPath.isSingleTopic) return false;
    if (this.equals(otherPath)) return false; // strict: not equal

    // Case 1: purely lexical, child extends this /A/B -> A/B/C or /A/B -> A/B#C
    if (otherPath.startsWith(this)) return true;


    // Case 2: topics match but some subtopic diverges, e.g. A/B#C and A/B#D, or A/B#C and A/B#D/E
    if (!this.paragraph || !otherPath.paragraph) {
      throw new Error(`ancestorOf requires DOM paragraphs for non-lexical checks: ${!this.paragraph ? this.string : otherPath.string}`);
    }

    const divergenceIndex = otherPath.segments.findIndex(([topic, subtopic], i) => {
      const mySeg = this.segments[i];
      if (!mySeg) return true; // other is longer but not a lexical prefix; treat as divergence
      const topicsMatch = topic?.equals(mySeg[0]);
      const subtopicsMatch = subtopic?.equals(mySeg[1]);
      return !topicsMatch || !subtopicsMatch;
    });

    let cursor = otherPath.slice(0, divergenceIndex + 1); // truncate after diverging segment
    while (cursor) { // walk DOM parents from point of divergence.
      if (cursor.equals(this)) return true;
      const parentPath = cursor.parentPath;
      if (!parentPath || parentPath.equals(cursor)) break;
      cursor = parentPath;
    }
    return false;
  }

  descendantOf(otherPath) {
    return otherPath?.ancestorOf(this);
  }

  includesTopic(topic) {
    return this.array.find(([currentTopic, _]) => {
      return topic.equals(currentTopic);
    });
  }

  get string() {
    return this.pathString;
  }

  get empty() {
    return !this.array[0];
  }

  slice() {
    return new this.constructor(this.array.slice(...arguments));
  }

  sliceAfterLastTopicInstance(topic) {
    return new this.constructor(this.array.slice(0, this.array.findLastIndex(([t]) => t.equals(topic)) + 1)); // after
  }

  sliceBeforeLastTopicInstance(topic) {
    return new this.constructor(this.array.slice(0, this.array.findLastIndex(([t]) => t.equals(topic)))); // after
  }

  get segments() {
    return this.array;
  }

  getSegment(i) {
    return this.array[i];
  }

  getSegmentTopic(i) {
    return this.array[i][0];
  }

  getSegmentSubtopic(i) {
    return this.array[i][1];
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

  get isSingleTopic() {
    return this.array.length === 1 && this.array[0][0].equals(this.array[0][1]);
  }

  get parentPath() {
    return this.paragraph?.parentParagraph?.path;
  }

  get parentParagraph() {
    if (this.lastSegment.isSingleTopic) { // in case child paragraph for last segment isn't rendered yet
      return this.withoutLastSegment.paragraph;
    }

    return this.paragraph.parentParagraph;
  }

  get parentLink() {
    return this.paragraph.parentLink;
  }

  get parentLinks() {
    return this.paragraph.parentLinks;
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
        if (selectedSegment[0].equals(currentSegment[0]) && selectedIndex < currentIndex) {
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
    let topicFirstIndex = {};
    let cycle = null;

    for (let i = 0; i < this.array.length; i++) {
      const topic = this.array[i][0];
      const topicKey = topic.mixedCase;

      if (topicFirstIndex.hasOwnProperty(topicKey)) {
        cycle = { start: topicFirstIndex[topicKey], end: i };
        break;
      } else {
        topicFirstIndex[topicKey] = i;
      }
    }

    if (cycle) {
      return new Path(this.array.slice(0, cycle.start).concat(this.array.slice(cycle.end)));
    }

    return this.clone();
  }

  get containsBackCycle() {
    return this.reduce().ancestorOf(this);
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

  initialLexicalOverlap(otherPath) { // Purely lexical overlap that stops at the first mismatch (topic or subtopic).
    if (this.empty || otherPath.empty) return null;
    if (!this.firstTopic.equals(otherPath.firstTopic)) return null;

    const minLen = Math.min(this.length, otherPath.length);
    let segments = [];

    for (let i = 0; i < minLen; i++) {
      const [topic1, subtopic1] = this.array[i];
      const [topic2, subtopic2] = otherPath.array[i];
      if (!topic1.equals(topic2)) break;
      if (!subtopic1.equals(subtopic2)) {
        segments.push([topic1, topic1]); // overlap at topic boundary when subtopics diverge
        return new Path(segments);
      }
      segments.push([topic1, subtopic1]);
    }

    if (segments.length === 0) return null;
    return new Path(segments);
  }

  initialOverlap(otherPath) {
    if (this.empty || otherPath.empty) return null;
    if (this.firstTopic.mixedCase !== otherPath.firstTopic.mixedCase) return null;
    if (this.equals(otherPath)) return this;

    for (let i = 0; i < Math.min(this.array.length, otherPath.array.length); i++) { // doesn't assume both paths in DOM
      const [topic1, subtopic1] = this.array[i];
      const [topic2, subtopic2] = otherPath.array[i];

      if (topic1.equals(topic2)) { // topics match
        if (subtopic1.equals(subtopic2)) { // initial overlap may continue into further segments
          if (i + 1 === Math.min(this.array.length, otherPath.array.length)) { // we reached the end of one of the arrays
            return this.slice(0, i + 1);
          } else {
            continue;
          }
        } else {
          break; // diversions that break within a segment require DOM-based .parentPath approach
        }
      } else if (i > 0) { // topics not equal but previous segments matched, end initial overlap after previous segment
        return this.slice(0, i); // slicing with current index will give segments before this one
      }
    }

    const lexicalOverlap = this.initialLexicalOverlap(otherPath);
    if (!lexicalOverlap) return null;

    const ancestorStrings = (path) => {
      const result = [];
      let cursor = path;
      while (cursor) {
        result.push(cursor.string);
        if (cursor.lastSegment.isSingleTopic) break; // stop at topic root of current segment
        if (!cursor.parentPath || cursor.parentPath.equals(cursor)) break;
        cursor = cursor.parentPath;
      }
      return result;
    };

    const thisAncestors = ancestorStrings(this);
    let cursor = otherPath;
    while (cursor) {
      if (thisAncestors.includes(cursor.string)) return cursor;
      if (cursor.lastSegment.isSingleTopic) break;
      if (!cursor.parentPath || cursor.parentPath.equals(cursor)) break;
      cursor = cursor.parentPath;
    }

    return lexicalOverlap;
  }

  linkTo(otherPath) {  // in this (enclosing) paragraph, which link is open for child otherPath
    let targetTopic;
    let targetSubtopic;
    const divergingIndex = this.length - 1;
    const sharesPrefix = otherPath.startsWithSegments(this.slice(0, divergingIndex));

    if (sharesPrefix) {
      const thisTopic = this.getSegmentTopic(divergingIndex);
      const thisSubtopic = this.getSegmentSubtopic(divergingIndex);
      const otherTopic = otherPath.getSegmentTopic(divergingIndex);
      const otherSubtopic = otherPath.getSegmentSubtopic(divergingIndex);

      if (thisTopic?.equals(otherTopic) && !thisSubtopic?.equals(otherSubtopic)) {
        // Diverges within the same segment: target the differing subtopic.
        targetTopic = otherTopic;
        targetSubtopic = otherSubtopic;
      } else if (otherPath.startsWithSegments(this) && otherPath.length > this.length) { // extends by full segment
        targetTopic = otherPath.getSegmentTopic(this.length); // first segment after this
        targetSubtopic = otherPath.getSegmentSubtopic(this.length); // matching subtopic of that segment
      }
    }

    if (!targetTopic || !targetSubtopic) return null; // e.g. otherPath was not a descendant of this

    const matches = this.paragraph.links.filter(link => {
      const inlinePath = link.inlinePath;
      return inlinePath?.equals(otherPath) || inlinePath?.ancestorOf(otherPath);
    });
    if (!matches.length) return null;

    return matches.find(link => link.inlinePath?.equals(otherPath)) || matches[0];
  }

  isBefore(otherPath) { // two initially overlapping paths, in the paragraph of divergence, which parent link is earlier?
    let overlapPath = this.initialOverlap(otherPath);
    if (!overlapPath) return null;

    let thisParentLink = overlapPath.linkTo(this);
    let otherParentLink = overlapPath.linkTo(otherPath);
    if (!thisParentLink?.element || !otherParentLink?.element) return null;

    return !!(thisParentLink.element.compareDocumentPosition(otherParentLink.element) & Node.DOCUMENT_POSITION_FOLLOWING);
  }

  twoStepChange(otherPath) { // an overlap that is not a subset or equivalence
    return this.initialOverlap(otherPath)
      && !this.equals(otherPath)
      && !this.ancestorOf(otherPath)
      && !otherPath.ancestorOf(this);
  }

  fulcrumLink(otherPath) { // parent link of first paragraph of otherPath under overlap paragraph
    const enclosingParagraphPath = this.initialOverlap(otherPath);
    if (!enclosingParagraphPath) return null;
    if (!enclosingParagraphPath.ancestorOf(otherPath)) return null;
    if (enclosingParagraphPath.equals(otherPath)) return null; // nothing to link if same path
    return enclosingParagraphPath.linkTo(otherPath);
  }

  intermediaryPathsTo(otherPath) {

    if (!otherPath.startsWith(this)) return null; // we only handle straight path increases from shorter this to longer otherPath
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

  startsWith(prefixPath) {
    if (!(prefixPath instanceof Path)) return false;
    if (prefixPath.length > this.length) return false;

    // Fast exact-segment prefix check.
    if (`${this.pathString}/`.startsWith(`${prefixPath.pathString}/`)) return true;
    // Fast topic-level → subtopic check (e.g., /A/B#C starts with /A/B).
    const lastIndexFast = prefixPath.length - 1;
    const prefixAtTopicLevelFast = Topic.areEqual(prefixPath.getSegmentTopic(lastIndexFast), prefixPath.getSegmentSubtopic(lastIndexFast));
    if (prefixAtTopicLevelFast && `${this.pathString}`.startsWith(`${prefixPath.pathString}#`)) return true;

    for (let i = 0; i < prefixPath.length; i++) {
      const thisSingleTopic = this.getSegmentTopic(i);
      const thisSubtopic = this.getSegmentSubtopic(i);
      const prefixTopic = prefixPath.getSegmentTopic(i);
      const prefixSubtopic = prefixPath.getSegmentSubtopic(i);

      if (!Topic.areEqual(thisSingleTopic, prefixTopic)) return false; // topics must match

      const isLast = i === prefixPath.length - 1;
      if (!isLast) { // earlier segments must match exactly
        if (!Topic.areEqual(thisSubtopic, prefixSubtopic)) return false;
      } else {
        const prefixAtTopicLevel = Topic.areEqual(prefixTopic, prefixSubtopic);
        if (!(prefixAtTopicLevel || Topic.areEqual(thisSubtopic, prefixSubtopic))) return false; // either /A and /A#B or /A#B and /A#B
      }
    }

    return true;
  }

  // Exact segment match: topics and subtopics must both match at every segment.
  startsWithSegments(prefixPath) {
    if (!(prefixPath instanceof Path)) return false;
    if (prefixPath.length > this.length) return false;
    for (let i = 0; i < prefixPath.length; i++) {
      const thisTopic = this.getSegmentTopic(i);
      const thisSubtopic = this.getSegmentSubtopic(i);
      const prefixTopic = prefixPath.getSegmentTopic(i);
      const prefixSubtopic = prefixPath.getSegmentSubtopic(i);
      if (!Topic.areEqual(thisTopic, prefixTopic)) return false;
      if (!Topic.areEqual(thisSubtopic, prefixSubtopic)) return false;
    }
    return true;
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
    const recapitalized = this.recapitalize;
    if (recapitalized.string !== this.string && Paragraph.byPath(recapitalized)) {
      return Paragraph.byPath(recapitalized);
    }
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

  static lastRenderedPath = null;

  static get rendered() {
    return Paragraph.selection?.path || Path.lastRenderedPath;  // fall back to last known rendered path
  }

  static get url() {
    const hash = window.location.hash || '';
    const fileProtocol = typeof window !== 'undefined' && window.location?.protocol === 'file:';

    if (hashUrls && fileProtocol) { // file:// with hash routing: ignore pathname to avoid treating file path segments as topics
      let hashPathString = '';
      if (hash.startsWith('#/')) hashPathString = hash.slice(2);
      else if (hash.startsWith('#')) hashPathString = hash.slice(1);
      return new Path(hashPathString);
    }

    if (hash.startsWith('#/')) { // hash-routing: interpret entire route from hash
      let hashPathString = hash.slice(2);
      if (hashPathString.startsWith('/')) hashPathString = hashPathString.slice(1);
      return new Path(hashPathString);
    }

    let pathString = window.location.href.slice(window.location.origin.length); // preserves raw ? as part of path

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
    if (!rootElement?.dataset?.pathDepth) return null;

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

    if (currentNode === canopyContainer) return null;

    return currentNode;
  }

  static setPath(newPath, linkToSelect, options = {}) {
    if (!(newPath instanceof Path)) throw new Error('newPath must be Path object');
    if (options.popState) return; // the URL has already changed
    const fileHashRouting = hashUrls && typeof window !== 'undefined' && window.location?.protocol === 'file:';

    if (fileHashRouting) { // file:// cannot change pathname; rely on hash updates
      const fileHashString = `#${newPath.pathString}`;
      if (window.location.hash !== fileHashString) window.location.hash = fileHashString;
      return;
    }

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

    if (hashUrls) {
      const fileProtocol = typeof window !== 'undefined' && window.location?.protocol === 'file:';
      productionPathString += fileProtocol ? '#' : '/#'; // file:// cannot change pathname via history API
    }

    return productionPathString + this.pathString;
  }

  get recapitalize() {
    return new Path(
      this.array.map(([topic, subtopic]) => [
        getCanonicalTopic(topic, topic),
        getCanonicalTopic(topic, subtopic),
      ])
    );
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
