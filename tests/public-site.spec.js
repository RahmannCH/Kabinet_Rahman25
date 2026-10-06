import { expect, test } from '@playwright/test';

const viewports = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'split-screen-desktop', width: 1024, height: 900 },
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

test('404 page is styled with skip link and card layout', async ({ request }) => {
  const baseURL = process.env.BASE_URL ?? 'http://127.0.0.1:49173';
  const response = await request.get(`${baseURL}/another-missing-page`);
  const html = await response.text();
  expect(html).toContain('skip-link');
  expect(html).toContain('not-found-card');
  expect(html).toContain('Kembali ke beranda');
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
    expect(text.trim()).toMatch(/^[0-9.]+\+?$/);
  }
  // Final values must match their data-count targets
  const mismatched = await page.locator('.stat-number[data-count]').evaluateAll(els =>
    els.filter(el => Number(el.textContent.replace('+', '').replace(/\./g, '')) !== Number(el.dataset.count)).length
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

test('Escape closes the open overlay and never leaves scroll stuck', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1440, height: 1000 });

  // --- Cabinet modal: open → Escape → closed, scroll released ---
  await page.locator('#openFullCabinetBtn').click();
  await expect(page.locator('#fullCabinetModal')).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');

  await page.keyboard.press('Escape');
  await expect(page.locator('#fullCabinetModal')).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');

  // --- Lightbox: open → Escape → closed, scroll released ---
  await page.locator('#galeri').scrollIntoViewIfNeeded();
  await page.locator('.gallery-item').first().click();
  await expect(page.locator('#lightbox')).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');

  await page.keyboard.press('Escape');
  await expect(page.locator('#lightbox')).toBeHidden();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');

  // --- Repeated open/close cycles must not leak the scroll lock ---
  for (let i = 0; i < 3; i++) {
    await page.locator('.gallery-item').nth(i).click();
    await expect(page.locator('#lightbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#lightbox')).toBeHidden();
  }
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('');

  // --- Overlay stack priority: with only the article modal open, Escape closes it too ---
  await page.locator('[data-article]').first().click();
  await expect(page.locator('#articleModal')).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(page.locator('#articleModal')).toBeHidden();
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

  // Clicking outside closes the drawer
  await page.evaluate(() => document.body.click());
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).not.toHaveClass(/is-open/);

  // Open again
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');

  // Grow to desktop width (>= 1280px) — CSS switches to inline nav, JS must close the menu state
  await page.setViewportSize({ width: 1366, height: 900 });
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

test('lightbox close button is visible in dark mode', async ({ page }) => {
  await page.goto('/');
  // Force dark theme via DOM (inline script checks localStorage/prefers-color-scheme)
  await page.evaluate(() => {
    document.documentElement.dataset.theme = 'dark';
  });
  // Open lightbox by clicking first gallery item
  await page.locator('.gallery-item').first().click();
  const btn = page.locator('.lightbox-close');
  await expect(btn).toBeVisible();
  const bg = await btn.evaluate(el => getComputedStyle(el).backgroundColor);
  // Dark-mode background should be dark (rgba(15,23,42,0.92) ≈ rgb(15,23,42))
  expect(bg).toContain('15');
  expect(bg).toContain('42');
});

test('reduced-motion reveals all scroll content immediately', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const opacities = await page.locator('.sc-fade-up').evaluateAll(els =>
    els.map(el => getComputedStyle(el).opacity)
  );
  for (const op of opacities) {
    expect(parseFloat(op)).toBe(1);
  }
});

test('agenda status uses Jakarta timezone', async ({ page }) => {
  // Mock: UTC 2027-04-12T18:30:00Z = 2027-04-13T01:30:00+07:00 (WIB)
  // In UTC, toISOString().slice(0,10) would return "2027-04-12" (wrong).
  // With Jakarta timezone fix, it should return "2027-04-13".
  await page.addInitScript(() => {
    const RealDate = Date;
    // eslint-disable-next-line no-global-assign
    Date = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) return new RealDate('2027-04-12T18:30:00Z');
        return new RealDate(...args);
      }
    };
  });
  await page.goto('/');
  // Item with date 2027-04-12 should show "is-selesai" (yesterday in Jakarta)
  // because Jakarta date is 2027-04-13, so 2027-04-12 < 2027-04-13
  const item = page.locator('#agendaTimeline .agenda-item[data-date="2027-04-12"]');
  await expect(item.locator('.agenda-status')).toHaveClass(/is-selesai/);
});

