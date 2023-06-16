const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error(message.text());
    }
  })
});

test.describe('Text styles', () => {
  test('Underscores create italic text', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Italic_text');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is text with italics. This is multiple italicized words, and this is italics within a word, but th_is is no_thing. This is an italic table cell.");
    await expect(page.locator('.canopy-selected-section i')).toHaveCount(4);
  });

  test('Asterisks create bold text', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Bold_text');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is bold text. This is a bold sentence which can contain spaces because the asterisks are on the edges of the words, whereas this is bold within a word, and this is not bold be*cause there are sp*aces and it is an intra-word style character. This is a bold table cell.");
    await expect(page.locator('.canopy-selected-section b')).toHaveCount(4);
  });

  test('Tildes create strike-through text', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Strike-through_text');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is strike through text. So is this. And this. Bu~t not thi~s. This is a struck through table cell.");
    await expect(page.locator('.canopy-selected-section s')).toHaveCount(4);
  });

  test('Underscores and asterisks creates bold italic text', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Italicized_bolded_text');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is italicized bolded text.");
    await expect(page.locator('.canopy-selected-section b i')).toHaveText("italicized bolded text");
  });

  test('Inline html tags are interpreted', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Inline_HTML_elements');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is text with an inline html element.");
    await expect(page.locator('.canopy-selected-section s')).toHaveText("an inline html element");
  });

  test('Escaped style characters are not rendered', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Escaped_style_characters');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is text with _escaped_ style characters.");
    await expect(page.locator('.canopy-selected-section i')).toHaveCount(0);
  });

  test('Backticks create inline code snippets', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Regular_code_snippets');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is a code snippet.");
    await expect(page.locator('.canopy-selected-section code')).toHaveText("code snippet");
  });

  test('Code snippets can contain escaped backticks', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Code_snippets_that_escape_backticks');
    await expect(page.locator('.canopy-selected-section'))
      .toHaveText("This is a code snippet that contains an escaped backtick ` but also intentional backslashes \\ eg, and also intentional double backticks eg \\\\ etc.");

    await expect(page.locator('.canopy-selected-section code'))
      .toHaveText("code snippet that contains an escaped backtick ` but also intentional backslashes \\ eg, and also intentional double backticks eg \\\\ etc");
  });

  test('Code snippets do not render style characters or style tokens', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Code_snippets_that_contain_style_characters_and_tokens');
    await expect(page.locator('.canopy-selected-section'))
      .toHaveText("This is a code snippet that contains _style characters_ and style tokens like {{OPEN_}} abc {{CLOSE_}}.");

    await expect(page.locator('.canopy-selected-section code')).toHaveText("code snippet that contains _style characters_ and style tokens like {{OPEN_}} abc {{CLOSE_}}");
  });

  test('Backticks can precede or succeed white space and regular punctuation', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Code_snippets_on_boundaries');
    await expect(page.locator('.canopy-selected-section code')).toHaveCount(8);
  });
});

