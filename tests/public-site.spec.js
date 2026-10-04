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

// ---- Logic-regression tests (overlay stack, scroll lock, stats, nav) ----

test('stats render real numbers, never a permanent zero', async ({ page }) => {
  await page.goto('/');
  const numbers = await page.locator('.stat-number[data-count]').allTextContents();
  expect(numbers.length).toBe(4);
  for (const text of numbers) {
    expect(text.trim()).not.toBe('0');
    expect(text.trim()).toMatch(/^\d+\+?$/);
  }
  // Final values must match their data-count targets
  const mismatched = await page.locator('.stat-number[data-count]').evaluateAll(els =>
    els.filter(el => Number(el.textContent.replace('+', '')) !== Number(el.dataset.count)).length
  );
  expect(mismatched).toBe(0);
});

test('proker departemen renders 21 cards and filters per departemen', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('#prokerDeptGrid .proker-dept-card');
  await expect(cards).toHaveCount(21);

  await page.locator('.proker-filter-btn[data-proker-filter="hr"]').click();
  await expect(page.locator('#prokerDeptGrid .proker-dept-card:visible')).toHaveCount(3);

  await page.locator('.proker-filter-btn[data-proker-filter="all"]').click();
  await expect(page.locator('#prokerDeptGrid .proker-dept-card:visible')).toHaveCount(21);
});

test('Escape closes only the topmost overlay and keeps scroll locked', async ({ page }) => {
  await page.goto('/');

  // Open cabinet modal
  await page.locator('#openFullCabinetBtn').click();
  await expect(page.locator('#fullCabinetModal')).toBeVisible();

  // Open gallery lightbox on top of it (close modal first to reach the gallery)
  await page.locator('#closeFullCabinetBtn').click();
  await page.locator('.gallery-item').first().click();
  await expect(page.locator('#lightbox')).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');

  // Escape closes the lightbox only
  await page.keyboard.press('Escape');
  await expect(page.locator('#lightbox')).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
});

test('tablet resize closes the mobile nav and keeps navigation usable', async ({ page }) => {
  await page.setViewportSize({ width: 480, height: 900 });
  await page.goto('/');

  const menuButton = page.locator('.menu-toggle');
  const nav = page.locator('#site-nav');
  await menuButton.click();
  await expect(nav).toBeVisible();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

  // Grow to desktop width — CSS switches to inline nav, JS must close the menu state
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).not.toHaveClass(/is-open/);
});

test('section numbering is unique and ordered', async ({ page }) => {
  await page.goto('/');
  const kickers = await page.locator('.section-kicker span').allTextContents();
  const nums = kickers.map(t => Number(t.trim())).filter(n => !Number.isNaN(n));
  expect(new Set(nums).size).toBe(nums.length); // no duplicates
  expect(nums).toEqual([...nums].sort((a, b) => a - b)); // ascending
});

test('agenda renders 18 data-driven items with auto-generated filter pills', async ({ page }) => {
  await page.goto('/');

  // 18 items rendered by JS from AGENDA_ITEMS
  const items = page.locator('#agendaTimeline .agenda-item');
  await expect(items).toHaveCount(18);

  // 10 filter pills: "Semua" + 9 months (Apr–Des)
  const pills = page.locator('#agendaFilter .agenda-filter-btn');
  await expect(pills).toHaveCount(10);

  // "Semua" is active by default and shows all 18
  await expect(pills.first()).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#agendaTimeline .agenda-item:not([hidden])')).toHaveCount(18);

  // Filter by April → 2 items
  await page.locator('#agendaFilter .agenda-filter-btn[data-agenda-filter="apr"]').click();
  await expect(page.locator('#agendaTimeline .agenda-item:not([hidden])')).toHaveCount(2);

  // Filter by December → 2 items
  await page.locator('#agendaFilter .agenda-filter-btn[data-agenda-filter="des"]').click();
  await expect(page.locator('#agendaTimeline .agenda-item:not([hidden])')).toHaveCount(2);

  // Back to "Semua"
  await page.locator('#agendaFilter .agenda-filter-btn[data-agenda-filter="all"]').click();
  await expect(page.locator('#agendaTimeline .agenda-item:not([hidden])')).toHaveCount(18);
});

test('every agenda item has a valid status badge class', async ({ page }) => {
  await page.goto('/');
  const statuses = await page.locator('#agendaTimeline .agenda-status').evaluateAll(els =>
    els.map(el => [...el.classList].filter(c => c.startsWith('is-')))
  );
  expect(statuses.length).toBe(18);
  for (const cls of statuses) {
    expect(cls.length).toBe(1); // exactly one is-* class
    expect(['is-selesai', 'is-running', 'is-upcoming']).toContain(cls[0]);
  }
});

test('all agenda years are 2027 (not stale 2026)', async ({ page }) => {
  await page.goto('/');
  const dates = await page.locator('#agendaTimeline .agenda-date').allTextContents();
  expect(dates.length).toBe(18);
  for (const d of dates) {
    expect(d).toContain('2027');
    expect(d).not.toContain('2026');
  }
});
