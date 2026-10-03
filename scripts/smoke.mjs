import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('../../agent-orchestrator/node_modules/playwright-core');

const baseURL = process.env.BASE_URL ?? 'http://localhost:8001';
const browserPath = process.env.PLAYWRIGHT_BROWSER ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outputDirectory = path.resolve('test-results');
const failures = [];

await mkdir(outputDirectory, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: browserPath });

try {
  for (const viewport of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 390, height: 844 },
    { name: 'narrow', width: 320, height: 720 },
  ]) {
    const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
    const pageErrors = [];
    const consoleErrors = [];
    const failedRequests = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('requestfailed', request => {
      if (new URL(request.url()).origin === new URL(baseURL).origin) failedRequests.push(request.url());
    });
    page.setDefaultTimeout(10000);
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(async () => {
      for (const image of document.querySelectorAll('img[loading="lazy"]')) image.loading = 'eager';
      await Promise.all([...document.images].map(image => image.decode().catch(() => undefined)));
    });
    await page.screenshot({ path: path.join(outputDirectory, `${viewport.name}.png`), fullPage: true });

    const title = await page.title();
    assert.match(title, /Kabinet Rahman 25/i, `${viewport.name}: document title`);
    assert.equal(await page.locator('h1').count(), 1, `${viewport.name}: exactly one h1`);

    const stylesheetLoaded = await page.locator('link[rel="stylesheet"][href="css/style.css"]').evaluate(link => link.sheet !== null);
    assert.equal(stylesheetLoaded, true, `${viewport.name}: main stylesheet loaded`);

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      missingTargets: [...document.querySelectorAll('a[href^="#"]')]
        .map(link => link.getAttribute('href'))
        .filter(href => href !== '#' && !document.getElementById(href.slice(1))),
      brokenImages: [...document.images].filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src),
      linksWithoutDestination: [...document.querySelectorAll('a')]
        .filter(link => !link.hasAttribute('href') || link.getAttribute('href') === '#')
        .map(link => link.textContent.trim() || link.getAttribute('aria-label') || '(unlabelled)'),
    }));
    assert.ok(dimensions.document <= dimensions.viewport, `${viewport.name}: horizontal overflow ${dimensions.document}px > ${dimensions.viewport}px`);
    assert.deepEqual(dimensions.missingTargets, [], `${viewport.name}: missing anchor targets`);
    assert.deepEqual(dimensions.brokenImages, [], `${viewport.name}: broken images`);
    assert.deepEqual(dimensions.linksWithoutDestination, [], `${viewport.name}: links without destinations`);
    assert.deepEqual(failedRequests, [], `${viewport.name}: failed local requests`);
    assert.deepEqual(pageErrors, [], `${viewport.name}: uncaught page errors`);
    assert.deepEqual(consoleErrors, [], `${viewport.name}: browser console errors`);

    if (viewport.name === 'mobile') {
      const menuButton = page.locator('.menu-toggle');
      const menu = page.locator('#site-nav');
      await menuButton.focus();
      await page.keyboard.press('Enter');
      assert.equal(await menuButton.getAttribute('aria-expanded'), 'true', 'mobile: menu opens with keyboard');
      assert.equal(await menu.isVisible(), true, 'mobile: menu visible when open');
      await menu.getByRole('link', { name: 'Organisasi' }).click();
      assert.equal(await menuButton.getAttribute('aria-expanded'), 'false', 'mobile: menu closes after navigation');
      assert.equal(new URL(page.url()).hash, '#divisi', 'mobile: organization link navigates to section');
    }

    console.log(`${viewport.name}: passed (${viewport.width}x${viewport.height})`);
    await page.close();
  }
} catch (error) {
  failures.push(error);
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(failures.map(error => error.stack ?? String(error)).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Screenshots saved to ${outputDirectory}`);
}