test.describe('Inline entities', () => {
  test('It creates images', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Images');
    await expect(page.locator('.canopy-selected-section p > span:has-text("This is a picture of jelly fish.")')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section img')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section span.canopy-image-caption')).toHaveText("Jelly \"Fish\" - W. Carter");
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.src))
      .toEqual('https://upload.wikimedia.org/wikipedia/commons/f/f7/Lion%27s_mane_jellyfish_in_Gullmarn_fjord_at_S%C3%A4mstad_8.jpg');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.title))
      .toEqual('Jelly \"fish\" title');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.alt)).toEqual('Alt text');
    await expect(await page.locator('.canopy-selected-section a.canopy-image-anchor').evaluate((element) => element.href))
      .toEqual('https://upload.wikimedia.org/wikipedia/commons/f/f7/Lion%27s_mane_jellyfish_in_Gullmarn_fjord_at_S%C3%A4mstad_8.jpg');
  });

  test('It creates linked images', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Linked_images');
    await expect(page.locator('.canopy-selected-section p > span:has-text("This picture of a frog is also a link.")')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section img')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section span.canopy-image-caption')).toHaveText("Frog \"link\" - Rushenb");
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.src))
      .toEqual('https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Rhacophorus_nigropalmatus.jpg/2560px-Rhacophorus_nigropalmatus.jpg');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.title))
      .toEqual('Frog \"title\"');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.alt)).toEqual('Alt text');
    await expect(await page.locator('.canopy-selected-section a.canopy-image-anchor').evaluate((element) => element.href)).toEqual('http://google.com/');
  });

  test('It creates links from URLs', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#URLs');
    await expect(page.locator('.canopy-selected-section')).toContainText("This is a URL, http://google.com");
    await expect(await page.locator('.canopy-selected-section a').evaluate((element) => element.href)).toEqual('http://google.com/');
    await expect(await page.locator('.canopy-selected-section svg')).toHaveCount(1);
  });

  test('It will not separate link icon from prior word', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Links_with_prior_word_break');
    await expect(await page.locator('.canopy-selected-section svg')).toHaveCount(1);

    let svgBottom = await page.locator('.canopy-selected-section span.canopy-url-link-svg-container').evaluate(
      element => element.getBoundingClientRect().bottom);
    let tokensBottom = await page.locator('.canopy-selected-section span.canopy-url-link-tokens-container').evaluate(
      element => element.getBoundingClientRect().bottom);
    expect(svgBottom - tokensBottom).toBeLessThan(5);
  });

  test('It will not separate link icon from following punctuation', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Links_with_following_punctuation_break');

    let svgBottom = await page.locator('.canopy-selected-section span.canopy-url-link-svg-container').evaluate(
      element => element.getBoundingClientRect().bottom);
    let nextTokenBottom = await page.evaluate(() =>
      document.querySelector('.canopy-selected-section span.canopy-url-link-svg-container').parentElement.nextSibling.getBoundingClientRect().bottom);
    expect(nextTokenBottom - svgBottom).toBeLessThan(5);
  });

  test('It creates links from hyperlink markup', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Hyperlinks');
    await expect(page.locator('.canopy-selected-section')).toContainText("This is a link");
    await expect(await page.locator('.canopy-selected-section a').evaluate(element => element.href)).toEqual('http://google.com/');
    await expect(await page.locator('.canopy-selected-section svg')).toHaveCount(1);
  });

  test('It creates inline HTML elements', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Inline_HTML');
    await expect(await page.locator('.canopy-selected-section').evaluate(element => element.innerText)).toEqual('Text. This is a test. Text.'); // no newlines
    await expect(await page.locator('.canopy-selected-section b')).toHaveCount(1);
  });

  test('It creates footnotes', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Footnotes');
    await expect(page.locator('.canopy-selected-section')).toContainText("This is regular text with a footnote1.");
    await expect(page.locator('.canopy-selected-section sup')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section .canopy-footnote-span')).toHaveText('1. This is that footnote.');
  });

  test('Special link examples', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Special_links');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is a link to (New) York, and to new york, and to \"New\" \'York\', and to the city of New York, and to the city of dew cork, and to the city that is new, and the city of newest york.");
    await expect(page.locator('.canopy-selected-section a')).toHaveCount(7);
  });
});

