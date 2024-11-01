import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';

function onLinkClick(link) {
  return (e) => {
    e.preventDefault();
    if (textIsSelected()) return // disqualify drags

    let newTab = e.metaKey || e.ctrlKey; // mac vs linux and windows
    let redirect = e.altKey;
    let inlineCycles = e.shiftKey;
    let redirectingCycle = link.cycle && !inlineCycles;

    if (!newTab && !e.altKey && link.isSelected && !link.isClosedCycle && !link.isPathReference && !link.isInlinedCycleReference) { // close global link
      return link.parentLink?.select({ scrollDirect: true, noBeforeChangeScroll: true }) || Path.root.display({ scrollDirect: true, noBeforeChangeScroll: true });
    }

    if (!newTab && !e.altKey && link.isOpen && !link.isClosedCycle && !link.isPathReference && !link.isInlinedCycleReference) { // select open link
      return link.select({ scrollDirect: true, noBeforeChangeScroll: true }); // not scrollToParagraph because returning up to parent link
    }

    if (!newTab && !e.altKey && link.isOffScreen && !link.isClosedCycle) { // scroll up to see partially visible link
      return link.select({ scrollDirect: true, noBeforeChangeScroll: true }); // not scrollToParagraph because returning up to parent link
    }

    if (!newTab && !e.altKey && link.isInlinedCycleReference) { // un-inlining an inlined cycle reference
      return link.select();
    }

    return link.execute({
      newTab,
      redirect: e.altKey,
      inlineCycles: e.shiftKey,
      scrollDirect: true,
      selectALink: false,
      pushHistoryState: true,
      scrollToParagraph: true,
      noBeforeChangeScroll: !redirectingCycle // most clicks cause downward movement except redirecting cycles
    });
  }
}

function textIsSelected() {
  const selection = window.getSelection();
  return selection && selection.rangeCount > 0 && !selection.isCollapsed;
}

export { onLinkClick };
