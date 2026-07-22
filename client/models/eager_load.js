function uniqueValidEagerLoadParagraphs(paragraphs) {
  const paragraphsByPath = new Map();

  paragraphs.forEach(paragraph => {
    if (!paragraph) return;

    if (!paragraph.path?.string) {
      console.warn('Skipping invalid eager-load paragraph candidate');
      return;
    }

    paragraphsByPath.set(paragraph.path.string, paragraph);
  });

  return Array.from(paragraphsByPath.values());
}

export { uniqueValidEagerLoadParagraphs };
