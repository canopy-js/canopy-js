import Path from 'models/path';
import Link from 'models/link';
import { canopyContainer } from 'helpers/getters';
import ScrollableContainer from 'helpers/scrollable_container';
import Topic from '../../cli/shared/topic';

class Paragraph {
  // A paragraph instance represents a visible paragraph, not
  // specifically the DOM element of type paragraph.
  //
  // Visible paragraphs in the UI are created with a section element
  // that has a paragraph element child.
  //
  // paragraph.sectionElement returns the section element, whereas
  // paragraph.paragraphElement returns the paragraph element.

  constructor(sectionElement) {
    if (!sectionElement || sectionElement.tagName !== 'SECTION' ) throw new Error("Paragraph instantiation requires section element");
    if (!sectionElement.classList.contains('canopy-section')) throw new Error("Paragraph class requires Canopy section element");

    const path = sectionElement.dataset.pathString;
    let cachedParagraph = Paragraph.byPath(path);
    if (cachedParagraph && cachedParagraph.sectionElement !== sectionElement) throw new Error(`Multiple DOM objects instantiated for single sectionElement`);
    if (cachedParagraph) return cachedParagraph;

    this.sectionElement = sectionElement;
    this.transferDataset();
  }

  static from(sectionElement) {
    return new this(sectionElement);
  }

  equals(otherParagraph) {
    if (!otherParagraph) return false;
    return this.sectionElement === otherParagraph.sectionElement;
  }

  allocateSpace() {
    this.sectionElement.style.display = 'block';
    this.sectionElement.style.opacity = '0%';
  }

  display() {
    this.sectionElement.style.display = 'block';
    this.sectionElement.style.opacity = '100%'; // prevents early webkit playwright spec bug before fix

    // Fixes firefox unicode bug
    this.paragraphElement.style.unicodeBidi = 'unset';
    requestAnimationFrame(() => {
      this.paragraphElement.style.unicodeBidi = 'plaintext';
    });
  }

  get element() {
    throw new Error("Depreciated in favor of #sectionElement property");
  }

  transferDataset() { // This is so we can more easily debug in the console
    this._topicName = this.sectionElement.dataset.topicName;
    this._subtopicName = this.sectionElement.dataset.subtopicName;
    this._pathString = this.sectionElement.dataset.pathString;
    this.pathDepth = Number(this.sectionElement.dataset.pathDepth);
  }

  get isVisible() {
    return window.getComputedStyle(this.sectionElement).display !== 'none';
  }

  get isFocused() {
    const rect = this.paragraphElement.getBoundingClientRect();
    const viewportHeight = ScrollableContainer.visibleHeight;

    const topLimit = viewportHeight * 0.1;
    const bottomLimit = viewportHeight * 0.5;

    return rect.top > topLimit && rect.top < bottomLimit;
  }

  get topic () {
    return Topic.fromMixedCase(this.sectionElement.dataset.topicName);
  }

  get subtopic () {
    return Topic.fromMixedCase(this.sectionElement.dataset.subtopicName);
  }

  get topicName() {
    return this.topic.mixedCase;
  }

  get subtopicName() {
    return this.subtopic.mixedCase;
  }

  get paragraphElement() {
    let paragraphElement = Array.from(this.sectionElement.childNodes).
      find((element) => element.tagName === 'P');

    if (!paragraphElement) throw new Error("Paragraph has no paragraph element");
    return paragraphElement;
  }

  get path() {
    return new Path(this.sectionElement.dataset.pathString);
  }

  get literalPath() {
    return Path.forSegment(this.topic, this.subtopic);
  }

  get topicPath() {
    return this.path.lastSegment.firstTopicPath;
  }

  get pathDown() { // path from the paragraph down the page
    return this.path.slice(this.pathDepth);
  }

  get links() {
    if (this.linkObjects) return this.linkObjects;
    let linkElements = this.paragraphElement.querySelectorAll('a.canopy-selectable-link');
    this.linkObjects = Array.from(linkElements).map((element) => new Link(element));
    return this.linkObjects;
  }

  get simpleGlobalLinks() {
    return this.links.filter(l => l.isSimpleGlobal);
  }

  get pathReferenceLinks() {
    return this.links.filter(l => l.isPathReference);
  }

  openPathReferenceLinksFor(currentPath) {
    return this.pathReferenceLinks.filter(l =>
      l.isOpenPathReferenceFor(currentPath, this.path)
    );
  }

  get linkElements() {
    return Array.from(this.paragraphElement.querySelectorAll('.canopy-selectable-link'));
  }

  get firstLink() {
    return this.links[0] || null;
  }

