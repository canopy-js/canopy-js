function TextToken(text) {
  this.text = text;
  this.type = 'text';
}

function LocalReferenceToken(
    targetTopic,
    targetSubtopic,
    enclosingTopic,
    enclosingSubtopic,
    text,
  ) {
  this.text = text;
  this.type = 'local';
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
}

function GlobalReferenceToken(
    targetTopic,
    targetSubtopic,
    enclosingTopic,
    enclosingSubtopic,
    text,
  ) {
  this.text = text;
  this.type = 'global';
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
}

function markdownUrlToken(url, text) {
  this.type = 'url';
  this.text = text || url;
  this.url = url;
}

function markdownImageToken(alt, resourceUrl, title, anchorUrl) {
  this.type = 'image';
  this.resourceUrl = resourceUrl;
  this.title = title || null;
  this.altText = alt || null;
  this.anchorUrl = anchorUrl || null;
}

function markdownFootnoteToken(superscript) {
  this.type = 'footnote';
  this.text = superscript;
}

function markdownHtmlToken(html) {
  this.type = 'html';
  this.html = html;
}

export {
  LocalReferenceToken,
  GlobalReferenceToken,
  TextToken,
  markdownUrlToken,
  markdownImageToken,
  markdownFootnoteToken,
  markdownHtmlToken
};

