/// <reference types="@cloudflare/workers-types" />

interface Env {
  UNSPLASH_CACHE: KVNamespace;
  UNSPLASH_ACCESS_KEY: string;
}

interface UnsplashImage {
  id: string;
  url: string;
  alt: string;
  blur_hash: string;
  created_at: string;
}

interface UnsplashApiResponse {
  id: string;
  urls: {
    regular: string;
  };
  alt_description: string | null;
  blur_hash: string;
  created_at: string;
}

async function updateCache(env: Env): Promise<Response> {
  try {
    console.log('Unsplash APIにリクエストを送信中...');
    const response = await fetch(
      'https://api.unsplash.com/photos?per_page=30',
      {
        headers: {
          Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Unsplash APIエラー:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Failed to fetch images from Unsplash: ${response.status} ${response.statusText}`,
      );
    }

    const images = (await response.json()) as UnsplashApiResponse[];
    console.log(`${images.length}枚の画像を取得しました`);

    const processedImages: UnsplashImage[] = images.map((img) => ({
      id: img.id,
      url: img.urls.regular,
      alt: img.alt_description || '',
      blur_hash: img.blur_hash,
      created_at: img.created_at,
    }));

    await env.UNSPLASH_CACHE.put('images', JSON.stringify(processedImages));
    await env.UNSPLASH_CACHE.put('last_updated', new Date().toISOString());

    return new Response(
      JSON.stringify({
        message: 'Cache updated successfully',
        count: processedImages.length,
        lastUpdated: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (error: unknown) {
    console.error('キャッシュの更新に失敗:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

export default {
  // Cronトリガーのハンドラー
  async scheduled(
    event: ScheduledEvent,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<void> {
    ctx.waitUntil(updateCache(env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // ランダムな画像を取得
    if (url.pathname === '/random') {
      try {
        const images = (await env.UNSPLASH_CACHE.get('images', 'json')) as
          | UnsplashImage[]
          | null;

        if (!images || images.length === 0) {
          return new Response(
            JSON.stringify({
              error: 'No images in cache',
              timestamp: new Date().toISOString(),
            }),
            {
              status: 404,
              headers: { 'Content-Type': 'application/json' },
            },
          );
        }

        const randomIndex = Math.floor(Math.random() * images.length);
        return new Response(
          JSON.stringify({
            image: images[randomIndex],
            timestamp: new Date().toISOString(),
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          },
        );
      } catch (error: unknown) {
        console.error('キャッシュからの画像取得に失敗:', error);
        return new Response(
          JSON.stringify({
            error:
              error instanceof Error ? error.message : 'Unknown error occurred',
            timestamp: new Date().toISOString(),
          }),
          {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
    }

    // キャッシュを更新（手動トリガー）
    if (url.pathname === '/update' && request.method === 'POST') {
      return updateCache(env);
    }

    return new Response(
      JSON.stringify({
        error: 'Not found',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  },
};
