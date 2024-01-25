import updateView from 'display/update_view';
import Path from 'models/path';
import Link from 'models/link';

function onLinkClick(link) {
  return (e) => {
    e.preventDefault();
    let newTab = e.metaKey || e.ctrlKey; // mac vs linux and windows
    let redirect = e.altKey;
    let inlineCycles = e.shiftKey;
    let redirectingCycle = link.cycle && !inlineCycles;

    if (!newTab && !e.altKey && link.isSelected && !link.isClosedCycle && !link.isPathReference) { // close global link
      return link.parentLink?.select({ scrollDirect: true, noAnimate: true }) || Path.root.display({ scrollDirect: true, noAnimate: true });
    }

    if (!newTab && !e.altKey && link.isOpen && !link.isClosedCycle && !link.isPathReference) { // select open link
      return link.select({ scrollDirect: true, noAnimate: true }); // not scrollToParagraph because returning up to parent link
    }

    if (!newTab && !e.altKey && link.isOffScreen && !link.isClosedCycle) { // scroll up to see partially visible link
      return link.select({ scrollDirect: true, noAnimate: true }); // not scrollToParagraph because returning up to parent link
    }

    return link.execute({
      newTab,
      redirect: e.altKey,
      inlineCycles: e.shiftKey,
      scrollDirect: true,
      scrollToParagraph: !link?.isBackCycle,
      selectALink: false,
      pushHistoryState: true,
      noAnimate: !redirectingCycle // most clicks cause downward movement except redirecting cycles
    });
  }
}

export { onLinkClick };