test('cabinet modal back/forward does not duplicate history entries', async ({ page }) => {
  await page.goto('/');
  const modal = page.locator('#fullCabinetModal');
  await expect(modal).toBeHidden();

  const initialLength = await page.evaluate(() => history.length);

  await page.locator('#openFullCabinetBtn').click();
  await expect(modal).toBeVisible();
  const afterOpen = await page.evaluate(() => history.length);
  expect(afterOpen).toBe(initialLength + 1);

  await page.goBack();
  await expect(modal).toBeHidden();
  await page.goForward();
  await expect(modal).toBeVisible();
  // Forward navigation must NOT push a fresh entry (the bug we fixed)
  const afterForward = await page.evaluate(() => history.length);
  expect(afterForward).toBe(afterOpen);
});

test('lightbox rapid click switches image without closing', async ({ page }) => {
  await page.goto('/');
  const galleryItems = page.locator('.gallery-item');
  const count = await galleryItems.count();
  expect(count).toBeGreaterThan(1);

  // Click first image
  await galleryItems.nth(0).click();
  const lightbox = page.locator('#lightbox');
  await expect(lightbox).toBeVisible();
  const firstSrc = await page.locator('#lightboxImage').getAttribute('src');

  // Trigger click on second image programmatically while lightbox is open
  await galleryItems.nth(1).evaluate(el => el.click());
  await expect(lightbox).toBeVisible();
  const secondSrc = await page.locator('#lightboxImage').getAttribute('src');

  expect(secondSrc).not.toBe(firstSrc);
  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
});

test('lightbox arrow keys navigate gallery images', async ({ page }) => {
  await page.goto('/');
  await page.locator('.gallery-item').first().click();
  const lightbox = page.locator('#lightbox');
  await expect(lightbox).toBeVisible();

  const firstSrc = await page.locator('#lightboxImage').getAttribute('src');
  await page.keyboard.press('ArrowRight');
  const secondSrc = await page.locator('#lightboxImage').getAttribute('src');
  expect(secondSrc).not.toBe(firstSrc);

  await page.keyboard.press('ArrowLeft');
  const backSrc = await page.locator('#lightboxImage').getAttribute('src');
  expect(backSrc).toBe(firstSrc);

  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
});

