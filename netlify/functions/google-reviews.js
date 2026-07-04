const GOOGLE_PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_BUSINESS_API_URL = 'https://mybusiness.googleapis.com/v4';

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

function cleanPlacesReview(review) {
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

function normalizeResourceId(value, prefix) {
  const cleaned = String(value || '').trim().replace(/^\/+|\/+$/g, '');
  if (!cleaned) return '';
  return cleaned.startsWith(`${prefix}/`) ? cleaned : `${prefix}/${cleaned}`;
}

function starRatingToNumber(starRating) {
  const value = String(starRating || '').toUpperCase();
  const namedRatings = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
  const namedRating = Object.keys(namedRatings).find(name => value.includes(name));
  if (namedRating) return namedRatings[namedRating];

  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : undefined;
}

function cleanBusinessReview(review) {
  const reviewer = review.reviewer || {};
  return {
    authorName: reviewer.displayName,
    profilePhotoUrl: reviewer.profilePhotoUrl,
    rating: starRatingToNumber(review.starRating),
    relativeTimeDescription: review.updateTime ? new Date(review.updateTime).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : undefined,
    text: review.comment || '',
    time: review.updateTime ? Math.floor(new Date(review.updateTime).getTime() / 1000) : undefined
  };
}

async function createAccessToken() {
  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_BUSINESS_CLIENT_ID,
      client_secret: process.env.GOOGLE_BUSINESS_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_BUSINESS_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Unable to create Google Business access token.');
  }
  return data.access_token;
}

async function fetchBusinessReviews() {
  const required = [
    process.env.GOOGLE_BUSINESS_ACCOUNT_ID,
    process.env.GOOGLE_BUSINESS_LOCATION_ID,
    process.env.GOOGLE_BUSINESS_CLIENT_ID,
    process.env.GOOGLE_BUSINESS_CLIENT_SECRET,
    process.env.GOOGLE_BUSINESS_REFRESH_TOKEN
  ];
  if (required.some(value => !value)) return null;

  const accessToken = await createAccessToken();
  const account = normalizeResourceId(process.env.GOOGLE_BUSINESS_ACCOUNT_ID, 'accounts');
  const location = normalizeResourceId(process.env.GOOGLE_BUSINESS_LOCATION_ID, 'locations');
  const url = `${GOOGLE_BUSINESS_API_URL}/${account}/${location}/reviews?pageSize=50&orderBy=${encodeURIComponent('updateTime desc')}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' } });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error && data.error.message ? data.error.message : 'Unable to load Google Business reviews.');
  }

  const reviews = Array.isArray(data.reviews) ? data.reviews : [];
  const averageRating = reviews.length
    ? (reviews.reduce((total, review) => total + (starRatingToNumber(review.starRating) || 0), 0) / reviews.length).toFixed(1)
    : undefined;

  return {
    name: process.env.GOOGLE_BUSINESS_LOCATION_NAME || 'Krizpia',
    rating: averageRating,
    userRatingsTotal: reviews.length,
    googleMapsUrl: process.env.GOOGLE_MAPS_REVIEW_URL || process.env.GOOGLE_MAPS_URL,
    reviews: reviews.map(cleanBusinessReview)
  };
}

async function fetchPlacesReviews() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) return null;

  const url = new URL(GOOGLE_PLACE_DETAILS_URL);
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'name,rating,user_ratings_total,reviews,url');
  url.searchParams.set('reviews_sort', 'newest');
  url.searchParams.set('key', apiKey);

  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.status !== 'OK') {
    throw new Error(data.error_message || data.status || 'Unable to load Google reviews.');
  }

  const result = data.result || {};

  return {
    name: result.name,
    rating: result.rating,
    userRatingsTotal: result.user_ratings_total,
    googleMapsUrl: result.url,
    reviews: Array.isArray(result.reviews) ? result.reviews.map(cleanPlacesReview) : []
  };
}

exports.handler = async () => {
  const errors = [];

  try {
    const businessData = await fetchBusinessReviews();
    if (businessData) return json(200, businessData);
  } catch (error) {
    errors.push(error.message || 'Google Business reviews failed.');
  }

  try {
    const placesData = await fetchPlacesReviews();
    if (placesData) return json(200, placesData);
  } catch (error) {
    errors.push(error.message || 'Google Places reviews failed.');
  }

  if (errors.length) {
    return json(502, { error: errors.join(' ') });
  }

  return json(503, {
    error: 'Google reviews are not configured. Set Google Business Profile credentials or GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID in Netlify.'
  });
};

exports._private = {
  cleanBusinessReview,
  cleanPlacesReview,
  normalizeResourceId,
  starRatingToNumber
};
