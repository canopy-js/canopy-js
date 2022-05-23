import Path from 'models/path';
import Link from 'models/link';
import { canopyContainer } from 'helpers/getters';
import { ancestorElement } from 'helpers/getters';

class Paragraph {
  // A paragraph instance represents a visible paragraph, not
  // specifically the DOM element of type paragraph.
  // As such, calls to paragraph.element actually return a
  // section element, which has a child that is of type P,
  // and other section elements as children.
  //
  // paragraph.element returns the section element, whereas
  // paragraph.paragraphElement returns the paragraph element.

  constructor(sectionElement) {
    this.sectionElement = sectionElement;
    this.transferDataset();
  }

  equals(otherParagraph) {
    return this.sectionElement === otherParagraph.element;
  }

  display() {
    this.element.style.display = 'block';
  }

  get element() {
    return this.sectionElement;
  }

  get topic() {
    return this.element.dataset.topicName;
  }

  get subtopic() {
    return this.element.dataset.topicName;
  }

  get paragraphElement() {
    return Array.from(this.element.childNodes).
      find((element) => element.tagName === 'P');
  }

  get path() {
    let pathArray = [];
    let currentElement = this.element;

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

  get pathDepth() {
    return this.sectionElement.dataset.pathDepth;
  }

  get links() {
    let linkElements = this.paragraphElement.querySelectorAll('a.canopy-selectable-link');
    return Array.from(linkElements).map((element) => new Link(element))
  }

  get firstLink() {
    return this.links[0] || null;
  }

  get lastLink() {
    return this.links[this.links.length - 1] || null;
  }

  get isPageRoot() {
    return this.element.parentNode === canopyContainer
  }

  get isTopic() {
    return this.sectionElement.dataset.topicName === this.sectionElement.dataset.subtopicName;
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
    return this.linkBySelector(
      (link) => link.targetTopic === targetTopic && link.targetSubtopic === targetSubtopic
    );
  }

  get parentLink() {
    if (this.element.parentNode === canopyContainer) { return null; }

    return this.parentParagraph.linkByTarget(
      this.element.dataset.topicName,
      this.element.dataset.subtopicName
    );
  }

  get displayTopicName() {
    return this.element.dataset.displayTopicName;
  }

  get parentParagraphElement() {
    return ancestorElement(this.element, 'canopy-paragraph');
  }

  get parentSectionElement() {
    return ancestorElement(this.element, 'canopy-section');
  }

  get parentParagraph() {
    return new Paragraph(this.parentSectionElement);
  }

  static get current() {
    let nodeList = document.querySelectorAll('section[style="display: block;"');
    return new Paragraph(nodeList[nodeList.length - 1]);
  }

  static containingLink(link) {
    let sectionElement = ancestorElement(link.element, 'canopy-section');
    return new Paragraph(sectionElement);
  }

}

export default Paragraph;
