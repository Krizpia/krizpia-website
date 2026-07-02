const GOOGLE_PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': statusCode === 200 ? 'public, max-age=1800' : 'no-store',
      'X-Content-Type-Options': 'nosniff'
    },
    body: JSON.stringify(payload)
  };
}

function cleanReview(review) {
  return {
    authorName: review.author_name,
    authorUrl: review.author_url,
    profilePhotoUrl: review.profile_photo_url,
    rating: review.rating,
    relativeTimeDescription: review.relative_time_description,
    text: review.text,
    time: review.time
  };
}

exports.handler = async () => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return json(503, {
      error: 'Google reviews are not configured. Set GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID in Netlify.'
    });
  }

  const url = new URL(GOOGLE_PLACE_DETAILS_URL);
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'name,rating,user_ratings_total,reviews,url');
  url.searchParams.set('reviews_sort', 'newest');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok || data.status !== 'OK') {
    return json(502, {
      error: data.error_message || data.status || 'Unable to load Google reviews.'
    });
  }

  const result = data.result || {};

  return json(200, {
    name: result.name,
    rating: result.rating,
    userRatingsTotal: result.user_ratings_total,
    googleMapsUrl: result.url,
    reviews: Array.isArray(result.reviews) ? result.reviews.map(cleanReview) : []
  });
};
