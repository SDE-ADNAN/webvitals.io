/**
 * Integration test for authentication endpoints
 * Run with: npx tsx src/test-auth-endpoints.ts
 * Make sure the server is running on port 4000
 */

async function testRegisterEndpoint() {
  console.log("\n=== Testing POST /api/auth/register ===");
  
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: "testpassword123",
    firstName: "Test",
    lastName: "User",
  };
  
  console.log("Registering user:", testUser.email);
  
  try {
    const response = await fetch("http://localhost:4000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testUser),
    });
    
    const data = await response.json();
    
    if (response.status === 201) {
      console.log("✓ Registration successful");
      console.log("Token received:", data.token ? "Yes" : "No");
      console.log("User data:", data.user);
      console.log("Password in response:", data.user.password ? "✗ FAIL (password exposed)" : "✓ PASS (password hidden)");
      return { success: true, token: data.token, user: data.user };
    } else {
      console.log("✗ Registration failed");
      console.log("Status:", response.status);
      console.log("Response:", data);
      return { success: false };
    }
  } catch (error) {
    console.log("✗ Request failed");
    console.error(error);
    return { success: false };
  }
}

async function testLoginEndpoint(email: string, password: string) {
  console.log("\n=== Testing POST /api/auth/login ===");
  
  console.log("Logging in with:", email);
  
  try {
    const response = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (response.status === 200) {
      console.log("✓ Login successful");
      console.log("Token received:", data.token ? "Yes" : "No");
      console.log("User data:", data.user);
      return { success: true, token: data.token };
    } else {
      console.log("✗ Login failed");
      console.log("Status:", response.status);
      console.log("Response:", data);
      return { success: false };
    }
  } catch (error) {
    console.log("✗ Request failed");
    console.error(error);
    return { success: false };
  }
}

async function testGetCurrentUser(token: string) {
  console.log("\n=== Testing GET /api/auth/me ===");
  
  try {
    const response = await fetch("http://localhost:4000/api/auth/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    
    const data = await response.json();
    
    if (response.status === 200) {
      console.log("✓ Get current user successful");
      console.log("User data:", data.user);
      console.log("Password in response:", data.user.password ? "✗ FAIL (password exposed)" : "✓ PASS (password hidden)");
      return { success: true };
    } else {
      console.log("✗ Get current user failed");
      console.log("Status:", response.status);
      console.log("Response:", data);
      return { success: false };
    }
  } catch (error) {
    console.log("✗ Request failed");
    console.error(error);
    return { success: false };
  }
}

async function testInvalidCredentials() {
  console.log("\n=== Testing Invalid Credentials ===");
  
  try {
    const response = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "nonexistent@example.com",
        password: "wrongpassword",
      }),
    });
    
    if (response.status === 401) {
      console.log("✓ Invalid credentials correctly rejected (401)");
      return { success: true };
    } else {
      console.log("✗ Expected 401 status, got:", response.status);
      return { success: false };
    }
  } catch (error) {
    console.log("✗ Request failed");
    console.error(error);
    return { success: false };
  }
}

async function testMissingToken() {
  console.log("\n=== Testing Missing Token ===");
  
  try {
    const response = await fetch("http://localhost:4000/api/auth/me", {
      method: "GET",
    });
    
    if (response.status === 401) {
      console.log("✓ Missing token correctly rejected (401)");
      return { success: true };
    } else {
      console.log("✗ Expected 401 status, got:", response.status);
      return { success: false };
    }
  } catch (error) {
    console.log("✗ Request failed");
    console.error(error);
    return { success: false };
  }
}

async function testDuplicateEmail(email: string) {
  console.log("\n=== Testing Duplicate Email ===");
  
  try {
    const response = await fetch("http://localhost:4000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password: "testpassword123",
      }),
    });
    
    if (response.status === 409) {
      console.log("✓ Duplicate email correctly rejected (409)");
      return { success: true };
    } else {
      console.log("✗ Expected 409 status, got:", response.status);
      return { success: false };
    }
  } catch (error) {
    console.log("✗ Request failed");
    console.error(error);
    return { success: false };
  }
}

async function runTests() {
  console.log("Starting authentication endpoint tests...");
  console.log("Make sure the server is running on port 4000\n");
  
  // Test health check first
  try {
    const healthResponse = await fetch("http://localhost:4000/api/health");
    if (healthResponse.ok) {
      console.log("✓ Server is running");
    } else {
      console.log("✗ Server health check failed");
      process.exit(1);
    }
  } catch (error) {
    console.log("✗ Cannot connect to server. Make sure it's running on port 4000");
    process.exit(1);
  }
  
  const results: Record<string, boolean> = {};
  
  // Test registration
  const registerResult = await testRegisterEndpoint();
  results.register = registerResult.success;
  
  if (!registerResult.success) {
    console.log("\n✗ Registration failed, skipping remaining tests");
    process.exit(1);
  }
  
  const { token, user } = registerResult;
  
  // Test login
  const loginResult = await testLoginEndpoint(user.email, "testpassword123");
  results.login = loginResult.success;
  
  // Test get current user
  if (token) {
    const getCurrentUserResult = await testGetCurrentUser(token);
    results.getCurrentUser = getCurrentUserResult.success;
  }
  
  // Test invalid credentials
  const invalidCredsResult = await testInvalidCredentials();
  results.invalidCredentials = invalidCredsResult.success;
  
  // Test missing token
  const missingTokenResult = await testMissingToken();
  results.missingToken = missingTokenResult.success;
  
  // Test duplicate email
  const duplicateEmailResult = await testDuplicateEmail(user.email);
  results.duplicateEmail = duplicateEmailResult.success;
  
  console.log("\n=== Test Results ===");
  console.log("Registration:", results.register ? "✓ PASS" : "✗ FAIL");
  console.log("Login:", results.login ? "✓ PASS" : "✗ FAIL");
  console.log("Get Current User:", results.getCurrentUser ? "✓ PASS" : "✗ FAIL");
  console.log("Invalid Credentials:", results.invalidCredentials ? "✓ PASS" : "✗ FAIL");
  console.log("Missing Token:", results.missingToken ? "✓ PASS" : "✗ FAIL");
  console.log("Duplicate Email:", results.duplicateEmail ? "✓ PASS" : "✗ FAIL");
  
  const allPassed = Object.values(results).every(r => r);
  console.log("\nOverall:", allPassed ? "✓ ALL TESTS PASSED" : "✗ SOME TESTS FAILED");
  
  process.exit(allPassed ? 0 : 1);
}

runTests();
