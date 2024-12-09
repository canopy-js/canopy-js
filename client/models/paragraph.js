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
    this.sectionElement = sectionElement;
    // this.parentNode = sectionElement.parentNode;
    this.transferDataset();

    let existingParagraph = Paragraph.byPath(this.sectionElement.dataset.pathString);
    if (existingParagraph) return existingParagraph;
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
    if (!this.element) return null;
    const rect = this.element.getBoundingClientRect();

    // Get the viewport height
    const viewportHeight = ScrollableContainer.visibleHeight;

    const topLimit = viewportHeight * 0.1;
    const bottomLimit = viewportHeight * 0.5;

    const topInRange = rect.top > topLimit;
    const bottomInRange = rect.top < bottomLimit;

    return topInRange && bottomInRange;
  }

  get topic () {
    return Topic.fromMixedCase(this.sectionElement.dataset.topicName);
  }

  get subtopic () {
    return Topic.fromMixedCase(this.sectionElement.dataset.subtopicName);
  }

  get topicName() {
    throw new Error("Depreciated in favor of #topic");
  }

  get subtopicName() {
    throw new Error("Depreciated in favor of #subtopic");
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

  get isRoot() {
    return this.sectionElement.parentNode === canopyContainer
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

  get parentLink() {
    if (this.parentNode === canopyContainer) { return null; } // with shadow dom can't assume section element is attached

    if (this.parentParagraph.linkElements.includes(Link.selection?.element) && Link.selection?.childParagraph?.equals(this)) {
      return Link.selection; // when selected link is path reference and so is one of the open links also
    }

    // if paragraph is subtopic, parent link must be local reference in parent
    if (!this.isTopic) {
      return this.parentParagraph.links.find(link => link.isLocal && link.targetSubtopic.caps === this.subtopic.caps);
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
        link.childTopic.caps === this.topic.caps &&
        link.childSubtopic.caps === this.topic.caps
    );
    if (simpleGlobalParent) return simpleGlobalParent;

    // otherwise pick the first matching link
    return this.parentParagraph && this.parentParagraph.links.find(
      link => link.isGlobal && link.childTopic.caps === this.topic.caps
    );
  }

  get parentLinks() {
    if (this.sectionElement.parentNode === canopyContainer) { return null; }

    return this.parentParagraph.linksBySelector(
      (link) =>
        (link.isGlobal && link.childTopic.caps === this.topic.caps) ||
        (link.isLocal && link.targetSubtopic.caps === this.subtopic.caps)
    );
  }

  get displayTopicName() {
    return this.sectionElement.dataset.displayTopicName;
  }

  get parentParagraph() {
    if (this.parentNode && this.parentNode.tagName === 'SECTION') return Paragraph.for(this.parentNode);

    if (this.sectionElement) {
      let parentElement = this.sectionElement?.parentNode?.closest('.canopy-section');
      return parentElement ? new Paragraph(parentElement) : null;
    } else {
      return null;
    }
  }

  get topicParagraph() {
    if (this.isTopic) {
      return this;
    } else {
      let topicParagraph = this.sectionElement.parentNode.closest('.canopy-topic-section');
      if (!topicParagraph) throw new Error('Missing topic paragraph');
      return new Paragraph(topicParagraph);
    }
  }

  get isTopic() {
    return Topic.areEqual(this.topic, this.subtopic);
  }

  get isInDom() {
    return !!this.sectionElement.closest('div#_canopy');
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
    if (!this.paragraphElement) return null;

    const rect = this.element.getBoundingClientRect();
    const viewportHeight = ScrollableContainer.visibleHeight;
    const elementTop = rect.top;

    if (elementTop < 0) return -1;
    if (elementTop > viewportHeight) return Infinity;

    // Calculate the percentage of the viewport the element's top is at
    const percentageInView = (elementTop / viewportHeight) * 100;

    return percentageInView;
  }

  static get selection() {
    return Paragraph.current;
  }

  static get current() {
    let sectionElement = document.querySelector('.canopy-selected-section');
    if (sectionElement) {
      return new Paragraph(sectionElement);
    } else {
      return null;
    }
  }

  static removeSelectionClass() {
    document.querySelector('.canopy-selected-section')?.classList.remove('canopy-selected-section');
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
    let sectionElement = link.element.parentNode.closest('.canopy-section');
    return new Paragraph(sectionElement);
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
    return this.paragraphsByPath[pathString];
  }

  removeFromDom() {
    this.sectionElement.parentNode.removeChild(this.sectionElement);
  }

  addToDom() {
    if (!this.parentNode) throw new Error('Every sectionElement must have parentNode');
    this.parentNode.appendChild(this.sectionElement); // attach bottom up so added to the DOM all at once.
    if (this.parentParagraph) this.parentParagraph.addToDom(); // recurse
    if (this.path.isTopic) return canopyContainer.appendChild(this.sectionElement); // base
  }

  static registerNode(sectionElement) {
    let paragraph = Paragraph.byPath(sectionElement.dataset.pathString) || Paragraph.for(sectionElement);
    Paragraph.paragraphsByPath[sectionElement.dataset.pathString] = paragraph;
  }

  static registerChild(childElement, parentElement) {
    Paragraph.registerNode(childElement);
    let childParagraph = Paragraph.byPath(childElement.dataset.pathString)
    childParagraph.parentNode = parentElement; // including canopyContainer, to reassemble DOM later
  }

  static registerSubtopics(sectionElement) { // take a rendered tree and register all nodes and adjacencies
    Array.from(sectionElement.querySelectorAll('.canopy-section'))
      .forEach(sectionElement => {
        Paragraph.registerNode(sectionElement)
        Paragraph.registerChild(sectionElement, sectionElement.parentNode);
      })
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
    return !!(document.querySelector('h1.canopy-header') && document.querySelector('canopy.section')); // this is a proxy for whether the first render has occured yet
  }

  static for(element) {
    if (Paragraph.byPath(element.dataset.pathString)) return Paragraph.byPath(element.dataset.pathString);
    return new Paragraph(element);
  }
}

export default Paragraph;
