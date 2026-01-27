function onLinkClick(link) {
  return (e) => {
    e.preventDefault();
    if (textIsSelected(link)) return // disqualify drags

    let newTab = e.metaKey || e.ctrlKey; // mac vs linux and windows

    if (!newTab && !e.altKey && link.isSelected && !link.isClosedCycle) { // unselect parent or path/cycle link
      return link.enclosingPath.display({
        scrollToParagraph: true,
        noBeforeChangeScroll: true,
        noAfterChangeScroll: link.isCycle
      });
    }

    if (!newTab && !e.altKey && link.isOpen) { // select open link
      return link.select({
        noBeforeChangeScroll: true // clicked link is the fulcrum, demonstrates focus so skip pre-scroll
      });
    }

    if (!newTab && !e.altKey && link.isInlinedCycleReference) { // un-inlining an inlined cycle reference
      return link.select();
    }

    const noBeforeChangeScroll = (!link.isCycle || link.isDownCycle) && // clicked link is the fulcrum except for non-down cycle links
      !link.isAboveViewport; // scroll to make link visible before descending
    const noAfterChangePause = !link.isCycle; // allow pause on cycle reductions

    return link.execute({
      newTab,
      redirect: e.altKey,
      inlineCycles: e.shiftKey,
      selectALink: false,
      pushLinkSelection: true,
      scrollToParagraph: true, // clicking a link should focus on child paragraph, not the link
      noBeforeChangeScroll,
      noAfterChangePause
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
