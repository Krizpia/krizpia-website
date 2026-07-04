const GOOGLE_PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const DEFAULT_PLACE_ID = 'ChIJBSEewaInBjsRi2mLAaIQxfE';
const DEFAULT_REVIEW_URL = 'https://www.google.com/maps/place/Krizpia/@9.4453436,76.5401108,17z/data=!4m8!3m7!1s0x3b0627a2c11e21e5:0xf1c510a2018b698b!8m2!3d9.4453436!4d76.5426911!9m1!1b1!16s%2Fg%2F11nq1568c9?entry=ttu';
const CACHE_SECONDS = 60 * 60 * 6;

function json(statusCode, payload, cacheSeconds = 0) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': cacheSeconds
        ? `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=${CACHE_SECONDS}`
        : 'no-store',
      'X-Content-Type-Options': 'nosniff'
    },
    body: JSON.stringify(payload)
  };
}

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizeReview(review) {
  return {
    authorName: cleanText(review.author_name, 80) || 'Google reviewer',
    rating: Number(review.rating) || 0,
    text: cleanText(review.text, 450),
    relativeTimeDescription: cleanText(review.relative_time_description, 60),
    profilePhotoUrl: /^https:\/\//.test(review.profile_photo_url || '') ? review.profile_photo_url : '',
    authorUrl: /^https:\/\//.test(review.author_url || '') ? review.author_url : ''
  };
}

exports.handler = async event => {
  if (event.httpMethod === 'OPTIONS') return json(204, {});
  if (event.httpMethod !== 'GET') return json(405, { error: 'Method not allowed.' });

  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID || DEFAULT_PLACE_ID;
  const reviewUrl = process.env.GOOGLE_REVIEW_URL || DEFAULT_REVIEW_URL;

  if (!apiKey) {
    return json(503, {
      error: 'Google reviews are not configured yet. Add GOOGLE_PLACES_API_KEY or GOOGLE_MAPS_API_KEY in Netlify environment variables.',
      reviewUrl
    });
  }

  const params = new URLSearchParams({
    place_id: placeId,
    fields: 'name,rating,user_ratings_total,reviews,url',
    reviews_sort: 'newest',
    key: apiKey
  });

  try {
    const response = await fetch(`${GOOGLE_PLACE_DETAILS_URL}?${params.toString()}`);
    const payload = await response.json();

    if (!response.ok || payload.status !== 'OK') {
      console.error('Google Places request failed', {
        statusCode: response.status,
        googleStatus: payload.status,
        message: payload.error_message
      });
      return json(502, {
        error: 'Google reviews are temporarily unavailable.',
        reviewUrl
      });
    }

    const result = payload.result || {};
    const reviews = Array.isArray(result.reviews) ? result.reviews.map(normalizeReview).filter(review => review.text) : [];

    return json(200, {
      name: cleanText(result.name, 100) || 'Krizpia',
      rating: Number(result.rating) || null,
      userRatingsTotal: Number(result.user_ratings_total) || null,
      reviewUrl: result.url || reviewUrl,
      reviews
    }, CACHE_SECONDS);
  } catch (error) {
    console.error('Google reviews function error', error);
    return json(502, {
      error: 'Google reviews are temporarily unavailable.',
      reviewUrl
    });
  }
};
