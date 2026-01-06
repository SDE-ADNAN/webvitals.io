import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { CreateSiteInput, UpdateSiteInput } from "../validators/siteValidators";

/**
 * Site response type
 */
export interface SiteResponse {
  id: number;
  siteId: string;
  name: string;
  url: string;
  domain: string;
  isActive: boolean;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    // Fallback: try to extract domain manually
    const match = url.match(/^(?:https?:\/\/)?([^\/]+)/i);
    return match ? match[1] : url;
  }
}

/**
 * Create a new site for a user
 * Requirements: 6.1-6.5
 */
export async function createSite(
  userId: number,
  data: CreateSiteInput
): Promise<SiteResponse> {
  // Generate unique siteId for SDK tracking
  const siteId = uuidv4();

  // Extract domain from URL
  const domain = extractDomain(data.url);

  // Create site in database
  const site = await prisma.site.create({
    data: {
      userId,
      name: data.name,
      url: data.url,
      domain,
      siteId,
      isActive: true,
    },
  });

  return site;
}

/**
 * List all sites for a user
 * Requirements: 7.1-7.5
 */
export async function listSites(userId: number): Promise<SiteResponse[]> {
  const sites = await prisma.site.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return sites;
}

/**
 * Get a site by siteId (public tracking ID)
 * Requirements: 8.1-8.5
 */
export async function getSiteByPublicId(
  siteId: string,
  userId: number
): Promise<SiteResponse> {
  const site = await prisma.site.findUnique({
    where: { siteId },
  });

  if (!site) {
    const error = new Error("Site not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // Verify ownership
  if (site.userId !== userId) {
    const error = new Error("You do not have permission to access this site");
    (error as any).statusCode = 403;
    throw error;
  }

  return site;
}

/**
 * Update a site
 * Requirements: 9.1-9.5
 */
export async function updateSite(
  siteId: string,
  userId: number,
  data: UpdateSiteInput
): Promise<SiteResponse> {
  // First verify the site exists and user owns it
  const existingSite = await prisma.site.findUnique({
    where: { siteId },
  });

  if (!existingSite) {
    const error = new Error("Site not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (existingSite.userId !== userId) {
    const error = new Error("You do not have permission to update this site");
    (error as any).statusCode = 403;
    throw error;
  }

  // Build update data
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.url !== undefined) {
    updateData.url = data.url;
    updateData.domain = extractDomain(data.url);
  }
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Update site
  const site = await prisma.site.update({
    where: { siteId },
    data: updateData,
  });

  return site;
}

/**
 * Delete a site (cascades to metrics and alerts)
 * Requirements: 10.1-10.5
 */
export async function deleteSite(
  siteId: string,
  userId: number
): Promise<void> {
  // First verify the site exists and user owns it
  const existingSite = await prisma.site.findUnique({
    where: { siteId },
  });

  if (!existingSite) {
    const error = new Error("Site not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (existingSite.userId !== userId) {
    const error = new Error("You do not have permission to delete this site");
    (error as any).statusCode = 403;
    throw error;
  }

  // Delete site (cascade delete will remove metrics and alerts)
  await prisma.site.delete({
    where: { siteId },
  });
}
