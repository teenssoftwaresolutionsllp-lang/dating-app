import { apiRequest } from './api';

export interface InitiateCallResponse {
  callId: string;
  channelName: string;
  appId: string;
  token: string;
  uid: number;
  callType: 'audio' | 'video';
  receiverName?: string;
  receiverAvatar?: string | null;
  callerName?: string;
  callerAvatar?: string | null;
}

export interface IncomingCallData {
  id: string;
  callerId: string;
  receiverId: string;
  channelName: string;
  callType: 'audio' | 'video';
  status: string;
  callerName: string;
  callerAvatar: string | null;
}

export interface CallHistoryItem {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  callType: 'audio' | 'video';
  direction: 'incoming' | 'outgoing';
  status: 'initiated' | 'ringing' | 'accepted' | 'rejected' | 'missed' | 'ended';
  durationSeconds: number;
  createdAt: string;
  startedAt?: string | null;
  endedAt?: string | null;
}

export const callApi = {
  /**
   * Retrieve Agora RTM token for real-time messaging
   */
  async getRtmToken(): Promise<{ appId: string; token: string; userId: string } | null> {
    try {
      const res = await apiRequest<{ appId: string; token: string; userId: string }>(
        '/api/v1/calls/rtm-token',
        { method: 'GET' }
      );
      const data = (res as any)?.data ?? res;
      if (data && typeof data === 'object' && 'token' in data) {
        return data as { appId: string; token: string; userId: string };
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Retrieve complete call history for the current user
   */
  async getCallHistory(): Promise<CallHistoryItem[]> {
    const res = await apiRequest<CallHistoryItem[]>('/api/v1/calls/history', {
      method: 'GET',
    });
    const data = (res as any)?.data ?? res;
    return Array.isArray(data) ? (data as CallHistoryItem[]) : [];
  },

  /**
   * Initiate a 1-on-1 voice or video call
   */
  async initiateCall(
    receiverId: string,
    callType: 'audio' | 'video' = 'video'
  ): Promise<InitiateCallResponse> {
    const res = await apiRequest<InitiateCallResponse>('/api/v1/calls/initiate', {
      method: 'POST',
      body: JSON.stringify({ receiverId, callType }),
    });
    const data = (res as any)?.data ?? res;
    return data as InitiateCallResponse;
  },

  /**
   * Check for any active incoming call
   */
  async getIncomingCall(): Promise<IncomingCallData | null> {
    const res = await apiRequest<IncomingCallData | null>('/api/v1/calls/incoming', {
      method: 'GET',
    });
    const data = (res as any)?.data ?? res;
    if (data && typeof data === 'object' && 'id' in data) {
      return data as IncomingCallData;
    }
    return null;
  },

  /**
   * Accept an incoming call and receive Agora credentials
   */
  async acceptCall(callId: string): Promise<InitiateCallResponse> {
    const res = await apiRequest<InitiateCallResponse>(`/api/v1/calls/${callId}/accept`, {
      method: 'POST',
    });
    const data = (res as any)?.data ?? res;
    return data as InitiateCallResponse;
  },

  /**
   * Reject an incoming call
   */
  async rejectCall(callId: string): Promise<void> {
    await apiRequest(`/api/v1/calls/${callId}/reject`, {
      method: 'POST',
    });
  },

  /**
   * End an ongoing call
   */
  async endCall(callId: string, durationSeconds: number = 0): Promise<void> {
    await apiRequest(`/api/v1/calls/${callId}/end`, {
      method: 'POST',
      body: JSON.stringify({ durationSeconds }),
    });
  },

  /**
   * Poll current call status (ringing, accepted, rejected, missed, ended)
   */
  async getCallStatus(
    callId: string
  ): Promise<{ id: string; status: string; durationSeconds: number } | null> {
    const res = await apiRequest<{ id: string; status: string; durationSeconds: number } | null>(
      `/api/v1/calls/${callId}/status`,
      {
        method: 'GET',
      }
    );
    const data = (res as any)?.data ?? res;
    if (data && typeof data === 'object' && 'id' in data) {
      return data as { id: string; status: string; durationSeconds: number };
    }
    return null;
  },
};
