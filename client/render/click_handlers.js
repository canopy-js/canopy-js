import updateView from 'display/update_view';
import Path from 'models/path';

function onLinkClick(link) {
  return (e) => {
    e.preventDefault();
    let path, linkToSelect;
    let newTab = e.metaKey || e.ctrlKey; // mac vs linux and windows

    if (!newTab && !e.altKey && link.isSelected && !(link.cycle && !link.open)) { // close global child
      return link.parentLink.select({ scrollTo: 'paragraph', scrollDirect: true });
    }

    return link.execute({
      newTab,
      redirect: e.altKey,
      inlineCycles: e.shiftKey,
      scrollDirect: true,
      scrollTo: 'paragraph',
      selectALink: false
    });
  }
}

export { onLinkClick };
