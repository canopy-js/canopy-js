function TextToken(text, length) {
  this.text = text;
  this.type = 'text';
  this.length = length || text.length;
}

function LocalReferenceToken(
    targetTopic,
    targetSubtopic,
    enclosingTopic,
    enclosingSubtopic,
    text,
    length
  ) {
  this.text = text;
  this.type = 'local';
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.length = length;
}

function GlobalReferenceToken(
    targetTopic,
    targetSubtopic,
    enclosingTopic,
    enclosingSubtopic,
    text,
    length
  ) {
  this.text = text;
  this.type = 'global';
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.length = length;
}

function ImportReferenceToken(
    targetTopic,
    targetSubtopic,
    enclosingTopic,
    enclosingSubtopic,
    text,
    length,
  ) {
  this.text = text;
  this.type = 'import';
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.length = length;
}

function markdownUrlToken(url, text, length) {
  this.type = 'url';
  this.text = text || url;
  this.url = url;
  this.length = length;
}

function markdownImageToken(alt, resourceUrl, title, anchorUrl, length) {
  this.type = 'image';
  this.resourceUrl = resourceUrl;
  this.title = title || null;
  this.altText = alt || null;
  this.anchorUrl = anchorUrl || null;
  this.length = length;
}

function markdownFootnoteToken(superscript, length) {
  this.type = 'footnote';
  this.text = superscript;
  this.length = length;
}

function markdownHtmlToken(html, length) {
  this.type = 'html';
  this.html = html;
  this.length = length;
}

module.exports = {
  LocalReferenceToken,
  GlobalReferenceToken,
  ImportReferenceToken,
  TextToken,
  markdownUrlToken,
  markdownImageToken,
  markdownFootnoteToken,
  markdownHtmlToken,
}
