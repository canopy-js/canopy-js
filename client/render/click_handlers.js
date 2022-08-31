import updateView from 'display/update_view';
import Path from 'models/path';

function onLocalLinkClick(targetTopic, targetSubtopic, link) {
  return (e) => {
    e.preventDefault();
    let path, linkToSelect;
    let newTab = e.metaKey || e.ctrlKey; // mac vs linux and windows

    if (newTab && !e.altKey) { // no zoom
      return window.open(location.origin + link.targetPath.string, '_blank');
    }

    if (newTab && e.altKey) { // zoom
      return window.open(location.origin + link.targetPath.lastSegment.string, '_blank');
    }

    if (!newTab && e.altKey) { //zoom
      let path = link.targetPath.lastSegment;
      return updateView(path, link.atNewPath(path));
    }

    if (!newTab && !e.altKey && link.isSelected) {
      path = link.parentLink?.paragraphPathWhenSelected || Path.current.rootTopicPath;
      return updateView(path, linkToSelect);
    }

    if (!newTab && !e.altKey && !link.isSelected) {
      path = link.paragraphPathWhenSelected;
      linkToSelect = link;
      return updateView(path, linkToSelect);
    }
  };
}

function onGlobalAndImportLinkClick (link) {
  return (e) => {
    e.preventDefault();
    let path, linkToSelect;
    let newTab = e.metaKey || e.ctrlKey; // mac vs linux and windows

    if (!newTab && !e.altKey && link.isSelected) { // close global child
      path = link.enclosingParagraph.path;
      return updateView(path, linkToSelect);
    }

    if (!newTab && !e.altKey && !link.isSelected) { // open global child
      path = link.paragraphPathWhenSelected;
      linkToSelect = link;
      return updateView(path, linkToSelect);
    }

    if (!newTab && e.altKey) { // Redirect to global child
      path = Path.forSegment(link.targetTopic, link.targetSubtopic);
      return updateView(path, linkToSelect, { scrollStyle: 'auto' });
    }

    if (newTab && !e.altKey) { // inline
      path = link.paragraphPathWhenSelected; // open the link in new tab
      return window.open(location.origin + path.string, '_blank');
    }

    if (newTab && e.altKey) {
      path = Path.forSegment(link.targetTopic, link.targetSubtopic);
      return window.open(location.origin + path.string, '_blank');
    }
  }
}

export { onLocalLinkClick, onGlobalAndImportLinkClick };
