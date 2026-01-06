import { prisma } from "../lib/prisma";
import { CreateAlertInput, UpdateAlertInput } from "../validators/alertValidators";

/**
 * Alert response type
 */
export interface AlertResponse {
  id: number;
  userId: number;
  siteId: number;
  metricType: string;
  threshold: number;
  condition: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new alert for a site
 * Requirements: 14.1-14.5
 */
export async function createAlert(
  userId: number,
  data: CreateAlertInput
): Promise<AlertResponse> {
  // First verify the site exists and user owns it
  const site = await prisma.site.findUnique({
    where: { siteId: data.siteId },
  });

  if (!site) {
    const error = new Error("Site not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (site.userId !== userId) {
    const error = new Error("You do not have permission to create alerts for this site");
    (error as any).statusCode = 403;
    throw error;
  }

  // Create alert with isActive=true by default
  const alert = await prisma.alert.create({
    data: {
      userId,
      siteId: site.id,
      metricType: data.metricType,
      threshold: data.threshold,
      condition: data.condition,
      isActive: true,
    },
  });

  return alert;
}

/**
 * List all alerts for a user
 * Requirements: 15.1-15.5
 */
export async function listAlerts(userId: number): Promise<AlertResponse[]> {
  const alerts = await prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return alerts;
}

/**
 * Get an alert by ID
 */
export async function getAlertById(
  alertId: number,
  userId: number
): Promise<AlertResponse> {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
  });

  if (!alert) {
    const error = new Error("Alert not found");
    (error as any).statusCode = 404;
    throw error;
  }

  // Verify ownership
  if (alert.userId !== userId) {
    const error = new Error("You do not have permission to access this alert");
    (error as any).statusCode = 403;
    throw error;
  }

  return alert;
}

/**
 * Update an alert
 * Requirements: 16.1-16.5
 */
export async function updateAlert(
  alertId: number,
  userId: number,
  data: UpdateAlertInput
): Promise<AlertResponse> {
  // First verify the alert exists and user owns it
  const existingAlert = await prisma.alert.findUnique({
    where: { id: alertId },
  });

  if (!existingAlert) {
    const error = new Error("Alert not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (existingAlert.userId !== userId) {
    const error = new Error("You do not have permission to update this alert");
    (error as any).statusCode = 403;
    throw error;
  }

  // Build update data
  const updateData: any = {};
  if (data.threshold !== undefined) updateData.threshold = data.threshold;
  if (data.condition !== undefined) updateData.condition = data.condition;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Update alert
  const alert = await prisma.alert.update({
    where: { id: alertId },
    data: updateData,
  });

  return alert;
}

/**
 * Delete an alert
 * Requirements: 17.1-17.5
 */
export async function deleteAlert(
  alertId: number,
  userId: number
): Promise<void> {
  // First verify the alert exists and user owns it
  const existingAlert = await prisma.alert.findUnique({
    where: { id: alertId },
  });

  if (!existingAlert) {
    const error = new Error("Alert not found");
    (error as any).statusCode = 404;
    throw error;
  }

  if (existingAlert.userId !== userId) {
    const error = new Error("You do not have permission to delete this alert");
    (error as any).statusCode = 403;
    throw error;
  }

  // Delete alert
  await prisma.alert.delete({
    where: { id: alertId },
  });
}
