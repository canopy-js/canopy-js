const { test, expect } = require('@playwright/test');

const os = require('os');
let platform = os.platform();
let systemNewTabKey;
if (platform === 'darwin') {
  systemNewTabKey = 'Meta';
} else {
  systemNewTabKey = 'Control';
}

test.beforeEach(async ({ page }) => {
  page.on("console", (message) => {
    if (message.type() === "error") {
      console.error(message.text());
    }
  })
});

test.describe('Special paths', () => {
  test('Project path prefix option creates path prefix', async ({ page }, workerInfo) => {
    await page.goto('http://localhost:3001');
    await expect(page).toHaveURL('http://localhost:3001/test/United_States');

    // For a global link
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('http://localhost:3001/test/United_States/New_York');
    await expect(page.locator('text=The state of New York has a southern border >> visible=true')).toHaveCount(1);

    // For a local link
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3001/test/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey. >> visible=true')).toHaveCount(1);

    await page.reload();

    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3001/test/United_States/New_York#Southern_border');

    // Project path prefix gets added to image tokens
    await page.goto('http://localhost:3001/test/Style_examples#Local_images');
    await expect(page).toHaveURL('http://localhost:3001/test/Style_examples#Local_images');
    await page.waitForSelector('img[title="Relative URL"]', { state: 'visible' });
    await expect(page.locator('img[title="Relative URL"]')).toHaveAttribute("src", "/test/_assets/USA.svg");
    await page.screenshot({ path: workerInfo.project.name + 'relative-1.png' });

    // Even if the user puts the project path prefix in manually it should still work and not get added twice
    await page.goto('http://localhost:3001/test/Style_examples#Inline_text_styles/Manual_Project_Path_Prefix_Specification');
    await expect(page).toHaveURL('http://localhost:3001/test/Style_examples#Inline_text_styles/Manual_Project_Path_Prefix_Specification');
    await page.waitForSelector('img[title="Manual URL"]', { state: 'visible' });
    await expect(page.locator('img[title="Manual URL"]')).toHaveAttribute("src", "/test/_assets/USA.svg");
    await page.screenshot({ path: workerInfo.project.name + 'manual-1.png' });
  });

  test('Hash URLs option creates hash prefix', async ({ page, context }) => {
    await page.goto('http://localhost:3002');
    await expect(page).toHaveURL('http://localhost:3002/#/United_States');

    // For a global link
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('http://localhost:3002/#/United_States/New_York');
    await expect(page.locator('text=The state of New York has a southern border >> visible=true')).toHaveCount(1);

    // For a local link
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3002/#/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey. >> visible=true')).toHaveCount(1);

    await page.reload();

    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3002/#/United_States/New_York#Southern_border');

    // after a new tab
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("style examples")').click({
        modifiers: [systemNewTabKey]
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('Style examples');
    await expect(newPage).toHaveURL('http://localhost:3002/#/Style_examples');
  });

  test('Project path prefix option is compatible with hash option', async ({ page }, workerInfo) => {
    await page.goto('http://localhost:3003');
    await expect(page).toHaveURL('http://localhost:3003/test/#/United_States');

    // For a global link
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('http://localhost:3003/test/#/United_States/New_York');
    await expect(page.locator('text=The state of New York has a southern border >> visible=true')).toHaveCount(1);

    // For a local link
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3003/test/#/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey. >> visible=true')).toHaveCount(1);

    await page.reload();

    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3003/test/#/United_States/New_York#Southern_border');

    // Project path prefix gets added to image tokens
    await page.goto('http://localhost:3001/test/Style_examples#Local_images');
    await expect(page).toHaveURL('http://localhost:3001/test/Style_examples#Local_images');
    await page.waitForSelector('img[title="Relative URL"]', { state: 'visible' });
    await expect(page.locator('img[title="Relative URL"]')).toHaveAttribute("src", "/test/_assets/USA.svg");
    await page.screenshot({ path: workerInfo.project.name + 'relative-2.png' });

    // Even if the user puts the project path prefix in manually it should still work and not get added twice
    await page.goto('http://localhost:3001/test/Style_examples#Inline_text_styles/Manual_Project_Path_Prefix_Specification');
    await expect(page).toHaveURL('http://localhost:3001/test/Style_examples#Inline_text_styles/Manual_Project_Path_Prefix_Specification');
    await page.waitForSelector('img[title="Manual URL"]', { state: 'visible' });
    await expect(page.locator('img[title="Manual URL"]')).toHaveAttribute("src", "/test/_assets/USA.svg");
    await page.screenshot({ path: workerInfo.project.name + 'manual-2.png' });
  });

  test('Hash URLs option works with static assets server', async ({ page, context }) => {
    await page.goto('http://localhost:3004');
    await expect(page).toHaveURL('http://localhost:3004/#/United_States');

    // For a global link
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('http://localhost:3004/#/United_States/New_York');
    await expect(page.locator('text=The state of New York has a southern border >> visible=true')).toHaveCount(1);

    // For a local link
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3004/#/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey. >> visible=true')).toHaveCount(1);

    await page.reload();

    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3004/#/United_States/New_York#Southern_border');

    // after a new tab
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("style examples")').click({
        modifiers: [systemNewTabKey]
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('Style examples');
    await expect(newPage).toHaveURL('http://localhost:3004/#/Style_examples');
  });

  test('Hash URLs and project path option work with static assets server', async ({ page, context }, workerInfo) => {
    await page.goto('http://localhost:3005/test');
    await expect(page).toHaveURL('http://localhost:3005/test/#/United_States');

    // For a global link
    await page.locator('body').press('ArrowRight');
    await expect(page.locator('.canopy-selected-link')).toHaveText('New York');
    await expect(page).toHaveURL('http://localhost:3005/test/#/United_States/New_York');
    await expect(page.locator('text=The state of New York has a southern border >> visible=true')).toHaveCount(1);

    // For a local link
    await page.locator('body').press('ArrowDown');
    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3005/test/#/United_States/New_York#Southern_border');
    await expect(page.locator('text=The southern border of New York abuts the northern border of New Jersey. >> visible=true')).toHaveCount(1);

    await page.reload();

    await expect(page.locator('.canopy-selected-link')).toHaveText('southern border');
    await expect(page).toHaveURL('http://localhost:3005/test/#/United_States/New_York#Southern_border');

    // after a new tab
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a:has-text("style examples")').click({
        modifiers: [systemNewTabKey]
      })
    ]);
    await newPage.waitForLoadState();

    await expect(newPage.locator('h1:visible')).toHaveText('Style examples');
    await expect(newPage).toHaveURL('http://localhost:3005/test/#/Style_examples');

    // Project path prefix gets added to image tokens
    await page.goto('http://localhost:3001/test/Style_examples#Local_images');
    await expect(page).toHaveURL('http://localhost:3001/test/Style_examples#Local_images');
    await page.waitForSelector('img[title="Relative URL"]', { state: 'visible' });
    await expect(page.locator('img[title="Relative URL"]')).toHaveAttribute("src", "/test/_assets/USA.svg");
    await page.screenshot({ path: workerInfo.project.name + 'relative-3.png' });

    // Even if the user puts the project path prefix in manually it should still work and not get added twice
    await page.goto('http://localhost:3001/test/Style_examples#Inline_text_styles/Manual_Project_Path_Prefix_Specification');
    await expect(page).toHaveURL('http://localhost:3001/test/Style_examples#Inline_text_styles/Manual_Project_Path_Prefix_Specification');
    await page.waitForSelector('img[title="Manual URL"]', { state: 'visible' });
    await expect(page.locator('img[title="Manual URL"]')).toHaveAttribute("src", "/test/_assets/USA.svg");
    await page.screenshot({ path: workerInfo.project.name + 'manual-3.png' });
  });
});
