const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error(message.text());
    }
  })
});

const os = require('os');
let platform = os.platform();
let systemNewTabKey;
if (platform === 'darwin') {
  systemNewTabKey = 'Meta';
} else {
  systemNewTabKey = 'Control';
}

test.describe('Topic names', () => {
  test('it renders everything properly for topics with single quotation marks', async ({ page, context }) => {
    await page.goto('/United_States/New_York#Southern_border');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');

    await page.locator('body').press('ArrowRight');

    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard");
    await expect(page.locator(`text=Martha's Vineyard is a an Island in Massachusetts >> visible=true`)).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator(`a:visible:text-is("Martha's Vineyard")`).click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard");
    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await expect(newPage.locator(`text=Martha's Vineyard is a an Island in Massachusetts >> visible=true`)).toHaveCount(1);
  });

  test('it renders everything properly for topics with double quotation marks', async ({ page, context }) => {
    await page.goto("/United_States/New_York/Martha's_Vineyard");
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard");

    await page.locator('body').press('ArrowDown');

    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/The_word_\"vinyard\"");
    await expect(page.locator('.canopy-selected-link')).toHaveText('the word "vinyard"');
    await expect(page.locator('text=This is a word in English >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('text=the word "vinyard"').click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/The_word_\"vinyard\"");
    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText('the word "vinyard"');
    await expect(newPage.locator('text=This is a word in English >> visible=true')).toHaveCount(1);
  });

  test('it renders everything properly for topics with pound signs marks', async ({ page, context }) => {
    await page.goto(`/United_States/New_York/Martha's_Vineyard/The_word_"vinyard"`);
    await expect(page.locator('.canopy-selected-link')).toHaveText('the word "vinyard"');

    await page.locator('body').press('ArrowRight');

    await expect(page.locator('.canopy-selected-link')).toHaveText("the world's #1 gift shop");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/The_world's_%231_gift_shop");
    await expect(page.locator('text=This is a great gift shop >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=the world's #1 gift shop").click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/The_world's_%231_gift_shop");
    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("the world's #1 gift shop");
    await expect(newPage.locator('text=This is a great gift shop >> visible=true')).toHaveCount(1);
  });

  test('it renders everything properly for topics with question marks', async ({ page, context }) => {
    await page.goto(`/United_States/New_York/Martha's_Vineyard/The_world's_%231_gift_shop`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("the world's #1 gift shop");
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText("the world's #1 keychains");
    await page.locator('body').press('ArrowRight');

    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/What_attractions_are_nearby_Martha's_Vineyard?");
    await expect(page.locator('.canopy-selected-link')).toHaveText("What attractions are nearby Martha's Vineyard?");
    await expect(page.locator('text=There are a lot of them. >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=What attractions are nearby Martha's Vineyard?").click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/What_attractions_are_nearby_Martha's_Vineyard?");
    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("What attractions are nearby Martha's Vineyard?");
    await expect(newPage.locator('text=There are a lot of them. >> visible=true')).toHaveCount(1);
  });

  test('it renders everything properly for topics with colons', async ({ page, context }) => {
    await page.goto(`/United_States/New_York/Martha's_Vineyard/What_attractions_are_nearby_Martha's_Vineyard?`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("What attractions are nearby Martha's Vineyard?");

    await page.locator('body').press('ArrowRight');

    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/Martha's_Vineyard:_a_history");
    await expect(page.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard: a history");
    await expect(page.locator('text=This is a good book. >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=Martha's Vineyard: a history").click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/Martha's_Vineyard:_a_history");
    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("Martha's Vineyard: a history");
    await expect(newPage.locator('text=This is a good book. >> visible=true')).toHaveCount(1);
  });

  test('it renders everything properly for topics with escaped style characters', async ({ page, context }) => {
    await page.goto(`United_States/New_York/Martha's_Vineyard#Parking_lot`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("parking lot");

    await page.locator('body').press('ArrowRight');

    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/%5C_Hello_world%5C_");
    await expect(page.locator('.canopy-selected-link')).toHaveText("_Hello world_");
    await expect(page.locator('text=This is a nice restaurant. >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=_Hello world_").click({
        modifiers: [systemNewTabKey, 'Alt']
      })
    ]);

    await expect(newPage).toHaveURL("%5C_Hello_world%5C_");
    await expect(newPage.locator('h1')).toHaveText("_Hello world_");
    await expect(await newPage.title()).toEqual('_Hello world_');
    await expect(newPage.locator('text=This is a nice restaurant. >> visible=true')).toHaveCount(1);
  });

  test('it renders everything properly for topics with ampersands', async ({ page, context }) => {
    await page.goto(`United_States/New_York/Martha's_Vineyard/%5C_Hello_world%5C_`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("_Hello world_");

    await page.locator('body').press('ArrowRight');

    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/M&Ms");
    await expect(page.locator('.canopy-selected-link')).toHaveText("M&Ms");
    await expect(page.locator('text=This is a kind of candy. >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=M&Ms").click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/M&Ms");
    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("M&Ms");
    await expect(newPage.locator('text=This is a kind of candy. >> visible=true')).toHaveCount(1);
  });


  test('it renders everything properly for topics with percent signs', async ({ page, context }) => {
    await page.goto(`United_States/New_York/Martha's_Vineyard/M&Ms`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("M&Ms");

    await page.locator('body').press('ArrowRight');

    await expect(page.locator('.canopy-selected-link')).toHaveText("100% orange juice");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/100%25_orange_juice");
    await expect(page.locator('text=This is very good orange juice. >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=100% orange juice").click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("100% orange juice");
    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/100%25_orange_juice");
    await expect(newPage.locator('text=This is very good orange juice. >> visible=true')).toHaveCount(1);
  });

  test('it renders everything properly for topics with literal percent encodings', async ({ page, context }) => {
    await page.goto(`United_States/New_York/Martha's_Vineyard/100%25_orange_juice`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("100% orange juice");

    await page.locator('body').press('ArrowRight');

    await expect(page.locator('.canopy-selected-link')).toHaveText("The %3C shop");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/The_%253C_shop");
    await expect(page.locator('text=This is a good store. >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=The %3C shop").click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/The_%253C_shop");
    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("The %3C shop");
    await expect(newPage.locator('text=This is a good store. >> visible=true')).toHaveCount(1);
  });

  test('it renders everything properly for topics with parentheses', async ({ page, context }) => {
    await page.goto(`United_States/New_York/Martha's_Vineyard/The_%253C_shop`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("The %3C shop");

    await page.locator('body').press('ArrowRight');

    await expect(page.locator('.canopy-selected-link')).toHaveText("Good Books (bookstore)");
    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/Good_Books_(bookstore)");
    await expect(page.locator('text=This is a bookstore. >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=Good Books (bookstore)").click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/Good_Books_(bookstore)");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("Good Books (bookstore)");
    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('text=This is a bookstore. >> visible=true')).toHaveCount(1);
  });

  test('it renders everything properly for topics with dollar signs', async ({ page, context }) => {
    await page.goto(`United_States/New_York/Martha's_Vineyard/Good_Books_(bookstore)`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("Good Books (bookstore)");

    await page.locator('body').press('ArrowRight');

    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/The_$1_Store");
    await expect(page.locator('.canopy-selected-link')).toHaveText("The $1 Store");
    await expect(page.locator('text=This is an inexpensive store. >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=The $1 store").click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/The_$1_Store");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("The $1 Store");
    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('text=This is an inexpensive store. >> visible=true')).toHaveCount(1);
  });

  test('it renders everything properly for topics with plus signs', async ({ page, context }) => {
    await page.goto(`United_States/New_York/Martha's_Vineyard/The_$1_Store`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("The $1 Store");

    await page.locator('body').press('ArrowRight');

    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/1+1");
    await expect(page.locator('.canopy-selected-link')).toHaveText("1+1");
    await expect(page.locator('text=This is a children\'s clothing store. >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=1+1").click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/1+1");
    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("1+1");
    await expect(newPage.locator('text=This is a children\'s clothing store. >> visible=true')).toHaveCount(1);
  });

  test('it renders everything properly for topics with single literal underscores', async ({ page, context }) => {
    await page.goto(`United_States/New_York/Martha's_Vineyard/1+1`);
    await expect(page.locator('.canopy-selected-link')).toHaveText("1+1");

    await page.locator('body').press('ArrowRight');

    await expect(page).toHaveURL("United_States/New_York/Martha's_Vineyard/Phone%5C_book");
    await expect(page.locator('.canopy-selected-link')).toHaveText("Phone_book");
    await expect(page.locator('text=This is a book of buisnesses. >> visible=true')).toHaveCount(1);

    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator("text=Phone_book").click({
        modifiers: [systemNewTabKey]
      })
    ]);

    await expect(newPage).toHaveURL("United_States/New_York/Martha's_Vineyard/Phone%5C_book");
    await expect(newPage.locator('h1')).toHaveText("United States");
    await expect(newPage.locator('.canopy-selected-link')).toHaveText("Phone_book");
    await expect(newPage.locator('text=This is a book of buisnesses. >> visible=true')).toHaveCount(1);
  });


  test('Topic names can contain italics', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Special_topic_names/Italic_topic_names');
    await page.locator('.canopy-selected-link');
    await expect(page.locator('.canopy-selected-link')).toHaveText("italic topic names");
    await expect(page.locator('.canopy-selected-link i')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-link i')).toHaveText("italic");

    await page.locator('.canopy-selected-link').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1')).toHaveText('Italic topic names');
    await expect(page.locator('h1 i')).toHaveCount(1);
    await expect(page.locator('h1 i')).toHaveText('Italic');
  });

  test('Topic names can contain code snippets', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Special_topic_names/Code_snippet_topic_names');
    await page.locator('.canopy-selected-link');
    await expect(page.locator('.canopy-selected-link')).toHaveText("code snippet topic names");
    await expect(page.locator('.canopy-selected-link code')).toHaveCount(1);
    await expect(page.locator('.canopy-selected-link code')).toHaveText("code snippet");

    await page.locator('.canopy-selected-link').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1')).toHaveText('Code snippet topic names');
    await expect(page.locator('h1 code')).toHaveCount(1);
    await expect(page.locator('h1 code')).toHaveText('Code snippet');
  });

  test('Topic names can contain literal underscores', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Special_topic_names/%5C_Topic_names_with_literal_underscores%5C_');
    await page.locator('.canopy-selected-link');
    await expect(page.locator('.canopy-selected-link')).toHaveText("_topic names with literal underscores_");
    await expect(page.locator('.canopy-selected-link i')).toHaveCount(0);

    await page.locator('.canopy-selected-link').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1')).toHaveText('_Topic names with literal underscores_');
    await expect(page.locator('h1 i')).toHaveCount(0);
  });

  test('Topic names can contain literal backticks', async ({ page }) => {
    await page.goto('/United_States/New_York/Style_examples#Special_topic_names/%60Topic_names_with_literal_backticks%60');
    await page.locator('.canopy-selected-link');
    await expect(page.locator('.canopy-selected-link')).toHaveText("`topic names with literal backticks`");
    await expect(page.locator('.canopy-selected-link code')).toHaveCount(0);

    await page.locator('.canopy-selected-link').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1')).toHaveText('`Topic names with literal backticks`');
    await expect(page.locator('h1 code')).toHaveCount(0);
  });

  test('Topic names can contain literal backslashes', async ({ page }) => {
    await page.goto('United_States/New_York/Style_examples#Special_topic_names/Topic_names_with_%5C%5C_backslashes');
    await page.locator('.canopy-selected-link');
    await expect(page.locator('.canopy-selected-link')).toHaveText("topic names with \\ backslashes");

    await page.locator('.canopy-selected-link').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1')).toHaveText('Topic names with \\ backslashes');
  });

  test('_data is a valid topic name', async ({ page }) => {
    await page.goto('United_States/New_York/Style_examples#Special_topic_names/%5C_data');
    await page.locator('.canopy-selected-link');
    await expect(page.locator('.canopy-selected-link')).toHaveText("_data");

    await page.locator('.canopy-selected-link').click({
      modifiers: ['Alt']
    })

    await expect(page.locator('h1')).toHaveText('_data');
  });
});
