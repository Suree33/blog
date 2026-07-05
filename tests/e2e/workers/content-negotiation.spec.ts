import { expect, test } from '@playwright/test';
import { routes } from '../utils/routes';

interface NegotiationCase {
  accept: string;
  expectedContentType: RegExp;
  representation: 'HTML' | 'Markdown';
}

const negotiationCases: NegotiationCase[] = [
  {
    accept: 'text/markdown',
    expectedContentType: /^text\/markdown\b/,
    representation: 'Markdown',
  },
  {
    accept: 'text/html',
    expectedContentType: /^text\/html\b/,
    representation: 'HTML',
  },
  {
    accept: 'text/html;q=0.5, text/markdown;q=1',
    expectedContentType: /^text\/markdown\b/,
    representation: 'Markdown',
  },
  {
    accept: 'text/html;q=1, text/markdown;q=0.5',
    expectedContentType: /^text\/html\b/,
    representation: 'HTML',
  },
  {
    accept: 'text/markdown, text/html, */*',
    expectedContentType: /^text\/markdown\b/,
    representation: 'Markdown',
  },
  {
    accept: 'text/html, text/markdown',
    expectedContentType: /^text\/html\b/,
    representation: 'HTML',
  },
  {
    accept: '*/*',
    expectedContentType: /^text\/html\b/,
    representation: 'HTML',
  },
];

test.describe('Workers content negotiation', () => {
  for (const negotiationCase of negotiationCases) {
    test(`Accept: ${negotiationCase.accept} は ${negotiationCase.representation} を返す`, async ({
      request,
    }) => {
      const response = await request.get(routes.sampleArticle, {
        headers: { Accept: negotiationCase.accept },
      });

      expect(response.status(), '記事 URL は HTTP 200 を返す').toBe(200);
      expect(
        response.headers()['content-type'] ?? '',
        `${negotiationCase.representation} の Content-Type が返る`,
      ).toMatch(negotiationCase.expectedContentType);
      expect(
        response.headers().vary ?? '',
        'content negotiation 応答は Vary: Accept を返す',
      ).toMatch(/(?:^|,)\s*Accept\s*(?:,|$)/i);
    });
  }

  test('HEAD は GET と同じ Markdown 表現を本文なしで返す', async ({
    request,
  }) => {
    const response = await request.head(routes.sampleArticle, {
      headers: { Accept: 'text/markdown' },
    });

    expect(response.status(), 'HEAD は HTTP 200 を返す').toBe(200);
    expect(
      response.headers()['content-type'] ?? '',
      'HEAD も Markdown の Content-Type を返す',
    ).toMatch(/^text\/markdown\b/);
    expect(
      response.headers().vary ?? '',
      'HEAD も Vary: Accept を返す',
    ).toMatch(/(?:^|,)\s*Accept\s*(?:,|$)/i);
    expect(await response.body(), 'HEAD の本文は空である').toHaveLength(0);
  });
});
