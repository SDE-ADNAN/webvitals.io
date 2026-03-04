import { swaggerSpec } from "./swagger";

describe("Swagger Documentation", () => {
  it("should have OpenAPI 3.0.0 specification", () => {
    expect(swaggerSpec.openapi).toBe("3.0.0");
  });

  it("should have API information", () => {
    expect(swaggerSpec.info).toBeDefined();
    expect(swaggerSpec.info.title).toBe("WebVitals.io API");
    expect(swaggerSpec.info.version).toBe("1.0.0");
    expect(swaggerSpec.info.description).toContain("WebVitals.io");
  });

  it("should have server configurations", () => {
    expect(swaggerSpec.servers).toBeDefined();
    expect(swaggerSpec.servers.length).toBeGreaterThan(0);
    expect(swaggerSpec.servers[0].url).toContain("localhost");
  });

  it("should have security schemes defined", () => {
    expect(swaggerSpec.components?.securitySchemes).toBeDefined();
    expect(swaggerSpec.components?.securitySchemes?.bearerAuth).toBeDefined();
    expect(swaggerSpec.components?.securitySchemes?.siteIdHeader).toBeDefined();
  });

  it("should have schema definitions", () => {
    expect(swaggerSpec.components?.schemas).toBeDefined();
    expect(swaggerSpec.components?.schemas?.User).toBeDefined();
    expect(swaggerSpec.components?.schemas?.Site).toBeDefined();
    expect(swaggerSpec.components?.schemas?.Metric).toBeDefined();
    expect(swaggerSpec.components?.schemas?.Alert).toBeDefined();
    expect(swaggerSpec.components?.schemas?.Error).toBeDefined();
  });

  it("should have error response definitions", () => {
    expect(swaggerSpec.components?.responses).toBeDefined();
    expect(swaggerSpec.components?.responses?.BadRequest).toBeDefined();
    expect(swaggerSpec.components?.responses?.Unauthorized).toBeDefined();
    expect(swaggerSpec.components?.responses?.Forbidden).toBeDefined();
    expect(swaggerSpec.components?.responses?.NotFound).toBeDefined();
    expect(swaggerSpec.components?.responses?.Conflict).toBeDefined();
    expect(swaggerSpec.components?.responses?.TooManyRequests).toBeDefined();
    expect(swaggerSpec.components?.responses?.InternalServerError).toBeDefined();
  });

  it("should have tags defined", () => {
    expect(swaggerSpec.tags).toBeDefined();
    expect(swaggerSpec.tags?.length).toBeGreaterThan(0);
    
    const tagNames = swaggerSpec.tags?.map((tag: any) => tag.name) || [];
    expect(tagNames).toContain("Authentication");
    expect(tagNames).toContain("Sites");
    expect(tagNames).toContain("Metrics");
    expect(tagNames).toContain("Alerts");
    expect(tagNames).toContain("Health");
  });

  it("should document all API endpoints", () => {
    expect(swaggerSpec.paths).toBeDefined();
    
    // Authentication endpoints
    expect(swaggerSpec.paths["/api/auth/register"]).toBeDefined();
    expect(swaggerSpec.paths["/api/auth/login"]).toBeDefined();
    expect(swaggerSpec.paths["/api/auth/me"]).toBeDefined();
    
    // Site endpoints
    expect(swaggerSpec.paths["/api/sites"]).toBeDefined();
    expect(swaggerSpec.paths["/api/sites/{siteId}"]).toBeDefined();
    
    // Metric endpoints
    expect(swaggerSpec.paths["/api/metrics"]).toBeDefined();
    expect(swaggerSpec.paths["/api/metrics/{siteId}"]).toBeDefined();
    expect(swaggerSpec.paths["/api/metrics/{siteId}/summary"]).toBeDefined();
    
    // Alert endpoints
    expect(swaggerSpec.paths["/api/alerts"]).toBeDefined();
    expect(swaggerSpec.paths["/api/alerts/{alertId}"]).toBeDefined();
    
    // Health endpoint
    expect(swaggerSpec.paths["/api/health"]).toBeDefined();
  });

  it("should have request/response examples for authentication endpoints", () => {
    const registerEndpoint = swaggerSpec.paths["/api/auth/register"]?.post;
    expect(registerEndpoint).toBeDefined();
    expect(registerEndpoint?.requestBody).toBeDefined();
    expect(registerEndpoint?.responses).toBeDefined();
    expect(registerEndpoint?.responses["201"]).toBeDefined();
    expect(registerEndpoint?.responses["400"]).toBeDefined();
    expect(registerEndpoint?.responses["409"]).toBeDefined();
  });

  it("should document authentication requirements", () => {
    const getMeEndpoint = swaggerSpec.paths["/api/auth/me"]?.get;
    expect(getMeEndpoint).toBeDefined();
    expect(getMeEndpoint?.security).toBeDefined();
    expect(getMeEndpoint?.security?.[0]?.bearerAuth).toBeDefined();
  });

  it("should document error codes", () => {
    const responses = swaggerSpec.components?.responses;
    
    // Check that error responses are defined with proper structure
    expect(responses?.BadRequest?.description).toBeDefined();
    expect(responses?.Unauthorized?.description).toBeDefined();
    expect(responses?.Forbidden?.description).toBeDefined();
    expect(responses?.NotFound?.description).toBeDefined();
    expect(responses?.Conflict?.description).toBeDefined();
    expect(responses?.TooManyRequests?.description).toBeDefined();
    expect(responses?.InternalServerError?.description).toBeDefined();
    
    // Verify they have content with error schema
    expect(responses?.BadRequest?.content).toBeDefined();
    expect(responses?.Unauthorized?.content).toBeDefined();
  });

  it("should have Retry-After header documented for rate limit errors", () => {
    const rateLimitResponse = swaggerSpec.components?.responses?.TooManyRequests;
    expect(rateLimitResponse?.headers).toBeDefined();
    expect(rateLimitResponse?.headers?.["Retry-After"]).toBeDefined();
  });
});