test.describe('Block entities', () => {
  test('It creates tables', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Tables');
    await expect(page.locator('.canopy-selected-section table')).toHaveCount(2);

    await expect(page.locator('.canopy-selected-section table tr td').nth(0)).toHaveText('This');
    await expect(page.locator('.canopy-selected-section table tr td').nth(1)).toHaveText('is');
    await expect(page.locator('.canopy-selected-section table tr td').nth(2)).toHaveText('a');
    await expect(page.locator('.canopy-selected-section table tr td').nth(3)).toHaveText('table');

    await expect(page.locator('.canopy-selected-section table tr td').nth(4)).toHaveText('2');
    await expect(page.locator('.canopy-selected-section table tr td').nth(5)).toHaveText('4');
    await expect(page.locator('.canopy-selected-section table tr td').nth(6)).toHaveText('6');
    await expect(page.locator('.canopy-selected-section table tr td').nth(7)).toHaveText('8'); // newline doesn't invalidate table

    await expect(page.locator('.canopy-selected-section table tr td').nth(8)).toHaveText('a');
    await expect(page.locator('.canopy-selected-section table tr td').nth(9)).toHaveText('b');
    await expect(page.locator('.canopy-selected-section table tr td').nth(10)).toHaveText('1');
    await expect(page.locator('.canopy-selected-section table tr td').nth(11)).toHaveText('2');
  });

  test('It allows import references in tables', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Tables_with_import_references');
    await expect(page.locator('.canopy-selected-section table')).toHaveCount(1);

    await expect(page.locator('.canopy-selected-section table tr td').nth(0)).toHaveText('This');
    await expect(page.locator('.canopy-selected-section table tr td').nth(1)).toHaveText('is');
    await expect(page.locator('.canopy-selected-section table tr td').nth(2)).toHaveText('a');
    await expect(page.locator('.canopy-selected-section table tr td').nth(3)).toHaveText('table');

    await expect(page.locator('.canopy-selected-section table a.canopy-global-link')).toHaveText('New York');
    await expect(page.locator('.canopy-selected-section table a.canopy-import-link')).toHaveText('Southern border');
  });

  test('It accepts table merge syntax', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Tables_with_merge_syntax');
    await expect(page.locator('.canopy-selected-section table')).toHaveCount(3);

    await expect(page.locator('.canopy-selected-section table tr td').nth(0)).toHaveText('This');
    await expect(page.locator('.canopy-selected-section table tr td').nth(1)).toHaveText('is');
    await expect(page.locator('.canopy-selected-section table tr td').nth(2)).toHaveText('a');
    await expect(page.locator('.canopy-selected-section table tr td').nth(3)).toHaveText('table');

    await expect(page.locator('.canopy-selected-section table tr td').nth(4)).toHaveText('2');
    await expect(page.locator('.canopy-selected-section table tr td').nth(5)).toHaveText('4');
    await expect(page.locator('.canopy-selected-section table tr td').nth(6)).toHaveText('6');
    await expect(await page.locator('.canopy-selected-section table tr td').nth(6)).toHaveAttribute('colspan', '2');

    await expect(page.locator('.canopy-selected-section table tr td').nth(7)).toHaveText('This');
    await expect(page.locator('.canopy-selected-section table tr td').nth(8)).toHaveText('is');
    await expect(page.locator('.canopy-selected-section table tr td').nth(9)).toHaveText('a');
    await expect(page.locator('.canopy-selected-section table tr td').nth(10)).toHaveText('table');
    await expect(await page.locator('.canopy-selected-section table tr td').nth(10)).toHaveAttribute('rowspan', '2');

    await expect(page.locator('.canopy-selected-section table tr td').nth(11)).toHaveText('2');
    await expect(page.locator('.canopy-selected-section table tr td').nth(12)).toHaveText('4');
    await expect(page.locator('.canopy-selected-section table tr td').nth(13)).toHaveText('6');

    await expect(page.locator('.canopy-selected-section table tr td').nth(14)).toHaveText('This');
    await expect(page.locator('.canopy-selected-section table tr td').nth(15)).toHaveText('is');
    await expect(page.locator('.canopy-selected-section table tr td').nth(16)).toHaveText('a');
    await expect(page.locator('.canopy-selected-section table tr td').nth(17)).toHaveText('table');

    await expect(page.locator('.canopy-selected-section table tr td').nth(18)).toHaveText('2');
    await expect(page.locator('.canopy-selected-section table tr td').nth(19)).toHaveText('4');
    await expect(await page.locator('.canopy-selected-section table tr td').nth(19)).toHaveAttribute('colspan', '3');
  });

  test('It creates multi-line code blocks', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Code_blocks');
    await expect(page.locator('.canopy-selected-section code')).toHaveCount(1);

    await expect(await page.innerText('.canopy-selected-section code')).toEqual(
      `// This is a code block\n`+
      `if (x) { y; }`
    );
  });

  test('It creates block quotes', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Block_quotes');
    await expect(page.locator('.canopy-selected-section blockquote')).toHaveCount(1);

    await expect(await page.innerText('.canopy-selected-section blockquote')).toEqual(
      `This is a block quote that has two lines\n` +
      `This is the second line`
    );
  });

  test('It creates block quotes with multi-line links', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Block_quotes_with_multi-line_links');
    await expect(page.locator('.canopy-selected-section blockquote a')).toHaveCount(1);
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('text=Multi-line link paragraph text. >> visible=true')).toHaveCount(1);
  });

  test('It creates RTL block quotes', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#RTL_block_quotes');
    await expect(page.locator('.canopy-selected-section blockquote')).toHaveCount(1);

    await expect(await page.innerText('.canopy-selected-section blockquote')).toEqual(
      `המילים האלה\n` +
      `הן מימין לשמאל`
    );

    await expect(await page.locator('.canopy-selected-section blockquote')).toHaveAttribute('dir', 'rtl');

  });

  test('It creates multi-line html blocks', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#HTML_blocks');
    await expect(page.locator('.canopy-selected-section figure')).toHaveCount(2);
    await expect(page.locator('.canopy-selected-section s')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section s')).toHaveText('This is an html block');
    await expect(page.locator('.canopy-selected-section a')).toHaveCount(1);
  });

  test('It creates HTML entities', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#HTML_entities');
    await expect(page.locator('.canopy-selected-section')).toHaveText("I like M&M's.");
  });

  test('It creates run-on-tag html blocks', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Run-on_tag_HTML_blocks');
    await expect(page.locator('.canopy-selected-section img')).toHaveCount(1);
  });

  test('It creates script tags', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Script_tags');
    page.on('dialog', async dialog => {
      expect(dialog.type()).toContain('alert');
    });
  });

  test('It creates nested lists', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Lists');
    await expect(await page.locator('.canopy-selected-section > .canopy-paragraph > ol').evaluate((element) => element.type)).toEqual('1');
    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li >> text="This"').nth(0)).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li >> text="Is"')).toHaveCount(1);

    await expect(await page.locator('.canopy-selected-section > .canopy-paragraph > ol > li > ol').evaluate((element) => element.type)).toEqual('a');
    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li > ol > li >> text="a"').nth(0)).toHaveText('a');
    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li > ol > li >> text="list"')).toHaveCount(1);

    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li > ol > li > ul > li >> text="with"')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li > ol > li > ul > li >> text="unordered elements also."')).toHaveCount(1)
  });
});

