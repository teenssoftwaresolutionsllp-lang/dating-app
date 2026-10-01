import { apiRequest } from "./api";

interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

async function requestAccountData<T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> {
  const response = await apiRequest<ApiEnvelope<T> | T>(endpoint, options);
  if (response && typeof response === "object" && "data" in response) {
    return response.data as T;
  }
  return response as T;
}

export interface DeactivateAccountResponse {
  deactivatedAt: string;
  deletionScheduledAt: string;
}

export interface DeletionOtpResponse {
  purpose: string;
  expiresIn: number;
  resendCooldown: number;
  devOtp?: string;
}

export interface DeleteAccountResponse {
  deleted: boolean;
  mediaCleanupPending: boolean;
  pendingMediaCount: number;
}

export async function deactivateAccount(): Promise<DeactivateAccountResponse> {
  return requestAccountData<DeactivateAccountResponse>(
    "/api/v1/account/deactivate",
    {
      method: "POST",
    },
  );
}

export async function requestAccountDeletionOtp(): Promise<DeletionOtpResponse> {
  return requestAccountData<DeletionOtpResponse>(
    "/api/v1/account/deletion-otp",
    {
      method: "POST",
    },
  );
}

export async function confirmAccountDeletion(
  otp: string,
): Promise<DeleteAccountResponse> {
  return requestAccountData<DeleteAccountResponse>("/api/v1/account/delete", {
    method: "POST",
    body: JSON.stringify({ otp }),
  });
}
