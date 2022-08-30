function TextToken(text) {
  this.text = text;
  this.type = 'text';
}

function LocalReferenceToken(
  targetTopic,
  targetSubtopic,
  enclosingTopic,
  enclosingSubtopic,
  text
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
  text
) {
  this.text = text;
  this.type = 'global';
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
}

function ImportReferenceToken(
  targetTopic,
  targetSubtopic,
  enclosingTopic,
  enclosingSubtopic,
  text
) {
  this.text = text;
  this.type = 'import';
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
}

function UrlToken(url, text) {
  this.type = 'url';
  this.text = text || url;
  this.url = url || text;
}

function ImageToken(alt, resourceUrl, title, anchorUrl) {
  this.type = 'image';
  this.resourceUrl = resourceUrl;
  this.title = title || null;
  this.altText = alt || null;
  this.anchorUrl = anchorUrl || null;
}

function FootnoteToken(superscript) {
  this.type = 'footnote';
  this.text = superscript;
}

function HtmlToken(html) {
  this.type = 'html_element';
  this.html = html;
}

module.exports = {
  LocalReferenceToken,
  GlobalReferenceToken,
  ImportReferenceToken,
  TextToken,
  UrlToken,
  ImageToken,
  FootnoteToken,
  HtmlToken
};
