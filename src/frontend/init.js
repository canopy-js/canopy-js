//Copyright Greenhouse Software 2017

window.onload = function onLoad() {
  if (!mossContainer()) {
    throw new Error('Page must have an html element with id "_canopy"');
  }

  if (mossContainer().dataset.source_url) {
    sendRequestTo(mossContainer().dataset.source_url, function success(responseText){
      init(responseText);
    });
  } else if (mossContainer().textContent) {
    init(mossContainer().textContent.trim());
  } else {
    throw new Error('No data string provided');
  }
}

function init(dataString) {
  if (!dataString || dataString.constructor !== String) {
    throw new Error("No data string provided");
  }

  var paragraphNodeTree = ParagraphNodeTree(dataString);
  var sectionElementTree = SectionElementTree(paragraphNodeTree, 0);

  mossContainer().innerHTML = '';
  mossContainer().appendChild(sectionElementTree);

  if (currentLink()){
    show(currentLink());
  } else {
    setFragmentToHashOfLink(rootLink());
  }
}

window.addEventListener('hashchange', function(e) {
  e.preventDefault();
  var hash = fragmentIdOf(e.newURL);

  if (linkWithDisplayHash(hash)) {
    show(linkWithDisplayHash(hash));
  } else {
    setFragmentToHashOfLink(rootLink());
  }
});
