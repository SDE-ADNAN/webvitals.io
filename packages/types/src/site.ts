export interface Site {
  id: number;
  userId: number;
  name: string;
  url: string;
  domain: string;
  siteId: string; // Public tracking ID
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
