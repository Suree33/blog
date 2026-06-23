import { test as base, expect } from '@playwright/test';

/**
 * Shared Playwright test fixture for the blog E2E suite.
 *
 * Re-exports `test` and `expect` so that future phases can extend `base` with
 * project-specific fixtures (e.g. Page Object Models, accessibility axe setup)
 * without touching individual specs.
 */
export const test = base;

export { expect };