  nthLink(n) {
    return this.links[n] || null;
  }

  get lastLink() {
    return this.links[this.links.length - 1] || null;
  }

  get previousLink() {
    return Link.lastSelectionOfParagraph(this);
  }

  get isPageRoot() {
    return this.parentNode === canopyContainer
  }

  get hasLinks() {
    return this.links.length > 0;
  }

  linkBySelector(callback) {
    return this.links.find(callback);
  }

  linksBySelector(callback) {
    return this.links.filter(callback);
  }

  linkByChild(givenTopic, givenSubtopic) {
    return this.linkBySelector(
      (link) =>
        (link.isGlobal && link.childTopic.caps === givenTopic?.caps) ||
        (link.isLocal && link.targetSubtopic.caps === givenSubtopic?.caps)
    );
  }

  get parentLinkCandidates() {
    return this.parentParagraph.linksBySelector(
      (link) =>
        (link.isGlobal && link.childTopic.caps === this.topic.caps) ||
        (link.isLocal && link.targetSubtopic.caps === this.subtopic.caps));

  }

  get parentLinks() {
    if (this.isPageRoot) { return null; }

    const parentParagraph = this.parentParagraph;
    if (!parentParagraph) return null; // safety

    // Get all candidate parent links
    const parentLinkCandidates = this.parentLinkCandidates;

    // if paragraph is subtopic, parent link must be local reference in parent - return all to allow multiple parent links
    if (!this.path.lastSegment.isTopic) {
      return parentParagraph.links.filter(link => link.isLocal && Topic.areEqual(link.targetSubtopic, this.subtopic));
    }

    // If any open path references, put them first, then everything else
    const openPathParents = parentLinkCandidates.filter(link => link.isOpenPathReference);
    if (openPathParents.length) {
      const rest = parentLinkCandidates.filter(l => !openPathParents.includes(l));
      return [...openPathParents, ...rest];
    }

    // If simple globals exist: use only them, ignore closed path refs
    const simpleGlobals = parentParagraph.simpleGlobalLinks.filter(link =>
      Topic.areEqual(link.childTopic, this.path.lastSegment.firstTopic)
    );
    if (simpleGlobals.length) {
      return simpleGlobals;
    }

    // If open parent is also selected link, put it first but return all parents
    if (parentParagraph.linkElements.includes(Link.selection?.element) && Link.selection?.childParagraph?.equals(this)) {
      return [Link.selection, ...parentLinkCandidates.filter(link => !link.equals(Link.selection))];
    }

    // if there are multiple global links beginning with the given topic, prefer the last selection (instead of returning all for simplicity)
    let lastSelectionOfParent = Link.lastSelectionOfParagraph(parentParagraph);
    if (parentLinkCandidates.length > 0 && lastSelectionOfParent && parentLinkCandidates.find(l => l.equals(lastSelectionOfParent))) {
      return [lastSelectionOfParent, ...parentLinkCandidates.filter(l => !l.equals(lastSelectionOfParent))];
    }

    // otherwise return all results
    return parentLinkCandidates;
  }

  get parentLink() {
    return this.parentLinks?.[0];
  }

  get displayTopicName() {
    return this.sectionElement.dataset.displayTopicName;
  }

  get parentParagraph() {
    if (!this.parentNode || this.parentNode.tagName !== 'SECTION') { // we require this.parentNode so don't search the DOM
      return null;
    }
    return Paragraph.for(this.parentNode);
  }

  get topicParagraph() {
    if (this.isTopic) return this;

    const topicSection = this.sectionElement.parentNode.closest('.canopy-topic-section');
    if (!topicSection) throw new Error('Missing topic paragraph');
    return Paragraph.for(topicSection);
  }

  get isTopic() {
    return this.topic.equals(this.subtopic);
  }

  get isInDom() {
    return canopyContainer.contains(this.sectionElement);
  }

  get isBig() {
    let paragraphPercent = this.paragraphElement.offsetHeight / ScrollableContainer.visibleHeight;
    return paragraphPercent > .75;
  }

  get fits() {
    let paragraphPercent = this.paragraphElement.offsetHeight / ScrollableContainer.visibleHeight;
    return paragraphPercent < .8;
  }

  get top() {
    return this.paragraphElement.getBoundingClientRect().top;
  }

  get bottom() {
    return this.paragraphElement.getBoundingClientRect().bottom;
  }

  get positionOnViewport() {
    const rect = this.paragraphElement.getBoundingClientRect();
    const viewportHeight = ScrollableContainer.visibleHeight;
    const top = rect.top;

    if (top < 0) return -1;
    if (top > viewportHeight) return Infinity;
    return (top / viewportHeight) * 100;
  }

