import { ancestorElement } from 'helpers/getters';
import { canopyContainer } from 'helpers/getters';
import Path from 'models/path';
import Paragraph from 'models/paragraph';

class Link {
  constructor(argument) {
    if (argument.tagName === 'A') {
      this.linkElement = argument;
    } else if (argument instanceof Link) {
      throw "Cannot instantiate link from link";
    } else {
      // The link element is retrieved only on-demand in case it doesn't exist yet
      this.metadataObject = argument;
    }
  }

  equals(otherLink) {
    return this.element === otherLink.element;
  }

  get element () {
    if (this.linkElement) {
      return this.linkElement
    } else {
      this.linkElement = Link.elementFromMetadata(this.metadata);
      return this.linkElement;
    }
  }

  get type() {
    return this.linkElement.dataset.type;
  }

  get parentSectionElement() {
    return ancestorElement(this.element, 'canopy-section');
  }

  get parentParagraphElement() {
    return ancestorElement(this.element, 'canopy-paragraph');
  }

  get enclosingParagraph() {
    return new Paragraph(this.parentSectionElement);
  }

  get targetParagraph() {
    let childNodes = Array.from(this.enclosingParagraph.element.childNodes);

    let element = childNodes.find((childElement) =>
        childElement.tagName === 'SECTION' &&
        childElement.dataset.topicName === this.element.dataset.targetTopic &&
        childElement.dataset.subtopicName === this.element.dataset.targetSubtopic);

    return new Paragraph(element);
  }

  get targetTopic() {
    return this.element.dataset.targetTopic;
  }

  get targetSubtopic() {
    return this.element.dataset.targetSubtopic;
  }

  get enclosingTopic() {
    return this.element.dataset.enclosingTopic;
  }

  get enclosingSubtopic() {
    return this.element.dataset.enclosingSubtopic;
  }

  get metadata() {
    if (this.metadataObject) {
      return this.metadataObject;
    } else if(this.linkElement) {
      let paragraph = Paragraph.containingLink(this);

      let relativeLinkNumber = Array.from(
        paragraph.element.querySelectorAll('.canopy-selectable-link')
      ).indexOf(this.linkElement);

      // changing the metadata schema requires changing Link#containsLinkSelectionMetadata
      this.metadataObject = {
        pathString: paragraph.path.string,
        text: this.linkElement.dataset.text,
        relativeLinkNumber: relativeLinkNumber
      };

      return this.metadataObject;
    }
  }

  static containsLinkSelectionMetadata(object) {
    return object.hasOwnProperty('relativeLinkNumber');
  }

  static elementFromMetadata(object) {
    let path = new Path(object.pathString);
    let paragraph = path.paragraph;
    if (!paragraph) throw "Link selection data refers to non-existant link";
    let link = paragraph.linkBySelector(
      (link, i) => link.element.dataset.text === object.text &&
        i === object.relativeLinkNumber
    );

    return link && link.element || null;
  }

  get nextSibling() {
    let links = this.enclosingParagraph.links;
    if (!this.equals(links[links.length - 1])) {
      let linkElements = links.map((link) => link.element);
      let indexOfCurrentLink = linkElements.indexOf(this.element);
      return links[indexOfCurrentLink + 1];
    } else {
      return null;
    }
  }

  get previousSibling() {
    let links = this.enclosingParagraph.links;
    if (!this.equals(links[0])) {
      let linkElements = links.map((link) => link.element);
      let indexOfCurrentLink = linkElements.indexOf(this.element);
      return links[indexOfCurrentLink - 1];
    } else {
      return null;
    }
  }

  get siblings() {
    return this.enclosingParagraph.links;
  }

  get firstSibling() {
    return this.siblings[0];
  }

  get lastSibling() {
    return this.siblings[this.siblings.length - 1];
  }

  get firstChildLink() {
    return this.targetParagraph.firstLink;
  }

  get lastChildLink() {
    return this.targetParagraph.lastLink;
  }

  get parentLink() {
    return this.enclosingParagraph.parentLink;
  }

  get grandParentLink() {
    return this.parentLink.parentLink;
  }

  get topicParagraph() {
    return ancestorElement(this.element, 'canopy-topic-section');
  }

  get selected() {
    return this.element.classList.includes('canopy-selected-link');
  }

  open() {
    this.element.classList.add('canopy-open-link');
  }

  get isOpen() {
    return this.element.classList.contains('canopy-open-link');
  }

  get isClosed() {
    return !this.isOpen;
  }

  get isGlobal() {
    return this.type === 'global';
  }

  get isLocal() {
    return this.type === 'local';
  }

  get isParent() {
    return this.isGlobal || this.isLocal;
  }

  static select(link) {
    link && link.element.classList.add('canopy-selected-link');
  }

  static selectionPresentInEvent(e) {
    return e.state && Link.containsLinkSelectionMetadata(e.state);
  }

  static get sessionSelection() {
    let sessionData = sessionStorage.getItem(Path.current.string);
    if (sessionData && sessionData !== 'null') {
      return new Link(JSON.parse(sessionData));
    } else {
      return null;
    }
  }

  static get historySelection() {
    if (history.state && Link.containsLinkSelectionMetadata(history.state)) {
      return new Link(history.state);
    } else {
      return null;
    }
  }

  static get priorSelection() {
    return this.historySelection || this.sessionSelection || null;
  }

  static get selection() {
    let selectedLink = document.querySelector('a.canopy-selected-link');
    if (selectedLink) {
      return new Link(selectedLink);
    } else {
      return null;
    }
  }

  static persistInSession(link) {
    // This has to be static because Link.selection hasn't always updated
    // between when a new link is selected and when we want to persist that selection
    let linkData = link && JSON.stringify(link.metadata);
    sessionStorage.setItem(location.pathname + location.hash, linkData || null);
  }

  static persistInHistory(link) {
    // This has to be static because Link.selection hasn't always updated
    // between when a new link is selected and when we want to persist that selection
    history.replaceState(
      link.metadata,
      document.title,
      window.location.href
    );
  }
}

export default Link;
