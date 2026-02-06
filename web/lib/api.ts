/**
 * AIFuel API Client
 * Handles all communication with the backend API
 */

import { API_BASE_URL } from './constants';

// Token storage
const TOKEN_KEY = 'aifuel_auth_token';
const API_KEY_STORAGE = 'aifuel_api_key';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

// API Key local storage (so user can see full key again)
export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(API_KEY_STORAGE);
}

export function setStoredApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function clearStoredApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE);
}

// API response types
export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    wallet: string;
    createdAt: string;
    isDiamondHands: boolean;
  };
}

export interface NonceResponse {
  message: string;
  nonce?: string;  // Optional, message already contains nonce
  timestamp: number;
}

export interface CreditsResponse {
  balance: number;
  daily: number;
  used: number;
  remaining: number;
  multiplier: number;
  isDiamondHands: boolean;
  resetsAt: string;
}

export interface ApiKeyResponse {
  key: {
    id: string;
    prefix: string;
    createdAt: string;
    lastUsedAt: string | null;
  } | null;
}

export interface CreateKeyResponse {
  id: string;
  key: string;  // Full key, only returned once!
  prefix: string;
  createdAt: string;
  message: string;
}

export interface ApiError {
  error: {
    message: string;
    type: string;
  };
}

// Helper for authenticated requests
async function authFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: { message: 'Request failed', type: 'unknown' }
    }));
    throw new Error(error.error.message);
  }
  
  return response.json();
}

/**
 * Get nonce message to sign
 */
export async function getNonce(wallet: string): Promise<NonceResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/nonce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet }),
  });
  
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}

/**
 * Connect wallet with signature
 */
export async function connectWallet(
  wallet: string,
  signature: string,
  message: string
): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/v1/auth/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet, signature, message }),
  });
  
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.error.message);
  }
  
  const data: AuthResponse = await response.json();
  
  // Store token
  setAuthToken(data.token);
  
  return data;
}

/**
 * Get credits info
 */
export async function getCredits(): Promise<CreditsResponse> {
  return authFetch<CreditsResponse>('/v1/credits');
}

/**
 * Get current API key (masked)
 */
export async function getApiKey(): Promise<ApiKeyResponse> {
  return authFetch<ApiKeyResponse>('/v1/keys');
}

/**
 * Create/regenerate API key
 */
export async function createApiKey(): Promise<CreateKeyResponse> {
  return authFetch<CreateKeyResponse>('/v1/keys', { method: 'POST' });
}

/**
 * Revoke API key
 */
export async function revokeApiKey(): Promise<{ success: boolean }> {
  return authFetch('/v1/keys', { method: 'DELETE' });
}

/**
 * Disconnect (clear local state)
 */
export function disconnectApi(): void {
  clearAuthToken();
  clearStoredApiKey();
}
