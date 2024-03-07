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
      .toEqual('https://upload.wikimedia.org/wikipedia/commons/9/98/Lion%27s_mane_jellyfish_in_Gullmarn_fjord_at_S%C3%A4mstad_8_-_edited.jpg');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.title))
      .toEqual('Jelly \"fish\" title');
    await expect(await page.locator('.canopy-selected-section img').evaluate((element) => element.alt)).toEqual('Alt text');
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
    const elementHandle = await page.$('.canopy-selected-section a');
    const punctuationHandle = await page.$('.canopy-selected-section a + span');

    // Assuming the element handles are now not null, get their bounding boxes
    const elementBox = await elementHandle.boundingBox();
    const punctuationBox = await punctuationHandle.boundingBox();

    // Calculate the right end position of the element (element's position + its width)
    const elementBottom = elementBox.y + elementBox.height;

    // Check if the left position of the punctuation is close to the right end of the element
    expect(punctuationBox.y + punctuationBox.height).toBeCloseTo(elementBottom, 1); // '1' is the threshold for how close they should be

    for (let i =0; i < 20; i++) {
      await page.evaluate((selector) => {
        document.querySelector(selector).innerText += 'i';
      }, '.canopy-selected-section a');

      expect(punctuationBox.y + punctuationBox.height).toBeCloseTo(elementBottom, 1); // '1' is the threshold for how close they should be
    }
  });

  test('It creates links from hyperlink markup', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Hyperlinks');
    await expect(page.locator('.canopy-selected-section')).toContainText("This is a link");
    await expect(await page.locator('.canopy-selected-section a').evaluate(element => element.href)).toEqual('http://google.com/');
    // Check if the ::after pseudo-element of the link contains the arrow character
    const arrowContent = await page.locator('.canopy-selected-section a').evaluate(element => {
      const afterContent = window.getComputedStyle(element, '::after').getPropertyValue('content');
      return afterContent;
    });

    const expectedArrowCharacter = '➹';
    expect(arrowContent).toContain(expectedArrowCharacter);
  });

  test('It handles hyperlink special cases', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Hyperlink_special_cases');
    await expect(page.locator('.canopy-selected-section')).toContainText("These are hyperlink special cases:");

    /*
    Hyperlink special cases:
    - This is a [link](http://google.com)
    - This is two links [link 1](http://google.com) [link 2](http://google.com) - don't combine
    - This is a nested image [![pic](https://en.wikipedia.org/favicon.ico)](https://en.wikipedia.org/)
    - This is a nested double image [![pic](https://en.wikipedia.org/favicon.ico)![pic](https://en.wikipedia.org/favicon.ico)](https://en.wikipedia.org/)
    - This is a nested image red herring [![abc](https://en.wikipedia.org/)
    - This is a parenthases wrapped link ([link](http://google.com)) and an escaped one ([link](http://google.com)\)
    - This is seemingly a link in a link [[link](http://google.com)](http://google.com) - text is lazy, URL is greedy
    */

    // Assert the total number of links
    await expect(page.locator('.canopy-selected-section a')).toHaveCount(9);

    // Asserting each link with href and either text or image content
    const links = [
      { href: 'http://google.com', text: 'link' },
      { href: 'http://google.com', text: 'link 1' },
      { href: 'http://google.com', text: 'link 2' },
      { href: 'https://en.wikipedia.org/', images: ['https://en.wikipedia.org/favicon.ico'] },
      { href: 'https://en.wikipedia.org/', images: ['https://en.wikipedia.org/favicon.ico', 'https://en.wikipedia.org/favicon.ico'] },
      { href: 'https://en.wikipedia.org/', text: '![abc' },
      { href: 'http://google.com)', text: 'link' },
      { href: 'http://google.com', text: 'link' },
      { href: 'http://google.com)](http://google.com', text: '[link' }
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
    await expect(page.locator('.canopy-selected-section table td >> visible=true')).toHaveCount(7);

    await expect(page.locator('.canopy-selected-section table tr td').nth(0)).toHaveText('This');
    await expect(page.locator('.canopy-selected-section table tr td').nth(1)).toHaveText('is');
    await expect(page.locator('.canopy-selected-section table tr td').nth(2)).toHaveText('a');
    await expect(page.locator('.canopy-selected-section table tr td').nth(3)).toHaveText('table');

    await expect(page.locator('.canopy-selected-section table tr td').nth(4)).toHaveText('2');
    await expect(page.locator('.canopy-selected-section table tr td').nth(5)).toHaveText('4');
    await expect(page.locator('.canopy-selected-section table tr td').nth(6)).toHaveText('6');
  });

  test('It allows table lists', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Table_lists');

    await expect(page.locator('.canopy-selected-section .canopy-table-list.canopy-quarter-pill')).toHaveCount(4);
    await expect(page.locator('.canopy-selected-section .canopy-table-list.canopy-third-pill')).toHaveCount(2);
    await expect(page.locator('.canopy-selected-section .canopy-table-list.canopy-half-pill')).toHaveCount(2);
    await expect(page.locator('.canopy-selected-section .canopy-table-list.canopy-quarter-card')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section .canopy-table-list.canopy-third-card')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section .canopy-table-list.canopy-half-tube')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-section .canopy-table-list.canopy-half-card')).toHaveCount(1);
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
    await page.locator('body').press('Enter');
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

