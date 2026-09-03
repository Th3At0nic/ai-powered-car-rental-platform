export type TDiditWebhookStatus =
  | 'Approved'
  | 'Declined'
  | 'In Review'
  | 'In Progress'
  | 'Not Started'
  | 'Abandoned'
  | 'Expired'
  | 'ACTIVE'
  | string; // Fallback for any unexpected vendor status string

export type TDiditWebhookPayload = {
  webhook_type?: string;
  status: TDiditWebhookStatus;
  session_id?: string; // Optional because user.data.updated events omit session_id
  vendor_data?: string;
  decision?: Record<string, unknown> | null;
  [key: string]: unknown; // Allows OCR and event metadata safely
};
