import Path from 'models/path';
import Paragraph from 'models/paragraph';
import Topic from '../../cli/shared/topic';
import updateView from 'display/update_view';
import ScrollableContainer from 'helpers/scrollable_container';

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
    if (!(otherLink instanceof Link)) throw new Error('Argument must be of type link');
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

  get element () { // callers should be prepared for null element indicating request that doesn't correspond to current data
    if (this.linkElement) {
      return this.linkElement
    } else if (this.metadataObject) {
      this.linkElement = Link.elementFromMetadata(this.metadata);
      if (!this.linkElement) return null;
      return this.linkElement;
    } else if (this.selectorCallback) {
      let link = this.selectorCallback();
      this.element = link?.element; // return undefined if not present and let caller handle
      return this.linkElement;
    }
  }

  get tryElement() {
    try { this.element } catch { return null; }
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
    if (!this.element) return null;
    return this.element.getBoundingClientRect().top;
  }

  get bottom() {
    if (!this.element) return null;
    return this.element.getBoundingClientRect().bottom;
  }

  get innerText() {
    if (!this.element) return null;
    return this.element?.innerText;
  }

  get isBig() {
    let viewPercent = this.element.offsetHeight / ScrollableContainer.visibleHeight;
    return viewPercent > .4;
  }

  get positionOnViewport() {
    if (!this.element) return null;

    const rect = this.element.getBoundingClientRect();
    const viewportHeight = ScrollableContainer.visibleHeight;
    const elementTop = rect.top;

    if (elementTop < 0) return -1;
    if (elementTop > viewportHeight) return Infinity;

    // Calculate the percentage of the viewport the element's top is at
    const percentageInView = (elementTop / viewportHeight);

    return percentageInView;
  }

  transferDataset() {
    // This is just to make it easier to inspect and debug DOM elements
    if (!this.linkElement) return;
    this._literalPathString = this.linkElement.dataset.literalPathString;
    this._enclosingTopic = this.linkElement.dataset.enclosingTopic;
    this._enclosingSubtopic = this.linkElement.dataset.enclosingSubtopic;
    this._typeValue = this.linkElement.dataset.type;
    this._text = this.linkElement.dataset.text;
  }

  get text() {
    return this.linkElement?.dataset?.text || this.metadataObject?.text;
  }

  get targetTopic() {
    return this.literalPath.lastTopic;
  }
  get targetSubtopic() {
    if (!this.element) return Topic.fromMixedCase(this.metadataObject.targetSubtopicString);
    if (this.isLocal) return Topic.fromMixedCase(this.element.dataset.targetSubtopic);
    return this.literalPath.lastSubtopic;
  }

  get childTopic() {
    return this.literalPath.firstTopic;
  }
  get childSubtopic() {
    if (!this.element) return Topic.fromMixedCase(this.metadataObject.targetSubtopicString);
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
    return this.element?.parentNode.closest('.canopy-section');
  }

  get sectionElement() {
    throw new Error("Depreciated in favor of #enclosingSectionElement");
  }

  get enclosingParagraphElement() {
    return this.element?.parentNode.closest('.canopy-paragraph');
  }

  get parentParagraphElement() {
    throw new Error("Depreciated in favor of #enclosingParagraphElement");
  }

  get enclosingParagraph() {
    if (!this.enclosingSectionElement) return null;
    return new Paragraph(this.enclosingSectionElement);
  }

  get enclosingPath() {
    if (!this.metadataObject && !this.enclosingSectionElement) return null; // eg link callback constructor that doesn't resolve
    if (this.metadataObject) return new Path(this.metadataObject.enclosingPathString);
    return this.enclosingParagraph.path;
  }

  get targetParagraph() { // if the link is to A/B/C, A is the child and C is the targetParagraph
    if (!this.isParent) return null;

    if (!Paragraph.byPath(this.inlinePath)) {
      if (this.cycle) return null; // the paragraph doesn't exist because we didn't preview it
      console.log(`Did not find paragraph child element matching link [${this.literalPath.firstTopic.mixedCase}, ${this.literalPath.firstSubtopic.mixedCase}]`); // could be network issues
      return null;
    }

    return Paragraph.byPath(this.inlinePath);
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
    throw '#path is deprecated in favor of #inlinePath or #literalPath';
  }

  get targetPath() { // links are assumed to be inlined unless the user redirects explicitly
    throw '#targetPath is deprecated in favor of #inlinePath or #literalPath';
  }

  get literalPath() {
    if (this.isLocal) return Path.forSegment(this.enclosingTopic, this.targetSubtopic);
    if (this.isGlobal) return Path.for((this.element?.dataset||this.metadataObject).literalPathString);
    return null;
  }

  static collectMetadata(linkElement) {
    let link = new Link(linkElement);

    return {
      enclosingPathString: link.enclosingPath.string,
      text: linkElement.dataset.text,
      relativeLinkNumber: link.relativeLinkNumber,
      previewPathString: link.previewPath.string, // on initial page load we need the paragraph path to call updateView before we have a link to use
      targetUrl: linkElement.dataset.targetUrl,
      targetTopicString: linkElement.dataset.targetTopic,
      targetSubtopicString: linkElement.dataset.targetSubtopic,
      literalPathString: linkElement.dataset.literalPathString
    };
  }

  static elementFromMetadata(object) {
    let enclosingPath = new Path(object.enclosingPathString);
    let enclosingParagraph = enclosingPath.paragraph;
    if (!enclosingParagraph) { return console.error("Link selection data refers to non-existant link", object); }
    
    let perfectMatch = enclosingParagraph.linkBySelector(
      (link) => (
        link.isParent && 
        link.previewPath.string === object.previewPathString &&
        link.relativeLinkNumber === object.relativeLinkNumber &&
        link.text === object.text
      )
    );

    let link = perfectMatch || enclosingParagraph.linkBySelector(  // if the link gets moved to a new paragraph, we should invalidate else select and not open parent link
      (link) => (link.isParent && link.previewPath.string === object.previewPathString) ||
        (link.isExternal && link.element?.dataset?.targetUrl === object.targetUrl)
    );

    return link?.element || null;
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
    return this.enclosingParagraph?.parentLink;
  }

  isParentLinkOf(paragraph) {
    return paragraph?.parentLink?.equals(this);
  }

  get grandParentLink() {
    return this.parentLink?.parentLink;
  }

  get topicParagraph() {
    if (!this.element) return null;
    return new Paragraph(this.element.parentNode.closest('.canopy-topic-section'));
  }

  get selected() {
    return this.element?.classList.includes('canopy-selected-link');
  }

  open() {
    this.element?.classList.add('canopy-open-link');
  }

  get isOpen() {
    return this.element?.classList.contains('canopy-open-link');
  }

  get isClosed() {
    return !this.isOpen;
  }

  get isClosedCycle() {
    return !this.isOpen && this.cycle;
  }

  get isSelected() {
    return this.element?.classList.contains('canopy-selected-link');
  }

  get isPathReference() {
    return this.type === 'global' && (this.literalPath.length > 1 || this.childTopic.mixedCase !== this.childSubtopic.mixedCase); // A/B or A/B#C
  }

  get isCoterminalReference() { // ie A/B/C/D with [[E/C/D]], if not coterminal, regular reduction
    return this.literalPath.includesTopic(this.enclosingTopic) 
      && this.literalPath.lastTopic.mixedCase === this.enclosingTopic.mixedCase
      && this.literalPath.lastSubtopic.mixedCase === this.enclosingSubtopic.mixedCase;
  }

  get selfReferencingOverlapStart() { // e.g. A/B/C/D with reference [[E/F/C/D/G]] inline A/B/C/D/E/F/C/D/G and focus on F's link to C ie divergence
    let topicMatches = this.inlinePath.pathArray.map(([topic, _]) => topic.mixedCase === this.enclosingTopic.mixedCase);
    let indexOfSelfReference = topicMatches.lastIndexOf(true);
    let indexOfCurrentSegment = this.enclosingPath.length - 1;

    while(indexOfCurrentSegment !== 0 && this.inlinePath.pathArray[indexOfCurrentSegment - 1][0].mixedCase === this.inlinePath.pathArray[indexOfSelfReference - 1][0].mixedCase) {
      indexOfSelfReference--;
      indexOfCurrentSegment--;
    }

    if (indexOfCurrentSegment === 0) { // e.g. A/B/C/D [[G/A/B/C/D]], point to G's link to A because here that's context for the repetition
      return this.inlinePath.slice(0, indexOfSelfReference + 1); // +1 so slice includes the last element which is also root topic so we get it's parent link
    }

    return this.inlinePath.slice(0, indexOfSelfReference + 1); // e.g. A/B/C/D [[G/B/C/E]] point to A/B/C/D/G/B/C/E B's link to C ie start of shared portion
  }

  get isSelfReference() {
    return this.enclosingParagraph.path.lastSegment.equals(this.literalPath);
  }

  get isRehashReference() {
    return this.enclosingPath.endsWith(this.literalPath);
  }

  get parentLinkBeforeRehash() { // eg A/B/C [[B/C]] or A/B#C [[B#C]] give parent link in B
    return this.enclosingPath.sliceBeforeLastTopicInstance(this.literalPath.firstTopic)
      .append(Path.forTopic(this.literalPath.firstTopic))
      .intermediaryPathsTo(this.enclosingPath)[1].parentLink;
  }

  get isSimpleGlobal() {
    return this.isGlobal && !this.isPathReference; // a global reference to a single global topic
  }

  get isEffectivePathReference() { // a path reference which is not a cycle unless the cycle is open and thus functioning as a path reference
    return this.isPathReference && (!this.cycle || this.isInlinedCycleReference);
  }

  get isInlinedCycleReference() { // a cycle reference that has been inlined
    return this.introducesNewCycle && this.isOpen;
  }

  get isInDom() {
    return !!this.element?.closest('#_canopy');
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
    return this.inlinePath.reduce().subsetOf(this.enclosingPath) ||
      this.isRehashReference; // e.g. A/B/C with [[B/C]] which focuses on B
  }

  get isLateralCycle() {
    return this.cycle && !this.inlinePath.reduce().subsetOf(this.enclosingPath);
  }

  get isParent() {
    return this.isGlobal || this.isLocal;
  }

  isSiblingOf(otherLink) {
    return this.enclosingParagraph.equals(otherLink.enclosingParagraph);
  }

  isIn(paragraph) {
    if (!(paragraph instanceof Paragraph)) throw 'Wrong argument type: ' + typeof paragraph;
    return paragraph.links.map(link => link.element).includes(this.element);
  }

  get hasChildren() {
    return this.childParagraph?.hasLinks;
  }

  get firstChild() {
    return this.childParagraph?.links.filter(link => !link.element?.closest('.canopy-image-caption'))[0];
  }

  firstChildOf(otherLink) {
    return !!otherLink.firstChild?.equals(this);
  }

  get isFragment() {
    return this.childParagraph?.paragraphElement?.offsetHeight === 0;
  }

  get childParagraphElement() {
    return this.childParagraph?.paragraphElement;
  }

  get isOffScreen() {
    if (!this.element) return null;
    const rect = this.element.getBoundingClientRect();
    const viewportHeight = ScrollableContainer.visibleHeight;
    return rect.top < 0 || rect.bottom > viewportHeight;
  }

  get isVisible() {
    if (!this.element) return false;
    const rect = this.element.getBoundingClientRect();
    const windowHeight = ScrollableContainer.visibleHeight;

    // Calculate the visible height of the element
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);

    // Calculate the total height of the element
    const totalHeight = rect.bottom - rect.top;

    // Check if more than 50% of the element's height is visible
    return (visibleHeight / totalHeight) >= 0.5;
  }

  get isEntirelyVisible() {
    if (!this.element) return false;
    const rect = this.element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= ScrollableContainer.visibleHeight;
  }

  get isAboveViewport() {
    if (!this.element || !this.element.getBoundingClientRect) {
      return false;
    }

    const rect = this.element.getBoundingClientRect();
    return rect.top < ScrollableContainer.top;
  }

  get isBelowViewport() {
    if (!this.element || !this.element.getBoundingClientRect) {
      return false;
    }

    const rect = this.element.getBoundingClientRect();
    const viewportHeight = ScrollableContainer.visibleHeight;
    return rect.bottom > viewportHeight;
  }

  get isDistantParent() {
    return this.top + ScrollableContainer.visibleHeight * 0.5 < this.childParagraph.top;
  }

  isHigherThan(otherLink) {
    return this.top < otherLink.top;
  }

  get isFocused() {
    if (!this.element) return null;
    const rect = this.element.getBoundingClientRect();

    // Get the viewport height
    const viewportHeight = ScrollableContainer.visibleHeight;

    const topLimit = viewportHeight * 0.1;
    const bottomLimit = viewportHeight * 0.5;

    // Check if the element is within the target area
    const overlapsTop = rect.bottom > topLimit;
    const overlapsBottom = rect.top < bottomLimit;

    return overlapsTop && overlapsBottom;
  }

  get cycle() {
    return this.introducesNewCycle;
  }

  get backButton() { // ie, a cycle link pointing to the current topic root, which when reduced would take you to the previous path segment
    return this.literalPath.equals(this.enclosingParagraph.topicPath);
  }

  get introducesNewCycle() {
    if (!this.isGlobal) return false;
    return Path.introducesNewCycle(this.enclosingPath, this.literalPath);
  }

  get inlinePath() { // ie if the user would inline the link's target at the link's enclosing path
    // if (this.literalPath.equals(this.enclosingParagraph.literalPath)) { // link to self in root topic = pop
    //   return this?.enclosingParagraph.parentParagraph?.path || this.enclosingParagraph.path;
    // }

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

    if (this.isGlobal && this.introducesNewCycle) { // select the link and display enclosing path
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
    if (this.cycle || this.externalLink || this.isPathReference) return this.enclosingPath; // path references display target but keep URL
    if (this.isLocal || this.isSimpleGlobal || this.isInlinedCycleReference) return this.inlinePath;
  }

  select(options = {}) {
    if (options.options) throw 'Caller produced malformed options object';
    if (options?.newTab && this.isParent && options.redirect) return window.open(location.origin + this.literalPath.productionPathString, '_blank');
    if (options?.newTab && this.isParent) return window.open(location.origin + this.previewPath.productionPathString, '_blank');

    if (options.inlineCycles && this.isCycle) return updateView(this.inlinePath, this, options);
    if (options.scrollToParagraph) return updateView(this.previewPath, null, options);

    return updateView(this.previewPath, this, options);
  }

  execute(options = {}) {
    options = { scrollDirect: true, ...options };

    if (!options.renderOnly) Link.persistLinkSelectionInSession(this); // even if execution selects different link, this link was last touched within paragraph

    if (this.isExternal) {
      return window.open(this.element.href, '_blank'); // external links must open in new tab
    }

    if (options?.newTab && this.isParent && options.redirect) return window.open(location.origin + this.literalPath.productionPathString, '_blank');
    if (options?.newTab && this.isParent) return window.open(location.origin + this.previewPath.productionPathString, '_blank');

    if (options.redirect) { // all handling is the same for redirection
      return this.literalPath.display({ scrollStyle: 'instant', ...options}); // handles new tab
    }

    if (this.isSelfReference && !this.isOpen) {
      if (this.enclosingPath.lastSegment.isTopic) return this.enclosingPath.withoutLastSegment.display(options); // pop
      return this.enclosingPath.parentLink.select({...options, scrollToParagraph: false }); // shift
    }

    if (this.isRehashReference && !this.isOpen) { // e.g. A/B/C/D with reference [[B/C/D]] indicating empasis on B's link to C
      if (this.literalPath.isTopic) return updateView(this.enclosingPath, this.enclosingPath.parentLink, { ...options, scrollToParagraph: false });
      return updateView(Path.rendered, this.parentLinkBeforeRehash, {...options, scrollToParagraph: false });
    }

    if (this.isCoterminalReference && !this.isOpen) { // e.g. A/B/C/D with reducing reference [[E/F/C/D/G]] inline A/B/C/D/E/F/C/D/G and focus on F's link to C ie divergence
      return this.inlinePath.display({...options, renderOnly: true, inlineCycles: true }).then(() => {
        return updateView(this.inlinePath, this.selfReferencingOverlapStart.parentLink, { ...options, scrollToParagraph: false, inlineCycles: true });
      });
    }

    if (this.isGlobal && this.introducesNewCycle && !options.inlineCycles) { // reduction
      if (options.pushHistoryState) Link.pushHistoryState(this);
      return this.inlinePath.reduce().display(options);
    }

    if ((this.isPathReference && !this.cycle) || (this.cycle && options.inlineCycles)) { // path reference down
      if (options.pushHistoryState) Link.pushHistoryState(this);
      return this.inlinePath.display({ noScroll: true, ...options }).then( // path reference means interested in parent
        () => this.inlinePath.parentLink.select({ ...options, scrollDirect: true, scrollToParagraph: false })
      );
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

  get onPage() {
    if (!this.element) return null;
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
    Array.from(document.querySelectorAll('a.canopy-selected-link')).forEach(link => link.classList.remove('canopy-selected-link'));
    if (linkToSelect) linkToSelect.element?.classList.add('canopy-selected-link');
  }

  static persistLinkSelection(linkToSelect) {
    Link.persistLinkSelectionInHistory(linkToSelect);
    Link.persistLinkSelectionInSession(linkToSelect);
  }

  static selectionPresentInEvent(e) {
    return e.state && e.state?.linkSelection;
  }

  static get sessionSelection() {
    if (Path.url.empty) return null; // initial '/' load will never recall link selection

    let lastSelectionsOfParagraph = JSON.parse(sessionStorage.getItem('lastSelectionsOfParagraph') || '{}');
    let linkData = lastSelectionsOfParagraph[Path.url.string];

    if (linkData && linkData !== null) {
      return new Link(linkData);
    } else {
      return null;
    }
  }

  eraseLinkData() {
    let lastSelectionsOfParagraph = JSON.parse(sessionStorage.getItem('lastSelectionsOfParagraph') || '{}');
    if (this.enclosingPath) delete lastSelectionsOfParagraph[this.enclosingPath];
    sessionStorage.setItem('lastSelectionsOfParagraph', JSON.stringify(lastSelectionsOfParagraph));
    if (history?.state?.linkSelection) history.state.linkSelection = null;
  }

  static get historySelection() {
    if (Path.url.empty) return null; // initial '/' load will never recall link selection

    if (history?.state?.linkSelection) {
      return new Link(history.state.linkSelection);
    } else {
      return null;
    }
  }

  static get savedSelection() {
    return this.historySelection;// || this.sessionSelection || null;
  }

  static get selection() {
    let selectedLink = document.querySelector('a.canopy-selected-link');
    if (selectedLink) {
      return new Link(selectedLink);
    } else {
      return null;
    }
  }

  static persistLinkSelectionInHistory(link) {
    // This has to be static because Link.selection hasn't always updated
    // between when a new link is selected and when we want to persist that selection
    history.replaceState(
      link && { linkSelection: link.metadata } || null,
      document.title,
      window.location.href
    );
  }

  static pushHistoryState(link) {
    if (!link) return;

    history.pushState(
      { linkSelection: link.metadata },
      document.title,
      window.location.origin + link.previewPath.productionPathString
    );
  }

  static current() {
    throw new Error("Link#current does not exist, try Link#selection");
  }

  static persistLinkSelectionInSession(link) {
    if (link) {
      let lastSelectionsOfParagraph = JSON.parse(sessionStorage.getItem('lastSelectionsOfParagraph') || '{}');
      lastSelectionsOfParagraph[link.enclosingParagraph.path] = link.metadata;
      sessionStorage.setItem('lastSelectionsOfParagraph', JSON.stringify(lastSelectionsOfParagraph));
      //console.log('Storing', link?.childSubtopic?.mixedCase, 'as session selection for', link.enclosingParagraph.path.string)
    }
  }

  static lastSelectionOfParagraph(paragraph) {
    let lastSelectionsOfParagraph = JSON.parse(sessionStorage.getItem('lastSelectionsOfParagraph') || '{}');
    if (lastSelectionsOfParagraph[paragraph.path]) {
      return new Link(lastSelectionsOfParagraph[paragraph.path]);
    }
  }

  get isLastSelection() {
    return Link.lastSelectionOfParagraph(this.enclosingParagraph)?.equals(this); // trigger DOM check
  }

  static get visible() {
    return Array.from(document.querySelectorAll('.canopy-selectable-link'))
      .map(element => Link.for(element))
      .filter(link => link.isVisible)
  }

  static get onPage() {
    return Array.from(document.querySelectorAll('.canopy-selectable-link'))
      .map(element => Link.for(element))
      .filter(link => link.onPage)
  }

  static for(arg) {
    return new this(arg);
  }

  static from(arg) {
    return new this(arg);
  }
}

export default Link;
