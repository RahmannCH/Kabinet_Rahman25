import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'narrow', width: 320, height: 720 },
];

for (const viewport of viewports) {
  test(`${viewport.name}: cabinet preview loads without broken assets or overflow`, async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    const failedLocalRequests = [];
    const baseURL = new URL(process.env.BASE_URL ?? 'http://127.0.0.1:49173');

    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    page.on('requestfailed', request => {
      if (new URL(request.url()).origin === baseURL.origin) failedLocalRequests.push(request.url());
    });

    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(baseURL.href);
    await expect(page).toHaveTitle(/Kabinet Rahman 25/i);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('.preview-banner')).toContainText('belum disahkan');
    expect(await page.locator('link[rel="stylesheet"][href="css/style.css"]').evaluate(link => Boolean(link.sheet))).toBe(true);

    const imageErrors = await page.locator('img').evaluateAll(async images => {
      await Promise.all(images.map(image => {
        image.loading = 'eager';
        return image.decode().catch(() => undefined);
      }));
      return images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.currentSrc || image.src);
    });
    expect(imageErrors).toEqual([]);

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      page: document.documentElement.scrollWidth,
      brokenAnchors: [...document.querySelectorAll('a[href^="#"]')]
        .map(link => link.getAttribute('href'))
        .filter(href => href !== '#' && !document.getElementById(href.slice(1))),
      emptyLinks: [...document.querySelectorAll('a')]
        .filter(link => !link.getAttribute('href') || link.getAttribute('href') === '#')
        .map(link => link.textContent.trim() || link.getAttribute('aria-label') || '(unlabelled)'),
    }));
    expect(dimensions.page, 'no horizontal overflow at WCAG reflow width').toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.brokenAnchors).toEqual([]);
    expect(dimensions.emptyLinks).toEqual([]);
    expect(failedLocalRequests).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
    await page.screenshot({ path: `test-results/${viewport.name}.png`, fullPage: true });
  });
}

test('mobile navigation supports keyboard, route selection, Escape, and focus restoration', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(process.env.BASE_URL ?? 'http://127.0.0.1:49173');
  const trigger = page.locator('.menu-toggle');
  const navigation = page.getByRole('navigation', { name: 'Navigasi utama' });

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toBeVisible();
  await navigation.getByRole('link', { name: 'Organisasi' }).click();
  await expect(page).toHaveURL(/#divisi$/);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');

  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
});

test('unknown route returns an actual 404 page', async ({ request }) => {
  const response = await request.get(`${process.env.BASE_URL ?? 'http://127.0.0.1:49173'}/missing-page`);
  expect(response.status()).toBe(404);
  await expect(response.text()).resolves.toContain('Halaman tidak ditemukan');
});

test('public build excludes source, tests, and project documentation', async () => {
  const { access } = await import('node:fs/promises');
  const exists = async path => access(path).then(() => true, () => false);
  for (const relativePath of ['PRD_KabinetRahman25.md', 'DESIGN.md', 'package.json', 'tests']) {
    expect(await exists(`dist/${relativePath}`)).toBe(false);
  }
  expect(await exists('dist/index.html')).toBe(true);
});
