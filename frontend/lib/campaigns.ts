import { apiUrl, authHeaders } from "./posts";

export type CampaignStatus = "active" | "paused" | "completed" | "archived";

export type Campaign = {
  id: number;
  store_id: number;
  name: string;
  goal: string;
  status: CampaignStatus | string;
  color: string;
  owner: string;
  starts_at: string | null;
  ends_at: string | null;
  notes: string;
  post_count: number;
  created_at: string;
  updated_at: string;
};

export type CampaignInput = {
  name: string;
  goal?: string;
  status?: CampaignStatus;
  color?: string;
  owner?: string;
  starts_at?: string | null;
  ends_at?: string | null;
  notes?: string;
};

export async function loadCampaigns(status = "all"): Promise<Campaign[]> {
  const response = await fetch(`${apiUrl}/campaigns?status=${encodeURIComponent(status)}`, { headers: authHeaders() });
  if (!response.ok) throw new Error("دریافت کمپین‌ها ناموفق بود");
  return response.json();
}

export async function createCampaign(payload: CampaignInput): Promise<Campaign> {
  const response = await fetch(`${apiUrl}/campaigns`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify({
      goal: "",
      status: "active",
      color: "#0F766E",
      owner: "",
      starts_at: null,
      ends_at: null,
      notes: "",
      ...payload
    })
  });
  if (!response.ok) throw new Error("ساخت کمپین ناموفق بود");
  return response.json();
}
