import Path from 'models/path';
import Link from 'models/link';
import { canopyContainer } from 'helpers/getters';
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
    this.pathDepth = this.sectionElement.dataset.pathDepth;
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
    let pathArray = [];
    let currentElement = this.sectionElement;
    let currentParagraph = this;
    let currentTopicParagraph = this.topicParagraph;

    while (currentElement !== canopyContainer) {
      currentTopicParagraph = currentParagraph.topicParagraph;

      pathArray.unshift([
        Topic.fromMixedCase(currentElement.dataset.topicName),
        Topic.fromMixedCase(currentElement.dataset.subtopicName)
      ]);

      while (currentElement !== canopyContainer && currentParagraph.topicParagraph.equals(currentTopicParagraph)) {
        currentElement = currentElement.parentNode;
        if (currentElement !== canopyContainer) currentParagraph = new Paragraph(currentElement);
      }
    }

    return new Path(pathArray);
  }

  get links() {
    if (this.linkObjects) return this.linkObjects;
    let linkElements = this.paragraphElement.querySelectorAll('a.canopy-selectable-link');
    this.linkObjects = Array.from(linkElements).map((element) => new Link(element));
    return this.linkObjects;
  }

  get firstLink() {
    return this.links[0] || null;
  }

  get lastLink() {
    return this.links[this.links.length - 1] || null;
  }

  get isPageRoot() {
    return this.sectionElement.parentNode === canopyContainer
  }

  get isTopic() {
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

  linkByTarget(targetTopic, targetSubtopic) {
    targetSubtopic = targetSubtopic || targetTopic;

    return this.linkBySelector(
      (link) => link.isParent &&
        link.targetTopic.caps === targetTopic.caps &&
        link.targetSubtopic.caps === targetSubtopic.caps
    );
  }

  get parentLink() {
    if (this.sectionElement.parentNode === canopyContainer) { return null; }

    return this.parentParagraph && this.parentParagraph.linkByTarget(
      this.topic,
      this.subtopic
    );
  }

  get parentLinks() {
    if (this.sectionElement.parentNode === canopyContainer) { return null; }

    return this.parentParagraph.linksBySelector(
      link => {
        return (link.isLocal || link.isGlobal) &&
          this.topic.caps === link.targetTopic.caps &&
          this.subtopic.caps === link.targetSubtopic.caps;
      }
    );
  }

  get ancestorImportReferences() {
    if (this.pageRoot) { return []; }
    if (!this.topicParagraph.parentParagraph) { return []; }

    return this.topicParagraph.parentParagraph.linksBySelector(
      link => {
        return link.isImport &&
          this.topic.caps === link.targetTopic.caps &&
          this.subtopic.caps === link.targetSubtopic.caps;
      }
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

  get isTopicRoot() {
    return this.topicName === this.subtopicName;
  }

  get isInDom() {
    return this.sectionElement.closest('div#_canopy');
  }

  static get current() {
    let sectionElement = document.querySelector('.canopy-selected-section');
    if (sectionElement) {
      return new Paragraph(sectionElement);
    } else {
      return null;
    }
  }

  select() {
    this.sectionElement.classList.add('canopy-selected-section');
  }

  scrollComplete() {
    this.sectionElement.classList.add('canopy-scroll-complete');
  }

  static get pageRoot() {
    let path = Path.current.rootTopicPath;
    return path.paragraph;
  }

  static containingLink(link) {
    if (!(link instanceof Link)) throw new Error("Must provide link instance argument");
    let sectionElement = link.element.parentNode.closest('.canopy-section');
    return new Paragraph(sectionElement);
  }

  static get contentLoaded() {
    return !!document.querySelector('h1'); // this is a proxy for whether the first render has occured yet
  }
}

export default Paragraph;
