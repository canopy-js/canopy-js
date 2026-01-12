function onLinkClick(link) {
  return (e) => {
    e.preventDefault();
    if (textIsSelected(link)) return // disqualify drags

    let newTab = e.metaKey || e.ctrlKey; // mac vs linux and windows

    if (!newTab && !e.altKey && link.isSelected && !link.isClosedCycle) { // unselect parent or path/cycle link
      return link.enclosingPath.display({
        scrollDirect: true,
        scrollToParagraph: true,
        noBeforeChangeScroll: true,
        noAfterChangeScroll: link.isCycle
      });
    }

    if (!newTab && !e.altKey && link.isOpen) { // select open link
      return link.select({ scrollDirect: true }); // not scrollToParagraph because returning up to parent link
    }

    if (!newTab && !e.altKey && !link.isVisible) { // scroll up to see link
      return link.select({
        scrollDirect: true, 
        noBeforeChangeScroll: true, // we should move straight to the link
        noAfterChangePause: true 
      });
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
      pushLinkSelection: true,
      scrollToParagraph: true,
      noBeforeChangeScroll: !link.isCycle, // only allow pre-scroll for cycle reductions
      noAfterChangePause: true // either focus on clicked link if above viewport (above), or go straight to target
    });
  }
}

function textIsSelected(link) {
  const selection = window.getSelection();
  return selection 
    && selection.rangeCount > 0 
    && !selection.isCollapsed 
    && (selection.focusElement||selection.focusNode.parentNode) // focusElement can be textNode which lacks .closest
      .closest('.canopy-selectable-link') === link.element;
}

export { onLinkClick };
