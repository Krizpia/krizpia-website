const crypto = require('crypto');

const TOKEN_MAX_AGE_SECONDS = 60 * 30;
const ALLOWED_PRODUCTS = new Set([
  'Traditional Kuzhalappam',
  'Spicy Kuzhalappam',
  'Sweet Kuzhalappam',
  'Thatta',
  'All Products',
  'Distribution Enquiry'
]);

function getSecret() {
  return process.env.CSRF_SECRET || process.env.NETLIFY_SITE_ID || 'krizpia-local-development-secret';
}

function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(part => part.trim()).filter(Boolean).map(part => {
    const index = part.indexOf('=');
    return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
  }));
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

function createToken() {
  const nonce = crypto.randomBytes(24).toString('hex');
  const issuedAt = Date.now().toString();
  const token = `${issuedAt}.${sign(`${nonce}.${issuedAt}`)}`;
  return { nonce, token };
}

function validateCsrf(event, body) {
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie || '');
  const nonce = cookies.krizpia_csrf;
  const token = event.headers['x-csrf-token'] || event.headers['X-CSRF-Token'] || body.csrfToken;
  if (!nonce || !token) return false;
  const [issuedAt, signature] = String(token).split('.');
  const timestamp = Number(issuedAt);
  if (!timestamp || Date.now() - timestamp > TOKEN_MAX_AGE_SECONDS * 1000) return false;
  const expected = sign(`${nonce}.${issuedAt}`);
  const provided = Buffer.from(signature || '');
  const expectedBuffer = Buffer.from(expected);
  return provided.length === expectedBuffer.length && crypto.timingSafeEqual(provided, expectedBuffer);
}

function clean(value, maxLength) {
  return String(value || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function validate(body) {
  const data = {
    name: clean(body.name, 50),
    phone: clean(body.phone, 15),
    product: clean(body.product, 60),
    quantity: clean(body.quantity, 40),
    message: clean(body.message, 220)
  };
  if (!/^[A-Za-z .'-]{2,50}$/.test(data.name)) return { error: 'Please enter a valid name.' };
  if (!/^[0-9+\-\s]{7,15}$/.test(data.phone)) return { error: 'Please enter a valid phone number.' };
  if (!ALLOWED_PRODUCTS.has(data.product)) return { error: 'Please choose a valid product.' };
  if (!/^[A-Za-z0-9 .-]{1,40}$/.test(data.quantity)) return { error: 'Please enter a valid quantity.' };
  return { data };
}

function json(statusCode, payload, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders
    },
    body: JSON.stringify(payload)
  };
}

exports.handler = async event => {
  if (event.httpMethod === 'OPTIONS') return json(204, {});

  if (event.httpMethod === 'GET') {
    const { nonce, token } = createToken();
    return json(200, { csrfToken: token }, {
      'Set-Cookie': `krizpia_csrf=${encodeURIComponent(nonce)}; Path=/; Max-Age=${TOKEN_MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Strict`
    });
  }

  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed.' }, { Allow: 'GET, POST, OPTIONS' });

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (error) {
    return json(400, { error: 'Invalid request body.' });
  }

  if (!validateCsrf(event, body)) return json(403, { error: 'Security token expired. Please refresh and try again.' });

  const result = validate(body);
  if (result.error) return json(422, { error: result.error });

  // Production delivery can be wired to an email/API provider with environment secrets.
  // The function deliberately avoids exposing the recipient address in client-side mailto URLs.
  console.log('Krizpia enquiry received', { ...result.data, receivedAt: new Date().toISOString() });

  return json(200, { ok: true });
};
