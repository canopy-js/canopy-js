function removeMarkdownTokens(string) {
  return string.
    replace(/([^\\]|^)_/g, '$1').
    replace(/([^\\]|^)\*/g, '$1').
    replace(/([^\\]|^)~/g, '$1');
}

export default removeMarkdownTokens;
