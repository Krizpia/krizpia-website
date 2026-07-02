const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_BUSINESS_API_URL = 'https://mybusiness.googleapis.com/v4';

const DEFAULT_REPLY_TEXT = 'Thank you for your valuable review. We are happy to know about your Krizpia experience and appreciate your support.';
const MAX_REPLIES_PER_RUN = 10;

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    },
    body: JSON.stringify(payload)
  };
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function normalizeResourceId(value, prefix) {
  const cleaned = String(value || '').trim().replace(/^\/+|\/+$/g, '');
  if (!cleaned) return '';
  return cleaned.startsWith(`${prefix}/`) ? cleaned : `${prefix}/${cleaned}`;
}

function getReviewName(review) {
  return review && (review.name || review.reviewName || review.reviewId || 'unknown-review');
}

function shouldReplyToReview(review) {
  return Boolean(review && getReviewName(review) !== 'unknown-review' && !review.reviewReply);
}

async function getAccessToken() {
  const params = new URLSearchParams({
    client_id: getRequiredEnv('GOOGLE_BUSINESS_CLIENT_ID'),
    client_secret: getRequiredEnv('GOOGLE_BUSINESS_CLIENT_SECRET'),
    refresh_token: getRequiredEnv('GOOGLE_BUSINESS_REFRESH_TOKEN'),
    grant_type: 'refresh_token'
  });

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });
  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Unable to create Google access token.');
  }

  return data.access_token;
}

async function googleBusinessRequest(path, accessToken, options = {}) {
  const response = await fetch(`${GOOGLE_BUSINESS_API_URL}/${path.replace(/^\//, '')}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(data.error && data.error.message ? data.error.message : `Google Business API error: ${response.status}`);
  }

  return data;
}

async function listLatestReviews(accessToken) {
  const account = normalizeResourceId(getRequiredEnv('GOOGLE_BUSINESS_ACCOUNT_ID'), 'accounts');
  const location = normalizeResourceId(getRequiredEnv('GOOGLE_BUSINESS_LOCATION_ID'), 'locations');
  const path = `${account}/${location}/reviews?pageSize=50&orderBy=${encodeURIComponent('updateTime desc')}`;
  const data = await googleBusinessRequest(path, accessToken);
  return Array.isArray(data.reviews) ? data.reviews : [];
}

async function replyToReview(reviewName, accessToken, comment) {
  return googleBusinessRequest(`${reviewName}/reply`, accessToken, {
    method: 'PUT',
    body: JSON.stringify({ comment })
  });
}

async function autoReplyToGoogleReviews({ dryRun = false } = {}) {
  if (process.env.GOOGLE_REVIEW_AUTO_REPLY_ENABLED !== 'true') {
    return {
      ok: true,
      enabled: false,
      message: 'Google review auto-reply is disabled. Set GOOGLE_REVIEW_AUTO_REPLY_ENABLED=true to enable it.'
    };
  }

  const replyText = (process.env.GOOGLE_REVIEW_REPLY_TEXT || DEFAULT_REPLY_TEXT).trim();
  const accessToken = await getAccessToken();
  const reviews = await listLatestReviews(accessToken);
  const pendingReviews = reviews.filter(shouldReplyToReview).slice(0, MAX_REPLIES_PER_RUN);
  const replied = [];

  for (const review of pendingReviews) {
    const reviewName = getReviewName(review);
    if (!dryRun) await replyToReview(reviewName, accessToken, replyText);
    replied.push({ reviewName, reviewer: review.reviewer && review.reviewer.displayName, rating: review.starRating });
  }

  return {
    ok: true,
    enabled: true,
    dryRun,
    checked: reviews.length,
    replied: replied.length,
    replies: replied
  };
}

function isScheduledEvent(event = {}) {
  const headers = event.headers || {};
  return headers['x-nf-scheduled'] === 'true' || headers['X-Nf-Scheduled'] === 'true' || event.httpMethod === 'SCHEDULED';
}

exports.handler = async event => {
  try {
    if (!isScheduledEvent(event)) {
      const secret = process.env.GOOGLE_REVIEW_AUTO_REPLY_SECRET;
      const headers = (event && event.headers) || {};
      const provided = headers['x-auto-reply-secret'] || headers['X-Auto-Reply-Secret'];
      if (!secret || provided !== secret) return json(401, { error: 'Unauthorized.' });
    }

    const dryRun = event && event.queryStringParameters && event.queryStringParameters.dryRun === 'true';
    return json(200, await autoReplyToGoogleReviews({ dryRun }));
  } catch (error) {
    console.error('Google review auto-reply failed', error);
    return json(500, { error: error.message || 'Google review auto-reply failed.' });
  }
};

exports.config = {
  schedule: '*/30 * * * *'
};

exports._private = {
  autoReplyToGoogleReviews,
  shouldReplyToReview,
  normalizeResourceId,
  isScheduledEvent
};
