import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },  // Ramp-up to 20 concurrent users over 10s
    { duration: '20s', target: 50 },  // Ramp-up to 50 concurrent users over 20s
    { duration: '10s', target: 50 },  // Stay at 50 concurrent users for 10s
    { duration: '10s', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'], // 95% of requests should respond within 800ms
    http_req_failed: ['rate<0.05'],    // Error rate should be less than 5%
  },
};

const BASE_URL = 'http://localhost:4000';

export default function () {
  // 1. Health & Status Check
  group('1. Health Check', function () {
    const res = http.get(`${BASE_URL}/`);
    check(res, {
      'status is 200': (r) => r.status === 200,
      'has security headers': (r) => r.headers['X-Content-Type-Options'] === 'nosniff',
    });
  });

  sleep(0.5);

  // 2. Fetch Product List
  let products = [];
  group('2. Browse Product Catalog', function () {
    const res = http.get(`${BASE_URL}/api/product/list`);
    check(res, {
      'products status 200': (r) => r.status === 200,
      'products list returned': (r) => {
        try {
          const body = JSON.parse(r.body);
          if (body.success && Array.isArray(body.products)) {
            products = body.products;
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    });
  });

  sleep(0.5);

  // 3. User Authentication & Cart Operations
  group('3. User Registration & Cart Mutation', function () {
    const userEmail = `k6_user_${__VU}_${__ITER}_${Date.now()}@loadtest.com`;
    const payload = JSON.stringify({
      name: `K6 User ${__VU}`,
      email: userEmail,
      password: 'Password123!',
    });

    const regRes = http.post(`${BASE_URL}/api/user/register`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    let token = '';
    const regSuccess = check(regRes, {
      'register status 201': (r) => r.status === 201,
      'received token': (r) => {
        try {
          const body = JSON.parse(r.body);
          if (body.success && body.token) {
            token = body.token;
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },
    });

    if (token && products.length > 0) {
      const selectedProductId = products[0]._id;
      const cartPayload = JSON.stringify({
        itemId: selectedProductId,
        size: 'M',
      });

      const cartRes = http.post(`${BASE_URL}/api/cart/add`, cartPayload, {
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      });

      check(cartRes, {
        'cart add status 200': (r) => r.status === 200,
      });

      // Get Cart
      const getCartRes = http.post(`${BASE_URL}/api/cart/get`, JSON.stringify({}), {
        headers: {
          'Content-Type': 'application/json',
          token: token,
        },
      });

      check(getCartRes, {
        'get cart status 200': (r) => r.status === 200,
      });
    }
  });

  sleep(1);
}
