import { canopyContainer } from 'helpers/getters';
import Paragraph from 'models/paragraph';

class ScrollableContainer {
  static get windowMode() {
    return !isElementScrollable(canopyContainer.parentElement)
  }

  static get element() {
    if (this.windowMode) return document.body;
    if (!this.windowMode) return canopyContainer.parentElement;
  }

  static get visibleHeight() {
    if (this.windowMode) return window.innerHeight;
    if (!this.windowMode) return this.element.clientHeight;
  }

  static get innerHeight() {
    if (this.windowMode) return document.documentElement.scrollHeight;
    if (!this.windowMode) return this.element.scrollHeight;
  }

  static get currentScroll() {
    if (this.windowMode) return window.scrollY;
    if (!this.windowMode) return this.element.scrollTop;
  }

  static get top () {
    if (this.windowMode) return 0;
    return canopyContainer.parentElement.getBoundingClientRect().top;
  }

  static addEventListener(type, handler) {
    if (this.windowMode) return window.addEventListener(type, handler);
    if (!this.windowMode) return this.element.addEventListener(type, handler);
  }

  static scrollTo(options){
    if (this.windowMode) return window.scrollTo(options);
    if (!this.windowMode) return this.element.scrollTo(options);
  }

  static get focusGap() {
    return ScrollableContainer.visibleHeight * 0.3;
  }

  static get focusY() {
    return ScrollableContainer.visibleHeight * 0.3 + ScrollableContainer.currentScroll;
  }

  static get focusedElement() { // return the HTML element that should be used as a focus when image load events disrupt viewport
    return Array.from(document.querySelectorAll('*'))
      .filter(el => {
        // Exclude non-visible elements
        if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
        if (el.closest('.canopy-image')) return false;

        const rect = el.getBoundingClientRect();
        // Check if element's bottom is within the viewport
        return rect.bottom > 0 && rect.bottom <= this.visibleHeight;
      })
      .reduce((highest, el) => {
        if (highest?.classList.contains('canopy-selected-link')) return highest; // selected link if visible is always the focus
        if (el?.classList.contains('canopy-selected-link')) return el;

        return !highest || el.getBoundingClientRect().bottom < highest.getBoundingClientRect().bottom ? el : highest;
      }, null) || canopyContainer; // Initialize reduce with null
  }
}

function isElementScrollable(element) {
  const overflowY = window.getComputedStyle(element).overflowY;
  const isOverflowScrollable = overflowY === 'scroll' || overflowY === 'auto';
  const contentOverflows = element.scrollHeight > element.clientHeight;
  return isOverflowScrollable && contentOverflows;
}

export default ScrollableContainer;
