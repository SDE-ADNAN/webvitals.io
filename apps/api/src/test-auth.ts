/**
 * Simple test script to verify authentication functionality
 * Run with: tsx src/test-auth.ts
 */

import { hashPassword, comparePassword } from "./utils/password";
import { signToken, verifyToken } from "./utils/jwt";

async function testPasswordHashing() {
  console.log("\n=== Testing Password Hashing ===");
  
  const password = "testpassword123";
  console.log("Original password:", password);
  
  // Test hashing
  const hashed = await hashPassword(password);
  console.log("Hashed password:", hashed);
  console.log("Hash length:", hashed.length);
  
  // Test comparison with correct password
  const isValid = await comparePassword(password, hashed);
  console.log("Correct password comparison:", isValid ? "✓ PASS" : "✗ FAIL");
  
  // Test comparison with incorrect password
  const isInvalid = await comparePassword("wrongpassword", hashed);
  console.log("Incorrect password comparison:", !isInvalid ? "✓ PASS" : "✗ FAIL");
  
  return isValid && !isInvalid;
}

async function testJWT() {
  console.log("\n=== Testing JWT Token ===");
  
  const payload = {
    userId: "123",
    email: "test@example.com",
  };
  
  console.log("Token payload:", payload);
  
  // Test token generation
  const token = signToken(payload);
  console.log("Generated token:", token.substring(0, 50) + "...");
  
  // Test token verification
  try {
    const decoded = verifyToken(token);
    console.log("Decoded payload:", decoded);
    
    const isValid = decoded.userId === payload.userId && decoded.email === payload.email;
    console.log("Token verification:", isValid ? "✓ PASS" : "✗ FAIL");
    
    return isValid;
  } catch (error) {
    console.log("Token verification: ✗ FAIL");
    console.error(error);
    return false;
  }
}

async function testInvalidToken() {
  console.log("\n=== Testing Invalid Token ===");
  
  try {
    verifyToken("invalid.token.here");
    console.log("Invalid token test: ✗ FAIL (should have thrown error)");
    return false;
  } catch (error) {
    console.log("Invalid token test: ✓ PASS (correctly rejected)");
    if (error instanceof Error) {
      console.log("Error message:", error.message);
    }
    return true;
  }
}

async function runTests() {
  console.log("Starting authentication tests...\n");
  
  const results = {
    passwordHashing: await testPasswordHashing(),
    jwt: await testJWT(),
    invalidToken: await testInvalidToken(),
  };
  
  console.log("\n=== Test Results ===");
  console.log("Password Hashing:", results.passwordHashing ? "✓ PASS" : "✗ FAIL");
  console.log("JWT Generation/Verification:", results.jwt ? "✓ PASS" : "✗ FAIL");
  console.log("Invalid Token Handling:", results.invalidToken ? "✓ PASS" : "✗ FAIL");
  
  const allPassed = Object.values(results).every(r => r);
  console.log("\nOverall:", allPassed ? "✓ ALL TESTS PASSED" : "✗ SOME TESTS FAILED");
  
  process.exit(allPassed ? 0 : 1);
}

runTests();
