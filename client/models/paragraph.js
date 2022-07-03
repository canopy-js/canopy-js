import Path from 'models/path';
import Link from 'models/link';
import { canopyContainer } from 'helpers/getters';
import { ancestorElement } from 'helpers/getters';

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
    if (!sectionElement || sectionElement.tagName !== 'SECTION' ) throw "Paragraph instantiation requires section element";
    if (!sectionElement.classList.contains('canopy-section')) throw "Paragraph class requires Canopy section element";
    this.sectionElement = sectionElement;
    this.transferDataset();
  }

  equals(otherParagraph) {
    if (!otherParagraph) return false;
    return this.sectionElement === otherParagraph.sectionElement;
  }

  display() {
    this.sectionElement.style.display = 'block';
  }

  get element() {
    throw "Depreciated in favor of #sectionElement property";
  }

  transferDataset() {
    this.topicName = this.sectionElement.dataset.topicName;
    this.subtopicName = this.sectionElement.dataset.subtopicName;
    this.pathDepth = this.sectionElement.dataset.pathDepth;
  }

  get topic() {
    throw "Depreciated in favor of #topicName";
  }

  get subtopic() {
    throw "Depreciated in favor of #subtopicName";
  }

  get paragraphElement() {
    let paragraphElement = Array.from(this.sectionElement.childNodes).
      find((element) => element.tagName === 'P');

    if (!paragraphElement) throw "Paragraph has no paragraph element";
    return paragraphElement;
  }

  get path() {
    let pathArray = [];
    let currentElement = this.sectionElement;

    while (currentElement !== canopyContainer) {
      let currentTopic = currentElement.dataset.topicName;

      pathArray.unshift([
        currentTopic,
        currentElement.dataset.subtopicName
      ]);

      while (currentElement.dataset.topicName === currentTopic) {
        currentElement = currentElement.parentNode;
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
    return this.topicName === this.subtopicName;
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
      (link) => link.targetTopic === targetTopic && link.targetSubtopic === targetSubtopic
    );
  }

  get parentLink() {
    if (this.sectionElement.parentNode === canopyContainer) { return null; }

    return this.parentParagraph && this.parentParagraph.linkByTarget(
      this.sectionElement.dataset.topicName,
      this.sectionElement.dataset.subtopicName
    );
  }

  get displayTopicName() {
    return this.sectionElement.dataset.displayTopicName;
  }

  get parentParagraph() {
    if (this.sectionElement) {
      let parentElement = ancestorElement(this.sectionElement, 'canopy-section');
      return parentElement ? new Paragraph(parentElement) : null;
    } else {
      return null;
    }
  }

  get topicParagraph() {
    if (this.isTopic) {
      return this;
    } else {
      return new Paragraph(ancestorElement(this.sectionElement, 'canopy-topic-section'));
    }
  }

  get isTopicRoot() {
    return this.topicName === this.subtopicName;
  }

  static get current() {
    return Path.current.paragraph;
  }

  static get pageRoot() {
    let path = Path.forTopic(Path.current.firstTopic);
    return path.paragraph;
  }

  static containingLink(link) {
    if (!link instanceof Link) throw "Must provide link instance argument";
    let sectionElement = ancestorElement(link.element, 'canopy-section');
    return new Paragraph(sectionElement);
  }

}

export default Paragraph;
