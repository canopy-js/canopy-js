import Paragraph from 'models/paragraph';
import Link from 'models/link';
import Path from 'models/path';
import { canopyContainer } from 'helpers/getters';
import updateView from 'display/update_view';
import { scrollElementToPosition } from 'display/helpers';

class BackButton {
  static generate() {
    let buttons = document.createElement('DIV');
    buttons.id = 'canopy-back-button-container';

    let backButton = document.createElement('A');
    backButton.id = 'canopy-back-button';

    backButton.innerText = '↩';
    backButton.classList.add('canopy-selectable-link');
    buttons.appendChild(backButton);

    backButton.addEventListener('click', () => {
      this.disableForSecond();
      this.execute();
    });

    return buttons;
  }

  static initializeListeners() {
    setTimeout(() => window.addEventListener('scroll', this.updateVisibilityState.bind(this)), 1000);
    setTimeout(() => window.addEventListener('resize', this.updateVisibilityState.bind(this)), 1000);

    setTimeout(() => this.updateVisibilityState(), 1000);
  }

  static init() {
    let buttons = this.generate();
    const canopyContainer = document.getElementById('_canopy');
    canopyContainer.appendChild(buttons);
    this.hide();

    this.initializeListeners();
  }

  static updateVisibilityState(options) {
    if (!Paragraph.contentLoaded) return;

    options = options || {};
    let { initialLoad } = options;

    if (this.disable) this.hide();

    const backButton = this.element;
    const paragraphElement = Paragraph.current?.paragraphElement; // Assuming this is accessible

    if (!paragraphElement) {
      return;
    }

    const paragraphRect = paragraphElement.getBoundingClientRect();
    const buttonRect = backButton.getBoundingClientRect();
    const topIsAboveViewport = canopyContainer.getBoundingClientRect().top < 0;
    const contentIsNotTooLow = (paragraphRect.bottom + 120) <= buttonRect.top; // then showing the button will interrupt the content
    const thereisEnoughContent = Paragraph.root.paragraphElement.getBoundingClientRect().bottom < 0;

    if (contentIsNotTooLow && thereisEnoughContent && topIsAboveViewport) {
      this.show(initialLoad);
    } else if (this.isVisible) {
      this.hide();
      this.deselect();
    }
  }

  static disableShow() {
    this.hide();
    this.disable = true;
  }

  static timeoutId = null;

  static disableForSecond() {
    this.disableShow();

    // Clear any existing timeout
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    // Set a new timeout
    this.timeoutId = setTimeout(() => {
      this.enableShow();
      this.timeoutId = null; // Reset the timeoutId after the delay
    }, 1000);
  }

  static enableShow(initialLoad) {
    this.disable = false;
    this.updateVisibilityState({initialLoad});
  }

  static show(initialLoad) {
    if (this.disable) return;
    if (this.element) {
      this.element.parentElement.style.zIndex = '1';
      this.element.style.opacity = '1'; // Fade in
      if (!initialLoad) this.element.style.transition = 'opacity 0.2s';
    }
  }

  static hide() {
    if (this.element) {
      this.element.style.opacity = '0'; // Fade out immediately
      this.element.parentElement.style.zIndex = '-1';
      this.element.style.transition = 'opacity 0s';
    }
  }

  static get canBecomeSelected() {
    return BackButton.isVisible && Link.selection.element !== this.element;
  }

  static get isVisible() {
    return this.element.style.opacity === '1';
  }

  static select() {
    this.previouslySelectedLink = Link.selection;
    Link.deselect();
    this.element.classList.add('canopy-selected-link');
  }

  static selected() {
    return Link.selection.element === this.element;
  }

  static deselect() {
    this.element.classList.remove('canopy-selected-link');
    this.previouslySelectedLink && this.previouslySelectedLink.onCurrentPage && this.previouslySelectedLink.addSelectionClass();
    this.previouslySelectedLink = null;
  }

  static wasPreviousSelection() {
    return this.previouslySelectedLink === null; //
  }

  static handlePathChange(options = {}) {
    if (!options.initialLoad && !options.noHideBackButton) {
      BackButton.disableForSecond();
    } else {
      BackButton.updateVisibilityState(options);
    }
  }

  static get linkToSelect() {
    // return Paragraph.current.topicParagraph?.parentLink?.parentLink || // close current topic tree
    return Paragraph.current.topicParagraph?.parentLink || // close current topic subtopics
      null; // ie root has no parent paragraph
  }

  static async execute() {
    this.deselect();
    this.disableForSecond();

    let success = await scrollElementToPosition(
      this.linkToSelect?.element || Paragraph.root.paragraphElement,
      { targetRatio: 0.5, minDiff: 50, direction: 'up', behavior: 'smooth' }
    );

    if (success) {
      await new Promise(resolve => setTimeout(resolve, 150));
      return updateView(
        this.linkToSelect?.previewPath || Paragraph.root.path,
        this.linkToSelect,
        { noScroll: true }
      );
    }
  }

  static get element() {
    return document.getElementById('canopy-back-button');
  }

  static get container() {
    return document.getElementById('canopy-back-button-container');
  }
}

export default BackButton;
