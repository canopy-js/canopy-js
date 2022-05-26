import { ancestorElement } from 'helpers/getters';
import { canopyContainer } from 'helpers/getters';
import Path from 'models/path';
import Paragraph from 'models/paragraph';

class Link {
  constructor(argument) {
    // There are three ways to instantiate a link object:
    // 1. You can provide a DOM element
    // 2. You can provide a metadata object
    //   (This is helpful when storing link selection in the session or history)
    // 3. You can provide a callback that returns the link
    //   (This is helpful for selecting links that are not yet rendered)

    if (argument.tagName === 'A') {
      this.element = argument;
    } else if (argument instanceof Link) {
      throw "Cannot instantiate link from link";
    } else if (typeof argument === 'function') {
      this.selectorCallback = argument;
    } else {
      // The link element is retrieved only on-demand in case it doesn't exist yet
      this.metadataObject = argument;
    }
  }

  equals(otherLink) {
    return this.element === otherLink.element;
  }

  matches(otherLink) {
    return this.targetTopic === otherLink.targetTopic &&
      this.targetSubtopic === otherLink.targetSubtopic &&
      this.relativeLinkNumber === otherLink.relativeLinkNumber;
  }

  contradicts(path) {
    return this.pathWhenSelected.string !== path.string;
  }

  get element () {
    if (this.linkElement) {
      return this.linkElement
    } else if (this.metadataObject) {
      this.element = Link.elementFromMetadata(this.metadata);
      return this.linkElement;
    } else if (this.selectorCallback) {
      let link = this.selectorCallback();
      if (!link) {
        console.log("Link selector callback didn't select link");
        return;
      }
      this.element = link.element;
      return this.linkElement;
    }
  }

  set element(argument) {
    if (argument instanceof HTMLAnchorElement) {
      this.linkElement = argument;
    } else if (argument instanceof Link) {
      this.linkElement = argument.element;
    }
    this.transferDataset();
  }

  transferDataset() {
    // This is just to make it easier to inspect and debug DOM elements
    // Getters are used instead of properties to allow lazy access for callback-specified links
    if (!this.linkElement) return;
    this._targetTopic = this.linkElement.dataset.targetTopic;
    this._targetSubtopic = this.linkElement.dataset.targetSubtopic;
    this._enclosingTopic = this.linkElement.dataset.enclosingTopic;
    this._enclosingSubtopic = this.linkElement.dataset.enclosingSubtopic;
    this._typeValue = this.linkElement.dataset.type;
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

  get type() {
    return this.element.dataset.type;
  }

  get sectionElement() {
    return ancestorElement(this.element, 'canopy-section');
  }

  get parentParagraphElement() {
    return ancestorElement(this.element, 'canopy-paragraph');
  }

  get enclosingParagraph() {
    return new Paragraph(this.sectionElement);
  }

  get targetParagraph() {
    let childNodes = Array.from(this.enclosingParagraph.sectionElement.childNodes);

    let element = childNodes.find((childElement) =>
        childElement.tagName === 'SECTION' &&
        childElement.dataset.topicName === this.element.dataset.targetTopic &&
        childElement.dataset.subtopicName === this.element.dataset.targetSubtopic);

    return new Paragraph(element);
  }

  atNewPath(newPath) { // get matching link at new path
    let newEnclosingParagraph;
    if (this.isParent) {
      newEnclosingParagraph = newPath.paragraph.parentParagraph;
    } else {
      newEnclosingParagraph = newPath.paragraph;
    }
    return newEnclosingParagraph
      .links
      .find(this.matcher);
  }

  get localPathWhenSelected() {
    if (this.isGlobal) {
      return new Path(this.pathWhenSelected.pathArray.slice(-2));
    } else {
      return this.pathWhenSelected.lastSegment;
    }
  }

  get matcher() {
    return (link) => link.matches(this);
  }

  get relativeLinkNumber() {
    if (this.storedRelativeLinkNumber) return this.storedRelativeLinkNumber;
    this.storedRelativeLinkNumber = this.
      enclosingParagraph.
      links.
      map(e => e.element).
      indexOf(this.element);

    return this.storedRelativeLinkNumber;
  }

  get metadata() {
    if (this.metadataObject) {
      return this.metadataObject;
    } else if(this.linkElement) {
      let metadata = Link.collectMetadata(this.linkElement);
      this.metadataObject = metadata;
      return metadata;
    } else if (this.selectorCallback) {
      this.element = this.selectorCallback();
      return this.metadata; // now that there is a this.linkElement
    } else {
      throw "Link has neither supplied metadata, dom element, nor selector function";
    }
  }

  get targetPath() {
    if (this.isGlobal) {
      return this.enclosingParagraph.path.addSegment(this.targetTopic, this.targetSubtopic);
    } else if (this.isLocal) {
      return this.enclosingParagraph.path.replaceTerminalSubtopic(this.targetSubtopic);
    } else {
      return null; // eg URL link
    }
  }

  get path() {
    throw "Depreciated in favor of #pathWhenSelected";
  }

  get pathWhenSelected() {
    if (this.isGlobal) {
      return this.enclosingParagraph.path.addSegment(this.targetTopic, this.targetSubtopic);
    } else if (this.isLocal) {
      return this.enclosingParagraph.path.replaceTerminalSubtopic(this.targetSubtopic);
    } else {
      return this.enclosingParagraph.path;
    }
  }

  static collectMetadata(linkElement) {
    let link = new Link(linkElement);
    let paragraph = Paragraph.containingLink(link);

    // changing the metadata schema requires changing Link#containsLinkSelectionMetadata
    return {
      pathString: paragraph.path.string, // initial page load with session/history link selection requires this
      text: linkElement.dataset.text,
      relativeLinkNumber: link.relativeLinkNumber
    };
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

  get present() {
    return !!this.element;
  }

  static select(linkToSelect) {
    linkToSelect?.present && linkToSelect.element.classList.add('canopy-selected-link');
    Link.persistInHistory(linkToSelect);
    Link.persistInSession(linkToSelect);
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
    let linkData = link?.present && JSON.stringify(link.metadata);
    sessionStorage.setItem(location.pathname + location.hash, linkData || null);
  }

  static persistInHistory(link) {
    // This has to be static because Link.selection hasn't always updated
    // between when a new link is selected and when we want to persist that selection
    history.replaceState(
      link?.present && link.metadata || null,
      document.title,
      window.location.href
    );
  }

  // selectALink returns a callback that will pick a link to select
  // once the DOM has rendered.
  //
  // selectALink takes a path to clarify which path is intended in case
  // there are multiple rendered in the DOM, and the path has not updated yet.

  static selectALink(path) {
    return new Link(() => {
      path = path || Path.current;
      let paragraph = path.paragraph;
      return paragraph.parentLink || paragraph.firstLink;
    });
  }

  static hasTarget(topic, subtopic) {
    return (link) => {
      return link.targetTopic === topic &&
        link.targetSubtopic === (subtopic || topic);
    }
  }

  static current() {
    throw "Link#current does not exist, try Link#selection";
  }
}

export default Link;
