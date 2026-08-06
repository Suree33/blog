import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../../src/worker.ts';

const markdownBody = '# 日本語の記事\n';

const createEnv = () => ({
  ASSETS: {
    fetch: async () =>
      new Response(markdownBody, {
        headers: { 'Content-Type': 'text/markdown' },
      }),
  },
});

test('direct .md response declares UTF-8 in Content-Type', async () => {
  const response = await worker.fetch(
    new Request('https://example.com/posts/example.md'),
    createEnv(),
  );

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get('Content-Type'),
    'text/markdown; charset=utf-8',
  );
  assert.equal(await response.text(), markdownBody);
});

test('negotiated Markdown response declares UTF-8 in Content-Type', async () => {
  const response = await worker.fetch(
    new Request('https://example.com/posts/example', {
      headers: { Accept: 'text/markdown' },
    }),
    createEnv(),
  );

  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get('Content-Type'),
    'text/markdown; charset=utf-8',
  );
  assert.equal(response.headers.get('Vary'), 'Accept');
  assert.equal(await response.text(), markdownBody);
});
