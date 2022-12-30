import { getAncestorElement } from 'helpers/getters';
import Path from 'models/path';
import Paragraph from 'models/paragraph';
import Topic from '../../cli/commands/shared/topic';

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
      throw new Error("Cannot instantiate link from link");
    } else if (typeof argument === 'object') {
      this.metadataObject = argument;
    } else if (typeof argument === 'function') {
      this.selectorCallback = argument;
    } else {
      throw new Error('Invalid argument to Link constructor');
    }
  }

  equals(otherLink) {
    return this.element === otherLink.element;
  }

  matches(otherLink) {
    if (!otherLink) throw new Error('Invalid link argument to Link#matches');

    return this.targetTopic === otherLink.targetTopic &&
      this.targetSubtopic === otherLink.targetSubtopic &&
      this.relativeLinkNumber === otherLink.relativeLinkNumber;
  }

  contradicts(path) {
    if (!(path instanceof Path)) throw new Error('Invalid path argument to Link#contradicts');
    return this.paragraphPathWhenSelected.string !== path.string;
  }

  get element () {
    if (this.linkElement) {
      return this.linkElement
    } else if (this.metadataObject) {
      this.element = Link.elementFromMetadata(this.metadata);
      if (!this.linkElement) throw new Error('Metadata refered to non-existant link');
      return this.linkElement;
    } else if (this.selectorCallback) {
      let link = this.selectorCallback();
      if (!link) throw new Error('Link selector callback provided no link');
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
    return Topic.fromMixedCase(this.element.dataset.targetTopic);
  }
  get targetSubtopic() {
    return Topic.fromMixedCase(this.element.dataset.targetSubtopic);
  }
  get enclosingTopic() {
    return Topic.fromMixedCase(this.element.dataset.enclosingTopic);
  }
  get enclosingSubtopic() {
    return Topic.fromMixedCase(this.element.dataset.enclosingSubtopic);
  }

  get topicName() {
    throw new Error('Links have no topicName, only targetTopic or enclosingTopic');
  }

  get subtopicName() {
    throw new Error('Links have no subtopicName, only targetSubtopic or enclosingSubtopic');
  }

  get type() {
    return this.element.dataset.type;
  }

  get enclosingSectionElement() {
    return getAncestorElement(this.element, 'canopy-section');
  }

  get sectionElement() {
    throw new Error("Depreciated in favor of #enclosingSectionElement");
  }

  get enclosingParagraphElement() {
    return getAncestorElement(this.element, 'canopy-paragraph');
  }

  get parentParagraphElement() {
    throw new Error("Depreciated in favor of #enclosingParagraphElement");
  }

  get enclosingParagraph() {
    return new Paragraph(this.enclosingSectionElement);
  }

  get targetParagraph() {
    if (!this.isParent) return null;

    let pathDepth = this.enclosingParagraph.pathDepth;
    if (this.isGlobalOrImport) pathDepth = Number(pathDepth) + 1;

    let sectionElement = this.enclosingParagraph.sectionElement.querySelector(
        `section[data-topic-name="${this.targetTopic.escapedMixedCase}"]` +
        `[data-subtopic-name="${this.targetSubtopic.escapedMixedCase}"]` +
        `[data-path-depth="${pathDepth}"`
      );

    if (!sectionElement) {
      throw new Error(`Did not find paragraph child element matching link [${this.targetTopic.mixedCase}, ${this.targetSubtopic.mixedCase}]`);
    }

    return new Paragraph(sectionElement);
  }

  atNewPath(newPath) { // get link instantiated with callback that returns matching link at new path
    return new Link(() => {
      let newEnclosingParagraph;
      if (this.isParent) {
        newEnclosingParagraph = newPath.paragraph.parentParagraph;
      } else {
        newEnclosingParagraph = newPath.paragraph;
      }
      return newEnclosingParagraph
        .links
        .find(this.matcher);
    });
  }

  get localPathSegmentWhenSelected() {
    if (this.isGlobalOrImport) {
      return new Path(this.paragraphPathWhenSelected.pathArray.slice(-2));
    } else {
      return this.paragraphPathWhenSelected.lastSegment;
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

  /* eslint getter-return: "off" */
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
      throw new Error("Link has neither supplied metadata, dom element, nor selector function");
    }
  }

  get targetPath() {
    if (this.isGlobalOrImport) {
      return this.enclosingParagraph.path.addSegment(this.targetTopic, this.targetSubtopic);
    } else if (this.isLocal) {
      return this.enclosingParagraph.path.replaceTerminalSubtopic(this.targetSubtopic);
    } else {
      return null; // eg URL link
    }
  }

  get path() {
    throw new Error("Depreciated in favor of #paragraphPathWhenSelected");
  }

  get pathToDisplay() {
    throw new Error("Depreciated in favor of #paragraphPathWhenSelected");
  }

  get paragraphPathWhenSelected() {
    if (this.isGlobalOrImport) {
      return this.enclosingParagraph.path.addSegment(this.targetTopic, this.targetSubtopic);
    } else if (this.isLocal) {
      return this.enclosingParagraph.path.replaceTerminalSubtopic(this.targetSubtopic);
    } else {
      return this.enclosingParagraph.path;
    }
  }

  get urlPathWhenSelected() {
    return this.paragraphPathWhenSelected;
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
    return object.relativeLinkNumber !== undefined;
  }

  static elementFromMetadata(object) {
    let path = new Path(object.pathString);
    let paragraph = path.paragraph;
    if (!paragraph) throw new Error("Link selection data refers to non-existant link");
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
    return this.parentLink?.parentLink;
  }

  get topicParagraph() {
    return getAncestorElement(this.element, 'canopy-topic-section');
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

  get isSelected() {
    return this.element.classList.contains('canopy-selected-link');
  }

  get isGlobal() {
    return this.type === 'global';
  }

  get isImport() {
    return this.type === 'import';
  }

  get isGlobalOrImport() {
    return this.type === 'global' || this.type === 'import';
  }

  get isLocal() {
    return this.type === 'local';
  }

  get isParent() {
    return this.isGlobal || this.isLocal || this.isImport;
  }

  get hasChildren() {
    return this.targetParagraph.hasLinks;
  }

  static select(linkToSelect) {
    linkToSelect && linkToSelect.element.classList.add('canopy-selected-link');
    Link.persistInHistory(linkToSelect);
    Link.persistInSession(linkToSelect);
    Link.persistLastSelectionData(linkToSelect);
  }

  static selectionPresentInEvent(e) {
    return e.state && Link.containsLinkSelectionMetadata(e.state);
  }

  static get sessionSelection() {
    let sessionData = sessionStorage.getItem(Path.current.string);
    if (sessionData && sessionData !== 'null') {
      let link = new Link(JSON.parse(sessionData));
      try { link.element; } catch { link = null; } // in case metadata is invalid
      return link;
    } else {
      return null;
    }
  }

  static get historySelection() {
    if (history.state && Link.containsLinkSelectionMetadata(history.state)) {
      let link = new Link(history.state);
      try { link.element; } catch { link = null; } // in case metadata is invalid
      return link;
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
      link && link.metadata || null,
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
      return paragraph.firstLink || paragraph.parentLink;
    });
  }

  static current() {
    throw new Error("Link#current does not exist, try Link#selection");
  }

  // If someone eg presses up from the second link in a paragraph, pressing down should return them there.
  static persistLastSelectionData(link) {
    if (link) {
      let lastSelectionsOfParagraph = JSON.parse(sessionStorage.getItem('lastSelectionsOfParagraph') || '{}');
      lastSelectionsOfParagraph[link.enclosingParagraph.path] = link.metadata;
      sessionStorage.setItem('lastSelectionsOfParagraph', JSON.stringify(lastSelectionsOfParagraph));
    }
  }

  static lastSelectionOfParagraph(paragraph) {
    let lastSelectionsOfParagraph = JSON.parse(sessionStorage.getItem('lastSelectionsOfParagraph') || '{}');
    if (lastSelectionsOfParagraph[paragraph.path]) {
      let link = new Link(lastSelectionsOfParagraph[paragraph.path]);
      try { // sometimes metadata from previous versions is stored and doesn't correspond to real links anymore
        if (link.element) {
          return link;
        }
      } catch {
        return null;
      }
    }
  }
}

export default Link;
