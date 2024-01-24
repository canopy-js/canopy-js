import Path from 'models/path';
import Link from 'models/link';
import { canopyContainer } from 'helpers/getters';
import ScrollableContainer from 'helpers/scrollable_container';
import Topic from '../../cli/shared/topic';
import updateView from 'display/update_view';

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
    this.sectionElement.style.opacity = '100%';
  }

  get element() {
    throw new Error("Depreciated in favor of #sectionElement property");
  }

  transferDataset() { // This is so we can more easily debug in the console
    this._topicName = this.sectionElement.dataset.topicName;
    this._subtopicName = this.sectionElement.dataset.subtopicName;
    this.pathDepth = Number(this.sectionElement.dataset.pathDepth);
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
    if (!this.isInDom) throw 'Cannot call Paragraph#path until paragraph is appended to DOM.';
    let array = [];
    let currentElement = this.sectionElement;
    let currentParagraph = this;
    let currentTopicParagraph = this.topicParagraph;

    while (currentElement !== canopyContainer) {
      currentTopicParagraph = currentParagraph.topicParagraph;

      array.unshift([
        Topic.fromMixedCase(currentElement.dataset.topicName),
        Topic.fromMixedCase(currentElement.dataset.subtopicName)
      ]);

      while (currentElement !== canopyContainer && currentParagraph.topicParagraph.equals(currentTopicParagraph)) {
        currentElement = currentElement.parentNode;
        if (currentElement !== canopyContainer) currentParagraph = new Paragraph(currentElement);
      }
    }

    return new Path(array);
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

  get isroot() {
    return this.sectionElement.parentNode === canopyContainer
  }

  get isSingleTopic() {
    return this.topic.caps === this.subtopic.caps;
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
    if (this.sectionElement.parentNode === canopyContainer) { return null; }

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
    if (this.sectionElement) {
      let parentElement = this.sectionElement.parentNode.closest('.canopy-section');
      return parentElement ? new Paragraph(parentElement) : null;
    } else {
      return null;
    }
  }

  get topicParagraph() {
    if (this.isTopic) {
      return this;
    } else {
      return new Paragraph(this.sectionElement.parentNode.closest('.canopy-topic-section'));
    }
  }

  get isTopic() {
    return this.topic.mixedCase === this.subtopic.mixedCase;
  }

  get isInDom() {
    return this.sectionElement.closest('div#_canopy');
  }

  get top() {
    return this.paragraphElement.getBoundingClientRect().top;
  }

  get bottom() {
    return this.paragraphElement.getBoundingClientRect().bottom;
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

  select(options = {}) {
    if (options?.newTab) return window.open(location.origin + this.path.string, '_blank');
    return updateView(this.path, this.parentLink, options);
  }

  addSelectionClass() {
    this.sectionElement.classList.add('canopy-selected-section');
  }

  scrollComplete() {
    this.sectionElement.classList.add('canopy-scroll-complete');
  }

  static get root() {
    let path = Path.current.rootTopicPath;
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
      path = parentPath;
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

  static get focused() {
    return Paragraph.atY(ScrollableContainer.visibleHeight * 0.3 + ScrollableContainer.currentScroll);
  }

  static get contentLoaded() {
    return !!document.querySelector('h1'); // this is a proxy for whether the first render has occured yet
  }

  static for(element) {
    return new Paragraph(element);
  }
}

export default Paragraph;
