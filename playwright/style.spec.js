const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error(message.text());
    }
  })

  await page.goto('/United_States');
  await expect(page).toHaveURL("United_States");
  await page.evaluate(() => localStorage.clear()); // get rid of old link selections
  await page.evaluate(() => sessionStorage.clear()); // get rid of old link selections
  await page.waitForFunction(() => {
    return localStorage.length === 0 && sessionStorage.length === 0;
  });
});

test.describe('Text styles', () => {
  test('Underscores create italic text', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Italic_text');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is text with italics. This is multiple italicized words, and this is italics within a word, but th_is is no_thing.This is an italic table cell.");
    await expect(page.locator('.canopy-selected-section i')).toHaveCount(4);
  });

  test('Asterisks create bold text', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Bold_text');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is bold text. This is a bold sentence which can contain spaces because the asterisks are on the edges of the words, whereas this is bold within a word, and this is not bold be*cause there are sp*aces and it is an intra-word style character.This is a bold table cell.");
    await expect(page.locator('.canopy-selected-section b')).toHaveCount(4);
  });

  test('Tildes create underline text', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Underlined_text');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is underlined text. So is this. And this. Bu~t not thi~s.This is an underlined table cell.");
    await expect(page.locator('.canopy-selected-section u')).toHaveCount(4);
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
    await expect(page.locator('.canopy-selected-section p span:has-text("This is a picture of jelly fish.")')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section img')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section span.canopy-image-caption')).toHaveText("Jelly \"Fish\" - W. Carter");
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.src))
      .toEqual('https://upload.wikimedia.org/wikipedia/commons/9/98/Lion%27s_mane_jellyfish_in_Gullmarn_fjord_at_S%C3%A4mstad_8_-_edited.jpg');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.title))
      .toEqual('Jelly \"fish\" title');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.alt)).toEqual('Alt text');
  });

  test('It creates linked images', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Linked_images');
    await expect(page.locator('.canopy-selected-section p span:has-text("This picture of a frog is also a link.")')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section img')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section span.canopy-image-caption')).toHaveText("Frog \"link\" - Rushenb");
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.src))
      .toEqual('https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Rhacophorus_nigropalmatus.jpg/2560px-Rhacophorus_nigropalmatus.jpg');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.title))
      .toEqual('Frog \"title\"');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.alt)).toEqual('Alt text');
    await expect(await page.locator('.canopy-selected-section a:has(img)').evaluate((element) => element.href)).toEqual('http://google.com/');
  });

  test('It creates links from URLs', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#URLs');
    await expect(page.locator('.canopy-selected-section')).toContainText("This is a URL, http://google.com.");
    await expect(page.evaluate(selector => window.getComputedStyle(document.querySelector(selector), '::after').content.includes('➹'), '.canopy-selected-section a')).toBeTruthy();
    await expect(await page.locator('.canopy-selected-section a').evaluate((element) => element.href)).toEqual('http://google.com/');
  });

  test('It will not separate link icon from prior word', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Links_with_prior_word_break');
    await expect(page.locator('.canopy-selected-section')).toContainText("This is a link");

    const isAfterStickingToLink = async (selector) => {
      return page.evaluate(selector => {
        const element = document.querySelector(selector);
        if (!element) return false;

        // Get the computed styles of the ::after pseudo-element
        const afterStyles = window.getComputedStyle(element, '::after');
        const content = afterStyles.getPropertyValue('content').replace(/['"]/g, '');

        // Create a temporary span and apply styles from ::after pseudo-element
        const tempSpan = document.createElement('span');
        tempSpan.textContent = content;

        // Apply relevant styles to the tempSpan
        tempSpan.style.fontSize = afterStyles.fontSize;
        tempSpan.style.fontFamily = afterStyles.fontFamily;
        tempSpan.style.fontWeight = afterStyles.fontWeight;
        tempSpan.style.fontStyle = afterStyles.fontStyle;
        tempSpan.style.letterSpacing = afterStyles.letterSpacing;
        tempSpan.style.textTransform = afterStyles.textTransform;
        tempSpan.style.marginRight = afterStyles.marginRight;
        tempSpan.style.textDecoration = afterStyles.textDecoration;

        const lastChildSpan = document.createElement('SPAN');
        let lastChildNode = element.lastChild;
        element.lastChild.remove();
        lastChildSpan.appendChild(lastChildNode);
        element.appendChild(lastChildSpan);

        element.appendChild(tempSpan);
        const linkRect = element.getBoundingClientRect();
        const tempSpanRect = tempSpan.getBoundingClientRect();

        // Cleanup: remove the temporary span
        element.removeChild(tempSpan);

        // Tolerance in pixels for line height differences
        const tolerance = 5;

        if (Math.abs(linkRect.bottom - tempSpanRect.bottom) > tolerance) console.error(linkRect.bottom, tempSpanRect.bottom)

        return Math.abs(linkRect.bottom - tempSpanRect.bottom) <= tolerance;
      }, selector);
    };

    for (let i = 0; i < 30; i++) {
      await page.evaluate(selector => {
        document.querySelector(selector).innerText += 'i';
      }, '.canopy-selected-section a');

      expect(await isAfterStickingToLink('.canopy-selected-section a')).toBeTruthy();
    }
  });

  test('It will not separate link icon from following punctuation', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Links_with_following_punctuation_break');
    await expect(page).toHaveURL('/United_States/New_York/Style_examples#Links_with_following_punctuation_break');

    // Wait for the element and punctuation to be available in the DOM
    await page.waitForSelector('.canopy-selected-section a');
    await page.waitForSelector('.canopy-selected-section a + span');

    // Now retrieve the element handles
    const elementHandle = await page.$('.canopy-selected-section a .canopy-link-content-container');
    const punctuationHandle = await page.$('.canopy-selected-section a + span');

    // Assuming the element handles are now not null, get their bounding boxes
    const elementBox = await elementHandle.boundingBox();
    const punctuationBox = await punctuationHandle.boundingBox();

    // Calculate the bottom position of the element (element's position + its height)
    const elementBottom = elementBox.y + elementBox.height;

    // Define tolerance for comparison
    const tolerance = 5;

    // Check if the bottom of the punctuation is within tolerance of the bottom of the element
    const punctuationBottom = punctuationBox.y + punctuationBox.height;
    expect(punctuationBottom).toBeGreaterThanOrEqual(elementBottom - tolerance);
    expect(punctuationBottom).toBeLessThanOrEqual(elementBottom + tolerance);

    // Iterate to verify if the positioning remains within tolerance as text changes
    for (let i = 0; i < 20; i++) {
      // Add text to the element
      await page.evaluate((selector) => {
        document.querySelector(selector).innerText += 'i';
      }, '.canopy-selected-section a .canopy-link-content-container');

      // Update bounding boxes after text change
      const updatedElementBox = await elementHandle.boundingBox();
      const updatedPunctuationBox = await punctuationHandle.boundingBox();

      const updatedElementBottom = updatedElementBox.y + updatedElementBox.height;
      const updatedPunctuationBottom = updatedPunctuationBox.y + updatedPunctuationBox.height;

      // Check if the updated punctuation bottom is within tolerance
      expect(updatedPunctuationBottom).toBeGreaterThanOrEqual(updatedElementBottom - tolerance);
      expect(updatedPunctuationBottom).toBeLessThanOrEqual(updatedElementBottom + tolerance);
    }
  });

  test('It creates links from hyperlink markup', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Hyperlinks');

    await expect(page.locator('.canopy-selected-section')).toContainText("This is a link");

    const link = page.locator('.canopy-selected-section a');
    await expect(await link.evaluate(element => element.href)).toEqual('http://google.com/');

    const iconContainer = page.locator('.canopy-selected-section a .canopy-link-content-container');
    await expect(iconContainer).toBeVisible();

    const iconStyles = await page.locator('.canopy-selected-section a .canopy-link-content-container .canopy-external-link-icon').evaluate(element => {
      const computedStyles = window.getComputedStyle(element);
      return {
        backgroundImage: computedStyles.getPropertyValue('background-image'),
        display: computedStyles.getPropertyValue('display'),
      };
    });

    // Expected background image for the icon (part of the SVG)
    const expectedBackgroundImage = 'url("data:image/svg+xml;base64,'; // Start of the base64 encoded SVG

    expect(iconStyles.backgroundImage).toContain(expectedBackgroundImage);
    expect(iconStyles.display).toEqual('inline-block'); // Ensure the icon span is rendered correctly
  });

  test('It handles hyperlink special cases', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Hyperlink_special_cases');
    await expect(page.locator('.canopy-selected-section')).toContainText("These are hyperlink special cases:");

    // Assert the total number of links
    await expect(page.locator('.canopy-selected-section a')).toHaveCount(12);

    // These are hyperlink special cases:
    // - This is a [link](http://google.com)
    // - This is two links [link 1](http://google.com) [link 2](http://google.com) - don't combine
    // - This is a nested image [![pic](./_assets/wiki-favicon.ico)](https://en.wikipedia.org/)
    // - This is a nested double image [![pic](./_assets/wiki-favicon.ico)![pic](./_assets/wiki-favicon.ico)](https://en.wikipedia.org/)
    // - This is a nested image red herring [![abc](https://en.wikipedia.org/)
    // - This is a parenthases wrapped link ([link](http://google.com\)) and ([link](http://google.com)) and an escaped one ([link](http://google.com)\)
    // - This is seemingly a link in a link [[link](http://google.com)](http://google.com) and [[link\](http://google.com)](http://google.com)

    // Asserting each link with href and either text or image content
    const links = [
      { href: 'http://google.com', text: 'link' },
      { href: 'http://google.com', text: 'link 1' },
      { href: 'http://google.com', text: 'link 2' },
      { href: 'https://en.wikipedia.org/', images: ['./_assets/wiki-favicon.ico'] },
      { href: 'https://en.wikipedia.org/', images: ['./_assets/wiki-favicon.ico', './_assets/wiki-favicon.ico'] },
      { href: 'https://en.wikipedia.org/', text: '![abc' }, // red herring
      { href: 'http://google.com)', text: 'link' }, // paren wrapped link #1
      { href: 'http://google.com)', text: 'link' }, // paren wrapped link #2
      { href: 'http://google.com', text: 'link' }, // paren wrapped link #3
      { href: 'http://google.com)](http://google.com', text: '[link' }, // unsuccessful link within link
      { href: 'http://google.com', text: '[link](http://google.com)' }, // Successful link containing link
      { href: 'http://google.com)', text: 'http://google.com)' } // Successful link inside link, but URL not markdown due to preserved escape \]
    ];

    links.forEach((link, i) => {
      const linkLocator = page.locator('.canopy-selected-section a').nth(i);
      expect(linkLocator).toHaveAttribute('href', link.href);

      if (link.text) {
        // Assert text content for non-image links
        expect(linkLocator).toContainText(link.text);
      } else if (link.images) {
        // Assert image content for links that wrap images
        link.images.forEach((src, j) => {
          expect(linkLocator.locator('img').nth(j)).toHaveAttribute('src', src);
        });
      }
    });
  });

  test('It creates inline HTML elements', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Inline_HTML');
    await expect(await page.locator('.canopy-selected-section').evaluate(element => element.innerText.trim())).toEqual('Text. This is a test. Text.'); // no newlines between html element and following text
    await expect(await page.locator('.canopy-selected-section b')).toHaveCount(1);
  });

  test('It creates footnotes', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Footnotes');
    await expect(page.locator('.canopy-selected-section')).toContainText("This is regular text with a footnote1.");
    await expect(page.locator('.canopy-selected-section sup')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section .canopy-footnote-span')).toHaveText('1. This is that footnote.');
  });

  test('It creates tooltips', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Tooltips');

    await expect(page.locator('.canopy-selected-section')).toContainText('This is text.');

    await page.hover('.canopy-tooltip');

    const tooltipText = page.locator('.canopy-tooltip .canopy-tooltiptext');
    await expect(tooltipText).toBeVisible();
    await expect(tooltipText).toHaveText('Here is a tooltip');
  });

  test('Special link examples', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Special_links');
    await expect(page.locator('.canopy-selected-section')).toHaveText("This is a link to (New) York↩, and to new york↩, and to \"New\" 'York'↩, and to the city of New York↩, and to the city of dew cork↩, and to the city that is new↩, and the city of newest york↩.");
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

  test('It accepts table omit syntax', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Tables_with_omitted_cells');
    await expect(page.locator('.canopy-selected-section table td:not(.hidden) >> visible=true')).toHaveCount(7);

    await expect(page.locator('.canopy-selected-section table tr td').nth(0)).toHaveText('This');
    await expect(page.locator('.canopy-selected-section table tr td').nth(1)).toHaveText('is');
    await expect(page.locator('.canopy-selected-section table tr td').nth(2)).toHaveText('a');
    await expect(page.locator('.canopy-selected-section table tr td').nth(3)).toHaveText('table');

    await expect(page.locator('.canopy-selected-section table tr td').nth(4)).toHaveText('2');
    await expect(page.locator('.canopy-selected-section table tr td').nth(5)).toHaveText('4');
    await expect(page.locator('.canopy-selected-section table tr td').nth(6)).toHaveText('6');
  });

  test('It supports table links with icons', async ({ page }) => {
    await page.goto('United_States/New_York/Style_examples#Table_links');
    await expect(page).toHaveURL("/United_States/New_York/Style_examples#Table_links");

    const newYorkLink = await page.locator('.canopy-selected-section a[data-literal-path-string="New_York"]');
    await expect(newYorkLink).toHaveText('New York↩');
    await expect(newYorkLink).toHaveAttribute('href', '/New_York');

    const newJerseyLink = await page.locator('.canopy-selected-section a[data-literal-path-string="New_Jersey"]');
    await expect(newJerseyLink).toHaveText('New Jersey');
    await expect(newJerseyLink).toHaveAttribute('href', '/New_Jersey');

    const helloLink = await page.locator('.canopy-selected-section a[data-text="Hello"]');
    await expect(helloLink).toHaveText('Hello');
    await expect(helloLink).toHaveAttribute('href', 'https://google.com');
    await expect(helloLink).toHaveAttribute('target', '_blank');
    const helloIcon = await helloLink.locator('.canopy-external-link-icon');
    await expect(helloIcon).toBeVisible();

    const normalText = await page.locator('.canopy-selected-section span:has-text("Normal Text")');
    await expect(normalText).toHaveText('Normal Text');

    const disabledLink = await page.locator('.canopy-selected-section a[data-text="Disabled Link"]');
    await expect(disabledLink).toHaveText('Disabled Link');
    expect(Number(await disabledLink.evaluate((el) => window.getComputedStyle(el).opacity))).toBeLessThan(1);
  });

  test('It allows menus', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Menus');
    await expect(page).toHaveURL("/United_States/New_York/Style_examples#Menus");

    await expect(page.locator('.canopy-selected-section .canopy-menu.canopy-eigth-pill')).toHaveCount(2);
    await expect(page.locator('.canopy-selected-section .canopy-menu.canopy-quarter-pill')).toHaveCount(2);
    await expect(page.locator('.canopy-selected-section .canopy-menu.canopy-third-pill')).toHaveCount(2);
    await expect(page.locator('.canopy-selected-section .canopy-menu.canopy-half-pill')).toHaveCount(2);
    await expect(page.locator('.canopy-selected-section .canopy-menu.canopy-quarter-card')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section .canopy-menu.canopy-third-card')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section .canopy-menu.canopy-half-tube')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section .canopy-menu.canopy-half-card')).toHaveCount(1);
  });

  test('It creates menu link icons', async ({ page }) => {
    await page.goto('United_States/New_York/Style_examples#Menu_link_icons');
    await expect(page).toHaveURL("United_States/New_York/Style_examples#Menu_link_icons");

    // Assert on the first menu link
    const firstLink = await page.locator('a[data-literal-path-string="United_States"]');
    await expect(firstLink).toHaveAttribute('href', '/United_States');
    await expect(firstLink).toHaveText(/United States/);
    await expect(firstLink.locator('.canopy-back-cycle-icon')).toHaveText('↩');

    // Assert on the second menu link
    const secondLink = await page.locator('a[data-literal-path-string="United_States/New_Jersey"]');
    await expect(secondLink).toHaveAttribute('href', '/United_States/New_Jersey');
    await expect(secondLink).toHaveText(/New Jersey/);
    await expect(secondLink.locator('.canopy-forward-cycle-icon')).toHaveText('↪');

    // Assert on the external link
    const externalLink = await page.locator('a[data-type="external"]');
    await expect(externalLink).toHaveAttribute('href', 'https://google.com');
    await expect(externalLink).toHaveAttribute('target', '_blank');
    await expect(externalLink).toHaveText(/Hello/);
    await expect(externalLink.locator('.canopy-external-link-icon')).toBeVisible();
  });

  test('It allows directional menus', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Directional_menus');
    await expect(page).toHaveURL("/United_States/New_York/Style_examples#Directional_menus");

    const viewportWidth = await page.evaluate(() => window.innerWidth);
    const tableLists = await page.locator('.canopy-menu');

    // Check alignment for buttons in the first container
    const firstContainerButtons = await tableLists.nth(0).locator('.canopy-menu-cell');
    const button1 = await firstContainerButtons.nth(0); // left-most link should be right aligned
    const boundingBox1 = await button1.boundingBox();
    expect(boundingBox1.x).toBeGreaterThan(viewportWidth / 2);

    // Check alignment for buttons in the second container
    const secondContainerButtons = await tableLists.nth(1).locator('.canopy-menu-cell');
    const button2 = await secondContainerButtons.nth(1); // right-most link should be left aligned
    const boundingBox2 = await button2.boundingBox();

    // Assert that each button is on the left half of the screen
    expect(boundingBox2.x + boundingBox2.width).toBeLessThan(viewportWidth / 2);

    // Check alignment for buttons in the third container
    const thirdContainerButtons = await tableLists.nth(2).locator('.canopy-menu-cell');

    // Assert that the first button is left-aligned
    const firstButton = await thirdContainerButtons.nth(0);
    const firstBoundingBox = await firstButton.boundingBox();
    expect(firstBoundingBox.x + firstBoundingBox.width).toBeLessThan(viewportWidth / 2);

    // Assert that the second button is right-aligned
    const secondButton = await thirdContainerButtons.nth(1);
    const secondBoundingBox = await secondButton.boundingBox();
    expect(secondBoundingBox.x).toBeGreaterThan(viewportWidth / 2);

    // Verify the ::after content for buttons in the third container
    await expect(await thirdContainerButtons.nth(0).locator('.canopy-menu-content-container')).toHaveText('New York↩'); // special case where we flip arrow
    await expect(await thirdContainerButtons.nth(1).locator('.canopy-menu-content-container')).toHaveText('New Jersey↪');
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

    await expect(page.locator('.canopy-selected-section blockquote')).toHaveCount(2);

    // Test for short blockquote which shouldn't get padding
    await expect(page.locator('.canopy-selected-section blockquote:first-of-type span.canopy-text-span')).toHaveCount(2);
    await expect(page.locator('.canopy-selected-section blockquote:first-of-type .canopy-blockquote-padded-linebreak')).toHaveCount(0);
    await expect(page.locator('.canopy-selected-section blockquote:first-of-type .canopy-linebreak-span')).toHaveCount(1);

    // Test for long blockquote where \n should get padding
    await expect(page.locator('.canopy-selected-section blockquote:last-of-type span.canopy-text-span')).toHaveCount(2);
    const longQuotePaddingSpan = await page.locator('.canopy-selected-section blockquote:last-of-type .canopy-blockquote-padded-linebreak');
    await expect(longQuotePaddingSpan).toHaveCount(1); // Assuming BR gets replaced by one special span
  });

  test('It creates block quotes with multi-line links', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Block_quotes_with_multi-line_links');
    await expect(page.locator('.canopy-selected-section blockquote a')).toHaveCount(1);
    await page.locator('body').press('Enter');
    await expect(page.locator('text=Multi-line link paragraph text. >> visible=true')).toHaveCount(1);
  });

  test('It creates RTL block quotes', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#RTL_block_quotes');
    await expect(page.locator('.canopy-selected-section blockquote')).toHaveCount(2);

    // Check the direction attribute is 'rtl'
    await expect(page.locator('.canopy-selected-section blockquote:first-of-type')).toHaveAttribute('dir', 'rtl');

    // No padded linebreak in short text block quote
    await expect(
      page.locator('.canopy-selected-section blockquote[dir="rtl"]:first-of-type .canopy-blockquote-padded-linebreak')
    ).toHaveCount(0);

    // Assert that .canopy-line-break has a calculated padding-bottom of 0
     const lineBreakElement = page.locator('.canopy-selected-section blockquote[dir="rtl"]:first-of-type .canopy-linebreak-span');
     const paddingBottom = await lineBreakElement.evaluate(el => getComputedStyle(el).paddingBottom);
     const marginBottom = await lineBreakElement.evaluate(el => getComputedStyle(el).marginBottom);
     expect(paddingBottom).toBe('0px');
     expect(marginBottom).toBe('0px');

    // Yes padded linebreak in short text block quote
    const longQuotePaddingSpan = page.locator('.canopy-selected-section blockquote[dir="rtl"]:last-of-type .canopy-blockquote-padded-linebreak');
    await expect(longQuotePaddingSpan).toHaveCount(1);

    // Assert that .canopy-line-break has a calculated padding-bottom of 10
     const lineBreakElement2 = page.locator('.canopy-selected-section blockquote[dir="rtl"]:last-of-type .canopy-linebreak-span');
     const paddingBottom2 = await lineBreakElement2.evaluate(el => getComputedStyle(el).paddingBottom);
     const marginBottom2 = await lineBreakElement2.evaluate(el => getComputedStyle(el).marginBottom);
     expect(paddingBottom2).toBe('0px');
     expect(marginBottom2).toBe('8px');
  });

  test('It creates multi-line html blocks', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#HTML_blocks');
    await expect(page.locator('.canopy-selected-section figure')).toHaveCount(2);
    await expect(page.locator('.canopy-selected-section s')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section s')).toHaveText('This is an html block');
    await expect(page.locator('.canopy-selected-section a')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section b')).toHaveText(['', '']); // we don't include trailing plaintext

    const parentLocator = page.locator('.canopy-selected-section');
    const newYorkLink = parentLocator.locator('a', { hasText: 'New York↩' });
    await expect(newYorkLink).toHaveCount(1);

    // From the link, locate the next sibling with class .canopy-linebreak-span
    const nextSiblingLineBreak = newYorkLink.locator('~ .canopy-linebreak-span');
    await expect(nextSiblingLineBreak).toHaveCount(1);

    // From the .canopy-linebreak-span, locate the next sibling span with the target text
    const nextSiblingSpan = nextSiblingLineBreak.locator('~ span', { hasText: 'These are two separate HTML tags' });
    await expect(nextSiblingSpan).toHaveCount(1);
  });

  test('It allows insertions of tokens into html blocks', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#HTML_blocks_with_insertions');
    await expect(page.locator('.canopy-selected-section .canopy-raw-html')).toHaveCount(2);

    await expect(page.locator('.canopy-selected-section .canopy-raw-html').nth(0)).toHaveText('This is a link: New York↩');

    await expect(page.locator('.canopy-selected-section .canopy-raw-html').nth(1)).toHaveText('These are not: \\{{[[New York]]}} {\\{[[New York]]}} {{[[New York]]\\}} {{[[New York]]}\\}');
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

    const textSelector = `*:not(li) >> text="Dr. So and so called."`; // ensure not part of a list item
    await expect(page.locator(textSelector)).toBeVisible(); // Assert that the text is present and not part of a list item
    const listItemSelector = `li >> text="So and so called"`; // Additional check to ensure the text is not part of a bullet in a list
    await expect(page.locator(listItemSelector)).toHaveCount(0);

    await expect(await page.locator('.canopy-selected-section > .canopy-paragraph > ol').evaluate((element) => element.type)).toEqual('1');
    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li >> text="This"').nth(0)).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li >> text="Is"')).toHaveCount(1);

    await expect(await page.locator('.canopy-selected-section > .canopy-paragraph > ol > li > ol').evaluate((element) => element.type)).toEqual('a');
    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li > ol > li >> text="a"').nth(0)).toHaveText('a');
    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li > ol > li >> text="list"')).toHaveCount(1);

    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li > ol > li > ul > li >> text="with"')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section > .canopy-paragraph > ol > li > ol > li > ul > li >> text="unordered elements also."')).toHaveCount(1)
  });

  test('It creates multi-line text with correct alignment', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Multi-line_text');

    const paragraph = page.locator('.canopy-selected-section > .canopy-paragraph');
    const linebreakSpans = paragraph.locator('.canopy-linebreak-span');
    await expect(linebreakSpans).toHaveCount(7);

    // Assert placement of each line break
    const expectedTextBeforeLineBreaks = [
      'This is some text.',
      'ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסטר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט↩',
      '.',
      'ר-ט-ל טקסט↩',
      'This is some text.',
      'ר-ט-ל טקסט',
      'This is some text.',
      'ר-ט-ל טקסט'
    ];

    for (let i = 0; i < await linebreakSpans.count(); i++) {
      const previousText = await linebreakSpans.nth(i).evaluate(el => el.previousElementSibling?.textContent.trim() || '');
      expect(previousText).toBe(expectedTextBeforeLineBreaks[i]);
    }

    // Assert that the short RTL elements is on the right side of the screen
    const shortRTLSpans = paragraph.locator('span').filter({
      hasText: (text) => text.includes('ר-ט-ל טקסט') && text.length < 30
    });

    for (let i = 0; i < await shortRTLSpans.count(); i++) {
      const span = shortRTLSpans.nth(i);

      // Get the bounding box of the span
      const boundingBox = await span.boundingBox();
      expect(boundingBox).not.toBeNull();
      
      // Assert that the span is closer to the right side of the viewport
      expect(boundingBox.x + boundingBox.width / 2).toBeGreaterThan(page.viewportSize().width / 2);
    }

    const longText = 'ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסטר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט ר-ט-ל טקסט↩';
    const longRTLspans = paragraph.locator('span').filter({ hasText: longText });

    await expect(longRTLspans.first()).toHaveText(longText);

    const boundingBox = await longRTLspans.first().boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox.x + boundingBox.width / 2).toBe(page.viewportSize().width / 2);

    // Assert that each English element is on the left side of the screen
    const englishSpans = paragraph.locator('span').filter({
      hasText: text => text.match(/^[A-Za-z0-9]/)
    });

    for (let i = 0; i < await englishSpans.count(); i++) {
      const span = englishSpans.nth(i);

      // Get the bounding box of the span
      const boundingBox = await span.boundingBox();
      expect(boundingBox).not.toBeNull();
      
      // Assert that the span is closer to the left side of the viewport
      expect(boundingBox.x + boundingBox.width / 2).toBeLessThan(page.viewportSize().width / 2);
    }
  });

  test('It creates disabled links', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Disabled_links');
    await expect(page.locator('a.canopy-disabled-link')).toHaveCount(2);
    await expect(page.locator('.canopy-menu-link-cell a.canopy-disabled-link')).toHaveCount(1);
  });

  test('It creates full-line links', async ({ page }, workerInfo) => {
    await page.goto('/United_States/New_York/Style_examples#Full-line_links');
    await expect(page).toHaveURL("United_States/New_York/Style_examples#Full-line_links");

    // Select the first link based on its text content
    const firstLink = page.locator('.canopy-selected-section .canopy-selectable-link.canopy-multiline-link', {
      hasText: 'This is a full line link'
    });

    const firstLinkContentContainer = firstLink.locator('.canopy-link-content-container');
    const firstLinkContentDisplay = await firstLinkContentContainer.evaluate(el => getComputedStyle(el).display);
    expect(firstLinkContentDisplay).toBe('inline-block');

    const firstLinkContentBorderStyle = await firstLinkContentContainer.evaluate(el => getComputedStyle(el).borderStyle);
    expect(firstLinkContentBorderStyle).not.toBe('none');

    // Check if the first link itself fills the container
    const firstLinkWidth = await firstLink.evaluate(el => el.offsetWidth);
    const containerWidth = await firstLink.evaluate(el => el.parentElement.offsetWidth);
    expect(firstLinkWidth).toBeGreaterThan(containerWidth * 0.9); // It should fill the container

    // Select the second link based on its text content
    const secondLink = page.locator('.canopy-selected-section .canopy-selectable-link', {
      hasText: 'This link would qualify'
    });

    // Check the display style of the .canopy-link-content-container inside the second link
    const secondLinkContentContainer = secondLink.locator('.canopy-link-content-container');
    const secondLinkContentDisplay = await secondLinkContentContainer.evaluate(el => getComputedStyle(el).display);
    expect(secondLinkContentDisplay).toBe('inline'); // we don't make it inline-block because it doesn't wrap, avoiding unicode-bidi issue

    const secondLinkContentBorderStyle = await secondLinkContentContainer.evaluate(el => getComputedStyle(el).borderStyle);
    expect(secondLinkContentBorderStyle).not.toBe('none');

    // Check if the second link does not fill the container
    const secondLinkWidth = await secondLink.evaluate(el => el.offsetWidth);
    expect(secondLinkWidth).not.toBeGreaterThan(containerWidth * 0.9); // It should not fill the container
  });

  test('It allows solo hash links [[#]]', async ({ page }) => {
    await page.goto('United_States/New_York/Style_examples#Inline_text_styles/Solo_hash_links');

    await page.click('text=Back'); // [[#]] in a root topic paragraph is a self-reference which for topic is pop
    await page.waitForURL('**/Style_examples#Inline_text_styles');
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline text styles');

    await page.goto('United_States/New_York/Style_examples#Inline_text_styles/Solo_hash_links#Subtopic_solo_hash_link');
    await page.click('.canopy-selected-section .canopy-selectable-link >> text=Back');
    await expect(page.locator('.canopy-selected-section .canopy-selectable-link:has-text("Back")')).toHaveAttribute('href', '/Solo_hash_links');
    await page.waitForURL('**/Solo_hash_links'); // Root topic reference in subtopic is regular cycle reduction ie pop
    await expect(page.locator('.canopy-selected-link')).toHaveText('solo hash links');
  });

  test('It allows solo caret links [[^]]', async ({ page }) => {
    await page.goto('United_States/New_York/Style_examples#Inline_text_styles/Solo_caret_links');

    await expect(page.locator('.canopy-selectable-link:has-text("Back")')).toHaveAttribute('href', '/Solo_caret_links');
    await page.click('text=Back'); // [[^]] in a root topic paragraph should render to [[#]] ie self-reference which in topic is pop
    await page.waitForURL('**/Style_examples#Inline_text_styles');
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline text styles');

    await page.goto('United_States/New_York/Style_examples#Inline_text_styles/Solo_caret_links#Subtopic_solo_caret_link');
    await expect(page.locator('.canopy-selected-section .canopy-selectable-link:has-text("Back")')).toHaveAttribute('href', '/Solo_caret_links');
    await page.click('.canopy-selected-section .canopy-selectable-link >> text=Back'); // [[^ in subtopic is regular cycle reference to ST parent]]
    await page.waitForURL('**/Solo_caret_links');
    await expect(page.locator('.canopy-selected-link')).toHaveText('solo caret links');

    await page.goto('United_States/New_York/Style_examples#Inline_text_styles/Solo_caret_links#Nested_subtopic_solo_caret_link');
    await expect(page.locator('.canopy-selected-section .canopy-selectable-link:has-text("Back")')).toHaveAttribute('href', '/Solo_caret_links#Subtopic_solo_caret_link');
    await page.click('.canopy-selected-section .canopy-selectable-link >> text=Back'); // this proves [[^]] is going to ST parent not always root topic like [[#]] 
    await page.waitForURL('**/Solo_caret_links#Subtopic_solo_caret_link');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Subtopic solo caret link');
  });

  test('It allows solo period links [[.]]', async ({ page }) => {
    await page.goto('United_States/New_York/Style_examples#Inline_text_styles/Solo_period_links');

    await expect(page.locator('.canopy-selected-section .canopy-selectable-link:has-text("Back")')).toHaveAttribute('href', '/Solo_period_links');
    await page.click('text=Back'); // [[.]] in a root topic paragraph is a self-reference which for topic is pop
    await page.waitForURL('**/Style_examples#Inline_text_styles');
    await expect(page.locator('.canopy-selected-link')).toHaveText('inline text styles');

    await page.goto('United_States/New_York/Style_examples#Inline_text_styles/Solo_period_links#Subtopic_solo_period_link');
    await expect(page.locator('.canopy-selected-section .canopy-selectable-link:has-text("Back")')).toHaveAttribute('href', '/Solo_period_links#Subtopic_solo_period_link');
    await page.click('.canopy-selected-section .canopy-selectable-link >> text=Back'); // [[.]] in subtopic is shift to parent
    await page.waitForURL('**/Solo_period_links#Subtopic_solo_period_link');
    await expect(page.locator('.canopy-selected-link')).toHaveText('Subtopic solo period link');
  });
});
