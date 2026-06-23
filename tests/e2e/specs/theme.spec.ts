import { expect, test } from '../fixtures/test';

/** Matches `dark` as a whole class in an HTML `class` attribute value. */
const DARK = /(?:^|\s)dark(?:\s|$)/;
/** Matches `light` as a whole class in an HTML `class` attribute value. */
const LIGHT = /(?:^|\s)light(?:\s|$)/;

/**
 * Theme toggle behaviour.
 *
 * Scoped to the desktop project because the theme toggle button lives in the
 * header icon cluster, which is hidden inside the mobile slide-down menu on
 * small viewports. The system colour scheme is emulated to `light` so the
 * three-state toggle cycle (dark -> light -> system) is deterministic.
 */
test.describe('theme toggle', () => {
  test.skip(({ isDesktop }) => !isDesktop, 'desktop only');

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
  });

  test('cycles dark -> light -> system and persists across reload', async ({
    homePage,
    page,
  }) => {
    await homePage.goto();

    const html = page.locator('html');

    // Fresh context => no stored theme => no explicit class on <html>.
    await expect(html).not.toHaveAttribute('class', DARK);
    await expect(html).not.toHaveAttribute('class', LIGHT);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('theme')))
      .toBeNull();

    // 1st click: current is system (null), system is light => applies dark.
    await homePage.header.toggleTheme();
    await expect(html).toHaveAttribute('class', DARK);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('theme')))
      .toBe('dark');

    // Persistence: reloading restores the theme from localStorage.
    await page.reload();
    await expect(html).toHaveAttribute('class', DARK);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('theme')))
      .toBe('dark');

    // 2nd click: current is dark, system is light => applies light.
    await homePage.header.toggleTheme();
    await expect(html).toHaveAttribute('class', LIGHT);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('theme')))
      .toBe('light');

    // 3rd click: current is light, system is light => clears to system.
    await homePage.header.toggleTheme();
    await expect(html).not.toHaveAttribute('class', DARK);
    await expect(html).not.toHaveAttribute('class', LIGHT);
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('theme')))
      .toBeNull();
  });
});
