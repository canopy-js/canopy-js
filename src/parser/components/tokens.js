import removeMarkdownTokens from 'helpers/remove_markdown_tokens';

function TextToken(text, escaped) {
  this.text = text;
  this.type = 'text';
  this.escaped = escaped || false;
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
  this.targetSubtopic = removeMarkdownTokens(targetSubtopic);
  this.targetTopic = removeMarkdownTokens(targetTopic);
  this.enclosingTopic = removeMarkdownTokens(enclosingTopic);
  this.enclosingSubtopic = removeMarkdownTokens(enclosingSubtopic);
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
  this.targetSubtopic = removeMarkdownTokens(targetSubtopic);
  this.targetTopic = removeMarkdownTokens(targetTopic);
  this.enclosingTopic = removeMarkdownTokens(enclosingTopic);
  this.enclosingSubtopic = removeMarkdownTokens(enclosingSubtopic);
}

function markdownUrlToken(url, text, urlSubtopic) {
  this.type = 'url';
  this.text = text || url;
  this.url = url;
  this.urlSubtopic = urlSubtopic;
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

