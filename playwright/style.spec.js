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
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is text with italics.");
    await expect(page.locator('.canopy-selected-section i')).toHaveText("italics");
  });

  test('Asterisks create bold text', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Bold_text');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is bold text.");
    await expect(page.locator('.canopy-selected-section b')).toHaveText("bold");
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
    await page.goto('/United_States/New_York/Style_examples#Code_snippets');
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

  test('Plaintext can contain style token literals', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Plaintext_that_contains_style_tokens');
    await page.locator('.canopy-selected-section');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is plaintext that contains style tokens like {{OPEN_}} ABC {{CLOSE_}}.")
    await expect(page.locator('.canopy-selected-section i')).toHaveCount(0);
  });
});

test.describe('Inline entities', () => {
  test('It creates images', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Images');
    await expect(page.locator('.canopy-selected-section span')).toHaveText("This is a picture of jelly fish.");
    await expect(page.locator('.canopy-selected-section img')).toHaveCount(1);
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.src))
      .toEqual('https://upload.wikimedia.org/wikipedia/commons/f/f7/Lion%27s_mane_jellyfish_in_Gullmarn_fjord_at_S%C3%A4mstad_8.jpg');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.title)).toEqual('Jelly Fish');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.alt)).toEqual('Alt text');
    await expect(await page.locator('.canopy-selected-section a').evaluate((element) => element.href))
      .toEqual('https://upload.wikimedia.org/wikipedia/commons/f/f7/Lion%27s_mane_jellyfish_in_Gullmarn_fjord_at_S%C3%A4mstad_8.jpg');
    await expect(await page.locator('.canopy-selected-section div')).toHaveText("Jelly Fish");
  });

  test('It creates linked images', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Linked_images');
    await expect(page.locator('.canopy-selected-section span')).toHaveText("This picture of a Jelly fish is also a link.");
    await expect(page.locator('.canopy-selected-section img')).toHaveCount(1);
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.src))
      .toEqual('https://upload.wikimedia.org/wikipedia/commons/f/f7/Lion%27s_mane_jellyfish_in_Gullmarn_fjord_at_S%C3%A4mstad_8.jpg');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.title)).toEqual('Jelly fish link');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.alt)).toEqual('Alt text');
    await expect(await page.locator('.canopy-selected-section a').evaluate((element) => element.href)).toEqual('http://google.com/');
    await expect(await page.locator('.canopy-selected-section div')).toHaveText("Jelly fish link");
  });

  test('It creates links from URLs', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#URLs');
    await expect(page.locator('.canopy-selected-section')).toContainText("This is a URL, http://google.com");
    await expect(await page.locator('.canopy-selected-section a').evaluate((element) => element.href)).toEqual('http://google.com/');
    await expect(await page.locator('.canopy-selected-section svg')).toHaveCount(0); // svg is deprecated
  });

  test('It creates links from hyperlink markup', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Hyperlinks');
    await expect(page.locator('.canopy-selected-section')).toContainText("This is a link");
    await expect(await page.locator('.canopy-selected-section a').evaluate((element) => element.href)).toEqual('http://google.com/');
    await expect(await page.locator('.canopy-selected-section svg')).toHaveCount(0); // svg is deprecated
  });

  test('It creates footnotes', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Footnotes');
    await expect(page.locator('.canopy-selected-section')).toContainText("This is regular text with a footnote1.");
    await expect(page.locator('.canopy-selected-section sup')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section .canopy-footnote-span')).toHaveText('1. This is that footnote.');
  });
});

test.describe('Block entities', () => {
  test('It creates tables', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Tables');
    await expect(page.locator('.canopy-selected-section table')).toHaveCount(1);

    await expect(page.locator('.canopy-selected-section table tr td').nth(0)).toHaveText('This');
    await expect(page.locator('.canopy-selected-section table tr td').nth(1)).toHaveText('is');
    await expect(page.locator('.canopy-selected-section table tr td').nth(2)).toHaveText('a');
    await expect(page.locator('.canopy-selected-section table tr td').nth(3)).toHaveText('table');

    await expect(page.locator('.canopy-selected-section table tr td').nth(4)).toHaveText('2');
    await expect(page.locator('.canopy-selected-section table tr td').nth(5)).toHaveText('4');
    await expect(page.locator('.canopy-selected-section table tr td').nth(6)).toHaveText('6');
    await expect(page.locator('.canopy-selected-section table tr td').nth(7)).toHaveText('8');
  });

  test('It creates multi-line code blocks', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Code_blocks');
    await expect(page.locator('.canopy-selected-section code')).toHaveCount(1);

    await expect(await page.innerText('.canopy-selected-section code')).toEqual(
      `// This is a code block\n`+
      `if (x) { y; }\n`
    );
  });

  test('It creates block quotes', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Block_quotes');
    await expect(page.locator('.canopy-selected-section blockquote')).toHaveCount(1);

    await expect(await page.innerText('.canopy-selected-section blockquote')).toEqual(
      `This is a block quote that has two lines\n` +
      `This is the second line\n`
    );
  });

  test('It creates multi-line html blocks', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#HTML_blocks');
    await expect(page.locator('.canopy-selected-section div')).toHaveText('This is an html block');
    await expect(page.locator('.canopy-selected-section figure')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section s')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section s')).toHaveText('This is an html block');
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