test('article modal supports deep-linking via hash and next/prev navigation', async ({ page }) => {
  await page.goto('/#kabar-pelatihan');
  const modal = page.locator('#articleModal');
  await expect(modal).toBeVisible();
  await expect(page.locator('#articleTitle')).toContainText('Pelatihan Kepemimpinan');

  // Next article
  await page.locator('#articleNextBtn').click();
  await expect(page.locator('#articleTitle')).toContainText('Open Recruitment');
  expect(page.url()).toContain('#kabar-oprec');

  // Prev article
  await page.locator('#articlePrevBtn').click();
  await expect(page.locator('#articleTitle')).toContainText('Pelatihan Kepemimpinan');

  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('proker live search filters cards dynamically', async ({ page }) => {
  await page.goto('/');
  const searchInput = page.locator('#prokerSearchInput');
  await expect(searchInput).toBeVisible();

  // Search for "Talk" (Tech Talk)
  await searchInput.fill('Talk');
  const visibleCards = page.locator('#prokerDeptGrid .proker-dept-card:visible');
  const count = await visibleCards.count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThan(21);
  await expect(visibleCards.first()).toContainText('Tech Talk');

  // Search for non-existent keyword
  await searchInput.fill('xyz999nomatch');
  await expect(page.locator('#prokerDeptGrid .proker-dept-card:visible')).toHaveCount(0);
  await expect(page.locator('#prokerEmpty')).toBeVisible();

  // Clear search
  await searchInput.fill('');
  await expect(page.locator('#prokerDeptGrid .proker-dept-card:visible')).toHaveCount(21);
  await expect(page.locator('#prokerEmpty')).toBeHidden();
});

test('aspirasi form updates char counter and swaps to permanent success state', async ({ page }) => {
  await page.goto('/');
  const pesanInput = page.locator('#pesanInput');
  const counter = page.locator('#pesanCounter');

  await expect(counter).toContainText('0 / 500');
  await pesanInput.fill('Halo pengurus kabinet');
  await expect(counter).toContainText('21 / 500');

  // Submit missing target to test ARIA describedby logic
  const submitBtn = page.locator('#publicAspirasiForm button[type="submit"]');
  await submitBtn.click();
  const targetSelect = page.locator('#divisiTarget');
  await expect(targetSelect).toHaveAttribute('aria-invalid', 'true');
  const errorId = await targetSelect.getAttribute('aria-describedby');
  expect(errorId).toBeTruthy();
  const errorMsg = page.locator(`#${errorId}`);
  await expect(errorMsg).toBeVisible();

  // Select target
  await targetSelect.selectOption('kominfo');
  await submitBtn.click();

  // Success card appears permanently
  const successCard = page.locator('#aspirasiSuccessCard');
  await expect(successCard).toBeVisible();
  await expect(successCard).toContainText('Aspirasi Terkirim');
  await expect(page.locator('#publicAspirasiForm')).toBeHidden();

  // Reset button returns the form
  await page.locator('#aspirasiResetBtn').click();
  await expect(page.locator('#publicAspirasiForm')).toBeVisible();
  await expect(successCard).toBeHidden();
  await expect(counter).toContainText('0 / 500');
  await expect(targetSelect).not.toHaveAttribute('aria-invalid');
});

test('offscreen hero animations pause to save GPU', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('.hero');
  await expect(hero).not.toHaveClass(/is-paused/);

  // Scroll to footer to push hero out of view
  await page.locator('.footer').scrollIntoViewIfNeeded();
  await expect(hero).toHaveClass(/is-paused/);
});

test('navbar elements never overlap across desktop and intermediate viewports', async ({ page }) => {
  for (const width of [1024, 1100, 1140, 1200, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const brandBox = await page.locator('#siteHeader .brand').boundingBox();
    const actionsBox = await page.locator('#siteHeader .header-actions').boundingBox();
    expect(brandBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();

    // Brand and header actions must not overlap horizontally
    expect(brandBox.x + brandBox.width).toBeLessThanOrEqual(actionsBox.x);
  }
});

test('cabinet modal auto-resets department filter on reopen', async ({ page }) => {
  await page.goto('/');
  await page.locator('#openFullCabinetBtn').click();
  const modal = page.locator('#fullCabinetModal');
  await expect(modal).toBeVisible();

  // Filter to DPO
  await page.locator('.modal-pill-btn[data-modal-filter="sec-dpo"]').click();
  await expect(page.locator('#sec-dpo')).not.toHaveClass(/is-modal-hidden/);
  await expect(page.locator('#sec-bph')).toHaveClass(/is-modal-hidden/);

  // Close modal via close button
  await page.locator('#closeFullCabinetBtn').click();
  await expect(modal).toBeHidden();

  // Re-open modal
  await page.locator('#openFullCabinetBtn').click();
  await expect(modal).toBeVisible();

  // Filters must be reset to 'Semua' and all sections unhidden
  const firstPill = page.locator('.modal-pill-btn').first();
  await expect(firstPill).toHaveClass(/active/);
  await expect(firstPill).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#sec-bph')).not.toHaveClass(/is-modal-hidden/);
  await expect(page.locator('#sec-dpo')).not.toHaveClass(/is-modal-hidden/);

  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('article modal next/prev replaces state instead of stacking history', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-article="kabar-pelatihan"]').first().click();
  const modal = page.locator('#articleModal');
  await expect(modal).toBeVisible();

  const lengthAfterOpen = await page.evaluate(() => history.length);

  // Cycle Next -> Next
  await page.locator('#articleNextBtn').click();
  await expect(page.locator('#articleTitle')).toContainText('Open Recruitment');

  await page.locator('#articleNextBtn').click();
  await expect(page.locator('#articleTitle')).toContainText('Gemastik');

  // History length must remain unchanged because replaceState was used
  const lengthAfterCycling = await page.evaluate(() => history.length);
  expect(lengthAfterCycling).toBe(lengthAfterOpen);

  // Close modal
  await page.locator('.article-sheet-close').click();
  await expect(modal).toBeHidden();
});
