import Path from 'models/path';
import Paragraph from 'models/paragraph';
import Topic from '../../cli/shared/topic';
import updateView from 'display/update_view';

class Link {
  constructor(argument) {
    // There are three ways to instantiate a link object:
    // 1. You can provide a DOM element
    // 2. You can provide a metadata object
    //   (This is helpful when storing link selection in the session or history)
    // 3. You can provide a callback that returns the link
    //   (This is helpful for selecting links that are not yet rendered)

    if (argument?.tagName === 'A') {
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

  contradicts(otherPath) {
    if (!(otherPath instanceof Path)) throw new Error('Invalid path argument to Link#contradicts');
    return this.targetPath.string !== otherPath.string;
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

  get top() {
    return this.element.getBoundingClientRect().top;
  }

  get bottom() {
    return this.element.getBoundingClientRect().bottom;
  }

  get innerText() {
    return this.element.innerText;
  }

  transferDataset() {
    // This is just to make it easier to inspect and debug DOM elements
    // Getters are used instead of properties to allow lazy access for callback-specified links
    if (!this.linkElement) return;
    this._pathString = this.linkElement.dataset.pathString;
    this._enclosingTopic = this.linkElement.dataset.enclosingTopic;
    this._enclosingSubtopic = this.linkElement.dataset.enclosingSubtopic;
    this._typeValue = this.linkElement.dataset.type;
  }

  get targetTopic() {
    return this.literalPath.lastTopic;
  }
  get targetSubtopic() {
    if (this.isLocal) return Topic.fromMixedCase(this.element.dataset.targetSubtopic);
    return this.literalPath.lastSubtopic;
  }

  get childTopic() {
    return this.literalPath.firstTopic;
  }
  get childSubtopic() {
    if (this.isLocal) return Topic.fromMixedCase(this.element.dataset.targetSubtopic);
    return this.literalPath.firstSubtopic;
  }

  get enclosingTopic() {
    return Topic.fromMixedCase(this.element.dataset.enclosingTopic);
  }

  get enclosingTopicParagraph() {
    return this.enclosingParagraph.topicParagraph;
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
    return this.element.parentNode.closest('.canopy-section');
  }

  get sectionElement() {
    throw new Error("Depreciated in favor of #enclosingSectionElement");
  }

  get enclosingParagraphElement() {
    return this.element.parentNode.closest('.canopy-paragraph');
  }

  get parentParagraphElement() {
    throw new Error("Depreciated in favor of #enclosingParagraphElement");
  }

  get enclosingParagraph() {
    return new Paragraph(this.enclosingSectionElement);
  }

  get enclosingPath() {
    if (this.metadataObject && !Paragraph.contentLoaded) return new Path(this.metadataObject.enclosingPathString);
    return this.enclosingParagraph.path;
  }

  get targetParagraph() { // if the link is to A/B/C, A is the child and C is the targetParagraph
    if (!this.isParent) return null;

    let pathDepth = this.enclosingParagraph.pathDepth;
    if (this.isGlobal) pathDepth = Number(pathDepth) + 1;

    let sectionElement = this.enclosingParagraph.sectionElement.querySelector(
        `section[data-topic-name="${this.literalPath.firstTopic.cssMixedCase}"]` +
        `[data-subtopic-name="${this.literalPath.firstSubtopic.cssMixedCase}"]` +
        `[data-path-depth="${pathDepth}"`
      );

    if (!sectionElement) {
      if (this.cycle) return null; // the paragraph doesn't exist because we didn't preview it
      console.log(`Did not find paragraph child element matching link [${this.literalPath.firstTopic.mixedCase}, ${this.literalPath.firstSubtopic.mixedCase}]`); // could be network issues
      return null;
    }

    return new Paragraph(sectionElement);
  }

  get childPath() {
    return this.childParagraph.path;
  }

  get childParagraph() {
    if (this.isLocal) return this.targetParagraph;
    if (this.isGlobal) return this.enclosingPath.append(this.literalPath.firstTopicPath).paragraph;
    return null;
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
      if (this?.linkElement) return Link.collectMetadata(this.linkElement); // rewrite in case format changed
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

  get path() {
    debugger;
    throw '#path is deprecated in favor of #inlinePath or #literalPath';
  }

  get targetPath() { // links are assumed to be inlined unless the user redirects explicitly
    throw '#targetPath is deprecated in favor of #inlinePath or #literalPath';
  }

  get literalPath() {
    if (this.isLocal) return Path.forSegment(this.enclosingTopic, this.targetSubtopic);
    if (this.isGlobal) return Path.for(this.element.dataset.pathString); // this will have to change for path links which can have multiple segments
    return null;
  }

  static collectMetadata(linkElement) {
    let link = new Link(linkElement);
    let paragraph = Paragraph.containingLink(link);

    // changing the metadata schema requires changing Link#containsLinkSelectionMetadata
    return {
      enclosingPathString: link.enclosingPath.string,
      text: linkElement.dataset.text,
      relativeLinkNumber: link.relativeLinkNumber,
      previewPathString: link.previewPath.string // on initial page load we need the paragraph path to call updateView before we have a link to use
    };
  }

  static containsLinkSelectionMetadata(object) {
    return object.relativeLinkNumber !== undefined;
  }

  static elementFromMetadata(object) {
    let enclosingPath = new Path(object.enclosingPathString);
    let enclosingParagraph = enclosingPath.paragraph;
    if (!enclosingParagraph) throw new Error("Link selection data refers to non-existant link");
    let link = enclosingParagraph.linkBySelector(
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

  siblingOf(link) {
    return this.enclosingParagraph && this.enclosingParagraph.equals(link?.enclosingParagraph);
  }

  get parentLink() {
    return this.enclosingParagraph.parentLink;
  }

  isParentLinkOf(paragraph) {
    return paragraph?.parentLink?.equals(this);
  }

  get grandParentLink() {
    return this.parentLink?.parentLink;
  }

  get topicParagraph() {
    return new Paragraph(this.element.parentNode.closest('.canopy-topic-section'));
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

  get isClosedCycle() {
    return !this.isOpen && this.cycle;
  }

  get isSelected() {
    return this.element.classList.contains('canopy-selected-link');
  }

  get isGlobal() {
    return this.type === 'global';
  }

  get pathReference() {
    return this.type === 'global' && (this.literalPath.length > 1 || this.childTopic.mixedCase !== this.childSubtopic.mixedCase);
  }

  get isSimpleGlobal() {
    return this.isGlobal && !this.pathReference; // a global reference to a single global topic
  }

  get effectivePathReference() { // a path reference which is not a cycle unless the cycle is open and thus functioning as a path reference
    return this.pathReference && (!this.cycle || this.inlinedCycleReference);
  }

  get inlinedCycleReference() { // a cycle reference that has been inlined
    return this.introducesNewCycle && this.isOpen;
  }

  get isExternal() {
    return this.type === 'external';
  }

  get isGlobal() {
    return this.type === 'global';
  }

  get isLocal() {
    return this.type === 'local';
  }

  get isCycle() {
    return this.introducesNewCycle;
  }

  get isBackCycle() {
    return this.inlinePath.reduce().subsetOf(this.inlinePath)
      && !this.inlinePath.reduce().equals(this.inlinePath);
  }

  get isParent() {
    return this.isGlobal || this.isLocal;
  }

  isSiblingOf(otherLink) {
    return this.enclosingParagraph.equals(otherLink.enclosingParagraph);
  }

  get hasChildren() {
    return this.childParagraph?.hasLinks;
  }

  get firstChild() {
    return this.childParagraph?.firstLink;
  }

  firstChildOf(otherLink) {
    return !!otherLink.firstChild?.equals(this);
  }

  get isOffScreen() {
    const rect = this.element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    return (
      rect.top < 0 || // The top edge of the element is above the viewport's top
      rect.bottom > viewportHeight // The bottom edge of the element is below the viewport's bottom
    );
  }

  isVisible() {
    if (!this.element) return false;
    let rect = this.element.getBoundingClientRect();
    let windowHeight = window.innerHeight;
    let windowWidth = window.innerWidth;

    let visibleWidth = Math.min(rect.right, windowWidth) - Math.max(rect.left, 0);
    let visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);

    let totalArea = (rect.bottom - rect.top) * (rect.right - rect.left);
    let visibleArea = visibleHeight * visibleWidth;

    return (visibleArea / totalArea) >= 0.5;
  }

  isAboveViewport() {
    if (!this.element || !this.element.getBoundingClientRect) {
      return false;
    }

    const rect = this.element.getBoundingClientRect();
    return rect.top < 0;
  }

  isBelowViewport() {
    if (!this.element || !this.element.getBoundingClientRect) {
      return false;
    }

    const rect = this.element.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    return rect.bottom > viewportHeight;
  }

  isDistantParent() {
    return this.top + ScrollableContainer.visibleHeight * 0.5 < this.childParagraph.top;
  }

  isHigherThan(otherLink) {
    return this.top < otherLink.top;
  }

  get isFocused() {
    const rect = this.element.getBoundingClientRect();

    // Get the viewport height
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Calculate the top 25% and bottom 40% positions of the viewport
    const topLimit = viewportHeight * 0.25;
    const bottomLimit = viewportHeight * 0.6;

    // Check if the element is within the target area
    const overlapsTop = rect.bottom > topLimit;
    const overlapsBottom = rect.top < bottomLimit;

    return overlapsTop && overlapsBottom;
  }

  get cycle() {
    return this.introducesNewCycle;
  }

  get introducesNewCycle() {
    if (!this.isGlobal) return false;
    return Path.introducesNewCycle(this.enclosingPath, this.literalPath);
  }

  get inlinePath() { // ie if the user would inline the link's target at the link's enclosing path
    if (this.isGlobal) {
      return this.enclosingParagraph.path.append(this.literalPath);
    }

    if (this.isLocal) {
      return this.enclosingParagraph.path.replaceTerminalSubtopic(this.targetSubtopic);
    }

    return this.enclosingParagraph.path;
  }

  get previewPath() {
    if (this.metadataObject && !Paragraph.contentLoaded) { // for initial page load before links exist
      return new Path(this.metadataObject.previewPathString);
    }

    if (this.isExternal) { // select the link and display enclosing path
      return this.enclosingPath;
    }

    if (this.isGlobal && this.introducesNewCycle && !this.inlinedCycleReference) { // select the link and display enclosing path
      return this.enclosingPath;
    }

    if (this.isGlobal) { // select link and advance the path
      return this.inlinePath;
    }

    if (this.isLocal) { // select link and advance the path
      return this.inlinePath;
    }
  }

  get urlPath() {
    if (this.cycle || this.pathReference || this.externalLink) return this.enclosingPath;
    if (this.isLocal || this.isSimpleGlobal) return this.inlinePath;

  }

  select(options = {}) {
    if (options?.newTab && this.isParent && options.redirect) return window.open(location.origin + this.literalPath.productionPathString, '_blank');
    if (options?.newTab && this.isParent) return window.open(location.origin + this.previewPath.productionPathString, '_blank');

    return updateView(this.previewPath, this, options);
  }

  execute(options = {}) {
    options = { scrollDirect: true, ...options };

    Link.persistLastLinkSelection(this); // even if another link gets selected, this link was last touched within paragraph

    if (this.isExternal) {
      return window.open(this.element.href, '_blank'); // external links must open in new tab
    }

    if (options.redirect) { // all handling is the same for redirection
      return this.literalPath.display({ scrollStyle: 'instant', ...options}); // handles new tab
    }

    if (this.isGlobal && this.introducesNewCycle && !options.inlineCycles) {
      return (options.pushHistoryState ? this.select({ noScroll: true, noDisplay: true }) : Promise.resolve()) // persist clicked link in history
        .then(() => this.inlinePath.reduce().display(options));
    }

    if ((this.pathReference && !this.cycle) || (this.cycle && options.inlineCycles)) { // eg [[A#B]] or [[A/B/C]]
      return (options.pushHistoryState ? this.select({ noScroll: true, noDisplay: true }) : Promise.resolve()) // persist clicked link in history
        .then(() => this.inlinePath.display({ scrollDirect: true, ...options }));
    }

    return (options.selectALink && this.firstChild || this).select(options);
  }

  static removeSelectionClass() {
    Array.from(document.getElementsByTagName("a")).forEach((linkElement) => {
      linkElement.classList.remove('canopy-selected-link');
    });
  }

  addSelectionClass() {
    Link.updateSelectionClass(this);
  }

  get onCurrentPage() {
    const style = window.getComputedStyle(this.element);

    return (
      this.element.offsetWidth > 0 &&
      this.element.offsetHeight > 0 &&
      style.display !== 'none' &&
      style.visibility !== 'hidden'
    );
  }

  static deselect(newLink) {
    Link.updateSelectionClass(newLink || null);
  }

  static updateSelectionClass(linkToSelect) {
    if (this.lastSelection !== linkToSelect) this.lastSelection = Link.selection;
    document.querySelector('a.canopy-selected-link')?.classList.remove('canopy-selected-link');
    if (linkToSelect) linkToSelect.element.classList.add('canopy-selected-link');
  }

  static lastSelection = null;

  static persistSelection(linkToSelect) {
    Link.persistInHistory(linkToSelect);
    Link.persistInSession(linkToSelect);
    Link.persistLastLinkSelection(linkToSelect);
  }

  static selectionPresentInEvent(e) {
    return e.state && Link.containsLinkSelectionMetadata(e.state);
  }

  static get sessionSelection() {
    if (Path.url.empty) return null; // initial '/' load will never recall link selection

    let sessionData = sessionStorage.getItem(Path.url.string);
    if (sessionData && sessionData !== 'null') {
      let link = new Link(JSON.parse(sessionData));
      return link;
    } else {
      return null;
    }
  }

  static get historySelection() {
    if (Path.url.empty) return null; // initial '/' load will never recall link selection

    if (history.state && Link.containsLinkSelectionMetadata(history.state)) {
      let link = new Link(history.state);
      return link;
    } else {
      return null;
    }
  }

  static get savedSelection() {
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

  static current() {
    throw new Error("Link#current does not exist, try Link#selection");
  }

  // If someone eg presses up from the second link in a paragraph, pressing down should return them there.
  static persistLastLinkSelection(link) {
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

  get isLastSelection() {
    return !!Link.lastSelectionOfParagraph(this.enclosingParagraph)?.equals(this);
  }

  static get visible() {
    return Array.from(document.querySelectorAll('.canopy-selectable-link'))
      .map(element => Link.for(element))
      .filter(link => link.isVisible)
  }

  static for(arg) {
    return new this(arg);
  }

  static from(arg) {
    return new this(arg);
  }
}

export default Link;
