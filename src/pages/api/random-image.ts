import type { APIRoute } from 'astro';

// Define allowed orientation values for validation
const ALLOWED_ORIENTATIONS = ['landscape', 'portrait', 'squarish'];

export const GET: APIRoute = async ({ url }) => {
  // Destructure url from context
  // Remove the temporary modification
  /* 
  // --- Temporary modification for testing failure ---
  console.log('Simulating API failure...');
  return new Response(
    JSON.stringify({ error: 'Simulated API failure' }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    },
  );
  // --- End of temporary modification ---
  */

  const accessKey = import.meta.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return new Response(
      JSON.stringify({ error: 'Unsplash API key is not configured' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    // Get and validate orientation from query params
    const queryOrientation = url.searchParams.get('orientation');
    const queryUsername = url.searchParams.get('username') || 'sur33'; // デフォルトユーザーを'sur33'に設定

    let validOrientation: string | null = null;
    if (queryOrientation && ALLOWED_ORIENTATIONS.includes(queryOrientation)) {
      validOrientation = queryOrientation;
    }

    // Construct Unsplash API URL with random endpoint
    const unsplashApiUrl = new URL('https://api.unsplash.com/photos/random');
    unsplashApiUrl.searchParams.append('client_id', accessKey);
    unsplashApiUrl.searchParams.append('username', queryUsername);
    if (validOrientation) {
      unsplashApiUrl.searchParams.append('orientation', validOrientation);
    }

    const response = await fetch(unsplashApiUrl.toString(), {
      headers: {
        'Accept-Version': 'v1',
      },
    });

    if (!response.ok) {
      throw new Error(`Unsplash API responded with status: ${response.status}`);
    }

    const randomImage = await response.json();

    return new Response(
      JSON.stringify({
        url: randomImage.urls.raw,
        alt: randomImage.alt_description || `${queryUsername}の写真`,
        blur_hash: randomImage.blur_hash,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching Unsplash image:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch image from Unsplash' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
};
