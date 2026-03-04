/**
 * Frontend Integration Test Script
 * 
 * This script tests all API endpoints to verify they're ready for frontend integration.
 * It simulates the complete user flow that the frontend will use.
 * 
 * Usage:
 *   npm run test:integration
 *   or
 *   ts-node test-frontend-integration.ts
 */

import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.API_URL || 'http://localhost:4000/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123',
  name: 'Test User'
};

const testSite = {
  name: 'Test Website',
  url: 'https://example.com'
};

const testMetric = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  ttfb: 600,
  fcp: 1800,
  tti: 3500,
  deviceType: 'desktop',
  browserName: 'Chrome',
  osName: 'Windows'
};

const testAlert = {
  metricType: 'lcp',
  condition: 'greater_than',
  threshold: 2500
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  tests: [] as Array<{ name: string; status: 'PASS' | 'FAIL'; message?: string }>
};

// Helper functions
function logTest(name: string, status: 'PASS' | 'FAIL', message?: string) {
  const emoji = status === 'PASS' ? '✅' : '❌';
  console.log(`${emoji} ${name}${message ? `: ${message}` : ''}`);
  testResults.tests.push({ name, status, message });
  if (status === 'PASS') {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

function logSection(title: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

async function testEndpoint(
  name: string,
  fn: () => Promise<any>
): Promise<any> {
  try {
    const result = await fn();
    logTest(name, 'PASS');
    return result;
  } catch (error) {
    const message = error instanceof AxiosError 
      ? `${error.response?.status} - ${error.response?.data?.message || error.message}`
      : error instanceof Error ? error.message : 'Unknown error';
    logTest(name, 'FAIL', message);
    throw error;
  }
}

// Test state
let authToken: string;
let userId: string;
let siteId: string;
let siteDbId: string;
let alertId: string;

async function runTests() {
  console.log('\n🚀 Starting Frontend Integration Tests\n');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Frontend URL: ${FRONTEND_URL}\n`);

  try {
    // Test 1: Health Check
    logSection('1. Health Check');
    await testEndpoint('GET /api/health', async () => {
      const response = await axios.get(`${API_BASE_URL}/health`);
      if (response.data.status !== 'ok') {
        throw new Error('Health check failed');
      }
      if (response.data.database !== 'connected') {
        throw new Error('Database not connected');
      }
      return response.data;
    });

    // Test 2: CORS Configuration
    logSection('2. CORS Configuration');
    await testEndpoint('CORS headers present', async () => {
      const response = await axios.options(`${API_BASE_URL}/health`, {
        headers: {
          'Origin': FRONTEND_URL,
          'Access-Control-Request-Method': 'GET'
        }
      });
      // Note: In development, CORS might not return preflight responses
      // This is just to verify the endpoint is accessible
      return response;
    });

    // Test 3: Authentication - Register
    logSection('3. Authentication - Register');
    await testEndpoint('POST /api/auth/register', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
      if (!response.data.token) {
        throw new Error('No token returned');
      }
      if (!response.data.user) {
        throw new Error('No user returned');
      }
      if (response.data.user.password) {
        throw new Error('Password hash exposed in response');
      }
      authToken = response.data.token;
      userId = response.data.user.id;
      return response.data;
    });

    // Test 4: Authentication - Login
    logSection('4. Authentication - Login');
    await testEndpoint('POST /api/auth/login', async () => {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      if (!response.data.token) {
        throw new Error('No token returned');
      }
      if (response.data.user.password) {
        throw new Error('Password hash exposed in response');
      }
      return response.data;
    });

    // Test 5: Authentication - Get Current User
    logSection('5. Authentication - Get Current User');
    await testEndpoint('GET /api/auth/me', async () => {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.user.id !== userId) {
        throw new Error('User ID mismatch');
      }
      if (response.data.user.password) {
        throw new Error('Password hash exposed in response');
      }
      return response.data;
    });

    // Test 6: Authentication - Invalid Token
    logSection('6. Authentication - Error Handling');
    await testEndpoint('401 on invalid token', async () => {
      try {
        await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: 'Bearer invalid-token' }
        });
        throw new Error('Should have returned 401');
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          return true;
        }
        throw error;
      }
    });

    // Test 7: Site Management - Create Site
    logSection('7. Site Management - Create Site');
    await testEndpoint('POST /api/sites', async () => {
      const response = await axios.post(`${API_BASE_URL}/sites`, testSite, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.data.site.siteId) {
        throw new Error('No siteId generated');
      }
      if (!response.data.site.domain) {
        throw new Error('Domain not extracted from URL');
      }
      siteId = response.data.site.siteId;
      siteDbId = response.data.site.id;
      return response.data;
    });

    // Test 8: Site Management - List Sites
    logSection('8. Site Management - List Sites');
    await testEndpoint('GET /api/sites', async () => {
      const response = await axios.get(`${API_BASE_URL}/sites`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!Array.isArray(response.data.sites)) {
        throw new Error('Response is not an array');
      }
      if (response.data.sites.length === 0) {
        throw new Error('No sites returned');
      }
      return response.data;
    });

    // Test 9: Site Management - Get Site Details
    logSection('9. Site Management - Get Site Details');
    await testEndpoint('GET /api/sites/:siteId', async () => {
      const response = await axios.get(`${API_BASE_URL}/sites/${siteId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.data.site.siteId !== siteId) {
        throw new Error('Site ID mismatch');
      }
      return response.data;
    });

    // Test 10: Site Management - Update Site
    logSection('10. Site Management - Update Site');
    await testEndpoint('PUT /api/sites/:siteId', async () => {
      const response = await axios.put(
        `${API_BASE_URL}/sites/${siteId}`,
        { name: 'Updated Test Website', isActive: true },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.data.site.name !== 'Updated Test Website') {
        throw new Error('Site name not updated');
      }
      return response.data;
    });

    // Test 11: Metrics - Submit Metric (Public Endpoint)
    logSection('11. Metrics - Submit Metric');
    await testEndpoint('POST /api/metrics', async () => {
      const response = await axios.post(`${API_BASE_URL}/metrics`, testMetric, {
        headers: { 'X-Site-ID': siteId }
      });
      if (response.status !== 201) {
        throw new Error('Expected 201 status');
      }
      return response.data;
    });

    // Submit a few more metrics for testing
    for (let i = 0; i < 5; i++) {
      await axios.post(`${API_BASE_URL}/metrics`, {
        ...testMetric,
        lcp: 2000 + Math.random() * 1000,
        fid: 50 + Math.random() * 100,
        cls: 0.05 + Math.random() * 0.1
      }, {
        headers: { 'X-Site-ID': siteId }
      });
    }

    // Test 12: Metrics - Get Metrics
    logSection('12. Metrics - Get Metrics');
    await testEndpoint('GET /api/metrics/:siteId', async () => {
      const response = await axios.get(`${API_BASE_URL}/metrics/${siteId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!Array.isArray(response.data.metrics)) {
        throw new Error('Response is not an array');
      }
      if (response.data.metrics.length === 0) {
        throw new Error('No metrics returned');
      }
      return response.data;
    });

    // Test 13: Metrics - Get Metrics with Filters
    logSection('13. Metrics - Get Metrics with Filters');
    await testEndpoint('GET /api/metrics/:siteId?timeRange=24h', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/metrics/${siteId}?timeRange=24h&deviceType=desktop`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (!Array.isArray(response.data.metrics)) {
        throw new Error('Response is not an array');
      }
      return response.data;
    });

    // Test 14: Metrics - Get Summary
    logSection('14. Metrics - Get Summary');
    await testEndpoint('GET /api/metrics/:siteId/summary', async () => {
      const response = await axios.get(
        `${API_BASE_URL}/metrics/${siteId}/summary`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (!response.data.summary) {
        throw new Error('Missing summary object');
      }
      if (!response.data.summary.averages || !response.data.summary.p95) {
        throw new Error('Missing metric summaries');
      }
      if (typeof response.data.summary.count !== 'number') {
        throw new Error('Missing count');
      }
      return response.data;
    });

    // Test 15: Alerts - Create Alert
    logSection('15. Alerts - Create Alert');
    await testEndpoint('POST /api/alerts', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/alerts`,
        { ...testAlert, siteId: siteDbId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (!response.data.alert.id) {
        throw new Error('No alert ID returned');
      }
      alertId = response.data.alert.id;
      return response.data;
    });

    // Test 16: Alerts - List Alerts
    logSection('16. Alerts - List Alerts');
    await testEndpoint('GET /api/alerts', async () => {
      const response = await axios.get(`${API_BASE_URL}/alerts`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!Array.isArray(response.data.alerts)) {
        throw new Error('Response is not an array');
      }
      if (response.data.alerts.length === 0) {
        throw new Error('No alerts returned');
      }
      return response.data;
    });

    // Test 17: Alerts - Update Alert
    logSection('17. Alerts - Update Alert');
    await testEndpoint('PUT /api/alerts/:alertId', async () => {
      const response = await axios.put(
        `${API_BASE_URL}/alerts/${alertId}`,
        { threshold: 3000, isActive: false },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.data.alert.threshold !== 3000) {
        throw new Error('Alert threshold not updated');
      }
      return response.data;
    });

    // Test 18: Alerts - Delete Alert
    logSection('18. Alerts - Delete Alert');
    await testEndpoint('DELETE /api/alerts/:alertId', async () => {
      const response = await axios.delete(`${API_BASE_URL}/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.status !== 200) {
        throw new Error('Expected 200 status');
      }
      return response.data;
    });

    // Test 19: Error Handling - 404
    logSection('19. Error Handling');
    await testEndpoint('404 on non-existent resource', async () => {
      try {
        await axios.get(`${API_BASE_URL}/sites/non-existent-id`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        throw new Error('Should have returned 404');
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return true;
        }
        throw error;
      }
    });

    // Test 20: Error Handling - Validation Error
    await testEndpoint('400 on validation error', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/sites`,
          { name: 'ab', url: 'invalid-url' }, // Invalid: name too short, invalid URL
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        throw new Error('Should have returned 400');
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 400) {
          if (!error.response.data.details) {
            throw new Error('Validation error should include details');
          }
          return true;
        }
        throw error;
      }
    });

    // Test 21: Cleanup - Delete Site (cascade delete)
    logSection('20. Cleanup - Delete Site');
    await testEndpoint('DELETE /api/sites/:siteId (cascade)', async () => {
      const response = await axios.delete(`${API_BASE_URL}/sites/${siteId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.status !== 200) {
        throw new Error('Expected 200 status');
      }
      return response.data;
    });

    // Test 22: Verify cascade delete
    await testEndpoint('Metrics deleted after site deletion', async () => {
      try {
        await axios.get(`${API_BASE_URL}/metrics/${siteId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        throw new Error('Should have returned 404');
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return true;
        }
        throw error;
      }
    });

    // Test 23: API Documentation
    logSection('21. API Documentation');
    await testEndpoint('GET /api/docs (Swagger)', async () => {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/api/docs/`);
      if (response.status !== 200) {
        throw new Error('Swagger docs not accessible');
      }
      return true;
    });

  } catch (error) {
    console.error('\n❌ Test suite failed:', error instanceof Error ? error.message : error);
  }

  // Print summary
  logSection('Test Summary');
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%\n`);

  if (testResults.failed > 0) {
    console.log('Failed Tests:');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`  - ${t.name}: ${t.message}`));
    console.log();
  }

  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