  static get selection() {
    return Paragraph.current;
  }

  static get current() {
    const sectionElement = document.querySelector('.canopy-selected-section');
    return sectionElement ? Paragraph.for(sectionElement) : null;
  }

  addSelectionClass() {
    this.sectionElement.classList.add('canopy-selected-section');
  }

  removeSelectionClass() {
    this.sectionElement.classList.remove('canopy-selected-section');
  }

  scrollComplete() {
    this.sectionElement.classList.add('canopy-scroll-complete');
  }

  static get root() {
    let path = Path.current.firstTopicPath;
    return path.paragraph;
  }

  static containingLink(link) {
    if (!(link instanceof Link)) throw new Error("Must provide link instance argument");
    const sectionElement = link.element.parentNode.closest('.canopy-section');
    return Paragraph.for(sectionElement);
  }

  static get visible() {
    let path = Path.rendered;
    let paragraphs = [];

    while (path) {
      paragraphs.push(path.paragraph);
      path = path.parentPath;
    }

    return paragraphs;
  }

  static atY(integerY) {
    return Paragraph.visible.reduce((bestParagraph, currentParagraph) => {
      if (bestParagraph.top < integerY && bestParagraph.bottom > integerY) return bestParagraph;
      if (currentParagraph.top < integerY && currentParagraph.bottom > integerY) return currentParagraph;
      return Math.abs(bestParagraph.top - integerY) < Math.abs(currentParagraph.top - integerY) ? bestParagraph : currentParagraph;
    });
  }

  // Shadow DOM
  static paragraphsByPath = {};
  static byPath(pathString) {
    if (!pathString) return null;
    if (pathString instanceof Path) pathString = pathString.pathString;
    if (!this.paragraphsByPath[pathString]?.parentNode) return null; // cache functions haven't run
    return this.paragraphsByPath[pathString];
  }

  removeFromDom() {
    this.sectionElement.parentNode.removeChild(this.sectionElement);
  }

  addToDom() {
    if (!this.parentNode) {
      throw new Error('sectionElement missing parentNode');
    }

    if (this.parentParagraph) {
      this.parentParagraph.addToDom(); // ensure parent first
    }

    if (this.sectionElement.parentNode !== this.parentNode) {
      this.parentNode.appendChild(this.sectionElement);
    }
  }

  executePostDisplayCallbacks() {
    this.sectionElement.postDisplayCallbacks?.forEach(callback => callback());
    this.sectionElement.postDisplayCallbacks = [];
  }

  valid() { // to avoid errors with temp sections appended for styling info
    return !!this.dataset.topicName;
  }

  static registerChild(childElement, parentElement) {
    const childParagraph = Paragraph.registerNode(childElement);
    childParagraph.parentNode = parentElement; // including canopyContainer
  }

  static registerNode(sectionElement) {
    const path = sectionElement.dataset.pathString;
    const existing = Paragraph.byPath(path);

    if (existing) {
      if (existing.sectionElement !== sectionElement) throw new Error("Multiple DOM objects instantiated for single sectionElement");
      return existing;
    }

    const paragraph = new Paragraph(sectionElement);
    this.paragraphsByPath[path] = paragraph;
    return paragraph;
  }

  static registerSubtopics(sectionElement) {
    Array.from(sectionElement.querySelectorAll('.canopy-section'))
      .forEach(section => {
        Paragraph.registerChild(section, section.parentNode);
      });
  }

  static detachSubtopics(sectionElement) { // separate the subtopics from parents until attached to DOM
    Array.from(sectionElement.querySelectorAll('.canopy-section'))
      .forEach(sectionElement => {
        sectionElement.parentNode.removeChild(sectionElement);
      })
  }

  static get all() {
    return Array.from(document.querySelectorAll('.canopy-section')).map(sectionElement => Paragraph.for(sectionElement));
  }

  static get focused() {
    return Paragraph.atY(ScrollableContainer.visibleHeight * 0.3 + ScrollableContainer.currentScroll);
  }

  static get contentLoaded() {
    return !!(document.querySelector('h1.canopy-header') && document.querySelector('section.canopy-section')); // this is a proxy for whether the first render has occured yet
  }

  static enableDisplayInProgress() {
    canopyContainer.dataset.displayInProgress = 'true';
  }

  static disableDisplayInProgress() {
    canopyContainer.dataset.displayInProgress = 'false';
  }

  static get displayInProgress() {
    return canopyContainer.dataset.displayInProgress === 'true';
  }

  static for(element) {
    return new Paragraph(element); // handles caching logic
  }
}

export default Paragraph;
